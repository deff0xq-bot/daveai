import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, X, Crown, Zap, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const PLANS = {
  basic: {
    name: 'Basic',
    price_usd: 9.99,
    price_rub: 999,
    price_ton: 1.5,
    icon: Zap,
    gradient: 'from-gray-700 to-gray-800',
    features: [
      { text: '100 генераций кода в месяц', included: true },
      { text: '20 изображений AI в месяц', included: true },
      { text: 'Базовые шаблоны', included: true },
      { text: 'Техническая поддержка', included: false },
      { text: 'Приоритетная генерация', included: false },
      { text: 'Кастомные промпты', included: false }
    ]
  },
  pro: {
    name: 'Pro',
    price_usd: 29.99,
    price_rub: 2999,
    price_ton: 4.5,
    icon: Crown,
    gradient: 'from-gray-600 to-gray-700',
    popular: true,
    features: [
      { text: '500 генераций кода в месяц', included: true },
      { text: '100 изображений AI в месяц', included: true },
      { text: 'Все шаблоны', included: true },
      { text: 'Техническая поддержка', included: true },
      { text: 'Приоритетная генерация', included: true },
      { text: 'Кастомные промпты', included: false }
    ]
  },
  ultimate: {
    name: 'Ultimate',
    price_usd: 99.99,
    price_rub: 9999,
    price_ton: 15,
    icon: Rocket,
    gradient: 'from-white to-gray-500',
    features: [
      { text: 'Безлимитные генерации кода', included: true },
      { text: 'Безлимитные изображения AI', included: true },
      { text: 'Все шаблоны + эксклюзивные', included: true },
      { text: 'Приоритетная поддержка 24/7', included: true },
      { text: 'Мгновенная генерация', included: true },
      { text: 'Кастомные промпты', included: true }
    ]
  }
};

const TON_WALLET_ADDRESS = 'UQBN-LD_8VQJFG_Y2F3TEKcZDwBjQ9uCMlU7EwOA8beQ_gX7';

export default function Subscriptions() {
  const [user, setUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const subscriptions = await base44.entities.Subscription.filter(
        { user_email: userData.email, status: 'active' },
        '-created_date',
        1
      );
      if (subscriptions.length > 0) {
        setCurrentSubscription(subscriptions[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const detectRegion = () => {
    const lang = navigator.language || navigator.userLanguage;
    return lang.includes('ru') ? 'RUB' : 'USD';
  };

  const getPlanPrice = (plan) => {
    const region = detectRegion();
    return region === 'RUB' 
      ? `${PLANS[plan].price_rub} ₽`
      : `$${PLANS[plan].price_usd}`;
  };

  const handleSelectPlan = (planType) => {
    setSelectedPlan(planType);
    setPaymentDialog(true);
    setPaymentMethod(null);
  };

  const handlePaymentMethod = (method) => {
    setPaymentMethod(method);
    
    if (method === 'foreign_card' || method === 'russian_card') {
      toast.error('Этот метод оплаты временно недоступен');
      return;
    }
  };

  const handleTonPayment = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);
      
      const tonAmount = PLANS[selectedPlan].price_ton;
      const nanotons = Math.floor(tonAmount * 1e9);

      // Создаем ссылку для оплаты TON
      const tonLink = `ton://transfer/${TON_WALLET_ADDRESS}?amount=${nanotons}&text=DaveAI_${selectedPlan}_${user.email}`;
      
      // Пытаемся открыть через TON Connect
      if (window.TonConnect) {
        const connector = new window.TonConnect();
        await connector.sendTransaction({
          to: TON_WALLET_ADDRESS,
          value: nanotons.toString(),
          comment: `Dave AI ${PLANS[selectedPlan].name} subscription - ${user.email}`
        });
      } else {
        // Открываем универсальную ссылку
        window.open(tonLink, '_blank');
      }

      // Имитируем успешную транзакцию для демо (в реальности нужен webhook)
      setTimeout(async () => {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await base44.entities.Subscription.create({
          user_email: user.email,
          plan_type: selectedPlan,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          payment_method: 'crypto_ton',
          transaction_hash: 'demo_' + Date.now()
        });

        if (selectedPlan === 'ultimate') {
          await base44.auth.updateMe({ has_unlimited_credits: true });
        }

        toast.success('✅ Подписка активирована!');
        setPaymentDialog(false);
        loadUserData();
        setProcessing(false);
      }, 3000);

    } catch (error) {
      console.error('TON payment error:', error);
      toast.error('Ошибка оплаты');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm text-gray-300">Специальное предложение</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6">
            Выберите свой план
          </h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
            Раскройте весь потенциал Dave AI с нашими подписками
          </p>
          
          {currentSubscription && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white">
              <Check className="w-4 h-4" />
              Активна: {PLANS[currentSubscription.plan_type].name} до{' '}
              {new Date(currentSubscription.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
          {Object.entries(PLANS).map(([key, plan], index) => {
            const Icon = plan.icon;
            const isActive = currentSubscription?.plan_type === key;
            
            return (
              <div
                key={key}
                className={`relative group transition-all duration-500 animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${plan.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                
                <div className={`relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-2 rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-white scale-100 md:scale-105 shadow-2xl shadow-white/20' 
                    : 'border-[#2a2a2a] hover:border-white/30 hover:scale-105'
                } ${isActive ? 'ring-2 ring-white' : ''}`}>
                  
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      🔥 Популярный
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute -top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Активен
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  {/* Title & Price */}
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {getPlanPrice(key)}
                    </span>
                    <span className="text-sm text-gray-400">/месяц</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 md:space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 group/item">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          feature.included 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-800 text-gray-600'
                        } transition-transform group-hover/item:scale-110`}>
                          {feature.included ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </div>
                        <span className={`text-sm md:text-base ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(key)}
                    disabled={isActive}
                    className={`group/btn relative w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 overflow-hidden before:absolute before:inset-[-100px] before:rounded-xl ${
                      isActive
                        ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-200 hover:shadow-xl hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isActive ? (
                        <>
                          <Check className="w-4 h-4" />
                          Текущий план
                        </>
                      ) : (
                        <>
                          Выбрать план
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
          {['🔒 Безопасно', '⚡ Мгновенно', '💎 Качество', '🎯 Поддержка'].map((badge, idx) => (
            <div key={idx} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 text-center text-gray-400 hover:border-[#3a3a3a] transition-all hover:scale-105">
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Оплата {selectedPlan && PLANS[selectedPlan].name}
            </DialogTitle>
          </DialogHeader>

          {!paymentMethod ? (
            <div className="space-y-3 animate-fade-in">
              <p className="text-gray-400 text-sm mb-6">Выберите способ оплаты:</p>
              
              <button
                onClick={() => {
                  setPaymentMethod('crypto_ton');
                  handleTonPayment();
                }}
                className="group relative w-full p-4 bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/30 rounded-xl transition-all hover:scale-105 active:scale-95 text-left overflow-hidden before:absolute before:inset-[-100px] before:rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    💎
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-1">Криптовалюта (TON)</div>
                    <div className="text-sm text-gray-400">
                      {selectedPlan && `${PLANS[selectedPlan].price_ton} TON`}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => handlePaymentMethod('foreign_card')}
                className="group relative w-full p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#3a3a3a] rounded-xl transition-all hover:scale-105 active:scale-95 text-left overflow-hidden before:absolute before:inset-[-100px] before:rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#3a3a3a] rounded-xl flex items-center justify-center text-2xl">
                    💳
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-1">Иностранные карты</div>
                    <div className="text-sm text-gray-400">Visa, Mastercard</div>
                  </div>
                  <div className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">Скоро</div>
                </div>
              </button>

              <button
                onClick={() => handlePaymentMethod('russian_card')}
                className="group relative w-full p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] border-2 border-[#3a3a3a] rounded-xl transition-all hover:scale-105 active:scale-95 text-left overflow-hidden before:absolute before:inset-[-100px] before:rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#3a3a3a] rounded-xl flex items-center justify-center text-2xl">
                    🏦
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-1">Российские карты</div>
                    <div className="text-sm text-gray-400">МИР, СБП</div>
                  </div>
                  <div className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">Скоро</div>
                </div>
              </button>
            </div>
          ) : paymentMethod === 'crypto_ton' && processing ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-bold mb-2">Обработка платежа...</p>
              <p className="text-sm text-gray-400">Подтвердите транзакцию в вашем кошельке TON</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}