import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Paperclip, Layout, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedPlaceholder from '../components/AnimatedPlaceholder';
import TemplateSelector from '../components/TemplateSelector';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const handleFileAttach = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const uploadedFiles = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedFiles.push({ name: file.name, url: file_url });
      }
      setAttachedFiles([...attachedFiles, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Ошибка загрузки файлов: ' + error.message);
    }
  };

  const createNewProject = async () => {
    if (!prompt.trim()) return;

    if (!isAuthenticated || !user) {
      toast.error('Подождите, идет авторизация...');
      return;
    }

    setIsCreating(true);
    try {
      const projectName = `Project ${Date.now()}`;

      const project = await base44.entities.Project.create({
        user_email: user.email,
        name: projectName,
        description: prompt,
        status: 'draft',
        files: attachedFiles
      });

      console.log('Created project:', project);
      navigate(createPageUrl(`Editor?id=${project.id}`));
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Ошибка создания проекта: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = async (template, htmlCode) => {
    if (!isAuthenticated || !user) {
      toast.error('Подождите, идет авторизация...');
      return;
    }

    try {
      const project = await base44.entities.Project.create({
        user_email: user.email,
        name: template.name,
        description: template.description || '',
        status: 'ready',
        code: htmlCode,
        html_preview: htmlCode,
        files: []
      });

      setShowTemplates(false);
      navigate(createPageUrl(`Editor?id=${project.id}`));
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast.error('Ошибка создания проекта: ' + error.message);
    }
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
              disabled={isLoadingAuth}
              className="flex items-center gap-2 px-4 md:px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-xl transition-all hover:scale-105 text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingAuth ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden xs:inline">Загрузка...</span>
                  <span className="xs:hidden">...</span>
                </>
              ) : (
                <>
                  <Layout className="w-4 h-4" />
                  <span className="hidden xs:inline">Начать с шаблона</span>
                  <span className="xs:hidden">Шаблон</span>
                </>
              )}
            </button>
          </div>

          {/* Input Box */}
          <div className="max-w-3xl mx-auto px-2 sm:px-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex flex-col gap-3 p-3 sm:p-4 md:p-5">
                <div className="flex items-start gap-2 sm:gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 p-2.5 rounded-lg hover:bg-white/10 transition-all group"
                    title="Прикрепить файлы"
                  >
                    <Paperclip className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileAttach}
                    className="hidden"
                    multiple
                  />
                  <div className="flex-1 relative">
                    <Input
                      placeholder=""
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="bg-transparent border-0 text-sm sm:text-base md:text-lg text-white placeholder:text-gray-600 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[48px] px-0"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && prompt.trim() && !isCreating) {
                          e.preventDefault();
                          createNewProject();
                        }
                      }}
                    />
                    {!prompt && (
                      <div className="absolute left-0 top-3 pointer-events-none text-sm sm:text-base md:text-lg text-gray-600">
                        <AnimatedPlaceholder />
                      </div>
                    )}
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white">
                        <Paperclip className="w-3 h-3" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <select className="bg-white/10 text-xs sm:text-sm text-white px-3 py-2 rounded-lg border border-white/20 focus:outline-none cursor-pointer hover:bg-white/20 transition-colors">
                    <option value="deepseek" className="bg-black">DeepSeek</option>
                    <option value="sonnet-4.5" className="bg-black">Claude Sonnet 4.5</option>
                    <option value="opus-4.5" className="bg-black">Claude Opus 4.5</option>
                  </select>

                  <Button
                    onClick={createNewProject}
                    disabled={!prompt.trim() || isCreating || isLoadingAuth}
                    className="bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2 shadow-lg"
                  >
                    {isLoadingAuth ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Загрузка...</span>
                      </>
                    ) : isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Создание...</span>
                      </>
                    ) : (
                      <>
                        <span>Создать приложение</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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