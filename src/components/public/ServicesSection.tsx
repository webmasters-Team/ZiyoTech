import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { servicesData } from '../../data/servicesData';
import { ServiceItem } from '../../types';
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
  X,
  Zap,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Globe2,
  ChevronRight
} from 'lucide-react';

interface ServicesSectionProps {
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

// Technology badges and tangible KPIs per service
const serviceMetadata: Record<
  string,
  {
    tech: string[];
    kpi: { uz: string; ru: string; en: string };
    highlight: { uz: string; ru: string; en: string };
  }
> = {
  'web-dev': {
    tech: ['React 19', 'Next.js', 'TypeScript', 'Tailwind', 'Core Web Vitals'],
    kpi: {
      uz: '< 1.5s Tezkor Yuklanish',
      ru: '< 1.5с Скорость Загрузки',
      en: '< 1.5s Core Web Vitals',
    },
    highlight: {
      uz: 'Google SEO va Mobil Moslashuvchanlik',
      ru: 'Google SEO и 100% Адаптивность',
      en: 'Top SEO & Mobile Responsiveness',
    },
  },
  ecommerce: {
    tech: ['Click & Payme', 'Uzum', 'Stripe', 'Omnichannel Inventory'],
    kpi: {
      uz: '3 Bosqichli Tezkor To\'lov',
      ru: 'Оплата в 3 Клика',
      en: '3-Step Streamlined Checkout',
    },
    highlight: {
      uz: '24/7 Avtomatlashgan Savdo',
      ru: 'Круглосуточные Автопродажи',
      en: 'Autonomous 24/7 Sales Engine',
    },
  },
  'ai-automation': {
    tech: ['Meta Graph API', 'OpenAI GPT-4o', 'PostgreSQL', 'Telegram API', 'RAG'],
    kpi: {
      uz: '< 3s Muloqot Tezligi',
      ru: '< 3с Ответ Клиенту',
      en: 'Sub-3s Response Latency',
    },
    highlight: {
      uz: '70% Xodimlar Vaqti Tejalishi',
      ru: 'Экономия до 70% Времени',
      en: '70% Operational Time Saved',
    },
  },
  smm: {
    tech: ['Meta Business Suite', 'Viral Reels Scripting', 'Audience Analytics'],
    kpi: {
      uz: 'Oylik 30+ Sifatli Kontent',
      ru: '30+ Публикаций в Месяц',
      en: '30+ Multi-format Assets/Mo',
    },
    highlight: {
      uz: 'Haqiqiy Mijozlar Oqimi',
      ru: 'Привлечение Покупателей',
      en: 'High-Intent Follower Growth',
    },
  },
  'media-content': {
    tech: ['4K Cinema Cameras', 'Studio Lighting', 'DaVinci Resolve', 'Sound FX'],
    kpi: {
      uz: '2x-3x Reklama CTR',
      ru: 'Рост CTR в 2.5 Раза',
      en: '2x-3x Higher Ad Engagement',
    },
    highlight: {
      uz: 'Xalqaro Standartdagi Tasvir',
      ru: 'Европейский Уровень Съемки',
      en: 'International Studio Quality',
    },
  },
  branding: {
    tech: ['Vector Guidelines', 'Color Science', 'Custom Typography', 'Brandbook'],
    kpi: {
      uz: '100% Eksklyuziv Identika',
      ru: '100% Уникальный Стиль',
      en: '100% Bespoke Identity System',
    },
    highlight: {
      uz: 'Bozorda Kuchli Pozitsionirlash',
      ru: 'Отстройка от Конкурентов',
      en: 'Enduring Market Authority',
    },
  },
  'digital-marketing': {
    tech: ['Meta Ads Manager', 'Google Ads', 'Conversion API', 'A/B Testing'],
    kpi: {
      uz: 'Shaffof ROAS / ROI',
      ru: 'Прозрачный ROAS / Окупаемость',
      en: 'Transparent ROAS & Attribution',
    },
    highlight: {
      uz: 'Arzonroq Xaridor Narxi (CAC)',
      ru: 'Снижение Стоимости Лида',
      en: 'Lower Lead Acquisition Cost',
    },
  },
  'custom-solutions': {
    tech: ['Tailored CRM', 'Cloud Architecture', 'REST & GraphQL APIs', 'Docker'],
    kpi: {
      uz: 'Nol Qo\'lda Xatolar',
      ru: 'Ноль Рутинных Ошибок',
      en: 'Zero Human Workflow Errors',
    },
    highlight: {
      uz: 'Biznesingizga 100% Moslashgan',
      ru: '100% Под Ваши Процессы',
      en: '100% Custom Tailored Logic',
    },
  },
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const categories = [
    {
      id: 'all',
      label: language === 'ru' ? 'Все Услуги' : language === 'en' ? 'All Services' : 'Barcha Xizmatlar',
    },
    {
      id: 'Development',
      label: language === 'ru' ? 'Веб и Разработка' : language === 'en' ? 'Web & Engineering' : 'Veb & Dasturlash',
    },
    {
      id: 'AI & Automation',
      label: 'AI & Automation',
    },
    {
      id: 'E-commerce',
      label: 'E-commerce',
    },
    {
      id: 'Marketing',
      label: language === 'ru' ? 'Маркетинг и SMM' : language === 'en' ? 'Marketing & Growth' : 'Marketing & SMM',
    },
    {
      id: 'Content',
      label: language === 'ru' ? 'Фото и Видео' : language === 'en' ? 'Media Production' : 'Foto & Video',
    },
    {
      id: 'Branding',
      label: language === 'ru' ? 'Брендинг' : language === 'en' ? 'Branding' : 'Brending',
    },
    {
      id: 'Engineering',
      label: language === 'ru' ? 'IT-Системы' : language === 'en' ? 'Custom Systems' : 'IT Tizimlar',
    },
  ];

  const filteredServices =
    activeCategory === 'all'
      ? servicesData
      : servicesData.filter((s) => s.category === activeCategory);

  const flagshipService = servicesData.find((s) => s.id === 'ai-automation')!;

  return (
    <section id="services" className="relative w-full py-12 sm:py-16 lg:py-24 bg-[#080C14] overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Editorial Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full-Cycle Digital Agency & AI Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            {t.services.sectionTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            {t.services.sectionSubtitle}
          </p>
        </div>

        {/* Clean Interactive Segmented Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mb-12 sm:mb-16">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/50 scale-[1.02]'
                    : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.07] border border-white/[0.08]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FLAGSHIP SPOTLIGHT BENTO: ZiyoTech AI Sales Agent & Automation */}
        {(activeCategory === 'all' || activeCategory === 'AI & Automation') && (
          <div className="mb-10 sm:mb-14 rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#08101E] to-[#040813] border-2 border-blue-500/40 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
            
            {/* Top Right Flagship Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-blue-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    Flagship Product & Engineering
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {flagshipService.name[language]}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono font-medium">
                  Official Meta Graph API
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800 font-mono font-medium">
                  Sub-3s Response
                </span>
              </div>
            </div>

            {/* Content 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
              
              {/* Left Column: Description & Deliverables */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {flagshipService.fullDesc[language]}
                </p>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    {t.services.deliverablesTitle}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {flagshipService.deliverables[language].slice(0, 4).map((deliv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setSelectedService(flagshipService)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/30 transition-all"
                  >
                    <span>{t.services.viewDetails}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('contact')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all"
                  >
                    <span>{t.services.requestConsultation}</span>
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Telemetry / Impact Showcase */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/25 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                    <span className="text-xs font-mono text-slate-400">Performance Benchmarks</span>
                    <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      Live Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-lg font-bold text-white font-mono">{'< 3'} sec</div>
                      <div className="text-[11px] text-slate-400">Response Latency</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-lg font-bold text-cyan-400 font-mono">70%+</div>
                      <div className="text-[11px] text-slate-400">Time Saved</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-lg font-bold text-sky-300 font-mono">24/7/365</div>
                      <div className="text-[11px] text-slate-400">Active Direct Funnel</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="text-lg font-bold text-indigo-300 font-mono">UZ & RU</div>
                      <div className="text-[11px] text-slate-400">Bilingual Fluency</div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      Architecture & Stack
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {serviceMetadata['ai-automation'].tech.map((tItem, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60 font-mono"
                        >
                          {tItem}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 7 SPECIALIZED CAPABILITY CARDS (Executive Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices
            .filter((s) => s.id !== 'ai-automation' || activeCategory !== 'all')
            .map((service, index) => {
              const Icon = iconMap[service.icon] || Code2;
              const meta = serviceMetadata[service.id] || {
                tech: ['Modern Architecture'],
                kpi: { uz: 'Yuqori Sifat', ru: 'Высокое Качество', en: 'High Quality' },
                highlight: { uz: 'Kafolatlangan Natija', ru: 'Гарантия Результата', en: 'Guaranteed Impact' },
              };

              return (
                <div
                  key={service.id}
                  className="group rounded-2xl bg-white/[0.02] hover:bg-blue-950/20 border border-white/[0.08] hover:border-blue-500/40 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/40"
                >
                  <div className="space-y-4">
                    
                    {/* Top Row: Icon & Editorial Index */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all">
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-cyan-400/80">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="block text-[11px] text-slate-400 font-mono">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {service.name[language]}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                      {service.shortDesc[language]}
                    </p>

                    {/* Tangible KPI highlight */}
                    <div className="pt-1 flex items-center gap-2 text-xs text-blue-200 font-mono bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-900/60">
                      <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-semibold">{meta.kpi[language]}</span>
                    </div>

                    {/* Deliverable preview (top 2 points) */}
                    <div className="pt-2 space-y-1.5 border-t border-white/[0.06]">
                      {service.deliverables[language].slice(0, 2).map((deliv, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{deliv}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack Indicator */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {meta.tech.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 font-mono border border-white/[0.04]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="pt-5 mt-6 border-t border-white/[0.07] flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors group/link"
                    >
                      <span>{t.services.viewDetails}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => onNavigate('contact')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-blue-500/20 text-slate-300 hover:text-white border border-white/[0.08] hover:border-blue-500/40 transition-all"
                    >
                      {language === 'ru' ? 'Заказать' : language === 'en' ? 'Quote' : 'Ariza'}
                    </button>
                  </div>

                </div>
              );
            })}
        </div>

        {/* Bottom Agency Guarantee & Consultation Prompt */}
        <div className="mt-14 sm:mt-18 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#081122] via-[#0B172E] to-[#070D18] border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {language === 'ru'
                ? 'Нужна индивидуальная стратегия для вашего бизнеса?'
                : language === 'en'
                ? 'Require a tailored digital roadmap for your enterprise?'
                : 'Biznesingiz uchun maxsus raqamli strategiya kerakmi?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {language === 'ru'
                ? 'Наши специалисты бесплатно проанализируют текущие процессы, составят смету и план внедрения в течение 24 часов.'
                : language === 'en'
                ? 'Our solution architects will analyze your operational bottlenecks, provide cost projections, and deliver an actionable execution blueprint.'
                : 'Mutaxassislarimiz mavjud jarayonlarni tahlil qilib, 24 soat ichida smeta va joriy etish rejasini taqdim etishadi.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('contact')}
            className="flex items-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/30 whitespace-nowrap shrink-0 transition-all hover:scale-105"
          >
            <span>{t.services.requestConsultation}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* REFINED OBSIDIAN SAPPHIRE/CYAN MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#091122] border border-blue-500/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-blue-500/20">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {selectedService.category} · Service Overview
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {selectedService.name[language]}
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-blue-500/40 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full description */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {selectedService.fullDesc[language]}
            </p>

            {/* Deliverables */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                {t.services.deliverablesTitle}
              </h4>
              <ul className="space-y-2">
                {selectedService.deliverables[language].map((deliv, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                {t.services.benefitsTitle}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedService.benefits[language].map((ben, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 bg-white/[0.03] p-3 rounded-xl border border-white/[0.07]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {language === 'ru' ? 'Закрыть' : language === 'en' ? 'Close' : 'Yopish'}
              </button>

              <button
                onClick={() => {
                  setSelectedService(null);
                  onNavigate('contact');
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/30 transition-all"
              >
                <span>{t.services.requestConsultation}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
