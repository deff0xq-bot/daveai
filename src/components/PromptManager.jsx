import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Plus, Edit, Trash2, Star, X } from 'lucide-react';
import { toast } from 'sonner';

export default function PromptManager({ onSelectPrompt, category = 'all' }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState({
    name: '',
    description: '',
    category: category !== 'all' ? category : 'general',
    prompt_template: '',
    variables: [],
    is_favorite: false
  });

  useEffect(() => {
    loadPrompts();
  }, [category]);

  const loadPrompts = async () => {
    try {
      const filter = category === 'all' ? {} : { category };
      const allPrompts = await base44.entities.CustomPrompt.filter(filter, '-created_date', 100);
      setPrompts(allPrompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPrompt.name || !currentPrompt.prompt_template) {
      toast.error('Заполните название и промпт');
      return;
    }

    try {
      if (currentPrompt.id) {
        await base44.entities.CustomPrompt.update(currentPrompt.id, currentPrompt);
        toast.success('Промпт обновлен');
      } else {
        await base44.entities.CustomPrompt.create(currentPrompt);
        toast.success('Промпт сохранен');
      }
      
      setEditMode(false);
      setCurrentPrompt({
        name: '',
        description: '',
        category: category !== 'all' ? category : 'general',
        prompt_template: '',
        variables: [],
        is_favorite: false
      });
      loadPrompts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить промпт?')) return;
    
    try {
      await base44.entities.CustomPrompt.delete(id);
      toast.success('Промпт удален');
      loadPrompts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка удаления');
    }
  };

  const toggleFavorite = async (prompt) => {
    try {
      await base44.entities.CustomPrompt.update(prompt.id, {
        is_favorite: !prompt.is_favorite
      });
      loadPrompts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addVariable = () => {
    setCurrentPrompt({
      ...currentPrompt,
      variables: [...(currentPrompt.variables || []), { name: '', label: '', placeholder: '' }]
    });
  };

  const updateVariable = (index, field, value) => {
    const updated = [...currentPrompt.variables];
    updated[index][field] = value;
    setCurrentPrompt({ ...currentPrompt, variables: updated });
  };

  const removeVariable = (index) => {
    const updated = currentPrompt.variables.filter((_, i) => i !== index);
    setCurrentPrompt({ ...currentPrompt, variables: updated });
  };

  if (editMode) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <h3 className="text-white font-semibold">
            {currentPrompt.id ? 'Редактировать' : 'Новый'} промпт
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Название</label>
              <Input
                value={currentPrompt.name}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, name: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
                placeholder="Мой промпт"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Описание</label>
              <Input
                value={currentPrompt.description}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, description: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
                placeholder="Краткое описание"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Категория</label>
              <select
                value={currentPrompt.category}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, category: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white px-3 py-2 rounded-lg text-sm"
              >
                <option value="general">Общее</option>
                <option value="code">Код</option>
                <option value="content">Контент</option>
                <option value="ui">UI</option>
                <option value="style">Стиль</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Шаблон промпта (используйте {'{'}variable{'}'} для переменных)
              </label>
              <Textarea
                value={currentPrompt.prompt_template}
                onChange={(e) => setCurrentPrompt({ ...currentPrompt, prompt_template: e.target.value })}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                rows={6}
                placeholder="Создай {type} с {description}..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-400">Переменные</label>
                <Button size="sm" variant="ghost" onClick={addVariable}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              {currentPrompt.variables?.map((variable, idx) => (
                <div key={idx} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Переменная {idx + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeVariable(idx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={variable.name}
                      onChange={(e) => updateVariable(idx, 'name', e.target.value)}
                      placeholder="Имя (например: type)"
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-xs"
                    />
                    <Input
                      value={variable.label}
                      onChange={(e) => updateVariable(idx, 'label', e.target.value)}
                      placeholder="Метка (например: Тип)"
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-xs"
                    />
                    <Input
                      value={variable.placeholder}
                      onChange={(e) => updateVariable(idx, 'placeholder', e.target.value)}
                      placeholder="Подсказка"
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-white hover:bg-gray-200 text-black"
            >
              Сохранить промпт
            </Button>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Мои промпты</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setEditMode(true)}
            className="bg-white hover:bg-gray-200 text-black"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Загрузка...</div>
        ) : prompts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Нет сохраненных промптов</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prompts.map(prompt => (
              <div
                key={prompt.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-semibold text-sm">{prompt.name}</h4>
                      <button
                        onClick={() => toggleFavorite(prompt)}
                        className="text-gray-500 hover:text-yellow-500"
                      >
                        <Star className={`w-3 h-3 ${prompt.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </button>
                    </div>
                    {prompt.description && (
                      <p className="text-xs text-gray-500 mt-1">{prompt.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCurrentPrompt(prompt);
                        setEditMode(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <pre className="text-xs text-gray-400 bg-[#0a0a0a] p-2 rounded mb-2 overflow-x-auto">
                  {prompt.prompt_template.substring(0, 150)}
                  {prompt.prompt_template.length > 150 && '...'}
                </pre>

                <Button
                  size="sm"
                  onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                  className="w-full bg-white hover:bg-gray-200 text-black"
                >
                  Использовать
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}