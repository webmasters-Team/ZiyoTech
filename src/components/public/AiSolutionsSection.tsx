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
  UserCheck
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
            <span>{t.aiSection.tag}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t.aiSection.headline}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {t.aiSection.description}
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
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-900/40'
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
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-600/30 transition-all"
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
                {/* Step 1 */}
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

                {/* Step 2 */}
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

                {/* Step 3 */}
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

      </div>
    </section>
  );
};
