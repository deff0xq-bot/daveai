import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout, Loader2, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AIUIBuilder({ onGenerateUI }) {
  const [description, setDescription] = useState('');
  const [colorScheme, setColorScheme] = useState('#667eea');
  const [responsive, setResponsive] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedUI, setGeneratedUI] = useState('');

  const generateUI = async () => {
    if (!description.trim()) {
      toast.error('Опишите UI');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `Создай ${responsive ? 'адаптивный (responsive)' : ''} UI компонент: "${description}".
      
      Основной цвет: ${colorScheme}
      
      ТРЕБОВАНИЯ:
      - Полный HTML с inline CSS и JavaScript если нужно
      - Современный дизайн с тенями, скруглениями, градиентами
      - Используй CSS Grid/Flexbox для компоновки
      ${responsive ? '- Media queries для мобильных устройств (@media max-width: 768px, 480px)' : ''}
      - Интерактивные элементы (hover эффекты, transitions)
      - Доступность (aria-labels, semantic HTML)
      - Цветовая схема на основе ${colorScheme}
      
      Примеры компонентов: формы, карточки, навигация, модальные окна, таблицы, галереи и т.д.
      
      Верни только готовый код без объяснений.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setGeneratedUI(response);
      toast.success('UI компонент создан!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка генерации');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUI);
    toast.success('Скопировано');
  };

  const handlePreview = () => {
    const blob = new Blob([generatedUI], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleUse = () => {
    if (onGenerateUI) {
      onGenerateUI(generatedUI);
      toast.success('UI добавлен в проект');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">AI UI Builder</h3>
        </div>

        <div className="space-y-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите UI: 'форма входа с email и паролем', 'карточки товаров в сетке', 'навигационное меню с выпадающими списками'..."
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
            rows={4}
          />

          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Цветовая схема</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="w-16 h-10 p-1 bg-[#1a1a1a] border-[#2a2a2a]"
                />
                <Input
                  type="text"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={responsive}
                onChange={(e) => setResponsive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs text-gray-400">Адаптивный</span>
            </label>
          </div>

          <Button
            onClick={generateUI}
            disabled={generating || !description.trim()}
            className="w-full bg-white hover:bg-gray-200 text-black"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Создание UI...
              </>
            ) : (
              'Создать UI'
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {generatedUI ? (
          <div className="space-y-3">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">{generatedUI}</pre>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Копировать
              </Button>
              <Button onClick={handlePreview} variant="outline" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Превью
              </Button>
              <Button onClick={handleUse} className="flex-1 bg-white hover:bg-gray-200 text-black">
                Использовать
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-center">
            <div>
              <Layout className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Опишите нужный UI</p>
              <p className="text-xs mt-2">AI создаст компонент с HTML, CSS и JS</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}