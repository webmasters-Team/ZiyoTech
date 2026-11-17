import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { servicesData } from '../data/servicesData';
import {
  Code2,
  ShoppingCart,
  Bot,
  Share2,
  Camera,
  Palette,
  Megaphone,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  BarChart3,
  Smartphone,
  Gauge,
  Globe2,
  Briefcase,
  Rocket,
  ShieldCheck,
  Workflow,
  Star,
  MonitorSmartphone,
  Paintbrush2,
  Zap,
  CirclePlay,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ServiceDetailPageProps {
  serviceId: string;
  onNavigate: (page: string, serviceId?: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Code2,
  ShoppingCart,
  Bot,
  Share2,
  Camera,
  Palette,
  Megaphone,
  Layers,
};

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ serviceId, onNavigate }) => {
  const { language } = useLanguage();
  const service = servicesData.find((s) => s.id === serviceId) || servicesData[0];
  const Icon = iconMap[service.icon] || Code2;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [serviceId]);

  const otherServices = servicesData.filter((s) => s.id !== service.id).slice(0, 3);

  const isEcommerce = service.id === 'ecommerce';
  const isSmm = service.id === 'smm';

  const stackBreakdown = {
    frontend: [
      'React + TypeScript',
      'Responsive design system',
      'SEO-optimized user flows',
      'Conversion-first UX',
    ],
    backend: [
      'API architecture',
      'Authentication & access control',
      'CRM and workflow integrations',
      'Automation and operational logic',
    ],
    database: [
      'PostgreSQL / MySQL / Firestore',
      'Normalized data model',
      'Secure data relationships',
      'Analytics-ready reporting',
    ],
  };

  const processSteps = isEcommerce
    ? [
        {
          title: language === 'ru' ? 'Аналитика магазина' : language === 'en' ? 'Store discovery' : 'Do`kon tahlili',
          description:
            language === 'ru'
              ? 'Анализируем ассортимент, сегменты покупателей, точки роста и процессы оформления заказа.'
              : language === 'en'
              ? 'We audit your catalogue, buyer behavior, conversion gaps, and purchase journey before designing the storefront.'
              : 'Mahsulot assortimenti, buyurtma jarayoni va mijoz holatini tahlil qilib, do`konni to`g`ri tuzamiz.',
        },
        {
          title: language === 'ru' ? 'UX и каталог' : language === 'en' ? 'Catalog UX' : 'Katalog UX',
          description:
            language === 'ru'
              ? 'Структурируем каталог, фильтры, карточки товаров и пользовательские сценарии для повышения продаж.'
              : language === 'en'
              ? 'We design the catalog architecture, product filters, and customer flows that simplify discovery and conversion.'
              : 'Mahsulot katalogi, filterlar va xarid ssenariysini loyihalab, sotuvni oshiruvchi UX yaratamiz.',
        },
        {
          title: language === 'ru' ? 'Платежи и запуск' : language === 'en' ? 'Checkout & launch' : 'To`lov va ishga tushirish',
          description:
            language === 'ru'
              ? 'Подключаем платежные системы, логистику, остатки и запускаем стабильный онлайн-магазин под рост продаж.'
              : language === 'en'
              ? 'We connect payment gateways, delivery logic, inventory sync, and launch the storefront with quality checks.'
              : 'To`lov tizimlari, yetkazib berish va ombor hisobini integratsiya qilib, stabil onlayn do`konni ishga tushiramiz.',
        },
      ]
    : isSmm
    ? [
        {
          title: language === 'ru' ? 'Аудит аккаунта' : language === 'en' ? 'Audience & channel audit' : 'Akkount tahlili',
          description:
            language === 'ru'
              ? 'Анализируем текущий контент, поведение аудитории, позиции в Instagram и точки роста для охватов и продаж.'
              : language === 'en'
              ? 'We audit your current social presence, content performance, audience behavior, and conversion gaps to identify the strongest growth opportunity.'
              : 'Instagram, audience va kontent natijalarini tahlil qilib, bozor va sales imkoniyatlarini aniqlaymiz.',
        },
        {
          title: language === 'ru' ? 'Контент-стратегия' : language === 'en' ? 'Content strategy' : 'Kontent strategiyasi',
          description:
            language === 'ru'
              ? 'Планируем контент-матрицу, темы, последовательность публикаций и визуальный стиль под ваш бренд и аудиторию.'
              : language === 'en'
              ? 'We define the content matrix, editorial rhythm, creative direction, and high-converting narrative structure for your brand.'
              : 'Kontent reja, postlar, storylar va vizual uslubni brend va auditoriyaga moslashtiramiz.',
        },
        {
          title: language === 'ru' ? 'Запуск и рост' : language === 'en' ? 'Launch & optimize' : 'Ishga tushirish va rivojlanish',
          description:
            language === 'ru'
              ? 'Запускаем публикации, reels, сторис, рекламные кампании и постоянно оптимизируем их по данным.'
              : language === 'en'
              ? 'We launch the content engine, reels, stories, and paid campaigns while constantly refining performance based on real data.'
              : 'Postlar, Reels, stories va reklama kampaniyalarini ishga tushirib, natijaga qarab optimallashtiramiz.',
        },
      ]
    : [
        {
          title: language === 'ru' ? 'Диагностика' : language === 'en' ? 'Discovery' : 'Tahlil',
          description:
            language === 'ru'
              ? 'Анализим текущего бренда, аудитории и целей, чтобы определить правильную стратегию продвижения.'
              : language === 'en'
              ? 'We audit your current positioning, audience, and commercial goals before designing the solution.'
              : 'Brend, auditoriya va maqsadlarni tekshirib, to\'g\'ri strategiyani belgilaymiz.',
        },
        {
          title: language === 'ru' ? 'Проектирование' : language === 'en' ? 'Design System' : 'Dizayn',
          description:
            language === 'ru'
              ? 'Создаем пользовательский опыт, структуру контента и визуальный стиль, ориентированный на рост конверсии.'
              : language === 'en'
              ? 'We structure UX flows, messaging, and visual direction to increase trust and conversion.'
              : 'UX, kontent tuzilishi va vizual uslubni loyihalab, ishonch va konversiyani oshiramiz.',
        },
        {
          title: language === 'ru' ? 'Разработка' : language === 'en' ? 'Build & Launch' : 'Ishlab Chiqarish',
          description:
            language === 'ru'
              ? 'Пишем быстрый, адаптивный и безопасный интерфейс, затем запускаем его с тестированием и аналитикой.'
              : language === 'en'
              ? 'We build a fast, responsive, secure product and launch with QA, analytics, and launch validation.'
              : 'Tez, moslashuvchan va xavfsiz interfeys yaratamiz va test hamda analitika bilan ishga tushiramiz.',
        },
      ];

  const showcaseMetrics = isEcommerce
    ? [
        { label: language === 'ru' ? 'Конверсия в покупку' : language === 'en' ? 'Checkout conversion' : 'Sotuv konversiyasi', value: '+35%', icon: TrendingUp },
        { label: language === 'ru' ? 'Платежи' : language === 'en' ? 'Payments' : 'To`lovlar', value: '24/7', icon: ShieldCheck },
        { label: language === 'ru' ? 'Мобильные покупки' : language === 'en' ? 'Mobile-first sales' : 'Mobil savdo', value: '100%', icon: Smartphone },
        { label: language === 'ru' ? 'Точность остатков' : language === 'en' ? 'Inventory accuracy' : 'Ombor aniqligi', value: '99.9%', icon: BarChart3 },
      ]
    : isSmm
    ? [
        { label: language === 'ru' ? 'Охват' : language === 'en' ? 'Reach' : 'Qamrov', value: '+180%', icon: TrendingUp },
        { label: language === 'ru' ? 'Вовлеченность' : language === 'en' ? 'Engagement' : 'Faollik', value: '4.8x', icon: Sparkles },
        { label: language === 'ru' ? 'Конверсия лидов' : language === 'en' ? 'Lead conversion' : 'Lead konversiyasi', value: '+42%', icon: BarChart3 },
        { label: language === 'ru' ? 'Публикации в месяц' : language === 'en' ? 'Monthly content' : 'Oylik kontent', value: '30+', icon: Share2 },
      ]
    : [
        { label: language === 'ru' ? 'Скорость сайта' : language === 'en' ? 'Page Speed' : 'Sayt Tezligi', value: '< 1.5s', icon: Gauge },
        { label: language === 'ru' ? 'Адаптивность' : language === 'en' ? 'Responsive' : 'Moslashuvchanlik', value: '100%', icon: Smartphone },
        { label: language === 'ru' ? 'SEO-структура' : language === 'en' ? 'SEO Ready' : 'SEO Tayyor', value: 'Core Web Vitals', icon: Globe2 },
        { label: language === 'ru' ? 'Доверие к бренду' : language === 'en' ? 'Brand Trust' : 'Brend Ishonchi', value: '+40%', icon: Briefcase },
      ];

  const projectSummary = isEcommerce
    ? language === 'ru'
      ? 'Мы создаем не просто магазин, а коммерческую платформу, которая помогает клиентам быстро находить товары, оформлять заказ и возвращаться снова.'
      : language === 'en'
      ? 'We build more than an online storefront — we create a commerce engine that improves product discovery, checkout confidence, and repeat business.'
      : 'Biz faqat onlayn do`kon emas, balki mahsulotlarni tez topish, qulay buyurtma qilish va takroriy savdoni oshiruvchi tijorat platformasini yaratamiz.'
    : isSmm
    ? language === 'ru'
      ? 'Мы создаем социальную систему, которая укрепляет доверие к бренду, ежедневно поддерживает интерес аудитории и превращает внимание в реальные обращения.'
      : language === 'en'
      ? 'We build a social media growth system that strengthens brand trust, improves audience retention, and turns attention into qualified leads.'
      : "Biz brendga ishonch qozonadigan, auditoriya bilan doimiy aloqada bo'ladigan va e'tiborni real murojaatlarga aylantiradigan SMM tizimini yaratamiz."
    : language === 'ru'
    ? 'Мы не просто строим сайт — мы создаем цифровую площадку, которая усиливает доверие к бренду, повышает качество лидов и служит росту бизнеса.'
    : language === 'en'
    ? 'We do not simply build a website — we create a digital asset that strengthens brand trust, improves lead quality, and supports long-term business growth.'
    : "Biz faqat sayt yasab qolmaymiz — biz brend ishonchini mustahkamlovchi, lead sifatini oshiruvchi va biznesning uzoq muddatli o'sishini qo'llab-quvvatlovchi raqamli platforma yaratamiz.";

  const summaryBadges = isEcommerce
    ? [
        language === 'ru' ? 'Коммерческая логика и funnel' : language === 'en' ? 'Commerce flow design' : 'Savdo jarayoni dizayni',
        language === 'ru' ? 'Платежи и доставка' : language === 'en' ? 'Payments & delivery' : 'To`lov va yetkazib berish',
        language === 'ru' ? 'Система управления заказами' : language === 'en' ? 'Order management' : 'Buyurtmalarni boshqarish',
      ]
    : isSmm
    ? [
        language === 'ru' ? 'Контент и визуальная стратегия' : language === 'en' ? 'Content & visual strategy' : 'Kontent va vizual strategiya',
        language === 'ru' ? 'Аналитика и рост' : language === 'en' ? 'Insights & growth' : 'Analitika va o\'sish',
        language === 'ru' ? 'Привлечение лидов' : language === 'en' ? 'Lead generation' : 'Lead yig\'ish',
      ]
    : [
        language === 'ru' ? 'Рабочий процесс по этапам' : language === 'en' ? 'Structured delivery process' : 'Bosqichma-bosqich ish jarayoni',
        language === 'ru' ? 'Команда специалистов' : language === 'en' ? 'Dedicated specialist team' : 'Mutaxassislar jamoasi',
        language === 'ru' ? 'Прозрачная коммуникация' : language === 'en' ? 'Transparent communication' : 'Shaffof aloqa',
      ];

  const detailCards = isEcommerce
    ? [
        {
          title: language === 'ru' ? 'Фронтенд' : language === 'en' ? 'Frontend' : 'Frontend',
          body: language === 'ru'
            ? 'Создаем удобный каталог, понятный поиск, карточки товаров и быстрый checkout для мобильных и desktop-покупателей.'
            : language === 'en'
            ? 'We design a streamlined storefront with clear product discovery, category filters, and a frictionless mobile-first checkout.'
            : 'Mahsulotlar katalogi, qidiruv, mahsulot kartalari va moslashuvchan mobil xarid tajribasini yaratamiz.',
          list: stackBreakdown.frontend,
        },
        {
          title: language === 'ru' ? 'Бэкенд' : language === 'en' ? 'Backend' : 'Backend',
          body: language === 'ru'
            ? 'Настраиваем логику оплаты, корзины, статусов заказов, уведомлений и интеграции с доставкой и системами учета.'
            : language === 'en'
            ? 'We implement payment orchestration, order flows, shipping logic, inventory rules, and business automation for the commerce stack.'
            : 'To`lov, buyurtma, ombor va yetkazib berish logikasini birlashtirishni amalga oshiramiz.',
          list: stackBreakdown.backend,
        },
        {
          title: language === 'ru' ? 'База данных' : language === 'en' ? 'Database' : 'Ma\'lumotlar Bazasi',
          body: language === 'ru'
            ? 'Проектируем структуру товаров, клиентов, остатков и заказов, чтобы можно было масштабировать магазин без потери качества.'
            : language === 'en'
            ? 'We model product, customer, inventory, and order data for stable growth, reporting, and scaling without operational bottlenecks.'
            : "Mahsulot, mijoz, ombor va buyurtmalar ma'lumotlarini tahlilga tayyor holda loyihalab beramiz.",
          list: stackBreakdown.database,
        },
      ]
    : isSmm
    ? [
        {
          title: language === 'ru' ? 'Контент' : language === 'en' ? 'Content' : 'Kontent',
          body: language === 'ru'
            ? 'Разрабатываем контент-матрицу, структуру публикаций, визуальные форматы и сценарии для удержания и вовлечения аудитории.'
            : language === 'en'
            ? 'We design a high-performance content system that keeps your audience engaged, your brand memorable, and your messaging conversion-focused.'
            : 'Kontent matritsasi, postlar, storylar va vizual formatlarni ishlab chiqamiz.',
          list: stackBreakdown.frontend,
        },
        {
          title: language === 'ru' ? 'Автоматизация' : language === 'en' ? 'Automation' : 'Avtomatlashtirish',
          body: language === 'ru'
            ? 'Настраиваем планирование постов, ответы, интеграции с CRM и упрощаем рутины работы с сообществом.'
            : language === 'en'
            ? 'We automate publishing workflows, CRM handoff, community management, and response systems so the social engine runs efficiently.'
            : 'Postlarni rejalashtirish, javob yozish va CRM integratsiyasini avtomatlashtiramiz.',
          list: stackBreakdown.backend,
        },
        {
          title: language === 'ru' ? 'Аналитика' : language === 'en' ? 'Analytics' : 'Analitika',
          body: language === 'ru'
            ? 'Собираем данные по охватам, вовлеченности, лидогенерации и показательным метрикам для постоянного улучшения роста.'
            : language === 'en'
            ? 'We track reach, engagement, leads, and audience quality so every campaign is sharper, faster, and more conversion-driven.'
            : "Qamrov, faollik va leadlar bo'yicha ma'lumotlarni yig'ib, har bir keyingi kampaniyani takomillashtiramiz.",
          list: stackBreakdown.database,
        },
      ]
    : [
        {
          title: language === 'ru' ? 'Фронтенд' : language === 'en' ? 'Frontend' : 'Frontend',
          body: language === 'ru'
            ? 'Создаём современный пользовательский интерфейс, SEO-структуру, адаптивные страницы и удобную навигацию для всех устройств.'
            : language === 'en'
            ? 'We build a modern user interface with strong UX, responsive layouts, clear navigation, and conversion-aware page structure.'
            : 'Zamonaviy foydalanuvchi interfeysi, SEO tuzilma, mobil va desktop uchun moslashuvchan sahifalar va qulay navigatsiya yaratamiz.',
          list: stackBreakdown.frontend,
        },
        {
          title: language === 'ru' ? 'Бэкенд' : language === 'en' ? 'Backend' : 'Backend',
          body: language === 'ru'
            ? 'Разрабатываем API, бизнес-логику, роли доступа и интеграции с CRM, платежами, мессенджерами и внешними системами.'
            : language === 'en'
            ? 'We create the application logic, APIs, user permissions, CRM integrations, and automated workflows that keep the platform running smoothly.'
            : "API, biznes logikasi, integratsiya va server xavfsizligi bilan shug'ullanadi.",
          list: stackBreakdown.backend,
        },
        {
          title: language === 'ru' ? 'База данных' : language === 'en' ? 'Database' : 'Ma\'lumotlar Bazasi',
          body: language === 'ru'
            ? 'Проектируем надёжную схему хранения данных, защищённые связи между сущностями и удобный доступ для аналитики и администрирования.'
            : language === 'en'
            ? 'We define a robust data model with secure relationships, clean information flow, and reliable access for reporting, administration, and future scaling.'
            : 'Xavfsiz va aniq ma\'lumotlar tuzilmasini yaratib, reporting, admin boshqaruv va kelajakdagi kengayish uchun qulay ma\'lumotlar modeli yaratamiz.',
          list: stackBreakdown.database,
        },
      ];

  const projectGallery = isEcommerce
    ? [
        {
          title: language === 'ru' ? 'Визуальный магазин и каталог' : language === 'en' ? 'Storefront & catalog design' : 'Do`kon va katalog dizayni',
          image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: language === 'ru' ? 'Чекаут и платёжный опыт' : language === 'en' ? 'Checkout and payment journey' : 'To`lov va xarid jarayoni',
          image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: language === 'ru' ? 'Аналитика роста продаж' : language === 'en' ? 'Sales growth analytics' : 'Savdo o\'sishi analitikasi',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        },
      ]
    : isSmm
    ? [
        {
          title: language === 'ru' ? 'Контент-стратегия и визуал' : language === 'en' ? 'Content strategy and visual direction' : 'Kontent strategiyasi va vizual yo\'nalish',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: language === 'ru' ? 'Рилс и вовлечение аудитории' : language === 'en' ? 'Reels and audience engagement' : 'Reels va auditoriya faolligi',
          image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: language === 'ru' ? 'Дашборд метрик и роста' : language === 'en' ? 'Growth dashboard and campaign metrics' : 'O\'sish dashboardi va kampaniya metrikasi',
          image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
        },
      ]
    : [
        {
          title: language === 'ru' ? 'Разработка UX и интерфейса' : language === 'en' ? 'UX and interface design' : 'UX va interfeys dizayni',
          image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: language === 'ru' ? 'Фронтенд и архитектура продукта' : language === 'en' ? 'Frontend and product architecture' : 'Frontend va mahsulot arxitekturasi',
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: language === 'ru' ? 'Запуск и аналитика результатов' : language === 'en' ? 'Launch and performance analytics' : 'Ishga tushirish va natija analitikasi',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        },
      ];

  const projectDuration =
    language === 'ru'
      ? 'Средний цикл реализации зависит от объема задач, но обычно занимает от 2 до 8 недель в зависимости от уровня кастомизации, контента и интеграций.'
      : language === 'en'
      ? 'Most projects are delivered in 2 to 8 weeks depending on scope, custom logic, integrations, and content readiness.'
      : 'Loyiha muddati vazifalarning hajmiga qarab 2 dan 8 haftagacha bo\'ladi. Kengaytirilgan funksionallik, integratsiyalar va kontent tayyorligi bu muddatga ta\'sir qiladi.';

  const deliveryTimeline = [
    {
      phase: language === 'ru' ? 'Этап 1 · Исследование' : language === 'en' ? 'Phase 1 · Discovery' : '1-bosqich · Tahlil',
      details:
        language === 'ru'
          ? 'Собираем требования, анализируем рынок и формируем точную дорожную карту.'
          : language === 'en'
          ? 'We define goals, map the audience, and clarify the product scope before building.'
          : 'Talablar to\'planib, bozor va auditoriya tahlil qilinadi hamda aniq ish reja tuziladi.',
    },
    {
      phase: language === 'ru' ? 'Этап 2 · Разработка' : language === 'en' ? 'Phase 2 · Build' : '2-bosqich · Ishlab chiqarish',
      details:
        language === 'ru'
          ? 'Проектируем интерфейс, строим логику и запускаем первые рабочие версии.'
          : language === 'en'
          ? 'We design the experience, implement the core system, and validate early prototypes.'
          : 'Interfeys, logika va dastlabki versiyalar ishlab chiqiladi va sinovdan o\'tkaziladi.',
    },
    {
      phase: language === 'ru' ? 'Этап 3 · Оптимизация' : language === 'en' ? 'Phase 3 · Optimization' : '3-bosqich · Optimizatsiya',
      details:
        language === 'ru'
          ? 'Улучшаем конверсию, скорость и качество пользовательского опыта на основе данных.'
          : language === 'en'
          ? 'We refine performance, UX clarity, and conversion outcomes based on real usage data.'
          : 'Haqiqiy ma\'lumotlar asosida tezlik, UX va konversiya samaradorligi optimallashtiriladi.',
    },
    {
      phase: language === 'ru' ? 'Этап 4 · Поддержка' : language === 'en' ? 'Phase 4 · Support' : '4-bosqich · Qo\'llab-quvvatlash',
      details:
        language === 'ru'
          ? 'После запуска продолжаем поддержку, анализ метрик и дальнейшее развитие продукта.'
          : language === 'en'
          ? 'After launch, we keep improving the product through analytics, support, and growth iterations.'
          : 'Ishga tushganidan keyin ham tahlillar, qo\'llab-quvvatlash va rivojlanish bosqichlari davom ettiriladi.',
    },
  ];

  const teamRoles = [
    {
      title: language === 'ru' ? 'Стратег' : language === 'en' ? 'Strategy Lead' : 'Strateg',
      description:
        language === 'ru'
          ? 'Определяет цели продукта, приоритеты и коммерческую логику решения.'
          : language === 'en'
          ? 'Defines the commercial goals, roadmap, and product focus for the engagement.'
          : 'Mahsulot maqsadlari, ustuvorliklar va tijorat yo\'nalishini belgilaydi.',
    },
    {
      title: language === 'ru' ? 'UX/UI дизайнер' : language === 'en' ? 'UX/UI Designer' : 'UX/UI Dizayner',
      description:
        language === 'ru'
          ? 'Создает понятный, продающий и визуально премиальный пользовательский опыт.'
          : language === 'en'
          ? 'Shapes the customer journey, information hierarchy, and visual system.'
          : 'Mijozlar tajribasi, vizual tizim va mahsulot oqimini ishlab chiqadi.',
    },
    {
      title: language === 'ru' ? 'Frontend разработчик' : language === 'en' ? 'Frontend Engineer' : 'Frontend Dasturchi',
      description:
        language === 'ru'
          ? 'Компоненты, адаптивность, производительность и надежность интерфейса.'
          : language === 'en'
          ? 'Builds resilient, responsive interfaces that feel premium and perform quickly.'
          : 'Tez va ishonchli interfeyslarni yaratadi, komponentlar hamda foydalanuvchi tajribasini optimallashtiradi.',
    },
    {
      title: language === 'ru' ? 'Поддержка и рост' : language === 'en' ? 'Growth & Support' : 'Rivojlanish va qo\'llab-quvvatlash',
      description:
        language === 'ru'
          ? 'Следит за метриками, анализирует результаты и помогает развивать проект дальше.'
          : language === 'en'
          ? 'Tracks results, improves operational flow, and guides ongoing product growth.'
          : 'Natija va metrikalarni kuzatib boradi, productni yanada rivojlantirishga yordam beradi.',
    },
  ];

  const portfolioHighlights = isEcommerce
    ? [
        language === 'ru'
          ? 'Премиальный UX, логистика и прозрачная корзина помогают увеличить средний чек и сократить отказы в оформлении.'
          : language === 'en'
          ? 'Premium UX, streamlined logistics, and a clear cart flow improve average order value and reduce drop-offs.'
          : 'Premium UX, soddalashtirilgan logistika va aniq savat jarayoni o\'rtacha chekni oshiradi va buyurtma rad etishlarini kamaytiradi.',
        language === 'ru'
          ? 'Надежная архитектура и аналитика помогают следить за конверсией, остатками и поведенческими паттернами клиентов.'
          : language === 'en'
          ? 'A stable technical foundation and reporting layer make conversion, inventory, and user behavior easy to optimize.'
          : 'Barqaror texnik infratuzilma va analitika konversiya, ombor va mijoz xatti-harakatlarini oson boshqarishga yordam beradi.',
        language === 'ru'
          ? 'Выстраивается система повторных покупок, автоматических уведомлений и удобного управления заказами.'
          : language === 'en'
          ? 'Repeat-purchase mechanics, automated reminders, and order visibility keep growth consistent after launch.'
          : 'Takroriy savdo mexanizmlari, avtomatik ogohlantirishlar va buyurtma monitoringi keyingi o\'sishni barqaror qiladi.',
      ]
    : isSmm
    ? [
        language === 'ru'
          ? 'Система контента, визуального стиля и вовлечения создает последовательный узнаваемый брендинг в соцсетях.'
          : language === 'en'
          ? 'A structured content and visual system builds a recognizable brand presence and keeps audiences engaged consistently.'
          : 'Kontent, vizual uslub va faollik tizimi brendni tanilishi oson va doimiy ravishda mustahkamlaydi.',
        language === 'ru'
          ? 'Постоянный мониторинг охватов, реакций и лидов помогает быстро корректировать стратегию.'
          : language === 'en'
          ? 'Continuous analytics around reach, replies, and leads let the strategy shift quickly based on what is working.'
          : 'Qamrov, javoblar va leadlar ustidan doimiy monitoring strategiyani tezkor qo\'llab-quvvatlaydi.',
        language === 'ru'
          ? 'Высококачественный контент и четкие CTA переводят внимание аудитории в запросы и подтвержденные продажи.'
          : language === 'en'
          ? 'High-quality storytelling and clear calls-to-action turn attention into inquiries and qualified demand.'
          : 'Yuqori sifatli kontent va aniq CTA auditoriya e\'tiborini murojaat va sifatli savdoga aylantiradi.',
      ]
    : [
        language === 'ru'
          ? 'Хорошо продуманная структура сайта помогает удерживать внимание и вести пользователя к целевому действию.'
          : language === 'en'
          ? 'A clear information hierarchy keeps visitors engaged and gently guides them toward the right action.'
          : 'Aniq ma\'lumotlar tuzilishi tashrif buyuruvchilarni jalb qilib, maqsadli harakatga olib keladi.',
        language === 'ru'
          ? 'Адаптивная, быстрая и безопасная система повышает доверие к бренду и сокращает потери лидов.'
          : language === 'en'
          ? 'Responsive, fast, and secure delivery improves trust, reduces friction, and protects leads from loss.'
          : 'Moslashuvchan, tez va xavfsiz tizim ishonchni oshiradi va leadlar yo\'qolishini kamaytiradi.',
        language === 'ru'
          ? 'Понимание аудитории и четкая Воронка продаж создают основу для роста бизнеса.'
          : language === 'en'
          ? 'Audience understanding and a measurable conversion funnel create the foundation for sustainable growth.'
          : 'Auditoriyani tushunish va aniq konversiya funneli biznesning barqaror o\'sishiga zamin yaratadi.',
      ];

  const pricingTiers = isEcommerce
    ? [
        {
          name: language === 'ru' ? 'Старт' : language === 'en' ? 'Starter' : 'Starter',
          price: '$900',
          detail:
            language === 'ru'
              ? 'Небольшой интернет-магазин с каталогом, корзиной и базовой оплатой.'
              : language === 'en'
              ? 'A compact storefront with catalog browsing, cart flow, and essential payment setup.'
              : 'Kichik onlayn do\'kon, katalog, savat va asosiy to\'lov integratsiyasi.',
        },
        {
          name: language === 'ru' ? 'Рост' : language === 'en' ? 'Growth' : 'Growth',
          price: '$1,800',
          detail:
            language === 'ru'
              ? 'Средний магазин с фильтрами, автоматизацией заказов и интеграциями с доставкой.'
              : language === 'en'
              ? 'A growing commerce storefront with product filters, order automation, and workflow integrations.'
              : 'O\'sayotgan onlayn do\'kon, mahsulot filterlari, buyurtma avtomatlashtirish va yetkazib berish integratsiyasi.',
        },
        {
          name: language === 'ru' ? 'Премиум' : language === 'en' ? 'Premium' : 'Premium',
          price: '$3,500+',
          detail:
            language === 'ru'
              ? 'Полноценная платформа с кастомной логикой, аналитикой, CRM и масштабированием.'
              : language === 'en'
              ? 'A premium commerce platform built for scale, custom logic, CRM health, and advanced analytics.'
              : 'Kengaytirilgan savdo platformasi, maxsus logika, CRM va ishlab chiqarish analitikasi.',
        },
      ]
    : isSmm
    ? [
        {
          name: language === 'ru' ? 'База' : language === 'en' ? 'Foundation' : 'Foundation',
          price: '$500',
          detail:
            language === 'ru'
              ? 'Минимальный пакет для запуска аккаунта, контент-плана и визуального оформления.'
              : language === 'en'
              ? 'A launch-ready plan for social content setup, visual identity, and a starter editorial rhythm.'
              : 'Akkountni ishga tushirish uchun minimal kontent reja, vizual uslub va boshlang\'ich jadvallar.',
        },
        {
          name: language === 'ru' ? 'Продвижение' : language === 'en' ? 'Growth' : 'Growth',
          price: '$1,200',
          detail:
            language === 'ru'
              ? 'Стабильная стратегия для роста охватов, вовлеченности и лидогенерации.'
              : language === 'en'
              ? 'An ongoing rhythm of filming, publishing, engagement optimization, and measurable reach growth.'
              : 'Qamrov, faollik va leadlar o\'sishi uchun barqaror marketing tizimi.',
        },
        {
          name: language === 'ru' ? 'Премиум' : language === 'en' ? 'Premium' : 'Premium',
          price: '$2,500+',
          detail:
            language === 'ru'
              ? 'Полный системный пакет для масштабирования бренда, рекламы и регулярного контентного потока.'
              : language === 'en'
              ? 'A full-scale social growth engine combining creative production, campaigns, automation, and analytics.'
              : 'Brendni kengaytirish, reklama va kontent motivatsiyasi uchun to\'liq tizimli paket.',
        },
      ]
    : [
        {
          name: language === 'ru' ? 'Старт' : language === 'en' ? 'Starter' : 'Starter',
          price: '$1,200',
          detail:
            language === 'ru'
              ? 'Комплексный стартовый сайт для бизнеса без сложной логики, но с сильным UX.'
              : language === 'en'
              ? 'A polished entry-level business website with a clear conversion path and premium design.'
              : 'Kichik biznes uchun zamonaviy korporativ sayt, aniq UX va yuqori konversiya.',
        },
        {
          name: language === 'ru' ? 'Профи' : language === 'en' ? 'Professional' : 'Professional',
          price: '$2,400',
          detail:
            language === 'ru'
              ? 'Усиленная версия с кастомной архитектурой, скоростью и маркетинговой структурой.'
              : language === 'en'
              ? 'A more advanced build with custom flows, technical depth, and performance optimization.'
              : 'Kengaytirilgan va chuqur texnik ishlov berilgan sayt uchun professional paket.',
        },
        {
          name: language === 'ru' ? 'Премиум' : language === 'en' ? 'Premium' : 'Premium',
          price: '$4,500+',
          detail:
            language === 'ru'
              ? 'Полноценная система под рост компании: маркетинг, автоматизация, интеграции и масштабирование.'
              : language === 'en'
              ? 'A premium digital platform built for scale, custom automations, integrations, and growth.'
              : 'Kompaniya o\'sishi uchun to\'liq digital platforma, avtomatlashtirish va integratsiyalar.',
        },
      ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="space-y-12 lg:space-y-16">
        <div>
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === 'ru' ? 'Назад ко всем услугам' : language === 'en' ? 'Back to all services' : 'Barcha xizmatlarga qaytish'}</span>
          </button>
        </div>

        <section className="grid items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>{service.category}</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {service.name[language]}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {service.fullDesc[language]}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-cyan-400"
              >
                <span>{language === 'ru' ? 'Заказать консультацию' : language === 'en' ? 'Book a consultation' : 'Konsultatsiya olish'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('portfolio')}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                <span>{language === 'ru' ? 'Смотреть проекты' : language === 'en' ? 'View projects' : 'Loyihalarni ko\'rish'}</span>
                <ChevronRight className="h-4 w-4 text-cyan-400" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[28px] border border-blue-500/30 bg-gradient-to-br from-slate-900 via-[#0b1326] to-[#080c14] p-6 shadow-[0_25px_80px_rgba(13,20,35,0.7)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.2),transparent_38%)]" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-300">
                    {language === 'ru' ? 'Фокус на результат' : language === 'en' ? 'Outcome-driven' : 'Natija markazi'}
                  </span>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                    {language === 'ru' ? 'GTM Ready' : language === 'en' ? 'Launch-ready' : 'Ishga tayyor'}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-700/80 bg-slate-950/60 p-4">
                  <div className="mb-4 flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-blue-500/15 p-2 text-cyan-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold">ZiyoTech</span>
                    </div>
                    <span className="text-xs text-slate-400">Project Pulse</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Goals</div>
                        <div className="mt-1 text-sm font-semibold text-white">Brand authority</div>
                      </div>
                      <Rocket className="h-5 w-5 text-cyan-400" />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">UX</div>
                        <div className="mt-1 text-sm font-semibold text-white">Trust-first experience</div>
                      </div>
                      <Users className="h-5 w-5 text-indigo-300" />
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Tech</div>
                        <div className="mt-1 text-sm font-semibold text-white">React · TypeScript · SEO</div>
                      </div>
                      <MonitorSmartphone className="h-5 w-5 text-blue-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {showcaseMetrics.map(({ label, value, icon: IconMetric }) => (
            <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <IconMetric className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="mt-2 text-sm text-slate-300">{label}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {language === 'ru' ? 'Что вы получаете' : language === 'en' ? 'What you receive' : 'Nima olasiz'}
              </h2>
            </div>

            <ul className="space-y-4">
              {service.deliverables[language].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-slate-200 sm:text-base">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0b1326] to-[#0a111c] p-7 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <Star className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {language === 'ru' ? 'Преимущества для бизнеса' : language === 'en' ? 'Business advantages' : 'Biznes afzalliklari'}
              </h2>
            </div>

            <div className="space-y-3">
              {service.benefits[language].map((item, index) => (
                <div key={index} className="flex gap-3 rounded-2xl border border-slate-800 bg-white/[0.02] p-3.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <p className="text-sm text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Workflow className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Как мы работаем' : language === 'en' ? 'How we work' : 'Biz qanday ishlaymiz'}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-800 bg-white/[0.02] p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <Paintbrush2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {language === 'ru' ? 'Почему это работает' : language === 'en' ? 'Why it performs' : 'Nega samarali ishlaydi'}
              </h2>
            </div>

            <div className="space-y-3">
              {portfolioHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-white/[0.02] p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0b1326] via-[#091222] to-[#080c14] p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {language === 'ru' ? 'Надежная инфраструктура' : language === 'en' ? 'Reliable delivery' : 'Ishonchli yetkazib berish'}
              </h2>
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-white/[0.02] p-3.5">
                <span>{language === 'ru' ? 'Архитектура' : language === 'en' ? 'Architecture' : 'Arxitektura'}</span>
                <span className="font-semibold text-cyan-300">Scalable</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-white/[0.02] p-3.5">
                <span>{language === 'ru' ? 'Поддержка' : language === 'en' ? 'Support' : 'Qo\'llab-quvvatlash'}</span>
                <span className="font-semibold text-cyan-300">Ongoing</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-white/[0.02] p-3.5">
                <span>{language === 'ru' ? 'Соблюдение стандартов' : language === 'en' ? 'Quality standards' : 'Sifat standartlari'}</span>
                <span className="font-semibold text-cyan-300">High</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Тарифы' : language === 'en' ? 'Pricing' : 'Narxlar'}
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className="rounded-3xl border border-slate-800 bg-white/2 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  {language === 'ru' ? 'Пакет' : language === 'en' ? 'Plan' : 'Paket'}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{tier.name}</h3>
                <div className="mb-4 text-3xl font-black tracking-tight text-cyan-300">{tier.price}</div>
                <p className="text-sm leading-relaxed text-slate-300">{tier.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
              <CirclePlay className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Примеры рабочего процесса и визуального стиля' : language === 'en' ? 'Project visuals and delivery snapshots' : 'Loyiha vizual va ish jarayoni tasvirlari'}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {projectGallery.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
                <img src={item.image} alt={item.title} className="h-64 w-full object-cover" />
                <div className="p-4">
                  <p className="text-sm font-medium text-slate-200">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
              <Code2 className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Архитектура проекта' : language === 'en' ? 'Project architecture' : 'Loyiha arxitekturasi'}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {detailCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-3 text-xl font-bold text-white">{card.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-300">{card.body}</p>
                <ul className="space-y-3">
                  {card.list.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-slate-200">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
              <Rocket className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Сроки реализации проекта' : language === 'en' ? 'Project delivery timeline' : 'Loyiha yakunlanish muddati'}
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-linear-to-br from-[#081320] via-[#0a1325] to-[#050b15] p-6">
            <p className="mb-6 max-w-3xl text-base leading-relaxed text-slate-300">
              {projectDuration}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {deliveryTimeline.map((item, index) => (
                <div key={item.phase} className="rounded-2xl border border-slate-800 bg-white/2 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <h3 className="text-base font-bold text-white">{item.phase}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{item.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Наша команда разработки' : language === 'en' ? 'Our development team' : 'Bizning ishlab chiqish jamoasi'}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {teamRoles.map((role) => (
              <div key={role.title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-300">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{role.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-800 pt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Другие услуги ZiyoTech' : language === 'en' ? 'More ZiyoTech capabilities' : 'Boshqa ZiyoTech xizmatlari'}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {otherServices.map((other) => {
              const OtherIcon = iconMap[other.icon] || Code2;
              return (
                <div
                  key={other.id}
                  onClick={() => onNavigate('service-detail', other.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onNavigate('service-detail', other.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-blue-500/40 hover:bg-blue-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-300 transition-transform group-hover:scale-105">
                    <OtherIcon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">{other.name[language]}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{other.shortDesc[language]}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-500/25 bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 p-7 text-white shadow-[0_25px_50px_rgba(59,130,246,0.35)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <Zap className="h-3.5 w-3.5" />
                {language === 'ru' ? 'Начать проект' : language === 'en' ? 'Start your project' : 'Loyihani boshlash'}
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {language === 'ru' ? 'Нужен продуманный сайт, который продает?' : language === 'en' ? 'Need a site that earns trust and drives sales?' : 'Sotishni va ishonchni oshiradigan sayt kerakmi?'}
              </h2>
            </div>

            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950/80 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-900"
            >
              <span>{language === 'ru' ? 'Связаться с нами' : language === 'en' ? 'Talk to us' : 'Biz bilan bog\'laning'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
