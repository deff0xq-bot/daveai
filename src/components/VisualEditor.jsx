import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paintbrush, Type, Image as ImageIcon, Layout } from 'lucide-react';
import { toast } from 'sonner';

export default function VisualEditor({ project, onApplyChanges }) {
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [imageUrl, setImageUrl] = useState('');
  const [imageWidth, setImageWidth] = useState('100');

  const applyChanges = () => {
    const styles = `
      body {
        background-color: ${bgColor} !important;
        color: ${textColor} !important;
        font-size: ${fontSize}px !important;
        font-family: ${fontFamily}, sans-serif !important;
      }
    `;

    let updatedCode = project.code || '';
    
    // Добавляем стили
    if (updatedCode.includes('</head>')) {
      if (updatedCode.includes('<style>')) {
        updatedCode = updatedCode.replace(/<style>[\s\S]*?<\/style>/, `<style>${styles}</style>`);
      } else {
        updatedCode = updatedCode.replace('</head>', `<style>${styles}</style>\n</head>`);
      }
    } else {
      updatedCode = `<style>${styles}</style>\n` + updatedCode;
    }

    if (imageUrl) {
      const imgTag = `<img src="${imageUrl}" style="width: ${imageWidth}%; height: auto; display: block; margin: 20px auto;" />`;
      if (updatedCode.includes('</body>')) {
        updatedCode = updatedCode.replace('</body>', `${imgTag}\n</body>`);
      } else {
        updatedCode += `\n${imgTag}`;
      }
    }

    onApplyChanges(updatedCode);
    toast.success('Стили применены!');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <Paintbrush className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">Визуальный редактор</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Цвета */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-white">Цвета</h4>
            </div>
            
            <div>
              <Label className="text-xs text-gray-400">Фон</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-400">Текст</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Шрифты */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-white">Шрифт</h4>
            </div>

            <div>
              <Label className="text-xs text-gray-400">Семейство</Label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm px-3 py-2 rounded-md"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
              </select>
            </div>

            <div>
              <Label className="text-xs text-gray-400">Размер (px)</Label>
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                min="8"
                max="72"
              />
            </div>
          </div>

          {/* Изображение */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-white">Изображение</h4>
            </div>

            <div>
              <Label className="text-xs text-gray-400">URL</Label>
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-400">Ширина (%)</Label>
              <Input
                type="number"
                value={imageWidth}
                onChange={(e) => setImageWidth(e.target.value)}
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                min="10"
                max="100"
              />
            </div>
          </div>

          <Button
            onClick={applyChanges}
            className="w-full bg-white hover:bg-gray-200 text-black"
          >
            Применить изменения
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}