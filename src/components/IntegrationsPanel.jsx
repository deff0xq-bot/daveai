import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Database, Github, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationsPanel({ projectId }) {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [integrations, setIntegrations] = useState({
    supabase: false,
    github: false
  });

  const saveSupabase = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast.error('Заполните все поля Supabase');
      return;
    }

    try {
      const project = await base44.entities.Project.filter({ id: projectId });
      const currentProject = project[0];
      
      await base44.entities.Project.update(projectId, {
        ...currentProject,
        integrations: {
          ...(currentProject.integrations || {}),
          supabase: {
            url: supabaseUrl,
            key: supabaseKey,
            connected: true
          }
        }
      });

      setIntegrations({ ...integrations, supabase: true });
      toast.success('Supabase подключен!');
    } catch (error) {
      toast.error('Ошибка подключения Supabase');
    }
  };

  const saveGithub = async () => {
    if (!githubToken || !githubRepo) {
      toast.error('Заполните все поля GitHub');
      return;
    }

    try {
      const project = await base44.entities.Project.filter({ id: projectId });
      const currentProject = project[0];
      
      await base44.entities.Project.update(projectId, {
        ...currentProject,
        integrations: {
          ...(currentProject.integrations || {}),
          github: {
            token: githubToken,
            repo: githubRepo,
            connected: true
          }
        }
      });

      setIntegrations({ ...integrations, github: true });
      toast.success('GitHub подключен!');
    } catch (error) {
      toast.error('Ошибка подключения GitHub');
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [projectId]);

  const loadIntegrations = async () => {
    const project = await base44.entities.Project.filter({ id: projectId });
    if (project[0]?.integrations) {
      const int = project[0].integrations;
      setIntegrations({
        supabase: !!int.supabase?.connected,
        github: !!int.github?.connected
      });
      if (int.supabase) {
        setSupabaseUrl(int.supabase.url || '');
        setSupabaseKey(int.supabase.key || '');
      }
      if (int.github) {
        setGithubToken(int.github.token || '');
        setGithubRepo(int.github.repo || '');
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-[#1a1a1a]">
        <h2 className="text-lg font-semibold text-white">Интеграции</h2>
        <p className="text-xs text-gray-500 mt-1">Подключите базы данных и Git</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Supabase */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-500" />
              <h3 className="text-white font-semibold">Supabase</h3>
            </div>
            {integrations.supabase && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Подключено
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Project URL</label>
              <Input
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxx.supabase.co"
                className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Anon Key</label>
              <Input
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-sm"
                type="password"
              />
            </div>

            <Button
              onClick={saveSupabase}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {integrations.supabase ? 'Обновить' : 'Подключить'} Supabase
            </Button>
          </div>
        </div>

        {/* GitHub */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">GitHub</h3>
            </div>
            {integrations.github && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Подключено
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Personal Access Token</label>
              <Input
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-sm"
                type="password"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Repository</label>
              <Input
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="username/repo-name"
                className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-sm"
              />
            </div>

            <Button
              onClick={saveGithub}
              className="w-full bg-white hover:bg-gray-200 text-black"
            >
              {integrations.github ? 'Обновить' : 'Подключить'} GitHub
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
          <p className="mb-2">💡 <strong>Supabase:</strong> После подключения вы сможете использовать базу данных в своем проекте</p>
          <p>💡 <strong>GitHub:</strong> Автоматически синхронизирует код с вашим репозиторием</p>
        </div>
      </div>
    </div>
  );
}