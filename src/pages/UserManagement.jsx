import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Shield, Ban, CheckCircle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setCurrentUser(userData);

      if (userData.role !== 'admin') {
        toast.error('Доступ запрещен. Только для администраторов.');
        return;
      }

      const usersList = await base44.entities.User.list('-created_date');
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await base44.entities.User.update(userId, { role: newRole });
      toast.success('Роль пользователя изменена');
      loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Ошибка изменения роли');
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await base44.entities.User.update(userId, { status: newStatus });
      toast.success(newStatus === 'blocked' ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Ошибка изменения статуса');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-white mb-2">Доступ запрещен</h2>
          <p className="text-gray-500">Эта страница доступна только администраторам</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Управление пользователями</h1>
        </div>

        {/* Filters */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Поиск по email или имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#2a2a2a] text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-white">
                  <SelectValue placeholder="Фильтр по роли" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Найдено пользователей: {filteredUsers.length}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Имя</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Роль</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Статус</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Дата регистрации</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#0a0a0a] transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{user.full_name || 'Не указано'}</td>
                    <td className="px-6 py-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={user.id === currentUser.id}
                      >
                        <SelectTrigger className="w-32 bg-[#0a0a0a] border-[#2a2a2a] text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        user.status === 'blocked' 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {user.status === 'blocked' ? (
                          <>
                            <Ban className="w-3 h-3" />
                            Заблокирован
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Активен
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(user.created_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant={user.status === 'blocked' ? 'default' : 'destructive'}
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        disabled={user.id === currentUser.id}
                        className="text-xs"
                      >
                        {user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Пользователи не найдены
          </div>
        )}
      </div>
    </div>
  );
}