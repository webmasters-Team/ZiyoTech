import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bot,
  MessageSquare,
  Instagram,
  Send,
  Cpu,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Database,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface AiSolutionsSectionProps {
  onNavigate: (page: string) => void;
}

export const AiSolutionsSection: React.FC<AiSolutionsSectionProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'instagram' | 'telegram' | 'web' | 'knowledge'>('instagram');

  const solutions = {
    instagram: {
      title: 'Instagram Direct AI Sales Agent',
      desc: language === 'ru'
        ? 'Официальная интеграция с Meta Graph API. Автоматический ответ клиентам за 3 секунды, проверка цен и остатков в базе данных, сбор заявок и перевод на человека.'
        : language === 'en'
        ? 'Official Meta Graph API integration. Autonomous sub-3s response to incoming inquiries, real-time catalog price checks, order drafting, and seamless staff handover.'
        : "Meta Graph API orqali rasmiy integratsiya. 3 soniya ichida mijozlarga javob berish, narx va ombor qoldig'ini tekshirish, buyurtma olish va xodimga yo'naltirish.",
      features: [
        'Official Meta Messenger API compliance',
        'Direct product catalog price retrieval',
        '24/7 autonomous order taking',
        'Instant human employee handover',
      ],
      badge: 'Flagship Solution',
    },
    telegram: {
      title: 'Telegram AI Business Bot',
      desc: language === 'ru'
        ? 'Интеллектуальный Telegram-бот для бизнеса: отправка каталога товаров с фото, расчет доставки по городам Узбекистана и интеграция с CRM-системами.'
        : language === 'en'
        ? 'High-conversion Telegram sales bot: interactive visual catalogs, automated courier rate calculations across Uzbekistan, and bi-directional CRM synchronization.'
        : "Biznes uchun aqlli Telegram bot: rasmli katalog taqdim etish, viloyatlarga yetkazib berish narxini hisoblash va CRM bilan to'liq bog'lanish.",
      features: [
        'Web App & Inline interactive menus',
        'Click, Payme, and Uzum integrations',
        'Multi-tiered customer categorization',
        'Direct CRM & ERP data flow',
      ],
      badge: 'Popular in UZ',
    },
    web: {
      title: 'Website Conversational AI Widget',
      desc: language === 'ru'
        ? 'Умный виджет на сайте, консультирующий посетителей по услугам компании, квалифицирующий лиды и передающий контактные данные в отдел продаж.'
        : language === 'en'
        ? 'Sleek embedded web agent that qualifies incoming inbound traffic, navigates complex service offerings, and collects structured lead dossiers.'
        : "Veb-saytingizga joylashtiriladigan aqlli chat-vidjet. Xizmatlar bo'yicha maslahat beradi va mijoz kontaktlarini savdo bo'limiga yuboradi.",
      features: [
        'Custom styled to match brand aesthetics',
        'Live page context awareness',
        'Automated lead qualification scoring',
        'Zero-latency sub-1s vector search',
      ],
      badge: 'Conversion Booster',
    },
    knowledge: {
      title: 'Verified Business Knowledge Base (RAG)',
      desc: language === 'ru'
        ? 'Система гарантирует: ИИ никогда не выдумывает цены, скидки или условия. Ответы формируются строго на основе загруженных прайс-листов и регламентов.'
        : language === 'en'
        ? 'Strict factual governance via verified RAG: the AI never hallucinates prices, inventory, or delivery policies, adhering solely to authenticated documents.'
        : "Qat'iy tekshirilgan bilimlar bazasi (RAG). AI hech qachon narxlar yoki shartlarni to'qib chiqarmaydi, faqat tasdiqlangan hujjatlar asosida javob beradi.",
      features: [
        'Zero hallucination price protection',
        'Instant document update synchronization',
        'Support for PDF, Excel, and Word specs',
        'Role-based permission governance',
      ],
      badge: 'Enterprise Security',
    },
  };

  const current = solutions[activeTab];

  const flagshipServices = [
    {
      title: language === 'ru' ? 'AI Sales Agent' : language === 'en' ? 'AI Sales Agent' : 'AI Savdo Agenti',
      description:
        language === 'ru'
          ? 'Автоматизирует продажи в Instagram, Telegram, WhatsApp и на сайте: отвечает на вопросы, квалифицирует лидов и переводит сложные сделки на сотрудника.'
          : language === 'en'
          ? 'Automates sales conversations across Instagram, Telegram, WhatsApp, and your website by answering questions, qualifying leads, and routing complex deals to staff.'
          : 'Instagram, Telegram, WhatsApp va veb-saytdagi savdo muloqotlarini avtomatlashtiradi: savollarni javoblaydi, leadlarni saralaydi va murakkab holatlarni xodimlarga yo’naltiradi.',
      badge: language === 'ru' ? 'Топ приоритет' : language === 'en' ? 'Top priority' : 'Asosiy ustuvorlik',
      icon: TrendingUp,
    },
    {
      title: language === 'ru' ? 'AI Customer Support' : language === 'en' ? 'AI Customer Support' : 'AI Mijozlarga Yordam',
      description:
        language === 'ru'
          ? 'Отвечает на частые вопросы, рассказывает о доставке и возвратах, уточняет статус заказов и помогает быстро решать жалобы.'
          : language === 'en'
          ? 'Handles FAQs, delivery and return policy questions, order updates, and complaint escalation without slowing your support team.'
          : 'Tez-tez keladigan savollarni, yetkazib berish va qaytarish shartlarini, buyurtma holatini va shikoyatlarni avtomatik tarzda ko‘rib chiqadi.',
      badge: language === 'ru' ? 'Очень высокий спрос' : language === 'en' ? 'Very high demand' : 'Yuqori talab',
      icon: ShieldCheck,
    },
    {
      title: language === 'ru' ? 'AI Booking Assistant' : language === 'en' ? 'AI Booking Assistant' : 'AI Bron Assistanti',
      description:
        language === 'ru'
          ? 'Проверяет доступность, бронирует встречи, отправляет напоминания и помогает уменьшить потерю клиентов из-за забытых записей.'
          : language === 'en'
          ? 'Checks calendars, books appointments, sends reminders, and reduces no-shows for clinics, salons, and service businesses.'
          : 'Kalendarni tekshiradi, uchrashuvlarni bron qiladi, eslatmalar yuboradi va tashriflarni yo‘qotish ehtimolini kamaytiradi.',
      badge: language === 'ru' ? 'Высокий спрос' : language === 'en' ? 'High demand' : 'Yuqori talab',
      icon: UserCheck,
    },
    {
      title: language === 'ru' ? 'AI CRM & Lead Management' : language === 'en' ? 'AI CRM & Lead Management' : 'AI CRM & Lead Boshqaruvi',
      description:
        language === 'ru'
          ? 'Собирает лиды, оценивает их уровень потенциала, обновляет CRM и напоминания менеджерам о следующих действиях.'
          : language === 'en'
          ? 'Captures inbound leads, scores sales potential, updates CRM records, and reminds teams exactly when to follow up.'
          : 'Leadlar yig‘adi, ularning savdo potentsialini baholaydi, CRM ma’lumotlarini yangilaydi va menejerlarga keyingi qadamni eslatadi.',
      badge: language === 'ru' ? 'Операционная ценность' : language === 'en' ? 'Operational value' : 'Amaliy qiymat',
      icon: Database,
    },
    {
      title: language === 'ru' ? 'AI Voice Receptionist' : language === 'en' ? 'AI Voice Receptionist' : 'AI Ovozli Rezeptionist',
      description:
        language === 'ru'
          ? 'Принимает входящие звонки, понимает запрос клиента, записывает на прием и направляет вызов в нужный отдел.'
          : language === 'en'
          ? 'Answers calls, understands customer intent, handles scheduling, and routes calls to the correct department or person.'
          : 'Kirish qo‘ng‘iroqlariga javob beradi, mijoz niyatini tushunadi, uchrashuvlarni bron qiladi va qo‘ng‘iroqni to‘g‘ri bo‘limga yo‘naltiradi.',
      badge: language === 'ru' ? 'Высокая ценность' : language === 'en' ? 'High value' : 'Yuqori qiymat',
      icon: Cpu,
    },
    {
      title: language === 'ru' ? 'AI Inventory & Order Automation' : language === 'en' ? 'AI Inventory & Order Automation' : 'AI Ombor & Buyurtma Avtomatlashtirish',
      description:
        language === 'ru'
          ? 'Проверяет остатки, отслеживает дефицит товаров, оформляет покупки и помогает избегать задержек в отделе продаж.'
          : language === 'en'
          ? 'Connects to stock systems to check availability, monitor shortages, process orders, and recommend replenishment before stockouts occur.'
          : 'Ombor qismini tekshiradi, mahsulot yetishmovchiligini kuzatadi, buyurtmalarni qayta ishlaydi va ombor tanqisligini oldindan bartaraf etadi.',
      badge: language === 'ru' ? 'Скорость оборота' : language === 'en' ? 'Faster flow' : 'Tezroq jarayon',
      icon: Database,
    },
    {
      title: language === 'ru' ? 'Business Process Automation' : language === 'en' ? 'Business Process Automation' : 'Biznes Jarayonlarini Avtomatlashtirish',
      description:
        language === 'ru'
          ? 'Автоматизирует повторяющиеся задачи вроде обработки форм, onboarding, маршрутизации заявок и внутренних уведомлений.'
          : language === 'en'
          ? 'Automates repetitive work like form processing, onboarding, approvals, internal notifications, and handoff workflows across teams.'
          : 'Formalar, onboarding, approvallar, ichki bildirishnomalar va jamoaviy jarayonlarni avtomatlashtiradi.',
      badge: language === 'ru' ? 'Рост эффективности' : language === 'en' ? 'Efficiency gain' : 'Samaradorlik o‘sishi',
      icon: Bot,
    },
    {
      title: language === 'ru' ? 'AI Marketing Automation' : language === 'en' ? 'AI Marketing Automation' : 'AI Marketing Avtomatlashtirish',
      description:
        language === 'ru'
          ? 'Генерирует черновики контента, сегментирует аудитории, запускает согласованные кампании и помогает вести лиды в воронку продаж.'
          : language === 'en'
          ? 'Drafts campaign content, segments audiences, automates approved messaging, and helps warm up leads through the funnel.'
          : 'Kampaniya kontentini tayyorlaydi, auditoriyani segmentlaydi, tasdiqlangan xabarlarni avtomatik yuboradi va leadlarni savdo funneliga olib kiradi.',
      badge: language === 'ru' ? 'Комплексный рост' : language === 'en' ? 'Growth engine' : 'O‘sish mexanizmi',
      icon: TrendingUp,
    },
    {
      title: language === 'ru' ? 'AI Analytics & Business Intelligence' : language === 'en' ? 'AI Analytics & Business Intelligence' : 'AI Analitika & Biznes Intellekti',
      description:
        language === 'ru'
          ? 'Преобразует данные в понятные дашборды, сводки по продажам, оповещения об аномалиях и прогнозы по росту.'
          : language === 'en'
          ? 'Transforms raw business data into dashboards, sales summaries, anomaly alerts, and forecast insights for better decision-making.'
          : 'Maqsadli ma’lumotlarni dashboard, savdo xulosalari, anomaliya ogohlantirishlari va prognozlar shaklida taqdim etadi.',
      badge: language === 'ru' ? 'Снижение рисков' : language === 'en' ? 'Smarter decisions' : 'Yaqshi qarorlar',
      icon: Cpu,
    },
    {
      title: language === 'ru' ? 'AI HR & Employee Assistant' : language === 'en' ? 'AI HR & Employee Assistant' : 'AI HR & Xodim Yordamchisi',
      description:
        language === 'ru'
          ? 'Отвечает на вопросы по политике компании, помогает с onboarding и хранит внутреннюю базу знаний для сотрудников.'
          : language === 'en'
          ? 'Answers employee policy questions, supports onboarding, organizes internal knowledge, and reduces repetitive HR admin work.'
          : 'Xodimlar uchun siyosatlar, onboarding, ichki bilimlar bazasi va HR admin ishlarini avtomatlashtiradi.',
      badge: language === 'ru' ? 'Меньше рутины' : language === 'en' ? 'Less admin work' : 'Kamroq admin ish',
      icon: UserCheck,
    },
    {
      title: language === 'ru' ? 'AI Document Processing' : language === 'en' ? 'AI Document Processing' : 'AI Hujjatlarni Qayta Ishlash',
      description:
        language === 'ru'
          ? 'Извлекает данные из счетов, контрактов и заявок, проверяет поля и передает информацию в связанную систему.'
          : language === 'en'
          ? 'Extracts key details from invoices, contracts, receipts, and forms, validates data, and routes records into connected systems.'
          : 'Hisob-fakturalar, shartnomalar, kvitansiyalar va formalar ma’lumotlarini ajratib oladi va tizimga yuboradi.',
      badge: language === 'ru' ? 'Автоматизация данных' : language === 'en' ? 'Data automation' : 'Ma’lumotlar avtomatlashtirish',
      icon: Database,
    },
    {
      title: language === 'ru' ? 'AI Consulting & Custom Development' : language === 'en' ? 'AI Consulting & Custom Development' : 'AI Kengash & Maxsus Rivojlanish',
      description:
        language === 'ru'
          ? 'Аудит бизнес-процессов, поиск точек автоматизации и создание решений под уникальные workflows компании.'
          : language === 'en'
          ? 'Audits workflows, identifies high-value automation opportunities, and builds custom AI systems tailored to your actual operating model.'
          : 'Biznes jarayonlarini tahlil qiladi, avtomatlashtirish imkoniyatlarini aniqlaydi va kompaniyaning o‘ziga xos ishlash modeliga mos AI yechimlar yaratadi.',
      badge: language === 'ru' ? 'Индивидуальный подход' : language === 'en' ? 'Custom strategy' : 'Maxsus strategiya',
      icon: Bot,
    },
  ];

  const launchPriority = [
    {
      name: language === 'ru' ? 'AI Sales Agent' : language === 'en' ? 'AI Sales Agent' : 'AI Savdo Agenti',
      detail:
        language === 'ru'
          ? 'Лиды, чат-конверсии и квалификация входящих запросов.'
          : language === 'en'
          ? 'Leads, chat conversion, and qualification for retail and service businesses.'
          : 'Leadlar, chat konversiyasi va kiruvchi murojaatlarni saralash.',
    },
    {
      name: language === 'ru' ? 'AI Customer Support' : language === 'en' ? 'AI Customer Support' : 'AI Mijoz Yordam',
      detail:
        language === 'ru'
          ? 'Поддержка 24/7, ответы на FAQ и распределение задач.'
          : language === 'en'
          ? 'Round-the-clock support, FAQ automation, and escalation routing.'
          : '24/7 yordam, FAQ avtomatlashtirish va murojaatlarni yo‘naltirish.',
    },
    {
      name: language === 'ru' ? 'AI Booking Assistant' : language === 'en' ? 'AI Booking Assistant' : 'AI Bron Assistanti',
      detail:
        language === 'ru'
          ? 'Запись клиентов, напоминания и сокращение потерь клиентов.'
          : language === 'en'
          ? 'Appointments, reminders, and fewer missed visits for clinics and service businesses.'
          : 'Uchrashuvlarni bron qilish, eslatmalar va qoldirilgan tashriflarni kamaytirish.',
    },
  ];

  const industrySolutions = [
    {
      title: language === 'ru' ? 'Retail & E-commerce' : language === 'en' ? 'Retail & E-commerce' : 'Chakana savdo & E-commerce',
      points:
        language === 'ru'
          ? ['Instagram/Telegram sales agents', 'Stock checks', 'Product recommendations', 'Order tracking']
          : language === 'en'
          ? ['Instagram and Telegram sales agents', 'Stock checking', 'Product recommendations', 'Abandoned cart follow-up']
          : ['Instagram/Telegram savdo agenti', 'Ombor tekshiruvi', 'Mahsulot tavsiyasi', 'Buyurtma kuzatuvi'],
    },
    {
      title: language === 'ru' ? 'Clinics & Dental Centers' : language === 'en' ? 'Clinics & Dental Centers' : 'Klinikalar & Tish shifoxonalari',
      points:
        language === 'ru'
          ? ['Appointment booking', 'Reminders', 'Patient FAQs', 'Reception support']
          : language === 'en'
          ? ['Appointment booking', 'Reminders', 'Service FAQs', 'Receptionist support']
          : ['Uchrashuv bronlash', 'Eslatmalar', 'FAQ', 'Rezeptionist yordami'],
    },
    {
      title: language === 'ru' ? 'Real Estate' : language === 'en' ? 'Real Estate' : 'Ko‘chmas mulk',
      points:
        language === 'ru'
          ? ['Lead qualification', 'Property matching', 'Viewing scheduling', 'CRM follow-up']
          : language === 'en'
          ? ['Lead qualification', 'Property matching', 'Viewing scheduling', 'CRM follow-up']
          : ['Lead saralash', 'Uyni moslashtirish', 'Tanishuv bronlash', 'CRM eslatmalar'],
    },
    {
      title: language === 'ru' ? 'Manufacturing' : language === 'en' ? 'Manufacturing' : 'Ishlab chiqarish',
      points:
        language === 'ru'
          ? ['Supplier communication', 'Inventory alerts', 'Document extraction', 'Procurement workflows']
          : language === 'en'
          ? ['Supplier communication', 'Inventory alerts', 'Document extraction', 'Procurement workflows']
          : ['Yetkazib beruvchilar bilan aloqa', 'Ombor ogohlantirishlari', 'Hujjatlarni qayta ishlash', 'Sotib olish jarayoni'],
    },
    {
      title: language === 'ru' ? 'Education' : language === 'en' ? 'Education' : 'Ta’lim',
      points:
        language === 'ru'
          ? ['Admissions support', 'Course guidance', 'Student FAQs', 'Enrollment workflows']
          : language === 'en'
          ? ['Admissions support', 'Course guidance', 'Student FAQs', 'Enrollment workflows']
          : ['Qabul yordami', 'Kurs tavsiyasi', 'Talabalar FAQ', 'Yozuv jarayonlari'],
    },
    {
      title: language === 'ru' ? 'Hospitality' : language === 'en' ? 'Hospitality' : 'Mehmonxona & xizmat',
      points:
        language === 'ru'
          ? ['Reservation inquiries', 'Guest FAQs', 'Multilingual support', 'Feedback collection']
          : language === 'en'
          ? ['Reservation inquiries', 'Guest FAQs', 'Multilingual support', 'Feedback collection']
          : ['Bron so‘rovlari', 'Mijoz FAQ', 'Ko‘p tilli yordam', 'Fikrlarni yig‘ish'],
    },
  ];

  return (
    <section id="ai-solutions" className="py-14 sm:py-20 lg:py-28 bg-[#040713] relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Интеллектуальная автоматизация' : language === 'en' ? 'Intelligent Automation' : 'Aqlli Avtomatlashtirish'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {language === 'ru'
              ? 'AI, который работает на ваш бизнес'
              : language === 'en'
              ? 'AI That Works for Your Business'
              : 'AI biznesingiz uchun ishlaydi'}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {language === 'ru'
              ? 'Автоматизируем продажи, снижает расходы, ускоряем задачи и превращаем ежедневные операции в систему роста.'
              : language === 'en'
              ? 'Automate customer conversations, capture more leads, reduce operating costs, and connect everyday business work with intelligent AI agents.'
              : 'Mijozlar bilan muloqotni avtomatlashtiramiz, ko‘proq lead yig‘amiz, xarajatlarni kamaytiramiz va kundalik operatsiyalarni aqlli AI bilan bog‘laymiz.'}
          </p>
        </div>

        {/* 3 Metric Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono tabular-nums mb-2">
              {t.aiSection.stat1}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {t.aiSection.stat1Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono tabular-nums mb-2">
              {t.aiSection.stat2}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {t.aiSection.stat2Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-mono tabular-nums mb-2">
              {t.aiSection.stat3}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {t.aiSection.stat3Desc}
            </p>
          </div>
        </div>

        {/* Interactive Solution Explorer */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          {/* Solution Tabs */}
          <div className="flex flex-wrap gap-2 pb-6 border-b border-slate-800 mb-8">
            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'instagram'
                  ? 'bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram Sales Agent</span>
            </button>

            <button
              onClick={() => setActiveTab('telegram')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'telegram'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Telegram AI Bot</span>
            </button>

            <button
              onClick={() => setActiveTab('web')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'web'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Website AI Widget</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Knowledge Base (RAG)</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-block px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800 text-blue-300 text-xs font-semibold">
                {current.badge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {current.title}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {current.desc}
              </p>

              <div className="space-y-2.5 pt-2">
                {current.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('product-sales-agent')}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <span>Explore ZiyoTech AI Sales Agent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-700 transition-colors"
                >
                  Request Integration Demo
                </button>
              </div>
            </div>

            {/* Architecture Illustration Box */}
            <div className="lg:col-span-5 rounded-2xl bg-[#060918] border border-slate-800 p-6 space-y-4">
              <div className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>Verified Data Pipeline</span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Meta Live Ready
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-white">Instagram Webhook Event</div>
                      <div className="text-[10px] text-slate-400">Customer asks for product & price</div>
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-cyan-300">Catalog & Policy Query</div>
                      <div className="text-[10px] text-slate-300">Checks PostgreSQL exact price & stock</div>
                    </div>
                  </div>
                  <Database className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-white">Verified Response or Handover</div>
                      <div className="text-[10px] text-slate-400">Sub-3s message or live operator alert</div>
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                Strict rule: AI never invents prices or promises unconfirmed deliveries.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <TrendingUp className="h-3.5 w-3.5" />
                {language === 'ru' ? 'Пакеты услуг' : language === 'en' ? 'Service portfolio' : 'Xizmat paketlari'}
              </div>
              <h3 className="text-2xl font-bold text-white">
                {language === 'ru' ? '12 AI-сервисов для реального роста бизнеса' : language === 'en' ? '12 AI services designed to solve business problems' : 'Real biznes o‘sishi uchun 12 ta AI xizmati'}
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {flagshipServices.map(({ title, description, badge, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 transition-all hover:border-cyan-500/40 hover:bg-slate-900/80">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200">
                    {badge}
                  </span>
                </div>
                <h4 className="mb-2 text-lg font-bold text-white">{title}</h4>
                <p className="text-sm leading-relaxed text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {language === 'ru' ? 'Что запускать первым' : language === 'en' ? 'Recommended launch priority' : 'Avval nima ishga tushirish kerak'}
              </h3>
            </div>

            <div className="space-y-4">
              {launchPriority.map((item, index) => (
                <div key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-xs font-black text-white">
                      {index + 1}
                    </div>
                    <h4 className="text-base font-bold text-white">{item.name}</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {language === 'ru' ? 'Отраслевые решения' : language === 'en' ? 'Industry-specific AI solutions' : 'Sanoatga oid AI yechimlar'}
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {industrySolutions.map((industry) => (
                <div key={industry.title} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <h4 className="mb-3 font-bold text-white">{industry.title}</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {industry.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-cyan-500/25 bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 p-7 text-white shadow-[0_25px_50px_rgba(59,130,246,0.35)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <Cpu className="h-3.5 w-3.5" />
                {language === 'ru' ? 'Начать проект' : language === 'en' ? 'Start your AI project' : 'AI loyihasini boshlash'}
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {language === 'ru'
                  ? 'Нужна система, которая реально экономит время и увеличивает продажи?'
                  : language === 'en'
                  ? 'Need an AI system that saves time and drives real business growth?'
                  : 'Vaqtni tejaydigan va savdoni oshiradigan AI tizimi kerakmi?'}
              </h2>
            </div>

            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950/80 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-900"
            >
              <span>{language === 'ru' ? 'Запросить аудит' : language === 'en' ? 'Request AI audit' : 'AI audit so\'rov qiling'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
