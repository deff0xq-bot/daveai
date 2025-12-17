import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function TemplateSelector({ onSelect, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const allTemplates = await base44.entities.Template.filter(
        { is_public: true },
        '-created_date',
        50
      );
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Все' },
    { value: 'portfolio', label: 'Портфолио' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'blog', label: 'Блог' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'dashboard', label: 'Дашборд' },
    { value: 'other', label: 'Другое' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelect = (template) => {
    const fullHtml = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <style>
    ${template.css_code || ''}
  </style>
</head>
<body>
  ${template.html_code}
  ${template.js_code ? `<script>${template.js_code}</script>` : ''}
</body>
</html>`;
    
    onSelect(template, fullHtml);
    toast.success(`Шаблон "${template.name}" выбран`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h2 className="text-lg md:text-xl font-bold text-white">Выберите шаблон</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 p-4 border-b border-[#1a1a1a] overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Шаблоны не найдены
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02]"
                >
                  {/* Preview Image */}
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    {template.preview_image ? (
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-6xl opacity-20">🎨</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Использовать
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 text-left">
                    <h3 className="text-white font-semibold mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {template.description || 'Готовый шаблон для быстрого старта'}
                    </p>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#2a2a2a] text-gray-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}