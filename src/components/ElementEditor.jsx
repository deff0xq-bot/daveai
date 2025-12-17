import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save } from 'lucide-react';

export default function ElementEditor({ selectedElement, onApplyChanges }) {
  const [fontSize, setFontSize] = useState('16');
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [width, setWidth] = useState('auto');
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    if (selectedElement) {
      setFontSize(parseInt(selectedElement.styles.fontSize) || 16);
      setColor(rgbToHex(selectedElement.styles.color) || '#000000');
      setBgColor(rgbToHex(selectedElement.styles.backgroundColor) || '#ffffff');
      setWidth(selectedElement.styles.width || 'auto');
      setHeight(selectedElement.styles.height || 'auto');
    }
  }, [selectedElement]);

  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    const match = rgb.match(/\d+/g);
    if (!match) return '#000000';
    const hex = match.slice(0, 3).map(x => {
      const h = parseInt(x).toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('');
    return '#' + hex;
  };

  const applyChanges = () => {
    if (!selectedElement) return;

    const changes = {
      fontSize: `${fontSize}px`,
      color: color,
      backgroundColor: bgColor,
      width: width === 'auto' ? 'auto' : `${width}px`,
      height: height === 'auto' ? 'auto' : `${height}px`
    };

    onApplyChanges(selectedElement, changes);
  };

  if (!selectedElement) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm p-4 text-center">
        Выберите элемент на странице для редактирования
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
          <div className="text-xs text-gray-400 mb-1">Элемент</div>
          <div className="text-sm text-white font-mono">&lt;{selectedElement.tag}&gt;</div>
          {selectedElement.text && (
            <div className="text-xs text-gray-500 mt-1 truncate">
              {selectedElement.text}
            </div>
          )}
        </div>

        <div>
          <Label className="text-xs text-gray-400">Размер шрифта (px)</Label>
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
            min="8"
            max="100"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-400">Цвет текста</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-400">Цвет фона</Label>
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

        {(selectedElement.tag === 'img' || selectedElement.tag === 'button' || selectedElement.tag === 'div') && (
          <>
            <div>
              <Label className="text-xs text-gray-400">Ширина (px)</Label>
              <Input
                type="number"
                value={width === 'auto' ? '' : width}
                onChange={(e) => setWidth(e.target.value || 'auto')}
                placeholder="auto"
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                min="10"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-400">Высота (px)</Label>
              <Input
                type="number"
                value={height === 'auto' ? '' : height}
                onChange={(e) => setHeight(e.target.value || 'auto')}
                placeholder="auto"
                className="mt-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                min="10"
              />
            </div>
          </>
        )}

        <Button
          onClick={applyChanges}
          className="w-full bg-white hover:bg-gray-200 text-black"
        >
          <Save className="w-4 h-4 mr-2" />
          Применить
        </Button>
      </div>
    </ScrollArea>
  );
}