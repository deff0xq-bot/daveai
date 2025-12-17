import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Paperclip, Layout } from 'lucide-react';
import AnimatedPlaceholder from '../components/AnimatedPlaceholder';
import TemplateSelector from '../components/TemplateSelector';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileAttach = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadedFiles = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploadedFiles.push({ name: file.name, url: file_url });
    }
    setAttachedFiles([...attachedFiles, ...uploadedFiles]);
  };

  const createNewProject = async () => {
    if (!prompt.trim()) return;

    setIsCreating(true);
    try {
      // Генерируем название проекта с помощью AI
      const projectName = await base44.integrations.Core.InvokeLLM({
        prompt: `Создай короткое название проекта (2-4 слова) на основе этого описания: "${prompt}". Верни ТОЛЬКО название без кавычек и дополнительного текста.`,
        add_context_from_internet: false
      });

      const project = await base44.entities.Project.create({
        name: projectName.trim(),
        description: prompt,
        status: 'draft',
        files: attachedFiles
      });

      navigate(createPageUrl(`Editor?id=${project.id}`));
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = async (template, htmlCode) => {
    const project = await base44.entities.Project.create({
      name: template.name,
      description: template.description || '',
      status: 'ready',
      code: htmlCode,
      html_preview: htmlCode,
      files: []
    });

    setShowTemplates(false);
    navigate(createPageUrl(`Editor?id=${project.id}`));
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-gray-800 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-gray-700 to-transparent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10 animate-pulse" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animationDuration: '4s'
        }}></div>

        {/* Floating dots with animation */}
        <div className="absolute inset-0 opacity-20 animate-pulse" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 2px, transparent 2px)`,
          backgroundSize: '60px 60px',
          animationDuration: '3s'
        }}></div>

        {/* Moving light rays */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-white to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <div className="w-full max-w-4xl text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] animate-fade-in hover:scale-105 transition-transform">
            <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400 animate-pulse" />
            <span className="text-[10px] md:text-xs font-medium text-gray-400">
              Представляем Dave V2
            </span>
          </div>
          
          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-tight px-2 sm:px-4 animate-fade-in" style={{
            textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.1)'
          }}>
            Что вы будете делать <span className="text-white">build</span> сегодня?
          </h1>
          
          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-lg text-gray-400 max-w-2xl mx-auto px-2 sm:px-4 animate-fade-in" style={{
            animationDelay: '0.2s',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            Создавайте потрясающие приложения и веб-сайты, общаясь с ИИ.
          </p>

          {/* Quick Start with Templates */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 px-2 sm:px-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-4 md:px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-xl transition-all hover:scale-105 text-sm font-bold shadow-lg"
            >
              <Layout className="w-4 h-4" />
              <span className="hidden xs:inline">Начать с шаблона</span>
              <span className="xs:hidden">Шаблон</span>
            </button>
          </div>

          {/* Input Box */}
          <div className="max-w-3xl mx-auto px-2 sm:px-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg sm:rounded-xl overflow-hidden shadow-2xl hover:shadow-white/10 transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-2.5 md:p-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded hover:bg-white/10 transition-all"
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttach}
                  className="hidden"
                  multiple
                />
                <Input
                  placeholder=""
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-xs sm:text-sm md:text-base text-white placeholder:text-gray-600 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && prompt.trim() && !isCreating) {
                      e.preventDefault();
                      createNewProject();
                    }
                  }}
                />
                {!prompt && (
                  <div className="absolute left-12 sm:left-14 md:left-20 pointer-events-none text-xs sm:text-sm md:text-base text-gray-600">
                    <AnimatedPlaceholder />
                  </div>
                )}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <select className="hidden sm:block bg-white/10 text-sm text-white px-3 py-2 rounded-lg border border-white/20 focus:outline-none cursor-pointer hover:bg-white/20 transition-colors">
                    <option value="deepseek" className="bg-black">DeepSeek</option>
                    <option value="sonnet-4.5" className="bg-black">Claude Sonnet 4.5</option>
                    <option value="opus-4.5" className="bg-black">Claude Opus 4.5</option>
                  </select>
                  <Button
                    onClick={createNewProject}
                    disabled={!prompt.trim() || isCreating}
                    className="bg-white hover:bg-gray-200 text-black px-4 md:px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap shadow-lg"
                  >
                    <span className="hidden sm:inline">{isCreating ? 'Создание...' : 'Создать сейчас'}</span>
                    <span className="sm:hidden">{isCreating ? '...' : 'Создать'}</span>
                    {!isCreating && <ArrowRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
            </div>

            {/* Template Selector Modal */}
            {showTemplates && (
            <TemplateSelector
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
            />
            )}
            </div>
            </div>
            </div>
            );
            }