import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import { Toaster } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { t } from './components/i18n';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      
      // Проверяем и начисляем ежедневные кредиты
      await checkDailyBonus(userData.email);
      
      // Загружаем актуальный баланс кредитов
      const transactions = await base44.entities.CreditTransaction.filter(
        { user_email: userData.email },
        '-created_date'
      );
      const totalCredits = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      setUser({ ...userData, credits: totalCredits });
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const checkDailyBonus = async (userEmail) => {
    try {
      // Получаем все транзакции пользователя для подсчета кредитов
      const allTransactions = await base44.entities.CreditTransaction.filter(
        { user_email: userEmail },
        '-created_date'
      );

      // Подсчитываем текущий баланс
      const currentBalance = allTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      // Проверяем ежедневный бонус
      const dailyBonusTransactions = allTransactions.filter(t => t.type === 'daily_bonus');
      const today = new Date().toISOString().split('T')[0];
      const hadBonusToday = dailyBonusTransactions.some(t => t.created_date.startsWith(today));
      
      // Если это первый вход (нет транзакций) или сегодня не было бонуса
      if (!hadBonusToday) {
        await base44.entities.CreditTransaction.create({
          user_email: userEmail,
          amount: 5,
          type: 'daily_bonus',
          description: allTransactions.length === 0 ? 'Приветственный бонус' : 'Ежедневный бонус'
        });
      }
    } catch (error) {
      console.error('Error checking daily bonus:', error);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handlePromoSubmit = async () => {
    if (promoCode.toUpperCase() === 'TIMOFEY') {
      await base44.auth.updateMe({ has_unlimited_credits: true });
      setUser({ ...user, has_unlimited_credits: true });
      setPromoDialogOpen(false);
      setPromoCode('');
      toast.success('🎉 Безлимитные кредиты активированы!');
    } else {
      toast.error('Неверный промокод');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Toaster position="top-right" theme="dark" />
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s ease-out;
        }
        button, a, [role="button"] {
          position: relative;
        }
        button::before, a::before, [role="button"]::before {
          content: '';
          position: absolute;
          inset: -30px;
          border-radius: inherit;
          cursor: pointer;
        }
      `}</style>
      {/* Header - Hidden on Editor page */}
      {currentPageName !== 'Editor' && (
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="container mx-auto px-3 md:px-6 h-12 md:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link to={createPageUrl('Home')} className="flex items-center gap-1.5 md:gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693dc1192a40ba960e285356/410298d2e_photo_2025-12-11_00-52-26.jpg"
                alt="Dave AI"
                className="w-6 h-6 md:w-8 md:h-8 rounded-lg"
              />
              <span className="text-base md:text-xl font-bold text-white">Dave AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:block px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-sm rounded-lg transition-colors"
              >
                {t('nav.logout')}
              </button>
            )}
          </div>
        </div>
      </header>
      )}

      {/* Navigation Menu */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 md:w-80 bg-[#0a0a0a] border-r border-[#1a1a1a] z-50 animate-slide-in-left">
            <div className="p-4 md:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-white">Навигация</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => {
                    navigate(createPageUrl('Home'));
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] rounded-lg transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-white">{t('nav.home')}</span>
                </button>

                <button
                  onClick={() => {
                    navigate(createPageUrl('Projects'));
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] rounded-lg transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-white">{t('nav.projects')}</span>
                </button>

                <button
                  onClick={() => {
                    navigate(createPageUrl('Settings'));
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] rounded-lg transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="text-white">{t('nav.settings')}</span>
                </button>

                <button
                  onClick={() => {
                    navigate(createPageUrl('Subscriptions'));
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] rounded-lg transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-white">Подписки</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      navigate(createPageUrl('UserManagement'));
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] rounded-lg transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-white">Пользователи</span>
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1a1a1a] rounded-lg transition-all hover:scale-105 active:scale-95 text-sm md:text-base md:hidden"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-white">{t('nav.logout')}</span>
                  </button>
                )}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      {currentPageName !== 'Editor' && (
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Dave AI</h3>
              <p className="text-sm text-gray-500">
                Создавайте приложения с помощью AI
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Ресурсы</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Поддержка →</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Блог →</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Галерея →</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Компания</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Карьера</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Конфиденциальность</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Условия</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#1a1a1a] text-center text-sm text-gray-600">
            © 2025 Dave AI. All rights reserved.
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}