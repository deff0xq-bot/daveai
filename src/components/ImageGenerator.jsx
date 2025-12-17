import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image as ImageIcon, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageGenerator({ projectId, onInsertImage }) {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadImages();
  }, [projectId]);

  const loadImages = async () => {
    try {
      const allImages = await base44.entities.GeneratedImage.filter(
        { project_id: projectId },
        '-created_date',
        50
      );
      setImages(allImages);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.CreditTransaction.create({
        user_email: user.email,
        amount: -1,
        type: 'generation',
        description: 'Генерация изображения',
        project_id: projectId
      });

      toast.loading('Генерация изображения...', { id: 'gen-img' });
      
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: prompt
      });

      const newImage = await base44.entities.GeneratedImage.create({
        project_id: projectId,
        prompt: prompt,
        image_url: url
      });

      setImages([newImage, ...images]);
      setPrompt('');
      toast.success('Изображение готово!', { id: 'gen-img' });
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Ошибка генерации', { id: 'gen-img' });
    } finally {
      setGenerating(false);
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL скопирован');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insertIntoCode = (image) => {
    if (onInsertImage) {
      onInsertImage(image.image_url);
    }
    base44.entities.GeneratedImage.update(image.id, { used_in_code: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <ImageIcon className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">AI Изображения</h3>
      </div>

      <div className="p-4 border-b border-[#1a1a1a]">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Опишите изображение..."
            className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
            onKeyDown={(e) => e.key === 'Enter' && generateImage()}
          />
          <Button
            onClick={generateImage}
            disabled={generating || !prompt.trim()}
            className="bg-white hover:bg-gray-200 text-black"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {generating ? 'Генерация...' : 'Создать'}
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-2">1 кредит за изображение</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              Изображения не созданы
            </div>
          ) : (
            images.map((img) => (
              <div
                key={img.id}
                className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a]"
              >
                <img
                  src={img.image_url}
                  alt={img.prompt}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                    {img.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyUrl(img.image_url, img.id)}
                      className="flex-1 text-xs h-7"
                    >
                      {copiedId === img.id ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      {copiedId === img.id ? 'Скопировано' : 'URL'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => insertIntoCode(img)}
                      className="flex-1 bg-white hover:bg-gray-200 text-black text-xs h-7"
                    >
                      Вставить
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}