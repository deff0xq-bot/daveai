import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborationPanel({ projectId, currentUser }) {
  const [activeSessions, setActiveSessions] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadCollaborators();
    loadComments();
    
    const interval = setInterval(() => {
      loadCollaborators();
      updateMySession();
    }, 3000);

    return () => clearInterval(interval);
  }, [projectId]);

  const loadCollaborators = async () => {
    const sessions = await base44.entities.CollaborationSession.filter({ project_id: projectId });
    const recentSessions = sessions.filter(s => {
      const lastActive = new Date(s.last_active || s.created_date);
      return Date.now() - lastActive.getTime() < 60000; // Активны в последние 60 сек
    });
    setActiveSessions(recentSessions);
  };

  const loadComments = async () => {
    const allComments = await base44.entities.ProjectComment.filter({ project_id: projectId }, '-created_date');
    setComments(allComments);
  };

  const updateMySession = async () => {
    const existingSessions = await base44.entities.CollaborationSession.filter({
      project_id: projectId,
      user_email: currentUser.email
    });

    if (existingSessions.length > 0) {
      await base44.entities.CollaborationSession.update(existingSessions[0].id, {
        last_active: new Date().toISOString(),
        user_name: currentUser.full_name || currentUser.email
      });
    } else {
      await base44.entities.CollaborationSession.create({
        project_id: projectId,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        last_active: new Date().toISOString()
      });
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    await base44.entities.ProjectComment.create({
      project_id: projectId,
      user_email: currentUser.email,
      user_name: currentUser.full_name || currentUser.email,
      content: newComment
    });

    setNewComment('');
    loadComments();
    toast.success('Комментарий добавлен');
  };

  const resolveComment = async (commentId) => {
    await base44.entities.ProjectComment.update(commentId, { resolved: true });
    loadComments();
  };

  const userColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const getUserColor = (email) => {
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return userColors[hash % userColors.length];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <Users className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-white">Совместная работа</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Active Users */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Users className="w-3 h-3" />
              Онлайн ({activeSessions.length})
            </div>
            <div className="space-y-1">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-lg">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getUserColor(session.user_email) }}
                  />
                  <span className="text-sm text-white truncate flex-1">
                    {session.user_name}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              ))}
              {activeSessions.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  Только вы
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              Комментарии ({comments.filter(c => !c.resolved).length})
            </div>
            <div className="space-y-2">
              {comments.filter(c => !c.resolved).map((comment) => (
                <div key={comment.id} className="bg-[#1a1a1a] rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">{comment.user_name}</div>
                      <div className="text-sm text-white">{comment.content}</div>
                    </div>
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="p-1 hover:bg-[#2a2a2a] rounded"
                      title="Решить"
                    >
                      <CheckCircle className="w-4 h-4 text-gray-400 hover:text-green-500" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(comment.created_date).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
              {comments.filter(c => !c.resolved).length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  Нет комментариев
                </div>
              )}
            </div>
          </div>

          {/* New Comment */}
          <div className="space-y-2">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавить комментарий..."
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addComment()}
            />
            <Button
              onClick={addComment}
              disabled={!newComment.trim()}
              className="w-full bg-white hover:bg-gray-200 text-black"
            >
              <Send className="w-4 h-4 mr-2" />
              Отправить
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}