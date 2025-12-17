import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paintbrush, Loader2, Upload, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function StyleTransfer({ onApplyStyle }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [extractedStyle, setExtractedStyle] = useState(null);
  const [generatedCSS, setGeneratedCSS] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      toast.success('Изображение загружено');
      
      // Автоматически анализируем стиль
      await analyzeStyle(file_url);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const analyzeStyle = async (url) => {
    setAnalyzing(true);
    try {
      const prompt = `Проанализируй изображение и извлеки его стиль для веб-дизайна.
      
      Определи:
      1. Доминирующую цветовую палитру (5-6 цветов с HEX кодами)
      2. Стиль (современный, винтажный, минималистичный и т.д.)
      3. Настроение (яркое, темное, спокойное, энергичное)
      4. Типографику (serif, sans-serif, рекомендуемые шрифты)
      5. Текстуры и паттерны
      
      Верни JSON структуру.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: [url],
        response_json_schema: {
          type: "object",
          properties: {
            colors: {
              type: "object",
              properties: {
                primary: { type: "string" },
                secondary: { type: "string" },
                accent: { type: "string" },
                background: { type: "string" },
                text: { type: "string" }
              }
            },
            style: { type: "string" },
            mood: { type: "string" },
            typography: {
              type: "object",
              properties: {
                family: { type: "string" },
                recommended_fonts: { type: "array", items: { type: "string" } }
              }
            },
            textures: { type: "string" }
          }
        }
      });

      setExtractedStyle(response);
      
      // Генерируем CSS на основе стиля
      await generateStyleCSS(response);
      
      toast.success('Стиль извлечен!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка анализа');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateStyleCSS = async (styleData) => {
    const prompt = `Создай CSS код для веб-дизайна на основе этого стиля:
    
    Цвета: ${JSON.stringify(styleData.colors)}
    Стиль: ${styleData.style}
    Настроение: ${styleData.mood}
    Типографика: ${JSON.stringify(styleData.typography)}
    Текстуры: ${styleData.textures}
    
    Создай:
    - CSS переменные для цветов
    - Стили для body, headers (h1-h6)
    - Стили для кнопок (.btn, .btn-primary, .btn-secondary)
    - Стили для карточек (.card)
    - Стили для форм (input, textarea, select)
    - Gradient backgrounds если уместно
    - Box shadows и border radius
    - Hover эффекты
    
    Верни только CSS код без объяснений.`;

    try {
      const css = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setGeneratedCSS(css);
    } catch (error) {
      console.error('Error generating CSS:', error);
    }
  };

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(generatedCSS);
    toast.success('CSS скопирован');
  };

  const handleApply = () => {
    if (onApplyStyle && generatedCSS) {
      onApplyStyle(generatedCSS, extractedStyle);
      toast.success('Стиль применен');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-3">
          <Paintbrush className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Перенос стиля</h3>
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || analyzing}
          className="w-full bg-white hover:bg-gray-200 text-black"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Загрузить изображение
            </>
          )}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <ScrollArea className="flex-1 p-4">
        {analyzing && (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Анализ стиля изображения...</p>
            </div>
          </div>
        )}

        {imageUrl && !analyzing && (
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
              <img src={imageUrl} alt="Uploaded" className="w-full rounded-lg" />
            </div>

            {extractedStyle && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="text-white text-sm font-semibold mb-2">Цветовая палитра</h4>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(extractedStyle.colors || {}).map(([name, color]) => (
                      <div key={name} className="text-center">
                        <div 
                          className="w-12 h-12 rounded-lg border border-[#3a3a3a]" 
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs text-gray-500 mt-1">{name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-gray-400">Стиль: <span className="text-white">{extractedStyle.style}</span></p>
                  <p className="text-gray-400">Настроение: <span className="text-white">{extractedStyle.mood}</span></p>
                  <p className="text-gray-400">Шрифты: <span className="text-white">{extractedStyle.typography?.family}</span></p>
                </div>
              </div>
            )}

            {generatedCSS && (
              <div className="space-y-2">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                  <h4 className="text-white text-sm font-semibold mb-2">Сгенерированный CSS</h4>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-64">
                    {generatedCSS}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCopyCSS} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать
                  </Button>
                  <Button onClick={handleApply} className="flex-1 bg-white hover:bg-gray-200 text-black">
                    Применить стиль
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!imageUrl && !analyzing && (
          <div className="flex items-center justify-center h-full text-gray-500 text-center">
            <div>
              <Paintbrush className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Перенесите стиль изображения</p>
              <p className="text-xs mt-2">Загрузите изображение для извлечения стиля</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}