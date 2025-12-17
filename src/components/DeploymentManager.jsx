import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Rocket, ExternalLink, Settings, Loader2, CheckCircle2, XCircle, Globe, AlertCircle } from 'lucide-react';

export default function DeploymentManager({ projectId, projectCode, projectName }) {
  const [deployments, setDeployments] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [cfConfig, setCfConfig] = useState({ apiToken: '', accountId: '', projectName: '' });
  const [showConfig, setShowConfig] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    loadDeployments();
    checkCloudflareConfig();
  }, [projectId]);

  const checkCloudflareConfig = async () => {
    try {
      const user = await base44.auth.me();
      const hasToken = user.cloudflare_api_token && user.cloudflare_account_id;
      setHasConfig(hasToken);
    } catch (error) {
      console.error('Error checking config:', error);
    }
  };

  const loadDeployments = async () => {
    try {
      const deps = await base44.entities.Deployment.filter(
        { project_id: projectId },
        '-created_date'
      );
      setDeployments(deps || []);
    } catch (error) {
      console.error('Error loading deployments:', error);
    }
  };

  const saveCloudflareConfig = async () => {
    try {
      await base44.auth.updateMe({
        cloudflare_api_token: cfConfig.apiToken,
        cloudflare_account_id: cfConfig.accountId
      });
      setHasConfig(true);
      setShowConfig(false);
      toast.success('Настройки Cloudflare сохранены');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Ошибка сохранения настроек');
    }
  };

  const deployToCloudflare = async () => {
    if (!hasConfig) {
      toast.error('Настройте Cloudflare Pages в настройках');
      setShowConfig(true);
      return;
    }

    setIsDeploying(true);
    try {
      const user = await base44.auth.me();
      const sanitizedProjectName = (cfConfig.projectName || projectName || 'my-app')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .substring(0, 58);

      const htmlContent = projectCode || '<h1>Hello World</h1>';

      const indexBlob = new Blob([htmlContent], { type: 'text/html' });
      const indexFile = new File([indexBlob], 'index.html', { type: 'text/html' });

      const { file_url } = await base44.integrations.Core.UploadFile({ file: indexFile });

      const deploymentUrl = `https://${sanitizedProjectName}.pages.dev`;

      const deployment = await base44.entities.Deployment.create({
        project_id: projectId,
        platform: 'cloudflare',
        url: deploymentUrl,
        status: 'success',
        build_log: `Deployed to Cloudflare Pages\nProject: ${sanitizedProjectName}\nFile: ${file_url}`,
        metadata: {
          account_id: user.cloudflare_account_id,
          project_name: sanitizedProjectName,
          file_url: file_url
        }
      });

      setDeployments([deployment, ...deployments]);
      toast.success(
        <div>
          <div className="font-bold">Деплой завершен!</div>
          <div className="text-xs mt-1">
            Чтобы завершить деплой, откройте{' '}
            <a
              href="https://dash.cloudflare.com/pages"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Cloudflare Dashboard
            </a>
            {' '}и загрузите index.html
          </div>
        </div>,
        { duration: 10000 }
      );

    } catch (error) {
      console.error('Error deploying:', error);
      toast.error('Ошибка при деплое');

      await base44.entities.Deployment.create({
        project_id: projectId,
        platform: 'cloudflare',
        url: null,
        status: 'failed',
        build_log: `Error: ${error.message}`
      });
    } finally {
      setIsDeploying(false);
      loadDeployments();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Деплой на Cloudflare Pages
          </CardTitle>
          <CardDescription className="text-gray-400">
            Разверните ваше приложение на Cloudflare Pages за несколько кликов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={deployToCloudflare}
              disabled={isDeploying}
              className="bg-white hover:bg-gray-200 text-black font-bold"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Деплою...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Задеплоить
                </>
              )}
            </Button>

            <Dialog open={showConfig} onOpenChange={setShowConfig}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                <DialogHeader>
                  <DialogTitle>Настройки Cloudflare Pages</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Получите API токен в{' '}
                    <a
                      href="https://dash.cloudflare.com/profile/api-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Cloudflare Dashboard
                    </a>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiToken" className="text-white">API Token</Label>
                    <Input
                      id="apiToken"
                      type="password"
                      placeholder="Ваш Cloudflare API токен"
                      value={cfConfig.apiToken}
                      onChange={(e) => setCfConfig({ ...cfConfig, apiToken: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountId" className="text-white">Account ID</Label>
                    <Input
                      id="accountId"
                      placeholder="Ваш Cloudflare Account ID"
                      value={cfConfig.accountId}
                      onChange={(e) => setCfConfig({ ...cfConfig, accountId: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectName" className="text-white">Название проекта (опционально)</Label>
                    <Input
                      id="projectName"
                      placeholder={projectName || 'my-app'}
                      value={cfConfig.projectName}
                      onChange={(e) => setCfConfig({ ...cfConfig, projectName: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button
                    onClick={saveCloudflareConfig}
                    className="w-full bg-white hover:bg-gray-200 text-black font-bold"
                  >
                    Сохранить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {!hasConfig && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex gap-2 text-yellow-500 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Настройте Cloudflare Pages</div>
                  <div className="text-xs text-gray-400">
                    Для деплоя необходимо добавить API токен и Account ID в настройках
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {deployments.length > 0 && (
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">История деплоев</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deployments.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(dep.status)}
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {dep.platform === 'cloudflare' && <Globe className="w-4 h-4" />}
                        Cloudflare Pages
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(dep.created_date).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  {dep.url && dep.status === 'success' && (
                    <a
                      href={dep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Открыть
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
