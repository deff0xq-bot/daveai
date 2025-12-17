import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, CheckCircle, XCircle, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function DomainSettings({ projectId }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadDomains();
  }, [projectId]);

  const loadDomains = async () => {
    const result = await base44.entities.Domain.filter({ project_id: projectId });
    setDomains(result);
    setLoading(false);
  };

  const addDomain = async () => {
    if (!newDomain.trim()) return;

    setAdding(true);
    try {
      const verificationToken = Math.random().toString(36).substring(2, 15);
      const dnsRecords = [
        { type: 'A', name: '@', value: '76.76.21.21' },
        { type: 'CNAME', name: 'www', value: 'daveai.base44.app' },
        { type: 'TXT', name: '_dave-verification', value: verificationToken }
      ];

      await base44.entities.Domain.create({
        project_id: projectId,
        domain_name: newDomain,
        status: 'pending',
        dns_records: dnsRecords,
        verification_token: verificationToken,
        ssl_status: 'pending'
      });

      setNewDomain('');
      loadDomains();
      toast.success('Домен добавлен! Настройте DNS записи');
    } catch (error) {
      toast.error('Ошибка добавления домена');
    } finally {
      setAdding(false);
    }
  };

  const verifyDomain = async (domainId) => {
    toast.loading('Проверка DNS...', { id: 'verify' });
    
    // Симуляция проверки
    setTimeout(async () => {
      await base44.entities.Domain.update(domainId, {
        status: 'verified',
        ssl_status: 'issued'
      });
      loadDomains();
      toast.success('Домен подтвержден!', { id: 'verify' });
    }, 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано!');
  };

  const statusColors = {
    pending: 'text-yellow-500',
    verified: 'text-green-500',
    active: 'text-blue-500',
    failed: 'text-red-500'
  };

  const statusIcons = {
    pending: Loader2,
    verified: CheckCircle,
    active: CheckCircle,
    failed: XCircle
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <Globe className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">Домены</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Добавить домен</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addDomain()}
              />
              <Button
                onClick={addDomain}
                disabled={adding || !newDomain.trim()}
                className="bg-white hover:bg-gray-200 text-black"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Добавить'}
              </Button>
            </div>
          </div>

          {domains.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Нет подключенных доменов
            </div>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => {
                const StatusIcon = statusIcons[domain.status];
                return (
                  <div key={domain.id} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">{domain.domain_name}</span>
                      </div>
                      <StatusIcon className={`w-4 h-4 ${statusColors[domain.status]} ${domain.status === 'pending' ? 'animate-spin' : ''}`} />
                    </div>

                    {domain.status === 'pending' && (
                      <>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400">Настройте DNS записи:</div>
                          {domain.dns_records?.map((record, idx) => (
                            <div key={idx} className="bg-[#0d0d0d] rounded p-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Тип: {record.type}</span>
                                <button
                                  onClick={() => copyToClipboard(record.value)}
                                  className="p-1 hover:bg-[#1a1a1a] rounded"
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                              <div className="text-xs text-white">Имя: {record.name}</div>
                              <div className="text-xs text-gray-400 break-all">Значение: {record.value}</div>
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={() => verifyDomain(domain.id)}
                          variant="outline"
                          className="w-full border-[#2a2a2a] hover:bg-[#2a2a2a] text-white text-sm"
                        >
                          Проверить DNS
                        </Button>
                      </>
                    )}

                    {domain.status === 'verified' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-green-500">
                          <CheckCircle className="w-3 h-3" />
                          DNS настроен
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-500">
                          <CheckCircle className="w-3 h-3" />
                          SSL: {domain.ssl_status === 'issued' ? 'Активен' : 'Ожидание'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}