import React from 'react';

// Translations for the app
const translations = {
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.projects': 'Проекты',
    'nav.settings': 'Настройки',
    'nav.logout': 'Выйти',
    
    // Home page
    'home.badge': 'Представляем Dave V2',
    'home.heading': 'Что вы будете делать',
    'home.heading.build': 'build',
    'home.heading.today': 'сегодня?',
    'home.subtitle': 'Создавайте потрясающие приложения и веб-сайты, общаясь с ИИ.',
    'home.template': 'Начать с шаблона',
    'home.placeholder': 'Опишите ваш проект...',
    'home.create': 'Создать сейчас',
    'home.create.mobile': 'Создать',
    
    // Projects page
    'projects.title': 'Мои проекты',
    'projects.new': 'Новый проект',
    'projects.empty': 'У вас пока нет проектов',
    'projects.create.first': 'Создать первый проект',
    'projects.no.description': 'Без описания',
    
    // Editor
    'editor.publish': 'Опубликовать',
    'editor.publishing': 'Публикация...',
    'editor.chat': 'Чат',
    'editor.preview': 'Превью',
    'editor.history': 'История',
    'editor.refresh': 'Обновить',
    'editor.edit.mode': 'Режим редактирования',
    'editor.seo': 'SEO настройки',
    'editor.domains': 'Домены',
    'editor.collab': 'Совместная работа',
    'editor.analytics': 'Аналитика',
    'editor.abtest': 'A/B Тестирование',
    'editor.content': 'Генератор контента',
    'editor.uibuilder': 'AI UI Builder',
    'editor.style': 'Перенос стиля',
    'editor.prompts': 'Мои промпты',
    'editor.mobile': 'Мобильный превью',
    
    // Chat
    'chat.placeholder': 'How can Dave help you today?',
    'chat.discussion': 'Обсуждение',
    'chat.codegen': 'Генерация кода',
    'chat.thinking': 'Thinking...',
    'chat.credits': 'Код - 1 кредит | Изображение - 5 кредитов',
    'chat.credits.free': 'Обсуждение - бесплатно',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.profile': 'Профиль',
    'settings.email': 'Email',
    'settings.name': 'Имя',
    'settings.name.empty': 'Не указано',
    'settings.role': 'Роль',
    'settings.language': 'Язык',
    'settings.credits': 'Кредиты',
    'settings.credits.available': 'кредитов доступно',
    'settings.general': 'Общие настройки',
    'settings.general.dev': 'Дополнительные настройки в разработке...',
    'settings.language.changed': 'Язык изменен',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Home page
    'home.badge': 'Introducing Dave V2',
    'home.heading': 'What will you',
    'home.heading.build': 'build',
    'home.heading.today': 'today?',
    'home.subtitle': 'Create stunning apps and websites by chatting with AI.',
    'home.template': 'Start with template',
    'home.placeholder': 'Describe your project...',
    'home.create': 'Create now',
    'home.create.mobile': 'Create',
    
    // Projects page
    'projects.title': 'My Projects',
    'projects.new': 'New Project',
    'projects.empty': 'You have no projects yet',
    'projects.create.first': 'Create first project',
    'projects.no.description': 'No description',
    
    // Editor
    'editor.publish': 'Publish',
    'editor.publishing': 'Publishing...',
    'editor.chat': 'Chat',
    'editor.preview': 'Preview',
    'editor.history': 'History',
    'editor.refresh': 'Refresh',
    'editor.edit.mode': 'Edit mode',
    'editor.seo': 'SEO Settings',
    'editor.domains': 'Domains',
    'editor.collab': 'Collaboration',
    'editor.analytics': 'Analytics',
    'editor.abtest': 'A/B Testing',
    'editor.content': 'Content Generator',
    'editor.uibuilder': 'AI UI Builder',
    'editor.style': 'Style Transfer',
    'editor.prompts': 'My Prompts',
    'editor.mobile': 'Mobile Preview',
    
    // Chat
    'chat.placeholder': 'How can Dave help you today?',
    'chat.discussion': 'Discussion',
    'chat.codegen': 'Code Generation',
    'chat.thinking': 'Thinking...',
    'chat.credits': 'Code - 1 credit | Image - 5 credits',
    'chat.credits.free': 'Discussion - free',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.email': 'Email',
    'settings.name': 'Name',
    'settings.name.empty': 'Not specified',
    'settings.role': 'Role',
    'settings.language': 'Language',
    'settings.credits': 'Credits',
    'settings.credits.available': 'credits available',
    'settings.general': 'General Settings',
    'settings.general.dev': 'Additional settings in development...',
    'settings.language.changed': 'Language changed',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
  },
  uk: {
    // Navigation
    'nav.home': 'Головна',
    'nav.projects': 'Проекти',
    'nav.settings': 'Налаштування',
    'nav.logout': 'Вийти',
    
    // Home page
    'home.badge': 'Представляємо Dave V2',
    'home.heading': 'Що ви будете',
    'home.heading.build': 'створювати',
    'home.heading.today': 'сьогодні?',
    'home.subtitle': 'Створюйте чудові додатки та веб-сайти, спілкуючись з ШІ.',
    'home.template': 'Почати з шаблону',
    'home.placeholder': 'Опишіть ваш проект...',
    'home.create': 'Створити зараз',
    'home.create.mobile': 'Створити',
    
    // Projects page
    'projects.title': 'Мої проекти',
    'projects.new': 'Новий проект',
    'projects.empty': 'У вас поки немає проектів',
    'projects.create.first': 'Створити перший проект',
    'projects.no.description': 'Без опису',
    
    // Editor
    'editor.publish': 'Опублікувати',
    'editor.publishing': 'Публікація...',
    'editor.chat': 'Чат',
    'editor.preview': 'Попередній перегляд',
    'editor.history': 'Історія',
    'editor.refresh': 'Оновити',
    'editor.edit.mode': 'Режим редагування',
    'editor.seo': 'SEO налаштування',
    'editor.domains': 'Домени',
    'editor.collab': 'Спільна робота',
    'editor.analytics': 'Аналітика',
    'editor.abtest': 'A/B Тестування',
    'editor.content': 'Генератор контенту',
    'editor.uibuilder': 'AI UI Builder',
    'editor.style': 'Перенос стилю',
    'editor.prompts': 'Мої промпти',
    'editor.mobile': 'Мобільний перегляд',
    
    // Chat
    'chat.placeholder': 'Як Dave може допомогти вам сьогодні?',
    'chat.discussion': 'Обговорення',
    'chat.codegen': 'Генерація коду',
    'chat.thinking': 'Думаю...',
    'chat.credits': 'Код - 1 кредит | Зображення - 5 кредитів',
    'chat.credits.free': 'Обговорення - безкоштовно',
    
    // Settings
    'settings.title': 'Налаштування',
    'settings.profile': 'Профіль',
    'settings.email': 'Email',
    'settings.name': 'Ім\'я',
    'settings.name.empty': 'Не вказано',
    'settings.role': 'Роль',
    'settings.language': 'Мова',
    'settings.credits': 'Кредити',
    'settings.credits.available': 'кредитів доступно',
    'settings.general': 'Загальні налаштування',
    'settings.general.dev': 'Додаткові налаштування в розробці...',
    'settings.language.changed': 'Мову змінено',
    
    // Common
    'common.loading': 'Завантаження...',
    'common.save': 'Зберегти',
    'common.cancel': 'Скасувати',
    'common.delete': 'Видалити',
    'common.edit': 'Редагувати',
  }
};

// Get current language from localStorage
export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'ru';
};

// Translate function
export const t = (key) => {
  const lang = getCurrentLanguage();
  return translations[lang]?.[key] || translations['ru'][key] || key;
};

// Hook for reactive translations
export const useTranslation = () => {
  const [, setUpdate] = React.useState(0);
  
  React.useEffect(() => {
    const handleStorageChange = () => {
      setUpdate(prev => prev + 1);
    };
    
    window.addEventListener('languageChange', handleStorageChange);
    return () => window.removeEventListener('languageChange', handleStorageChange);
  }, []);
  
  return { t };
};