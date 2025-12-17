import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function VersionHistory({ projectId, onRevert, currentVersion }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    try {
      const allVersions = await base44.entities.CodeVersion.filter(
        { project_id: projectId },
        '-created_date',
        50
      );
      setVersions(allVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (version) => {
    try {
      toast.loading('Восстановление версии...', { id: 'revert' });
      await onRevert(version);
      toast.success('Версия восстановлена!', { id: 'revert' });
    } catch (error) {
      toast.error('Ошибка восстановления', { id: 'revert' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 text-sm">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <History className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">История версий</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              История версий пуста
            </div>
          ) : (
            versions.map((version, idx) => (
              <div
                key={version.id}
                className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {version.version_number === currentVersion ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="text-white text-sm font-medium">
                      Версия {version.version_number}
                    </span>
                  </div>
                  {version.version_number !== currentVersion && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRevert(version)}
                      className="h-6 text-xs text-gray-400 hover:text-white"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Восстановить
                    </Button>
                  )}
                </div>

                {version.description && (
                  <p className="text-xs text-gray-400 mb-2">{version.description}</p>
                )}

                {version.created_by_message && (
                  <p className="text-xs text-gray-500 italic mb-2">
                    "{version.created_by_message.substring(0, 100)}..."
                  </p>
                )}

                <div className="text-xs text-gray-600">
                  {moment(version.created_date).format('DD.MM.YYYY HH:mm')}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}