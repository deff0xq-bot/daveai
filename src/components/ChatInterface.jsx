import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Mic, MicOff, Paperclip, Image as ImageIcon, Video, Sparkles, Rocket, BarChart3, Palette, ShoppingCart, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatInterface({ projectId, project, onCodeGenerated, userCredits }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [fileType, setFileType] = useState('html');
  const [complexity, setComplexity] = useState('standard');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDiscussionMode, setIsDiscussionMode] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadMessages();
    initSpeechRecognition();
  }, [projectId]);

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.error('Ошибка распознавания речи');
      };
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Голосовой ввод не поддерживается в вашем браузере');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info('Говорите...');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    const msgs = await base44.entities.Message.filter(
      { project_id: projectId },
      'created_date'
    );
    setMessages(msgs);
  };

  const handleFileAttach = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    toast.loading('Загрузка файлов...', { id: 'file-upload' });
    const uploadedFiles = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedFiles.push({ name: file.name, url: file_url });
    }
    setAttachedFiles([...attachedFiles, ...uploadedFiles]);
    toast.success('Файлы загружены!', { id: 'file-upload' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const today = new Date();
    const isFreeDay = today.getDate() === 25 && today.getMonth() === 11 && today.getFullYear() === 2025;

    const currentInput = input;
    const currentFiles = attachedFiles;
    const isImageRequest = /генерир.*изображ|создай.*изображ|нарисуй|изображение/i.test(currentInput);
    const isVideoRequest = /генерир.*видео|создай.*видео|сними.*видео|видео/i.test(currentInput);
    
    const userMessage = {
      project_id: projectId,
      role: 'user',
      content: currentInput,
      attached_files: currentFiles
    };

    await base44.entities.Message.create(userMessage);
    setMessages([...messages, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    const streamingMessage = {
      project_id: projectId,
      role: 'assistant',
      content: '',
      credits_used: 0,
      streaming: true
    };
    setMessages([...messages, userMessage, streamingMessage]);

    try {
      if (isVideoRequest && !isDiscussionMode) {
        const user = await base44.auth.me();

        if (!isFreeDay && !user.has_unlimited_credits) {
          const transactions = await base44.entities.CreditTransaction.filter(
            { user_email: user.email },
            '-created_date'
          );
          const currentBalance = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

          if (currentBalance < 10) {
            setMessages(prev => prev.slice(0, -1));
            toast.error('Недостаточно кредитов для генерации видео (нужно 10 кредитов).');
            setIsLoading(false);
            return;
          }

          await base44.entities.CreditTransaction.create({
            user_email: user.email,
            amount: -10,
            type: 'generation',
            description: 'Генерация видео',
            project_id: projectId
          });
        }

        const videoPrompt = `Ты - AI режиссер. Создай детальный промпт для генерации ДОЛГОГО ВЫСОКОКАЧЕСТВЕННОГО видео (60+ секунд) на основе запроса: "${currentInput}"

СТРУКТУРА ПРОМПТА:
1. ОСНОВНАЯ КОНЦЕПЦИЯ (2-3 предложения)
2. ВИЗУАЛЬНЫЙ СТИЛЬ: (кинематографический стиль, цветовая палитра, освещение)
3. СЦЕНЫ ПО ТАЙМКОДАМ:
   0:00-0:10 - [детальное описание первой сцены, движение камеры]
   0:10-0:25 - [вторая сцена с плавным переходом]
   0:25-0:40 - [третья сцена, кульминация]
   0:40-1:00 - [финальная сцена, завершение]
4. ТЕХНИЧЕСКИЕ ДЕТАЛИ: разрешение 4K, 60fps, cinematic color grading
5. МУЗЫКА/ЗВУК: описание атмосферы и саундтрека
6. ЭМОЦИОНАЛЬНЫЙ ТОН: какие эмоции должно вызывать видео

Создай МАКСИМАЛЬНО ДЕТАЛЬНЫЙ промпт для топовой AI модели (Runway Gen-3 Alpha, Kling AI 1.5)`;

        const videoResponse = await base44.integrations.Core.InvokeLLM({
          prompt: videoPrompt,
          add_context_from_internet: true
        });

        const assistantMessage = {
          project_id: projectId,
          role: 'assistant',
          content: `🎬 ПРОМПТ ДЛЯ ГЕНЕРАЦИИ ДОЛГОГО ВИДЕО СОЗДАН\n\n${videoResponse}\n\n✨ Используйте этот промпт в:\n• Runway Gen-3 Alpha (runway.ml)\n• Kling AI 1.5 (kling.ai)\n• Pika 2.0 (pika.art)\n\nДлительность: 60+ секунд | Качество: 4K | Стиль: Cinematic`,
          credits_used: isFreeDay ? 0 : 10
        };

        await base44.entities.Message.create(assistantMessage);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMessage, streaming: false };
          return updated;
        });

        toast.success(isFreeDay ? 'План видео создан! (Бесплатно сегодня 🎉)' : 'План видео создан! Списано 10 кредитов');
        setIsLoading(false);
        return;
      }

      if (isImageRequest && !isDiscussionMode) {
        const user = await base44.auth.me();

        if (!isFreeDay && !user.has_unlimited_credits) {
          const transactions = await base44.entities.CreditTransaction.filter(
            { user_email: user.email },
            '-created_date'
          );
          const currentBalance = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

          if (currentBalance < 5) {
            setMessages(prev => prev.slice(0, -1));
            toast.error('Недостаточно кредитов для генерации изображения (нужно 5 кредитов).');
            setIsLoading(false);
            return;
          }

          await base44.entities.CreditTransaction.create({
            user_email: user.email,
            amount: -5,
            type: 'generation',
            description: 'Генерация изображения',
            project_id: projectId
          });
        }

        const { url } = await base44.integrations.Core.GenerateImage({
          prompt: currentInput
        });

        const assistantMessage = {
          project_id: projectId,
          role: 'assistant',
          content: `Изображение готово:\n\n![Generated Image](${url})`,
          credits_used: isFreeDay ? 0 : 5
        };

        await base44.entities.Message.create(assistantMessage);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMessage, streaming: false };
          return updated;
        });

        toast.success(isFreeDay ? 'Изображение сгенерировано! (Бесплатно сегодня 🎉)' : 'Изображение сгенерировано! Списано 5 кредитов');
        return;
      }

      if (isDiscussionMode) {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Ты - Dave AI, помощник разработчика. Отвечай на вопросы пользователя, помогай с планированием и обсуждением.\n\nВопрос: ${currentInput}`,
          add_context_from_internet: true
        });

        let currentText = '';
        const words = response.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: currentText };
            return updated;
          });
          await new Promise(resolve => setTimeout(resolve, 20));
        }

        const assistantMessage = {
          project_id: projectId,
          role: 'assistant',
          content: response,
          credits_used: 0
        };

        await base44.entities.Message.create(assistantMessage);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMessage, streaming: false };
          return updated;
        });
        
        return;
      }

      const user = await base44.auth.me();

      if (!isFreeDay && !user.has_unlimited_credits) {
        const transactions = await base44.entities.CreditTransaction.filter(
          { user_email: user.email },
          '-created_date'
        );
        const currentBalance = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

        if (currentBalance < 1) {
          setMessages(prev => prev.slice(0, -1));
          toast.error('Недостаточно кредитов. Пополните баланс в настройках.');
          setIsLoading(false);
          return;
        }

        await base44.entities.CreditTransaction.create({
          user_email: user.email,
          amount: -1,
          type: 'generation',
          description: 'Генерация кода',
          project_id: projectId
        });
      }

      const contextFromPrevious = project?.code ? `\n\nТекущий код:\n${project.code}\n\nПродолжи, улучши или дополни код.` : '';
      
      const complexityInstructions = {
        simple: 'Простой код с базовой функциональностью.',
        standard: 'Качественный код с хорошим дизайном и анимациями.',
        advanced: 'Продвинутый код с максимальной интерактивностью и эффектами.'
      };

      const seoInstructions = `
        КРИТИЧНО: SEO ОПТИМИЗАЦИЯ
        - Используй семантические HTML5 теги: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>
        - Добавь мета-теги: <meta name="description" content="...">, <meta name="keywords" content="...">
        - Open Graph теги: <meta property="og:title">, <meta property="og:description">, <meta property="og:image">
        - Twitter Card теги: <meta name="twitter:card" content="summary_large_image">
        - Все изображения ДОЛЖНЫ иметь alt атрибуты с описательным текстом
        - Используй правильную иерархию заголовков (H1 -> H2 -> H3)
        - Добавь <title> тег с описательным названием страницы
        - Добавь структурированные данные Schema.org где уместно (JSON-LD)
        - Используй aria-label для интерактивных элементов
      `;

      const responsiveStyles = `
        /* Responsive Design */
        * { box-sizing: border-box; }
        img { max-width: 100%; height: auto; }
        @media (max-width: 768px) {
          body { padding: 10px; }
          h1 { font-size: 1.5em; }
          h2 { font-size: 1.3em; }
          h3 { font-size: 1.1em; }
        }
        @media (max-width: 480px) {
          body { padding: 5px; font-size: 14px; }
        }
      `;

      const fileTypeInstructions = {
        html: 'Верни ПОЛНУЮ СТРАНИЦУ с HTML, CSS и JavaScript. Создай целостную, готовую к использованию веб-страницу.',
        json: 'Верни валидный JSON.',
        python: 'Верни Python скрипт.',
        javascript: 'Верни JavaScript код ES6+.',
        css: 'Верни CSS с анимациями.',
        react: 'Верни React компонент.',
        vue: 'Верни Vue компонент.'
      };

      const isRefactorRequest = /рефактор|улучш.*код|оптимизир|читабельн|производительн/i.test(currentInput);
      const isTestRequest = /тест|unit.*test|testing|добавь тесты/i.test(currentInput);
      const isTranslateRequest = /перевед.*на|конвертир.*в|из.*в|react.*vue|vue.*react/i.test(currentInput);
      
      let specialInstructions = '';
      if (isRefactorRequest) {
        specialInstructions = '\n\nЗадача: Рефакторинг кода. Улучши читаемость, производительность, добавь комментарии где необходимо, оптимизируй структуру.';
      } else if (isTestRequest) {
        specialInstructions = '\n\nЗадача: Добавь unit-тесты. Создай тесты для всех ключевых функций, проверь edge cases.';
      } else if (isTranslateRequest) {
        specialInstructions = '\n\nЗадача: Перевод между фреймворками. Сохрани всю функциональность, адаптируй под синтаксис целевого фреймворка.';
      }
      
      const planPrompt = `Составь краткий план для: ${currentInput}. Ответь в 2-3 предложениях что будешь делать.`;
      const plan = await base44.integrations.Core.InvokeLLM({
        prompt: planPrompt,
        add_context_from_internet: false
      });

      let currentText = `План:\n${plan}\n\nГенерирую код...`;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: currentText };
        return updated;
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isABTestRequest = /вариант|a\/b|ab test|тест.*вариант|альтернатив/i.test(currentInput);

      const abTestInstructions = isABTestRequest ? `\n\nA/B ТЕСТИРОВАНИЕ: Создай ДВА варианта страницы (Вариант A и Вариант B) с разными подходами к дизайну/структуре. Отдели варианты комментариями "=== ВАРИАНТ A ===" и "=== ВАРИАНТ B ===". Варианты должны тестировать разные гипотезы (например: разный CTA, цветовая схема, расположение элементов).` : '';

      const codePrompt = `${complexityInstructions[complexity]}\n${fileTypeInstructions[fileType]}${specialInstructions}\n${seoInstructions}\n\nВАЖНО: Код должен быть адаптивным (responsive) для всех устройств. Используй media queries, относительные единицы (%, em, rem), и flexible layouts.${abTestInstructions}\n\nЗапрос: ${currentInput}${contextFromPrevious}\n\nБез объяснений, только код с responsive дизайном и SEO-оптимизацией.`;
      const fileUrls = currentFiles.length > 0 ? currentFiles.map(f => f.url) : null;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: codePrompt,
        add_context_from_internet: true,
        file_urls: fileUrls
      });

      currentText = '';
      const words = response.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? ' ' : '') + words[i];
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: currentText };
          return updated;
        });
        
        if (i % 50 === 0 && i > 0) {
          await base44.entities.Project.update(projectId, {
            status: 'generating',
            code: currentText
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      const seoNote = fileType === 'html' ? ' с SEO-оптимизацией (мета-теги, семантический HTML, alt атрибуты)' : '';
      const abNote = /вариант|a\/b|ab test|тест.*вариант|альтернатив/i.test(currentInput) ? '. Созданы варианты для A/B тестирования' : '';
      currentText += `\n\n---\nГотово! Создан ${fileType} файл с уровнем сложности ${complexity}${seoNote}${abNote}.`;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: currentText };
        return updated;
      });

      await base44.entities.Project.update(projectId, {
        status: 'ready',
        code: response
      });

      if (onCodeGenerated) {
        onCodeGenerated(response, currentInput);
      }

      const assistantMessage = {
        project_id: projectId,
        role: 'assistant',
        content: currentText,
        credits_used: isFreeDay ? 0 : 1
      };

      await base44.entities.Message.create(assistantMessage);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...assistantMessage, streaming: false };
        return updated;
      });

      toast.success(isFreeDay ? 'Код готов! (Бесплатно сегодня 🎉)' : 'Код готов! Списан 1 кредит');

    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка генерации');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-black to-[#0a0a0a]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-300 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white">Начните создавать с Dave AI</h3>
              <p className="text-gray-500 text-sm max-w-md">Опишите, что вы хотите создать, и я помогу воплотить вашу идею в жизнь</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-2xl">
                <button
                  onClick={() => setInput('Создай современный лендинг для стартапа')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-105"
                >
                  <div className="text-white font-semibold mb-1 flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Лендинг
                  </div>
                  <div className="text-gray-500 text-xs">Создать страницу для стартапа</div>
                </button>
                <button
                  onClick={() => setInput('Разработай интерактивную дашборд с графиками')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-105"
                >
                  <div className="text-white font-semibold mb-1 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </div>
                  <div className="text-gray-500 text-xs">Панель с аналитикой</div>
                </button>
                <button
                  onClick={() => setInput('Создай портфолио веб-дизайнера')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-105"
                >
                  <div className="text-white font-semibold mb-1 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Портфолио
                  </div>
                  <div className="text-gray-500 text-xs">Сайт-портфолио</div>
                </button>
                <button
                  onClick={() => setInput('Разработай интернет-магазин товаров')}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-105"
                >
                  <div className="text-white font-semibold mb-1 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    E-commerce
                  </div>
                  <div className="text-gray-500 text-xs">Магазин с корзиной</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
            )}
            <div className={`max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-white text-black rounded-2xl px-5 py-3.5 shadow-lg'
                : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200 rounded-2xl px-5 py-3.5'
            }`}>
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {msg.content}
                {msg.streaming && <span className="animate-pulse ml-1 text-white">▋</span>}
              </p>
              {msg.credits_used > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Использовано: {msg.credits_used} {msg.credits_used === 1 ? 'кредит' : 'кредитов'}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center ml-3 flex-shrink-0 shadow-lg">
                <span className="text-white text-sm font-bold">Вы</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-gray-400 text-sm">Генерирую код...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-[#0a0a0a] backdrop-blur-xl">
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => setIsDiscussionMode(!isDiscussionMode)}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-1.5 ${
                isDiscussionMode
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              {isDiscussionMode ? (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  Обсуждение
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Генерация
                </>
              )}
            </button>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="hidden md:block bg-white/10 text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none cursor-pointer hover:bg-white/20 transition-all font-medium"
            >
              <option value="deepseek" className="bg-black">DeepSeek</option>
              <option value="sonnet-4.5" className="bg-black">Claude Sonnet</option>
              <option value="opus-4.5" className="bg-black">Claude Opus</option>
            </select>

            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="hidden md:block bg-white/10 text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none cursor-pointer hover:bg-white/20 transition-all font-medium"
            >
              <option value="html" className="bg-black">HTML</option>
              <option value="react" className="bg-black">React</option>
              <option value="vue" className="bg-black">Vue</option>
            </select>

            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="hidden sm:block bg-white/10 text-xs text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none cursor-pointer hover:bg-white/20 transition-all font-medium"
            >
              <option value="simple" className="bg-black">Простой</option>
              <option value="standard" className="bg-black">Стандарт</option>
              <option value="advanced" className="bg-black">Продвинутый</option>
            </select>

            {attachedFiles.length > 0 && (
              <div className="text-xs text-white flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                <Paperclip className="w-3 h-3" />
                <span className="font-medium">{attachedFiles.length} файл(а)</span>
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Прикрепить файлы"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={() => setInput('Сгенерируй изображение: ')}
              className="flex-shrink-0 p-2.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Генерация изображения (5 кредитов)"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setInput('Создай видео: ')}
              className="flex-shrink-0 p-2.5 rounded-lg hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all"
              title="Генерация видео (10 кредитов)"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={toggleRecording}
              className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
              title="Голосовой ввод"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttach}
              className="hidden"
              multiple
            />

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Опишите, что хотите создать..."
              className="flex-1 bg-transparent border-0 text-white text-sm placeholder:text-gray-600 focus:outline-none focus-visible:ring-0 resize-none py-3 px-2 min-h-[52px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 p-3 rounded-lg bg-white hover:bg-gray-200 text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg"
              title="Отправить"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1.5">
              {isDiscussionMode ? (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  Режим обсуждения - бесплатно
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Генерация: 1 кредит
                </>
              )}
            </span>
            {userCredits !== undefined && (
              <span className="text-gray-500 font-medium">
                Баланс: <span className="text-white">{userCredits}</span> кредитов
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}