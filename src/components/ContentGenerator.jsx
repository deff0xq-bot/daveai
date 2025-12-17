import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Loader2, Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentGenerator({ projectId, onInsertContent }) {
  const [contentType, setContentType] = useState('blog');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const contentTypes = [
    { value: 'blog', label: 'Блог пост', placeholder: 'Тема: 10 советов по веб-дизайну' },
    { value: 'product', label: 'Описание товара', placeholder: 'Товар: Беспроводные наушники' },
    { value: 'landing', label: 'Landing текст', placeholder: 'Продукт: SaaS платформа для аналитики' },
    { value: 'social', label: 'Соц. сети', placeholder: 'Анонс: новая функция в приложении' },
    { value: 'meta', label: 'Meta описания', placeholder: 'Страница: главная страница интернет-магазина' }
  ];

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Введите описание');
      return;
    }

    setGenerating(true);
    try {
      const contentPrompts = {
        blog: `Напиши SEO-оптимизированный блог пост на тему: "${prompt}". 
               Включи: заголовок H1, подзаголовки H2-H3, ключевые слова естественно в тексте.
               Формат: готовый HTML с семантическими тегами <article>, <header>, <section>.
               Длина: 500-800 слов.`,
        product: `Создай продающее SEO-описание товара: "${prompt}".
                 Включи: название товара, краткое описание, ключевые характеристики, преимущества, призыв к действию.
                 Используй убедительный язык и ключевые слова.
                 Формат: готовый HTML с микроразметкой Schema.org (Product).`,
        landing: `Напиши конверсионный текст для лендинга: "${prompt}".
                 Структура: цепляющий заголовок, подзаголовок, описание проблемы, решение, преимущества, социальное доказательство, призыв к действию.
                 Формат: готовый HTML с семантическими тегами.`,
        social: `Создай 3 варианта поста для соц. сетей: "${prompt}".
                Каждый пост: цепляющий текст, эмодзи, хэштеги.
                Варианты для: Facebook/Instagram, Twitter, LinkedIn.
                Формат: текст с разделителями "=== Вариант N ===".`,
        meta: `Создай SEO мета-теги для страницы: "${prompt}".
              Включи: title (55-60 символов), description (150-160 символов), keywords (10-15 слов), og:tags, twitter:card.
              Формат: готовые HTML meta теги.`
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contentPrompts[contentType],
        add_context_from_internet: true
      });

      setGeneratedContent(response);
      toast.success('Контент сгенерирован!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Скопировано');
  };

  const handleInsert = () => {
    if (onInsertContent) {
      onInsertContent(generatedContent);
      toast.success('Контент добавлен');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Генератор контента</h3>
        </div>

        <div className="space-y-3">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full bg-[#1a1a1a] text-white px-3 py-2 rounded-lg border border-[#2a2a2a] text-sm"
          >
            {contentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={contentTypes.find(t => t.value === contentType)?.placeholder}
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
            rows={3}
          />

          <Button
            onClick={generateContent}
            disabled={generating || !prompt.trim()}
            className="w-full bg-white hover:bg-gray-200 text-black"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              'Сгенерировать контент'
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {generatedContent ? (
          <div className="space-y-3">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">{generatedContent}</pre>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Копировать
              </Button>
              <Button
                onClick={handleInsert}
                className="flex-1 bg-white hover:bg-gray-200 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Вставить
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-center">
            <div>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Генерируйте SEO-контент</p>
              <p className="text-xs mt-2">Блог посты, описания товаров, тексты</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}