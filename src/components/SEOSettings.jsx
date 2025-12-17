import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Sparkles, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SEOSettings({ project, onUpdate }) {
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (project) {
      setSeoTitle(project.seo_title || '');
      setSeoDescription(project.seo_description || '');
      setSeoKeywords(project.seo_keywords || '');
    }
  }, [project]);

  const autoGenerateSEO = async () => {
    setGenerating(true);
    try {
      toast.loading('Генерация SEO...', { id: 'seo' });

      const prompt = `На основе этого проекта создай SEO метаданные:
Название: ${project.name}
Описание: ${project.description || 'Не указано'}
Код: ${project.code ? project.code.substring(0, 500) : 'Нет кода'}

Верни JSON с полями: title (до 60 символов), description (до 160 символов), keywords (до 10 ключевых слов через запятую)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            keywords: { type: 'string' }
          }
        }
      });

      setSeoTitle(response.title);
      setSeoDescription(response.description);
      setSeoKeywords(response.keywords);

      toast.success('SEO сгенерировано!', { id: 'seo' });
    } catch (error) {
      console.error('Error generating SEO:', error);
      toast.error('Ошибка генерации SEO', { id: 'seo' });
    } finally {
      setGenerating(false);
    }
  };

  const saveSEO = async () => {
    try {
      await base44.entities.Project.update(project.id, {
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords
      });

      if (onUpdate) {
        onUpdate({
          ...project,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: seoKeywords
        });
      }

      toast.success('SEO сохранено!');
    } catch (error) {
      console.error('Error saving SEO:', error);
      toast.error('Ошибка сохранения');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <Search className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">SEO</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Заголовок (Title)
          </label>
          <Input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="SEO заголовок (до 60 символов)"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
            maxLength={60}
          />
          <div className="text-xs text-gray-600 mt-1">
            {seoTitle.length}/60
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Описание (Description)
          </label>
          <Textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="SEO описание (до 160 символов)"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm resize-none"
            rows={4}
            maxLength={160}
          />
          <div className="text-xs text-gray-600 mt-1">
            {seoDescription.length}/160
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Ключевые слова (Keywords)
          </label>
          <Input
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
          />
        </div>

        <Button
          onClick={autoGenerateSEO}
          disabled={generating}
          variant="outline"
          className="w-full border-[#2a2a2a] hover:bg-[#1a1a1a] text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? 'Генерация...' : 'AI Генерация'}
        </Button>

        <Button
          onClick={saveSEO}
          className="w-full bg-white hover:bg-gray-200 text-black"
        >
          <Save className="w-4 h-4 mr-2" />
          Сохранить
        </Button>
      </div>
    </div>
  );
}