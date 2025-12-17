import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings as SettingsIcon, User, CreditCard, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('ru');

  useEffect(() => {
    loadUser();
    const savedLang = localStorage.getItem('language') || 'ru';
    setLanguage(savedLang);
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // Отправляем событие для обновления всех компонентов
    window.dispatchEvent(new Event('languageChange'));
    toast.success(`Язык изменен на ${lang === 'ru' ? 'Русский' : lang === 'en' ? 'English' : 'Українська'}`);
    // Перезагружаем страницу для применения изменений
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8" style={{
          textShadow: '0 0 40px rgba(255,255,255,0.3)'
        }}>
          Настройки
        </h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-white">Профиль</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Имя</label>
                <p className="text-white">{user?.full_name || 'Не указано'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Роль</label>
                <p className="text-white">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-white">Язык</h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => handleLanguageChange('ru')}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all hover:scale-105 text-sm sm:text-base min-h-[44px] ${
                  language === 'ru' 
                    ? 'bg-white text-black' 
                    : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                }`}
              >
                🇷🇺 Русский
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all hover:scale-105 text-sm sm:text-base min-h-[44px] ${
                  language === 'en' 
                    ? 'bg-white text-black' 
                    : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => handleLanguageChange('uk')}
                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all hover:scale-105 text-sm sm:text-base min-h-[44px] ${
                  language === 'uk' 
                    ? 'bg-white text-black' 
                    : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                }`}
              >
                🇺🇦 Українська
              </button>
            </div>
          </div>

          {/* Credits Section */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-white">Кредиты</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-white">∞</span>
              <span className="text-gray-500">кредитов доступно</span>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-white">Общие настройки</h2>
            </div>
            <p className="text-gray-500 text-sm">Дополнительные настройки в разработке...</p>
          </div>
        </div>
      </div>
    </div>
  );
}