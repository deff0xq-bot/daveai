import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ArrowLeft, Loader2, RefreshCw, MessageSquare, Eye, History, Image, Search, Paintbrush, Edit3, Globe, Smartphone, Users, TrendingUp, Split } from 'lucide-react';
import { toast } from 'sonner';
import ChatInterface from '../components/ChatInterface';
import AppPreview from '../components/AppPreview';
import InteractivePreview from '../components/InteractivePreview';
import VersionHistory from '../components/VersionHistory';
import ImageGenerator from '../components/ImageGenerator';
import SEOSettings from '../components/SEOSettings';
import ElementEditor from '../components/ElementEditor';
import DomainSettings from '../components/DomainSettings';
import MobilePreview from '../components/MobilePreview';
import CollaborationPanel from '../components/CollaborationPanel';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ABTestManager from '../components/ABTestManager';
import ContentGenerator from '../components/ContentGenerator';
import AIUIBuilder from '../components/AIUIBuilder';
import StyleTransfer from '../components/StyleTransfer';
import PromptManager from '../components/PromptManager';
import SiteStructureGenerator from '../components/SiteStructureGenerator';

export default function Editor() {
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [mobileView, setMobileView] = useState('chat');
  const [leftPanel, setLeftPanel] = useState('chat');
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [mobilePreviewMode, setMobilePreviewMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('id');

      if (projectId) {
        const allProjects = await base44.entities.Project.list('-created_date', 100);
        const foundProject = allProjects.find(p => p.id === projectId);
        
        if (foundProject) {
          setProject(foundProject);
        } else {
          console.error('Project not found with ID:', projectId);
          toast.error('Проект не найден');
          navigate(createPageUrl('Projects'));
        }
      } else {
        toast.error('ID проекта не указан');
        navigate(createPageUrl('Projects'));
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Ошибка загрузки проекта: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeGenerated = async (code, userMessage = '') => {
    const isFullHtml = code.trim().toLowerCase().startsWith('<!doctype') || code.trim().toLowerCase().startsWith('<html');
    
    const htmlCode = isFullHtml ? code : `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;

    const newVersion = (project.version_number || 1) + 1;

    // Сохраняем предыдущую версию в историю
    if (project.code) {
      await base44.entities.CodeVersion.create({
        project_id: project.id,
        code: project.code,
        html_preview: project.html_preview,
        version_number: project.version_number || 1,
        description: 'Автосохранение перед обновлением',
        created_by_message: userMessage
      });
    }

    await base44.entities.Project.update(project.id, {
      code: code,
      html_preview: htmlCode,
      status: 'ready',
      version_number: newVersion
    });

    // Перезагружаем проект из базы данных
    const allProjects = await base44.entities.Project.list('-created_date', 100);
    const updatedProject = allProjects.find(p => p.id === project.id);
    if (updatedProject) {
      setProject(updatedProject);
    }
    
    setPreviewKey(prev => prev + 1);
    toast.success('Код успешно сгенерирован!');
  };

  const handleRevertVersion = async (version) => {
    await base44.entities.Project.update(project.id, {
      code: version.code,
      html_preview: version.html_preview,
      status: 'ready',
      version_number: version.version_number
    });

    const allProjects = await base44.entities.Project.list('-created_date', 100);
    const updatedProject = allProjects.find(p => p.id === project.id);
    if (updatedProject) {
      setProject(updatedProject);
    }
    
    setPreviewKey(prev => prev + 1);
  };

  const handleInsertImage = async (imageUrl) => {
    const imageTag = `<img src="${imageUrl}" alt="Generated image" style="max-width: 100%; height: auto;" />`;
    
    // Вставляем изображение в конец body
    let updatedCode = project.code || '';
    if (updatedCode.includes('</body>')) {
      updatedCode = updatedCode.replace('</body>', `${imageTag}\n</body>`);
    } else {
      updatedCode += `\n${imageTag}`;
    }

    await handleCodeGenerated(updatedCode, 'Вставлено AI изображение');
    toast.success('Изображение добавлено!');
  };

  const handleElementSelect = (elementInfo) => {
    setSelectedElement(elementInfo);
  };

  const handleApplyElementChanges = async (elementInfo, changes) => {
    let updatedCode = project.code || project.html_preview || '';
    
    // Создаем уникальный идентификатор для элемента
    const elementId = `dave-element-${Date.now()}`;
    const element = elementInfo.element;
    
    // Получаем HTML элемента
    const elementHTML = element.outerHTML;
    
    // Создаем стиль для элемента
    const styleString = `font-size: ${changes.fontSize}; color: ${changes.color}; background-color: ${changes.backgroundColor}; width: ${changes.width}; height: ${changes.height};`;
    
    // Добавляем или обновляем атрибут style
    let newElementHTML;
    if (element.hasAttribute('style')) {
      newElementHTML = elementHTML.replace(/style="[^"]*"/, `style="${styleString}"`);
    } else {
      newElementHTML = elementHTML.replace(/^<(\w+)/, `<$1 style="${styleString}"`);
    }
    
    // Заменяем в коде
    if (updatedCode.includes(elementHTML)) {
      updatedCode = updatedCode.replace(elementHTML, newElementHTML);
    } else {
      // Если не нашли точное совпадение, добавляем стили в head
      const styleTag = `<style>.dave-styled { ${styleString} }</style>`;
      if (updatedCode.includes('</head>')) {
        updatedCode = updatedCode.replace('</head>', `${styleTag}\n</head>`);
      } else {
        updatedCode = styleTag + updatedCode;
      }
    }

    await handleCodeGenerated(updatedCode, 'Изменение элемента через визуальный редактор');
    setSelectedElement(null);
  };

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
    toast.success('Превью обновлено');
  };

  const publishToVercel = async () => {
    if (!project?.html_preview) {
      toast.error('Нет кода для публикации');
      return;
    }

    setPublishing(true);
    toast.loading('Публикация...', { id: 'publishing' });
    
    try {
      // Добавляем водяной знак и стили
      let htmlWithWatermark = project.html_preview;
      
      // Стили для водяного знака
      const watermarkStyles = `
<style>
.dave-watermark {
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  z-index: 999999 !important;
}
.dave-watermark a {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  background: rgba(0, 0, 0, 0.9) !important;
  color: white !important;
  padding: 10px 16px !important;
  border-radius: 12px !important;
  text-decoration: none !important;
  font-family: system-ui, -apple-system, sans-serif !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
  transition: all 0.3s ease !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
}
.dave-watermark a:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 6px 16px rgba(0,0,0,0.7) !important;
}
</style>`;

      const watermark = `
<div class="dave-watermark">
  <a href="https://daveai.base44.app" target="_blank" rel="noopener">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
    <span>Edit with Dave AI</span>
  </a>
</div>`;
      
      // Добавляем стили перед </head> или в начало
      if (htmlWithWatermark.includes('</head>')) {
        htmlWithWatermark = htmlWithWatermark.replace('</head>', watermarkStyles + '\n</head>');
      } else {
        htmlWithWatermark = watermarkStyles + htmlWithWatermark;
      }
      
      // Добавляем водяной знак перед </body>
      if (htmlWithWatermark.includes('</body>')) {
        htmlWithWatermark = htmlWithWatermark.replace('</body>', watermark + '\n</body>');
      } else {
        htmlWithWatermark += watermark;
      }

      // Добавляем аналитику
      const analyticsScript = `
      <script>
      (function() {
      const projectId = '${project.id}';
      let sessionStart = Date.now();
      let pageViews = 0;

      function trackView() {
      pageViews++;
      fetch('https://api.base44.app/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      project_id: projectId,
      type: 'view',
      timestamp: new Date().toISOString(),
      referrer: document.referrer
      })
      });
      }

      trackView();
      window.addEventListener('beforeunload', () => {
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      navigator.sendBeacon('https://api.base44.app/track', JSON.stringify({
      project_id: projectId,
      type: 'exit',
      duration: duration,
      bounced: pageViews === 1
      }));
      });
      })();
      </script>`;

      if (htmlWithWatermark.includes('</body>')) {
        htmlWithWatermark = htmlWithWatermark.replace('</body>', analyticsScript + '\n</body>');
      } else {
        htmlWithWatermark += analyticsScript;
      }
      
      // Создаём Blob URL для просмотра
      const blob = new Blob([htmlWithWatermark], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Сохраняем HTML в base64 для постоянного хранения
      const base64Html = btoa(unescape(encodeURIComponent(htmlWithWatermark)));
      const dataUrl = `data:text/html;base64,${base64Html}`;
      
      await base44.entities.Project.update(project.id, {
        vercel_url: dataUrl,
        status: 'published'
      });

      setProject({ ...project, vercel_url: dataUrl, status: 'published' });
      toast.success('Опубликовано!', { id: 'publishing' });
      
      // Открываем через blob URL (работает лучше для больших файлов)
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Publishing error:', error);
      toast.error('Ошибка: ' + (error.message || 'Неизвестная ошибка'), { id: 'publishing' });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d] text-gray-400">
        Проект не найден
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d]">
      {/* Top Bar */}
      <div className="h-12 border-b border-[#1a1a1a] flex items-center justify-between px-2 md:px-4 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate(createPageUrl('Projects'))}
            className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <input
            type="text"
            value={project.name}
            onChange={async (e) => {
              const newName = e.target.value;
              setProject({ ...project, name: newName });
              await base44.entities.Project.update(project.id, { name: newName });
            }}
            className="text-xs md:text-sm text-gray-400 bg-transparent border-none focus:outline-none focus:text-white w-full max-w-[150px] md:max-w-none"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Mobile: Only essential buttons */}
          <button
            onClick={() => setLeftPanel(leftPanel === 'history' ? 'chat' : 'history')}
            className={`md:hidden p-1.5 hover:bg-[#1a1a1a] rounded-md transition-colors ${
              leftPanel === 'history' ? 'bg-[#1a1a1a] text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="История"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={refreshPreview}
            disabled={!project.html_preview}
            className="md:hidden p-1.5 hover:bg-[#1a1a1a] text-gray-400 hover:text-white rounded-md transition-colors disabled:opacity-30"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Desktop: Essential buttons only */}
          <button
            onClick={() => setLeftPanel(leftPanel === 'chat' ? 'chat' : 'chat')}
            className={`hidden md:block p-1.5 hover:bg-[#1a1a1a] rounded-md transition-colors ${
              leftPanel === 'chat' ? 'bg-[#1a1a1a] text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Чат с AI"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditMode(!editMode);
              setLeftPanel('visual');
            }}
            className={`hidden md:block p-1.5 hover:bg-[#1a1a1a] rounded-md transition-colors ${
              editMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Визуальные изменения"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={refreshPreview}
            disabled={!project.html_preview}
            className="hidden md:block p-1.5 hover:bg-[#1a1a1a] text-gray-400 hover:text-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Обновить превью"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={publishToVercel}
            disabled={publishing || !project.html_preview}
            className="px-2 md:px-4 py-1 md:py-1.5 bg-white hover:bg-gray-200 text-black text-[10px] md:text-sm rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {publishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Buttons */}
      <div className="md:hidden flex border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <button
          onClick={() => setMobileView('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mobileView === 'chat'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Чат
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mobileView === 'preview'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-500'
          }`}
        >
          <Eye className="w-4 h-4" />
          Превью
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] border-r border-[#1a1a1a] bg-[#0a0a0a]`}>
          {leftPanel === 'chat' && (
            <ChatInterface
              projectId={project.id}
              project={project}
              onCodeGenerated={handleCodeGenerated}
              userCredits={user?.credits || 0}
            />
          )}
          {leftPanel === 'visual' && (
            <ElementEditor
              selectedElement={selectedElement}
              onApplyChanges={handleApplyElementChanges}
            />
          )}
          {leftPanel === 'history' && (
            <VersionHistory
              projectId={project.id}
              onRevert={handleRevertVersion}
              currentVersion={project.version_number || 1}
            />
          )}
          {leftPanel === 'images' && (
            <ImageGenerator
              projectId={project.id}
              onInsertImage={handleInsertImage}
            />
          )}
          {leftPanel === 'seo' && (
            <SEOSettings
              project={project}
              onUpdate={setProject}
            />
          )}
          {leftPanel === 'domains' && (
            <DomainSettings
              projectId={project.id}
            />
          )}
          {leftPanel === 'collab' && (
            <CollaborationPanel
              projectId={project.id}
              currentUser={user}
            />
          )}
          {leftPanel === 'analytics' && (
            <AnalyticsDashboard
              projectId={project.id}
            />
          )}
          {leftPanel === 'abtest' && (
            <ABTestManager
              code={project.code}
              onSelectVariant={async (variantCode) => {
                await handleCodeGenerated(variantCode, 'Выбран A/B вариант');
                setLeftPanel('chat');
              }}
            />
          )}
          {leftPanel === 'content' && (
            <ContentGenerator
              projectId={project.id}
              onInsertContent={async (content) => {
                let updatedCode = project.code || project.html_preview || '';
                if (updatedCode.includes('</body>')) {
                  updatedCode = updatedCode.replace('</body>', `${content}\n</body>`);
                } else {
                  updatedCode += `\n${content}`;
                }
                await handleCodeGenerated(updatedCode, 'Добавлен AI контент');
              }}
            />
          )}
          {leftPanel === 'uibuilder' && (
            <AIUIBuilder
              onGenerateUI={async (uiCode) => {
                let updatedCode = project.code || project.html_preview || '';
                if (updatedCode.includes('</body>')) {
                  updatedCode = updatedCode.replace('</body>', `${uiCode}\n</body>`);
                } else {
                  updatedCode += `\n${uiCode}`;
                }
                await handleCodeGenerated(updatedCode, 'Добавлен AI UI компонент');
              }}
            />
          )}
          {leftPanel === 'styletransfer' && (
            <StyleTransfer
              onApplyStyle={async (cssCode, styleData) => {
                let updatedCode = project.code || project.html_preview || '';
                const styleTag = `<style>\n${cssCode}\n</style>`;
                if (updatedCode.includes('</head>')) {
                  updatedCode = updatedCode.replace('</head>', `${styleTag}\n</head>`);
                } else {
                  updatedCode = styleTag + updatedCode;
                }
                await handleCodeGenerated(updatedCode, 'Применен стиль из изображения');
              }}
            />
          )}
          {leftPanel === 'prompts' && (
            <PromptManager
              onSelectPrompt={(prompt) => {
                // Переключаемся в чат и можем автоматически заполнить промпт
                setLeftPanel('chat');
                toast.success(`Промпт "${prompt.name}" выбран`);
              }}
            />
          )}
          {leftPanel === 'structure' && (
            <SiteStructureGenerator
              onGenerateStructure={async (htmlCode, structureData) => {
                await handleCodeGenerated(htmlCode, 'Создан сайт по AI структуре');
                setLeftPanel('chat');
              }}
            />
          )}
          </div>

        {/* Preview Area */}
        <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 bg-[#0d0d0d] relative`}>
          {project.html_preview ? (
            editMode ? (
              <InteractivePreview 
                html={project.html_preview} 
                key={previewKey}
                editMode={editMode}
                onElementSelect={handleElementSelect}
              />
            ) : mobilePreviewMode ? (
              <MobilePreview html={project.html_preview} key={previewKey} />
            ) : (
              <AppPreview html={project.html_preview} key={previewKey} />
            )
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center text-gray-600 px-4">
                <div className="text-6xl mb-4 opacity-20">
                  <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                  </svg>
                </div>
                <p className="text-xs md:text-sm">Ваше превью появится здесь</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}