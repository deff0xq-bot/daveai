import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Split, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ABTestManager({ code, onSelectVariant }) {
  const [variants, setVariants] = useState(() => {
    // Парсим варианты из кода
    if (!code) return [];
    
    const variantAMatch = code.match(/===\s*ВАРИАНТ A\s*===([\s\S]*?)(?====\s*ВАРИАНТ B\s*===|$)/i);
    const variantBMatch = code.match(/===\s*ВАРИАНТ B\s*===([\s\S]*?)$/i);
    
    const result = [];
    if (variantAMatch) {
      result.push({ name: 'Вариант A', code: variantAMatch[1].trim() });
    }
    if (variantBMatch) {
      result.push({ name: 'Вариант B', code: variantBMatch[1].trim() });
    }
    
    // Если не найдено разделение, создаем один вариант
    if (result.length === 0 && code) {
      result.push({ name: 'Основной вариант', code: code.trim() });
    }
    
    return result;
  });

  const handleCopy = (variantCode) => {
    navigator.clipboard.writeText(variantCode);
    toast.success('Код скопирован');
  };

  const handlePreview = (variantCode) => {
    const blob = new Blob([variantCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (variants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Split className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">A/B тестирование</p>
          <p className="text-xs mt-2">Попросите AI создать варианты страницы</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-2">
          <Split className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">A/B Тестирование</h3>
        </div>
        <p className="text-xs text-gray-500">
          Найдено {variants.length} вариант(ов) для тестирования
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {variants.map((variant, idx) => (
            <div
              key={idx}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">{variant.name}</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(variant.code)}
                    className="h-8 px-3"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreview(variant.code)}
                    className="h-8 px-3"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <pre className="text-xs text-gray-400 bg-[#0a0a0a] p-3 rounded-lg overflow-x-auto max-h-48">
                {variant.code.substring(0, 300)}
                {variant.code.length > 300 && '...'}
              </pre>

              <Button
                onClick={() => onSelectVariant(variant.code)}
                className="w-full mt-3 bg-white hover:bg-gray-200 text-black"
              >
                Использовать этот вариант
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}