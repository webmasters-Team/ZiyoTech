import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import aiBusinessAutomationImage from '../../assets/explainer/ai-business-automation.webp';
import companyServicesImage from '../../assets/explainer/company-services.webp';
import retailFashionImage from '../../assets/explainer/retail-fashion.webp';
import furnitureManufacturingImage from '../../assets/explainer/furniture-manufacturing.webp';
import foodHospitalityImage from '../../assets/explainer/food-hospitality.webp';
import socialMessagingSalesImage from '../../assets/explainer/social-messaging-sales.webp';
import onlineStoreCheckoutImage from '../../assets/explainer/online-store-checkout.webp';
import reelsAdProductionImage from '../../assets/explainer/reels-ad-production.webp';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Clock,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface EasyExplainerSectionProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

export const EasyExplainerSection: React.FC<EasyExplainerSectionProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  // Business types for the Solution Finder
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ai-agents');
  const [selectedGoal, setSelectedGoal] = useState<string>('automation');

  const industries = [
    {
      id: 'ai-agents',
      icon: aiBusinessAutomationImage,
      label: {
        uz: 'AI Agentlar & Biznes Avtomatlashtirish',
        ru: 'AI Агенты и Автоматизация Бизнеса',
        en: 'AI Agents & Business Automation',
      },
      tag: {
        uz: 'Avtomatlashtirish',
        ru: 'Автоматизация',
        en: 'Automation',
      },
    },
    {
      id: 'services',
      icon: companyServicesImage,
      label: {
        uz: 'Kompaniya Xizmatlari',
        ru: 'Услуги Компании',
        en: 'Company Services',
      },
      tag: {
        uz: 'Yechimlar',
        ru: 'Решения',
        en: 'Solutions',
      },
    },
    {
      id: 'retail',
      icon: retailFashionImage,
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
      icon: furnitureManufacturingImage,
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
      id: 'hospitality',
      icon: foodHospitalityImage,
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
      icon: socialMessagingSalesImage,
      label: {
        uz: 'Instagram Direct & Telegram\'da 24/7 avtomatik sotish',
        ru: 'Автоматизация продаж в Instagram Direct и Telegram 24/7',
        en: 'Automate sales in Instagram Direct & Telegram 24/7',
      },
    },
    {
      id: 'website',
      icon: onlineStoreCheckoutImage,
      label: {
        uz: 'Click/Payme to\'lovli zamonaviy veb-sayt yoki do\'kon',
        ru: 'Современный сайт или интернет-магазин с оплатой Payme/Click',
        en: 'Modern online store with seamless online payment checkout',
      },
    },
    {
      id: 'content',
      icon: reelsAdProductionImage,
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
    'ai-agents-automation': {
      title: {
        uz: 'ZiyoTech AI Savdo Agenti va biznes avtomatlashtirish',
        ru: 'ZiyoTech AI Sales Agent и автоматизация бизнеса',
        en: 'ZiyoTech AI Sales Agent & business automation',
      },
      description: {
        uz: 'Instagram Direct, Telegram va veb-saytingizdagi savollarni avtomatik javoblatish, buyurtma olish va muloqotni real savdoga aylantirish.',
        ru: 'ИИ-агент для Instagram Direct и Telegram, который отвечает на вопросы клиентов, фиксирует заказы и переводит взаимодействия в реальные продажи.',
        en: 'An AI sales agent for Instagram Direct, Telegram, and your website that answers customer questions, captures orders, and converts inquiries into revenue.',
      },
      serviceId: 'ai-automation',
      timeline: { uz: '3–5 ish kuni', ru: '3–5 рабочих дней', en: '3–5 business days' },
      outcome: {
        uz: '24/7 javob, 70% vaqt tejash',
        ru: 'Ответ клиентам 24/7 и экономия до 70% времени',
        en: '24/7 responses and up to 70% time saved',
      },
      deliverables: {
        uz: ['Instagram Direct AI integratsiyasi', 'Telegram boti', 'Bilimlar bazasi', 'Buyurtma avtomatlashtirish'],
        ru: ['Подключение AI к Instagram Direct', 'Telegram бот', 'База знаний компании', 'Автоматизация заявок и заказов'],
        en: ['Instagram Direct AI integration', 'Telegram bot', 'Verified business knowledge base', 'Lead and order automation'],
      },
    },
    'services-automation': {
      title: {
        uz: 'Kompaniya xizmatlari va operatsion jarayonlar uchun yechim',
        ru: 'Решение для услуг компании и операционных процессов',
        en: 'Solutions for service businesses and operational workflows',
      },
      description: {
        uz: 'Ariza qabul qilish, mijozlar bilan muloqot va ichki jarayonlarni professional, soddalashtirilgan tizimga olib chiqishga yordam beradi.',
        ru: 'Оптимизация приема заявок, общения с клиентами и внутренних процессов для компаний, работающих в сфере услуг.',
        en: 'A clearer, scalable system for lead intake, customer communication, and internal workflow orchestration for service businesses.',
      },
      serviceId: 'web-dev',
      timeline: { uz: '5–10 ish kuni', ru: '5–10 рабочих дней', en: '5–10 business days' },
      outcome: {
        uz: 'Jarayonlar aniqroq va tezroq ishlaydi',
        ru: 'Процессы становятся быстрее и прозрачнее',
        en: 'Operations become clearer, faster, and more scalable',
      },
      deliverables: {
        uz: ['Veb-sayt yoki portal', 'Ariza qabul qilish formasi', 'CRM va admin panel', 'Mijozlar bilan ishlash avtomatlashtirish'],
        ru: ['Сайт или портал', 'Форма приема заявок', 'CRM/панель управления', 'Автоматизация общения с клиентами'],
        en: ['Website or portal', 'Lead capture forms', 'CRM/admin system', 'Client workflow automation'],
      },
    },
    'retail-automation': {
      title: {
        uz: 'ZiyoTech AI Savdo Agenti (Instagram Direct & Telegram)',
        ru: 'ZiyoTech AI Sales Agent (Instagram Direct и Telegram)',
        en: 'ZiyoTech AI Sales Agent for Instagram Direct & Telegram',
      },
      description: {
        uz: 'Mijozlar kechasi yoki bayram kunlarida ham 3 soniyada javob oladi, narx, hajm va buyurtma jarayonini avtomatik olib boradi.',
        ru: 'Клиенты пишут ночью или в выходные? ИИ-ассистент отвечает за 3 секунды, уточняет размер, цену и оформляет заказ.',
        en: 'Customers message at night or on weekends? The AI agent responds in 3 seconds, confirms product details, and turns requests into orders.',
      },
      serviceId: 'ai-automation',
      timeline: { uz: '3–5 ish kuni', ru: '3–5 рабочих дней', en: '3–5 business days' },
      outcome: {
        uz: 'Yo\'qolgan mijozlar kamayadi, xodimlar vaqti 70% tejaydi',
        ru: 'Ноль упущенных клиентов и экономия до 70% времени команды',
        en: 'Fewer missed leads and up to 70% less manual follow-up time',
      },
      deliverables: {
        uz: ['Instagram Direct rasmiy AI integratsiyasi', 'Telegram savdo boti', 'Katalog bilan sinxronizatsiya'],
        ru: ['Официальное подключение Instagram Direct', 'Торговый бот в Telegram', 'Синхронизация с каталогом товаров'],
        en: ['Official Instagram Direct API integration', 'Telegram commerce bot', 'Catalog and SKU sync'],
      },
    },
    'retail-website': {
      title: {
        uz: 'Elektron tijorat do\'koni (Click, Payme, Uzum integratsiyasi)',
        ru: 'Интернет-магазин с оплатой (Payme, Click)',
        en: 'E-commerce storefront with Payme & Click checkout',
      },
      description: {
        uz: 'Mahsulotlarni zamonaviy ko\'rinishda taqdim etuvchi, xaridorni 3 bosqichda to\'lovga olib keladigan onlayn do\'kon.',
        ru: 'Современный интернет-магазин, где покупатели за 3 шага выбирают товар, оплачивают и оформляют доставку.',
        en: 'A modern storefront that helps customers browse, pay, and complete checkout in just a few steps.',
      },
      serviceId: 'ecommerce',
      timeline: { uz: '7–12 ish kuni', ru: '7–12 рабочих дней', en: '7–12 business days' },
      outcome: {
        uz: 'Kunduzgi va kechki savdo avtomatik ishlaydi',
        ru: 'Автоматические продажи 24/7 и прозрачный учет остатков',
        en: 'Autonomous sales flow and clearer inventory control',
      },
      deliverables: {
        uz: ['Zamonaviy online do\'kon', 'Click va Payme to\'lovlar', 'Mobil moslashuvchan shablon'],
        ru: ['Современный интернет-магазин', 'Подключение Payme и Click', 'Полностью адаптивный интерфейс'],
        en: ['Modern e-commerce storefront', 'Click & Payme payment integration', 'Mobile-first responsive shopping flow'],
      },
    },
    'retail-content': {
      title: {
        uz: 'Professional mahsulot fotosessiyasi va sotuvchi Reels',
        ru: 'Предметная фотосъемка и продающие Reels',
        en: 'Commercial product photography & high-converting Reels',
      },
      description: {
        uz: 'Mahsulotlaringizni brend darajasida ko\'rsatadigan professional studiya va bic lanceta videokontent orqali ishonch va sotuvni oshirish.',
        ru: 'Студийная съемка и динамичный видеоконтент, которые повышают доверие и увеличивают конверсию.',
        en: 'Studio-quality visuals and dynamic short-form content designed to increase perceived value and conversion rates.',
      },
      serviceId: 'media-content',
      timeline: { uz: '3–5 ish kuni', ru: '3–5 рабочих дней', en: '3–5 business days' },
      outcome: {
        uz: 'Reklama narxi kamayadi, mahsulotlar yangi mijozlar uchun ko\'proq jozibador bo\'ladi',
        ru: 'Снижение стоимости привлечения и повышение доверия к бренду',
        en: 'Lower acquisition cost and stronger consumer trust',
      },
      deliverables: {
        uz: ['Mahsulot uchun 4K fotosuratlar', '5–10 tayyor Reels', 'Instagram vizual stili'],
        ru: ['Каталожные фото товаров в 4K', '5–10 готовых Reels', 'Единый стиль контента'],
        en: ['4K product photography', '5–10 ready-to-post Reels', 'Cohesive Instagram content style'],
      },
    },
    'default': {
      title: {
        uz: 'ZiyoTech kompleks raqamlashtirish paketi',
        ru: 'Комплексная цифровизация бизнеса ZiyoTech',
        en: 'ZiyoTech comprehensive digital transformation package',
      },
      description: {
        uz: 'Veb-sayt, AI savdo agenti, marketing va kontent bir tizim ichida ishlay boshlaydi va biznesdan real natija beradi.',
        ru: 'Сайт, ИИ-агент и цифровой рост объединяются в одну систему, которая работает на рост выручки и снижение рутины.',
        en: 'Website, AI sales agent, and growth systems combined into one engine to convert attention into revenue and reduce manual work.',
      },
      serviceId: 'ai-automation',
      timeline: { uz: '5–10 ish kuni', ru: '5–10 рабочих дней', en: '5–10 business days' },
      outcome: {
        uz: 'Barcha jarayonlar ko\'proq nazorat qilinadi va tezroq ishlaydi',
        ru: 'Все процессы становятся легче контролировать и масштабировать',
        en: 'Core processes become easier to manage, measure, and scale',
      },
      deliverables: {
        uz: ['Veb-sayt va online do\'kon', 'AI savdo agenty', 'SMM, media va reklama'],
        ru: ['Сайт и интернет-магазин', 'ИИ-агент продаж', 'SMM, медиа и реклама'],
        en: ['Website and storefront', 'AI sales agent', 'SMM, media, and growth campaigns'],
      },
    },
  };

  const key = `${selectedIndustry}-${selectedGoal}`;
  const currentRec = recommendations[key] || recommendations['retail-automation'];

  return (
    <section className="relative w-full overflow-hidden border-t border-blue-500/15 bg-[#080C14] py-12 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-75 w-150 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-linear-to-br from-[#0B1528] via-[#08101E] to-[#040813] p-5 shadow-2xl sm:p-8 lg:p-10">
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
                  {language === 'ru'
                    ? 'Шаг 1: Какая у вас сфера бизнеса?'
                    : language === 'en'
                      ? 'Step 1: What is your business industry?'
                      : '1-qadam: Biznesingiz qaysi sohada?'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {industries.map((ind) => {
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      onClick={() => setSelectedIndustry(ind.id)}
                      className={`flex min-h-24 flex-col justify-between rounded-2xl border p-3.5 text-left transition-all sm:p-4 ${
                        isSelected
                          ? 'border-blue-400 bg-blue-950/70 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400'
                          : 'border-white/8 bg-white/2 text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="mb-2 flex w-full items-center justify-between">
                        <div className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-cyan-300/35 ${isSelected ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                          <img src={ind.icon} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight sm:text-sm">{ind.label[language]}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-slate-400">{ind.tag[language]}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
                  {language === 'ru'
                    ? 'Шаг 2: Какая ваша главная задача сейчас?'
                    : language === 'en'
                      ? 'Step 2: What is your primary objective?'
                      : '2-qadam: Sizga hozir eng ko\'p nima kerak?'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {goals.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-blue-400 bg-blue-950/70 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400'
                          : 'border-white/8 bg-white/2 text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-cyan-300/35 ${isSelected ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                        <img src={goal.icon} alt="" aria-hidden="true" className="h-full w-full object-cover object-center" />
                      </div>
                      <span className="text-xs font-semibold leading-snug sm:text-sm">{goal.label[language]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-[#070D1A] p-5 sm:p-7">
              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                <div className="space-y-4 text-left lg:col-span-8">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-blue-800 bg-blue-950 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                      {language === 'ru' ? 'Рекомендованное Решение' : language === 'en' ? 'Recommended Solution' : 'Sizga Tavsiya Etilgan Yechim'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      {currentRec.timeline[language]}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                    {currentRec.title[language]}
                  </h3>

                  <p className="text-xs font-normal leading-relaxed text-slate-300 sm:text-sm">
                    {currentRec.description[language]}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      {language === 'ru' ? 'Что входит:' : language === 'en' ? 'Included scope:' : 'Nimalarni olasiz:'}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {currentRec.deliverables[language].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/8 bg-white/3 p-5 text-center lg:col-span-4 lg:text-left">
                  <div>
                    <div className="font-mono text-[11px] uppercase text-slate-400">
                      {language === 'ru' ? 'Ожидаемый результат' : language === 'en' ? 'Expected Outcome' : 'Kutiladigan asosiy natija'}
                    </div>
                    <div className="mt-1 text-sm font-bold text-blue-200 sm:text-base">
                      {currentRec.outcome[language]}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => onNavigate('contact')}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] hover:from-blue-500 hover:to-cyan-400 sm:text-sm"
                    >
                      <span>
                        {language === 'ru'
                          ? 'Получить Консультацию и Смету'
                          : language === 'en'
                            ? 'Request Consultation & Estimate'
                            : 'Konsultatsiya va Narxni Bilish'}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onNavigate('service-detail', currentRec.serviceId)}
                      className="w-full rounded-full px-4 py-2 text-xs text-slate-300 transition-colors hover:text-white"
                    >
                      {language === 'ru' ? 'Подробнее об услуге' : language === 'en' ? 'View Service Details' : 'Batafsil ma\'lumot ko\'rish'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            {language === 'ru' ? 'Сравнение Эффективности' : language === 'en' ? 'Impact Comparison' : 'Haqiqiy Taqqoslash'}
          </span>
          <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
            {language === 'ru'
              ? 'Обычная работа против работы с ZiyoTech'
              : language === 'en'
                ? 'Traditional Manual Work vs. With ZiyoTech'
                : 'ZiyoTech\'siz eski usul va ZiyoTech bilan yangi natija'}
          </h3>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-red-500/25 bg-red-950/15 p-6 sm:p-7">
              <div className="flex items-center gap-2.5 border-b border-red-500/20 pb-3 text-base font-bold text-red-400 sm:text-lg">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>
                  {language === 'ru'
                    ? 'Обычная работа (Частые проблемы)'
                    : language === 'en'
                      ? 'Traditional Approach (Friction & Loss)'
                      : 'ZiyoTech\'dan oldin (Ko\'p uchraydigan muammolar)'}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-300 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span>
                    {language === 'ru'
                      ? 'Клиент пишет в 23:00, оператор спит, а утром клиент уже купил у конкурентов.'
                      : language === 'en'
                        ? 'A client writes late at night, nobody replies, and by morning they purchased from a competitor.'
                        : 'Mijoz soat 23:00 da yozadi, xodim uxlayapti — ertalabga borib mijoz raqobatchidan olib bo\'ladi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span>
                    {language === 'ru'
                      ? 'Менеджеры тратят весь день на ответы «Сколько стоит?» и отправку одинаковых фото.'
                      : language === 'en'
                        ? 'Managers spend entire working hours repeatedly answering "How much?" and re-sending identical photos.'
                        : 'Operatorlar kun bo\'yi "Narxi qancha?" va "Rasmi bormi?" degan bir xil savollarga javob berishdan charchaydi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span>
                    {language === 'ru'
                      ? 'Сайт загружается медленно (более 4 секунд) или его нет вовсе — теряется до 50% покупателей.'
                      : language === 'en'
                        ? 'Website takes 4+ seconds to load or lacks mobile payment options, shedding up to 50% of buyers.'
                        : 'Sayt sekin yuklanadi yoki yo\'q — xaridor to\'lov qilolmay sahifani yopadi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
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

            <div className="space-y-4 rounded-2xl border-2 border-blue-500/40 bg-blue-950/25 p-6 shadow-xl shadow-blue-950/30 sm:p-7">
              <div className="flex items-center gap-2.5 border-b border-blue-500/25 pb-3 text-base font-bold text-blue-200 sm:text-lg">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                <span>
                  {language === 'ru'
                    ? 'С ZiyoTech (Автоматизация и Рост)'
                    : language === 'en'
                      ? 'With ZiyoTech (Autonomous Growth)'
                      : 'ZiyoTech bilan (Haqiqiy natija va xotirjamlik)'}
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-200 sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    {language === 'ru'
                      ? '24/7/365 мгновенный ответ за 3 секунды: вежливый диалог на узбекском или русском языках в любое время.'
                      : language === 'en'
                        ? 'Instant 3-second responses 24/7/365: polite, natural conversation in Uzbek and Russian anytime.'
                        : '24/7 uzluksiz: kechasi soat 03:00 da yozilsa ham 3 soniyada do\'stona va to\'g\'ri javob beriladi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    {language === 'ru'
                      ? 'ИИ сам берет данные из каталога, называет точную цену, проверяет наличие и формирует готовую заявку.'
                      : language === 'en'
                        ? 'The AI agent references verified catalog data, quotes precise prices, checks stock, and drafts orders.'
                        : 'AI katalogdan aniq narx va omborni tekshirib aytadi va xaridorni buyurtmaga olib boradi.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    {language === 'ru'
                      ? 'Молниеносный современный сайт (< 1.5 сек) с удобной оплатой Click/Payme прямо со смартфона.'
                      : language === 'en'
                        ? 'Sub-1.5s load time website with effortless 3-step Click & Payme checkout directly on smartphones.'
                        : 'Telefon va kompyuterda 1.5 soniyada ochiluvchi, Click va Payme orqali to\'lov qabul qiluvchi qulay sayt.'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
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
      </div>

      <div className="mt-8 rounded-3xl border border-white/8 bg-white/2 p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-xl space-y-2 text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            {language === 'ru' ? 'Как Мы Работаем' : language === 'en' ? 'Simple Process' : 'Boshlash Juda Oson'}
          </span>
          <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
            {language === 'ru'
              ? 'Всего 3 простых шага до запуска'
              : language === 'en'
                ? 'Only 3 Simple Steps from Idea to Launch'
                : 'Goyadan ishga tushirishgacha 3 oddiy qadam'}
          </h3>
        </div>

        <div className="mx-auto mt-8 max-w-6xl">
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-blue-500/20 bg-[#070E1C] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 font-mono text-lg font-bold text-cyan-300">
                01
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'ru' ? '1. Короткий созвон' : language === 'en' ? '1. Quick Discovery' : '1. Qisqa suhbat'}
              </h4>
              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                {language === 'ru'
                  ? 'Понимаем задачу и планируем решение.'
                  : language === 'en'
                    ? 'We define the goal and the right setup.'
                    : 'Maqsadni va to\'g\'ri yechimni aniqlaymiz.'}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-blue-500/20 bg-[#070E1C] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 font-mono text-lg font-bold text-cyan-300">
                02
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'ru' ? '2. Сборка' : language === 'en' ? '2. Build' : '2. Yaratish'}
              </h4>
              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                {language === 'ru'
                  ? 'Сайт, ИИ и процессы запускаются быстро.'
                  : language === 'en'
                    ? 'We launch the website, tools, and automation.'
                    : 'Sayt, AI va jarayonlar tez ishlay boshlaydi.'}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-blue-500/20 bg-[#070E1C] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 font-mono text-lg font-bold text-cyan-300">
                03
              </div>
              <h4 className="text-lg font-bold text-white">
                {language === 'ru' ? '3. Рост' : language === 'en' ? '3. Grow' : '3. O\'sish'}
              </h4>
              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                {language === 'ru'
                  ? 'Запускаем систему и улучшаем результат.'
                  : language === 'en'
                    ? 'The system starts working and brings leads.'
                    : 'Tizim ishlay boshlaydi va savdoni oshiradi.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-4 sm:flex-row">
          <div className="text-center text-xs text-slate-300 sm:text-left sm:text-sm">
            {language === 'ru'
              ? 'Хотите узнать, как это сработает именно для вашего бизнеса?'
              : language === 'en'
                ? 'Want to discover how this works specifically for your business?'
                : 'Sizning biznesingiz uchun qanday ishlashini bilmoqchimisiz?'}
          </div>

          <button
            onClick={() => onNavigate('contact')}
            className="flex items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-cyan-400 sm:text-sm"
          >
            <span>
              {language === 'ru'
                ? 'Обсудить Проект Бесплатно'
                : language === 'en'
                  ? 'Discuss Your Project For Free'
                  : 'Loyihani Bepul Muhokama Qilish'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
