import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  ShoppingBag,
  Building2,
  UtensilsCrossed,
  Clock,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Bot,
  Globe,
  Camera
} from 'lucide-react';

interface EasyExplainerSectionProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

export const EasyExplainerSection: React.FC<EasyExplainerSectionProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  // Business types for the Solution Finder
  const [selectedIndustry, setSelectedIndustry] = useState<string>('retail');
  const [selectedGoal, setSelectedGoal] = useState<string>('automation');

  const industries = [
    {
      id: 'retail',
      icon: ShoppingBag,
      label: {
        uz: 'Do\'kon & Kiyim-Kechak',
        ru: 'Магазины и Одежда',
        en: 'Retail & Fashion Stores',
      },
      tag: {
        uz: 'Chakana savdo',
        ru: 'Розничные продажи',
        en: 'B2C Retail',
      },
    },
    {
      id: 'manufacturing',
      icon: Building2,
      label: {
        uz: 'Mebel & Ishlab Chiqarish',
        ru: 'Мебель и Производство',
        en: 'Furniture & Manufacturing',
      },
      tag: {
        uz: 'Katta assortiment',
        ru: 'Большой каталог',
        en: 'High SKU volume',
      },
    },
    {
      id: 'services',
      icon: Zap,
      label: {
        uz: 'Xizmatlar & B2B Kompaniyalar',
        ru: 'Услуги и B2B Бизнес',
        en: 'Professional Services & B2B',
      },
      tag: {
        uz: 'Arizalar qabul qilish',
        ru: 'Сбор заявок',
        en: 'Lead Generation',
      },
    },
    {
      id: 'hospitality',
      icon: UtensilsCrossed,
      label: {
        uz: 'Restoran & Yetkazib Berish',
        ru: 'Рестораны и Доставка',
        en: 'Food & Hospitality',
      },
      tag: {
        uz: 'Menyu va buyurtmalar',
        ru: 'Меню и заказы',
        en: 'Menu & Orders',
      },
    },
  ];

  const goals = [
    {
      id: 'automation',
      icon: Bot,
      label: {
        uz: 'Instagram Direct & Telegram\'da 24/7 avtomatik sotish',
        ru: 'Автоматизация продаж в Instagram Direct и Telegram 24/7',
        en: 'Automate sales in Instagram Direct & Telegram 24/7',
      },
    },
    {
      id: 'website',
      icon: Globe,
      label: {
        uz: 'Click/Payme to\'lovli zamonaviy veb-sayt yoki do\'kon',
        ru: 'Современный сайт или интернет-магазин с оплатой Payme/Click',
        en: 'Modern online store with seamless online payment checkout',
      },
    },
    {
      id: 'content',
      icon: Camera,
      label: {
        uz: 'Instagram Reels va mahsulot fotosessiyasi orqali mijoz jalb qilish',
        ru: 'Привлечение клиентов через Reels, контент и рекламу',
        en: 'Acquire high-intent customers via Reels & ad production',
      },
    },
  ];

  // Dynamic recommendations based on selections
  const recommendations: Record<
    string,
    {
      title: { uz: string; ru: string; en: string };
      description: { uz: string; ru: string; en: string };
      serviceId: string;
      timeline: { uz: string; ru: string; en: string };
      outcome: { uz: string; ru: string; en: string };
      deliverables: { uz: string[]; ru: string[]; en: string[] };
    }
  > = {
    'retail-automation': {
      title: {
        uz: 'ZiyoTech AI Savdo Agenti (Instagram Direct & Telegram)',
        ru: 'ZiyoTech AI Sales Agent (Instagram Direct и Telegram)',
        en: 'ZiyoTech AI Sales Agent for Instagram Direct & Telegram',
      },
      description: {
        uz: 'Mijozlaringiz kechasi yozadimi yoki dam olish kunlaridami — AI yordamchi 3 soniyada javob beradi, o\'lcham va narxni aytadi, buyurtmani qabul qiladi.',
        ru: 'Клиенты пишут ночью или в выходные? ИИ-ассистент мгновенно за 3 секунды ответит на вопрос, уточнит размер и цену, и сформирует готовый заказ.',
        en: 'Customers message after hours? The AI agent replies within 3 seconds, verifies sizes and pricing, and captures orders automatically.',
      },
      serviceId: 'ai-automation',
      timeline: { uz: '3–5 ish kuni', ru: '3–5 рабочих дней', en: '3–5 business days' },
      outcome: {
        uz: '0 yo\'qotilgan mijoz, xodimlarning vaqti 70% tejaladi',
        ru: 'Ноль упущенных клиентов, экономия до 70% времени сотрудников',
        en: 'Zero lost customers, saving up to 70% of operator time',
      },
      deliverables: {
        uz: ['Instagram Direct rasmiy AI integratsiyasi', 'Telegram savdo boti', 'Mahsulotlar katalogi bilan sinxronizatsiya'],
        ru: ['Официальное подключение Instagram Direct', 'Торговый бот в Telegram', 'Синхронизация с каталогом товаров'],
        en: ['Official Meta Instagram Direct AI', 'Telegram commerce bot', 'Catalog & SKU synchronization'],
      },
    },
    'retail-website': {
      title: {
        uz: 'Elektron Tijorat Do\'koni (Click, Payme, Uzum Integratsiyasi)',
        ru: 'Интернет-магазин с приемом платежей (Payme, Click)',
        en: 'E-commerce Storefront with Payme & Click Checkout',
      },
      description: {
        uz: 'Mahsulotlaringizni chiroyli va qulay tartibda namoyish etuvchi, xaridorlar 3 qadamda to\'lov qilib sotib oladigan tezkor onlayn do\'kon.',
        ru: 'Быстрый и удобный онлайн-магазин, где покупатели за 3 шага выбирают товар, оплачивают картой и оформляют доставку.',
        en: 'High-converting online store enabling buyers to browse SKUs, pay online via local/international cards, and order delivery in 3 steps.',
      },
      serviceId: 'ecommerce',
      timeline: { uz: '7–12 ish kuni', ru: '7–12 рабочих дней', en: '7–12 business days' },
      outcome: {
        uz: 'Kechayu-kunduz avtomatlashgan savdo, to\'liq hisob-kitob',
        ru: 'Автоматические продажи 24/7 и прозрачный учет остатков',
        en: 'Autonomous round-the-clock sales & synchronized inventory',
      },
      deliverables: {
        uz: ['Zamonaviy onlayn do\'kon sayti', 'Click va Payme to\'lov tizimlari', 'Mobil telefonlar uchun 100% moslashgan interfeys'],
        ru: ['Современный интернет-магазин', 'Подключение Payme и Click', '100% удобство для покупок со смартфона'],
        en: ['Modern e-commerce storefront', 'Click & Payme payment gateway', 'Mobile-first responsive shopping flow'],
      },
    },
    'retail-content': {
      title: {
        uz: 'Professional Mahsulot Fotosessiyasi & Sotuvchi Reels',
        ru: 'Предметная фотосъемка и продающие Reels',
        en: 'Commercial Product Photography & High-Converting Reels',
      },
      description: {
        uz: 'Mahsulotlaringiz xalqaro brendlardek qimmat va jozibador ko\'rinishi uchun professional studiya fotosessiyasi va dinamik Reels videoroligi.',
        ru: 'Студийная съемка ваших товаров с правильным светом и динамичный монтаж Reels, которые вызывают доверие и желание купить.',
        en: 'Studio product lighting, commercial cinematography, and viral short-form Reels crafted to stop scrolling and elevate perceived value.',
      },
      serviceId: 'media-content',
      timeline: { uz: '3–5 ish kuni', ru: '3–5 рабочих дней', en: '3–5 business days' },
      outcome: {
        uz: 'Reklama narxi 2 barobar arzonlashadi, xaridor ishonchi oshadi',
        ru: 'Снижение стоимости клика в 2 раза и доверие к бренду',
        en: '2x higher advertising CTR and instant consumer trust',
      },
      deliverables: {
        uz: ['Mahsulotlar katalog fotosuratlari', '5–10 ta tayyor Reels roliklari', 'Instagram sahifa uchun yagona vizual uslub'],
        ru: ['Каталожные фото товаров в 4K', '5–10 готовых Reels со звуком', 'Единый визуальный стиль для ленты'],
        en: ['High-res 4K catalog photos', '5–10 ready-to-post Reels', 'Cohesive visual identity for feed'],
      },
    },
    'default': {
      title: {
        uz: 'ZiyoTech Kompleks Raqamlashtirish Paketi',
        ru: 'Комплексная цифровизация бизнеса ZiyoTech',
        en: 'ZiyoTech Comprehensive Digital Transformation',
      },
      description: {
        uz: 'Veb-sayt, sun\'iy intellekt avtomatlashtirish va maqsadli reklama — barchasi yagona professional jamoa qo\'lida sinxron ishga tushiriladi.',
        ru: 'Сайт, ИИ-ассистент и реклама: единая система, где каждая деталь настроена на рост выручки и сокращение рутины.',
        en: 'Website engineering, AI sales agents, and digital growth unified under a single architecture for measurable revenue growth.',
      },
      serviceId: 'ai-automation',
      timeline: { uz: '5–10 ish kuni', ru: '5–10 рабочих дней', en: '5–10 business days' },
      outcome: {
        uz: 'Biznesingiz raqobatchilardan 3 qadam oldinda bo\'ladi',
        ru: 'Ваш бизнес на 3 шага впереди конкурентов',
        en: 'Empower your business with a substantial technological edge',
      },
      deliverables: {
        uz: ['Tezkor veb-sayt / lending', 'AI savdo yordamchisi', 'Doimiy texnik qo\'llab-quvvatlash'],
        ru: ['Быстрый сайт / лендинг', 'ИИ-помощник для продаж', 'Постоянная техническая поддержка'],
        en: ['High-speed web platform', 'AI conversational sales assistant', 'Continuous technical support'],
      },
    },
  };

  const key = `${selectedIndustry}-${selectedGoal}`;
  const currentRec = recommendations[key] || recommendations['retail-automation'];

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 bg-[#080C14] border-t border-blue-500/15 overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        
        {/* 1. SECTION HEADER: Crystal-clear statement */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {language === 'ru'
                ? 'Все просто и прозрачно'
                : language === 'en'
                ? 'Clear & Simple Guide'
                : 'Oddiy va Tushunarli Yo\'riqnoma'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {language === 'ru'
              ? 'Как ZiyoTech помогает вашему бизнесу зарабатывать больше?'
              : language === 'en'
              ? 'How ZiyoTech Helps Your Business Grow and Earn More'
              : 'ZiyoTech biznesingizga qanday qilib ko\'proq daromad keltiradi?'}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {language === 'ru'
              ? 'Никаких сложных технических терминов. Выберите вашу сферу и цель, чтобы мгновенно увидеть точное готовое решение.'
              : language === 'en'
              ? 'No complex technical jargon. Choose your business type and primary goal to instantly see your tailored solution.'
              : 'Murakkab atamalarsiz, oddiy so\'zlar bilan. Biznesingiz turi va maqsadini tanlang — biz sizga eng to\'g\'ri yechimni ko\'rsatamiz.'}
          </p>
        </div>

        {/* 2. INTERACTIVE SOLUTION FINDER (2-CLICK WIZARD) */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#08101E] to-[#040813] border-2 border-blue-500/30 p-5 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="space-y-6">
            
            {/* Step 1: Choose Business Type */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {language === 'ru'
                    ? 'Шаг 1: Какая у вас сфера бизнеса?'
                    : language === 'en'
                    ? 'Step 1: What is your business industry?'
                    : '1-qadam: Biznesingiz qaysi sohada?'}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {industries.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => setSelectedIndustry(ind.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[96px] ${
                        isSelected
                          ? 'bg-blue-950/70 border-blue-400 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-500/20 text-cyan-300' : 'bg-white/[0.05] text-slate-400'}`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">{ind.label[language]}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ind.tag[language]}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Main Goal */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {language === 'ru'
                    ? 'Шаг 2: Какая ваша главная задача сейчас?'
                    : language === 'en'
                    ? 'Step 2: What is your primary objective?'
                    : '2-qadam: Sizga hozir eng ko\'p nima kerak?'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`p-4 rounded-2xl text-left transition-all border flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-950/70 border-blue-400 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-blue-500/20 text-cyan-300' : 'bg-white/[0.05] text-slate-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold leading-snug">
                        {goal.label[language]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Result Card */}
            <div className="mt-6 pt-6 border-t border-blue-500/20 rounded-2xl bg-[#070D1A] p-5 sm:p-7 border border-blue-500/30">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left: Solution & Deliverables */}
                <div className="lg:col-span-8 space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-800 font-bold">
                      {language === 'ru' ? 'Рекомендованное Решение' : language === 'en' ? 'Recommended Solution' : 'Sizga Tavsiya Etilgan Yechim'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {currentRec.timeline[language]}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {currentRec.title[language]}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {currentRec.description[language]}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      {language === 'ru' ? 'Что входит:' : language === 'en' ? 'Included scope:' : 'Nimalarni olasiz:'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentRec.deliverables[language].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Key Benefit & CTA */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4 text-center lg:text-left">
                  <div>
                    <div className="text-[11px] text-slate-400 font-mono uppercase">
                      {language === 'ru' ? 'Ожидаемый результат' : language === 'en' ? 'Expected Outcome' : 'Kutiladigan asosiy natija'}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-blue-200 mt-1">
                      {currentRec.outcome[language]}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => onNavigate('contact')}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                    >
                      <span>
                        {language === 'ru'
                          ? 'Получить Консультацию и Смету'
                          : language === 'en'
                          ? 'Request Consultation & Estimate'
                          : 'Konsultatsiya va Narxni Bilish'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onNavigate('service-detail', currentRec.serviceId)}
                      className="w-full py-2 px-4 rounded-full text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      {language === 'ru' ? 'Подробнее об услуге' : language === 'en' ? 'View Service Details' : 'Batafsil ma\'lumot ko\'rish'}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* 3. BEFORE VS AFTER COMPARISON (OLDIN VA KEYIN) */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              {language === 'ru' ? 'Сравнение Эффективности' : language === 'en' ? 'Impact Comparison' : 'Haqiqiy Taqqoslash'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {language === 'ru'
                ? 'Обычная работа против работы с ZiyoTech'
                : language === 'en'
                ? 'Traditional Manual Work vs. With ZiyoTech'
                : 'ZiyoTech\'siz eski usul va ZiyoTech bilan yangi natija'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Old Way (Pain Points) */}
            <div className="rounded-2xl p-6 sm:p-7 bg-red-950/15 border border-red-500/25 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-red-500/20 text-red-400 font-bold text-base sm:text-lg">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>
                  {language === 'ru'
                    ? 'Обычная работа (Частые проблемы)'
                    : language === 'en'
                    ? 'Traditional Approach (Friction & Loss)'
                    : 'ZiyoTech\'dan oldin (Ko\'p uchraydigan muammolar)'}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? 'Клиент пишет в 23:00, оператор спит, а утром клиент уже купил у конкурентов.'
                      : language === 'en'
                      ? 'A client writes late at night, nobody replies, and by morning they purchased from a competitor.'
                      : 'Mijoz soat 23:00 da yozadi, xodim uxlayapti — ertalabga borib mijoz raqobatchidan olib bo\'ladi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? 'Менеджеры тратят весь день на ответы «Сколько стоит?» и отправку одинаковых фото.'
                      : language === 'en'
                      ? 'Managers spend entire working hours repeatedly answering "How much?" and re-sending identical photos.'
                      : 'Operatorlar kun bo\'yi "Narxi qancha?", "Rasmi bormi?" degan bir xil savollarga javob berishdan charchaydi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? 'Сайт загружается медленно (более 4 секунд) или его нет вовсе — теряется до 50% покупателей.'
                      : language === 'en'
                      ? 'Website takes 4+ seconds to load or lacks mobile payment options, shedding up to 50% of buyers.'
                      : 'Sayt sekin yuklanadi yoki yo\'q — xaridor to\'lov qilolmay sahifani yopadi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? 'Реклама крутится, но нет структуры: заявки теряются в личных переписках.'
                      : language === 'en'
                      ? 'Paid ads burn budget with messy DMs, causing valuable inquiries to get lost in unread chats.'
                      : 'Reklamaga pul ketadi, lekin xabarlar shaxsiy chatlarda chalkashib, yo\'qolib ketadi.'}
                  </span>
                </li>
              </ul>
            </div>

            {/* The ZiyoTech Way (Solutions & Outcomes) */}
            <div className="rounded-2xl p-6 sm:p-7 bg-blue-950/25 border-2 border-blue-500/40 space-y-4 shadow-xl shadow-blue-950/30">
              <div className="flex items-center gap-2.5 pb-3 border-b border-blue-500/25 text-blue-200 font-bold text-base sm:text-lg">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>
                  {language === 'ru'
                    ? 'С ZiyoTech (Автоматизация и Рост)'
                    : language === 'en'
                    ? 'With ZiyoTech (Autonomous Growth)'
                    : 'ZiyoTech bilan (Haqiqiy natija va xotirjamlik)'}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? '24/7/365 мгновенный ответ за 3 секунды: вежливый диалог на узбекском или русском языках в любое время.'
                      : language === 'en'
                      ? 'Instant 3-second responses 24/7/365: polite, natural conversation in Uzbek and Russian anytime.'
                      : '24/7 uzluksiz: kechasi soat 03:00 da yozilsa ham 3 soniyada do\'stona va to\'g\'ri javob beriladi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? 'ИИ сам берет данные из каталога, называет точную цену, проверяет наличие и формирует готовую заявку.'
                      : language === 'en'
                      ? 'The AI agent references verified catalog data, quotes precise prices, checks stock, and drafts orders.'
                      : 'AI katalogdan aniq narx va omborni tekshirib aytadi va xaridorni buyurtmaga olib boradi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? 'Молниеносный современный сайт (< 1.5 сек) с удобной оплатой Click/Payme прямо со смартфона.'
                      : language === 'en'
                      ? 'Sub-1.5s load time website with effortless 3-step Click & Payme checkout directly on smartphones.'
                      : 'Telefon va kompyuterda 1.5 soniyada ochiluvchi, Click va Payme orqali to\'lov qabul qiluvchi qulay sayt.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    {language === 'ru'
                      ? 'Каждый лид зафиксирован в единой базе, реклама окупается в 2–3 раза лучше.'
                      : language === 'en'
                      ? 'Every lead is captured in a unified CRM; your marketing investments yield 2–3x higher returns.'
                      : 'Har bir murojaat va mijoz tartibli saqlanadi, reklama byudjeti 2–3 barobar samarali ishlaydi.'}
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* 4. THREE SIMPLE STEPS TO GET STARTED */}
        <div className="rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 lg:p-10 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              {language === 'ru' ? 'Как Мы Работаем' : language === 'en' ? 'Simple Process' : 'Boshlash Juda Oson'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {language === 'ru'
                ? 'Всего 3 простых шага до запуска'
                : language === 'en'
                ? 'Only 3 Simple Steps from Idea to Launch'
                : 'Ishga tushirish uchun 3 oddiy qadam'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#070E1C] border border-blue-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 font-bold font-mono text-lg flex items-center justify-center">
                01
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'ru' ? '1. Короткий созвон или чат' : language === 'en' ? '1. Brief Discovery Chat' : '1. Qisqa suhbat'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'ru'
                  ? 'Вы рассказываете о своем бизнесе и задачах. Мы бесплатно составляем план и прозрачную смету.'
                  : language === 'en'
                  ? 'Tell us about your business goals. We prepare an actionable execution roadmap and transparent cost estimate.'
                  : 'Siz o\'z biznesingiz va nima kerakligini aytasiz. Biz bepul reja va aniq narxni hisoblab beramiz.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#070E1C] border border-blue-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 font-bold font-mono text-lg flex items-center justify-center">
                02
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'ru' ? '2. Настройка за 3–7 дней' : language === 'en' ? '2. Setup in 3–7 Days' : '2. 3–7 kunda sozlash'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'ru'
                  ? 'Наша команда разрабатывает сайт, подключает платежи или настраивает ИИ под ваш ассортимент.'
                  : language === 'en'
                  ? 'Our team builds your web storefront, connects payments, and trains the AI on your exact inventory catalog.'
                  : 'Jamoamiz veb-saytni tayyorlaydi, to\'lovlarni ulaydi yoki AI yordamchini sizning tovarlaringizga o\'rgatadi.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#070E1C] border border-blue-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 font-bold font-mono text-lg flex items-center justify-center">
                03
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'ru' ? '3. Запуск и результат' : language === 'en' ? '3. Launch & Revenue' : '3. Ishga tushirish & Natija'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'ru'
                  ? 'Система начинает работать 24/7, обрабатывать входящих клиентов и приносить реальные продажи.'
                  : language === 'en'
                  ? 'The system runs autonomously 24/7, capturing incoming leads and driving consistent sales velocity.'
                  : 'Tizim 24/7 to\'xtovsiz ishlay boshlaydi, mijozlarni qabul qiladi va savdolaringizni oshiradi.'}
              </p>
            </div>
          </div>

          {/* Action Banner */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.08]">
            <div className="text-xs sm:text-sm text-slate-300 text-center sm:text-left">
              {language === 'ru'
                ? 'Хотите узнать, как это сработает именно для вашего бизнеса?'
                : language === 'en'
                ? 'Want to discover how this works specifically for your business?'
                : 'Sizning biznesingiz uchun qanday ishlashini bilmoqchimisiz?'}
            </div>

            <button
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/30 whitespace-nowrap transition-all hover:scale-105"
            >
              <span>
                {language === 'ru'
                  ? 'Обсудить Проект Бесплатно'
                  : language === 'en'
                  ? 'Discuss Your Project For Free'
                  : 'Loyihani Bepul Muhokama Qilish'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
