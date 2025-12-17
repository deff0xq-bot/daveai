import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SiteStructureGenerator({ onGenerateStructure }) {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [structure, setStructure] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateStructure = async () => {
    if (!description.trim()) {
      toast.error('Введите описание сайта');
      return;
    }

    setGenerating(true);
    toast.loading('Генерация структуры сайта...', { id: 'generating-structure' });

    try {
      const prompt = `На основе следующего описания создай детальную структуру сайта.

Описание: ${description}

Создай структуру в формате JSON со следующими элементами:
1. Название сайта (siteName)
2. Описание сайта (siteDescription)
3. Список страниц (pages) - массив объектов, каждый с:
   - name: название страницы
   - path: URL путь (например, /, /about, /services)
   - sections: массив секций страницы, каждая с:
     - type: тип секции (hero, features, about, services, testimonials, contact, footer и т.д.)
     - title: заголовок секции
     - description: описание контента
     - content: предложенный контент/текст
4. Цветовая схема (colorScheme) с primary, secondary, accent цветами
5. SEO метаданные (seo) с title, description, keywords
6. Рекомендации по функционалу (recommendations) - массив строк

Верни только валидный JSON без дополнительных объяснений.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            siteName: { type: "string" },
            siteDescription: { type: "string" },
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  path: { type: "string" },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        content: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            colorScheme: {
              type: "object",
              properties: {
                primary: { type: "string" },
                secondary: { type: "string" },
                accent: { type: "string" }
              }
            },
            seo: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                keywords: { type: "string" }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setStructure(response);
      toast.success('Структура сгенерирована!', { id: 'generating-structure' });
    } catch (error) {
      console.error('Error generating structure:', error);
      toast.error('Ошибка генерации структуры', { id: 'generating-structure' });
    } finally {
      setGenerating(false);
    }
  };

  const copyStructure = () => {
    navigator.clipboard.writeText(JSON.stringify(structure, null, 2));
    setCopied(true);
    toast.success('Структура скопирована');
    setTimeout(() => setCopied(false), 2000);
  };

  const useStructure = async () => {
    if (!structure) return;

    toast.loading('Создание сайта на основе структуры...', { id: 'create-site' });

    try {
      // Генерируем HTML на основе структуры
      const htmlPrompt = `На основе следующей структуры сайта создай полный HTML код с встроенными CSS и JavaScript.

Структура: ${JSON.stringify(structure, null, 2)}

Требования:
1. Современный, адаптивный дизайн
2. Использовать указанную цветовую схему
3. Плавные анимации и переходы
4. SEO-оптимизация (мета-теги, семантический HTML)
5. Все страницы в одном HTML файле с навигацией
6. Интерактивные элементы
7. Мобильная версия

Верни только полный HTML код без объяснений.`;

      const htmlCode = await base44.integrations.Core.InvokeLLM({
        prompt: htmlPrompt,
        add_context_from_internet: false
      });

      onGenerateStructure(htmlCode, structure);
      toast.success('Сайт создан!', { id: 'create-site' });
    } catch (error) {
      console.error('Error creating site:', error);
      toast.error('Ошибка создания сайта', { id: 'create-site' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-white" />
          <h2 className="text-lg font-bold text-white">Генератор структуры сайта</h2>
        </div>
        <p className="text-xs text-gray-500">
          AI создаст детальную структуру вашего сайта
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Опишите ваш сайт
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: Интернет-магазин одежды с каталогом, корзиной, формой заказа и блогом. Минималистичный дизайн в черно-белых тонах..."
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white h-32"
              disabled={generating}
            />
          </div>

          <Button
            onClick={generateStructure}
            disabled={generating || !description.trim()}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              'Сгенерировать структуру'
            )}
          </Button>

          {structure && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{structure.siteName}</h3>
                  <button
                    onClick={copyStructure}
                    className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">{structure.siteDescription}</p>

                {/* Pages */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Страницы:</h4>
                  {structure.pages?.map((page, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">{page.name}</span>
                        <span className="text-xs text-gray-500">{page.path}</span>
                      </div>
                      <div className="space-y-1">
                        {page.sections?.map((section, sIdx) => (
                          <div key={sIdx} className="text-xs text-gray-400 pl-3 border-l-2 border-[#2a2a2a]">
                            <span className="text-white">{section.type}</span>: {section.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color Scheme */}
                {structure.colorScheme && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Цветовая схема:</h4>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-[#2a2a2a]"
                          style={{ backgroundColor: structure.colorScheme.primary }}
                        />
                        <span className="text-xs text-gray-400">Primary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-[#2a2a2a]"
                          style={{ backgroundColor: structure.colorScheme.secondary }}
                        />
                        <span className="text-xs text-gray-400">Secondary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-[#2a2a2a]"
                          style={{ backgroundColor: structure.colorScheme.accent }}
                        />
                        <span className="text-xs text-gray-400">Accent</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO */}
                {structure.seo && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">SEO:</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div><span className="text-white">Title:</span> {structure.seo.title}</div>
                      <div><span className="text-white">Description:</span> {structure.seo.description}</div>
                      <div><span className="text-white">Keywords:</span> {structure.seo.keywords}</div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {structure.recommendations && structure.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Рекомендации:</h4>
                    <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                      {structure.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button
                onClick={useStructure}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Создать сайт по структуре
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}