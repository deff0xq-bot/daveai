import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Plus, Folder, Search, Trash2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, statusFilter, projects]);

  const loadProjects = async () => {
    const projectsList = await base44.entities.Project.list('-created_date');
    setProjects(projectsList);
    setLoading(false);
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;

    try {
      await base44.entities.Project.delete(projectId);
      toast.success('Проект удален');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Ошибка удаления проекта');
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Project.update(editingProject.id, {
        name: editName,
        description: editDescription
      });
      toast.success('Проект обновлен');
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Ошибка обновления проекта');
    }
  };

  const openEditDialog = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description || '');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white" style={{
            textShadow: '0 0 40px rgba(255,255,255,0.3)'
          }}>
            Мои проекты
          </h1>
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all hover:scale-105 active:scale-95 text-sm sm:text-base min-h-[40px]"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Новый проект</span>
            <span className="sm:hidden">Новый</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
              <Input
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 bg-[#0a0a0a] border-[#2a2a2a] text-white text-sm min-h-[40px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-white text-sm min-h-[40px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="generating">Генерация</SelectItem>
                <SelectItem value="ready">Готов</SelectItem>
                <SelectItem value="published">Опубликован</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Загрузка...</div>
        ) : filteredProjects.length === 0 && searchQuery === '' && statusFilter === 'all' ? (
          <div className="text-center py-20">
            <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 mb-4">У вас пока нет проектов</p>
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className="px-6 py-2 bg-white hover:bg-gray-200 text-black rounded-lg font-medium transition-all hover:scale-105"
            >
              Создать первый проект
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Проекты не найдены</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-6 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-all"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(createPageUrl(`Editor?id=${project.id}`))}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 hover:bg-[#222] transition-all cursor-pointer group relative"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => openEditDialog(project, e)}
                    className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <h3 className="text-white font-semibold mb-2 pr-20">{project.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{project.description || 'Без описания'}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="px-2 py-1 bg-[#2a2a2a] rounded">{project.status}</span>
                  <span>{new Date(project.created_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingProject && (
          <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
            <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
              <DialogHeader>
                <DialogTitle>Редактировать проект</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditProject} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Название</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Описание</label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingProject(null)}
                    className="bg-[#2a2a2a] border-[#3a3a3a] text-white hover:bg-[#3a3a3a]"
                  >
                    Отмена
                  </Button>
                  <Button type="submit" className="bg-white text-black hover:bg-gray-200">
                    Сохранить
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}