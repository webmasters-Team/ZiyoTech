import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import websiteDevelopmentImage from '../../assets/services/website-development.webp';
import ecommerceSolutionsImage from '../../assets/services/ecommerce-solutions.webp';
import aiAgentsAutomationImage from '../../assets/services/ai-agents-automation.webp';
import digitalMarketingImage from '../../assets/services/digital-marketing.webp';
import photoVideoContentImage from '../../assets/services/photo-video-content.webp';
import brandingDesignImage from '../../assets/services/branding-design.webp';
import {
  Sparkles,
  ArrowRight,
  Play,
  Instagram,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface HeroProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { theme, setTheme } = useTheme();

  const heroCopy = {
    badge:
      language === 'ru'
        ? 'AI Growth Partner для бизнеса'
        : language === 'en'
        ? 'AI Growth Partner for Modern Business'
        : 'Zamonaviy biznes uchun AI o\'sish hamkori',
    headline1:
      language === 'ru'
        ? 'Преобразуйте Продажи.'
        : language === 'en'
        ? 'Turn More Leads.'
        : 'Savdoni oshiring',
    headline2:
      language === 'ru'
        ? 'Автоматизируйте Умнее.'
        : language === 'en'
        ? 'Automate Smarter.'
        : 'Aqilli Avtomatlashtirish',
    subtitle:
      language === 'ru'
        ? 'ZiyoTech создает AI-агентов, сайты и автоматизированные системы, которые превращают входящие запросы в реальный рост продаж и стабильную работу бизнеса.'
        : language === 'en'
        ? 'ZiyoTech builds AI-powered websites, sales agents, and automation systems that turn customer conversations into measurable revenue and smoother operations.'
        : 'ZiyoTech AI agentlar, veb-saytlar va biznes avtomatlashtirish tizimlarini yaratadi. Ular qabul qilingan murojaatlarni real savdoga va samarali ishlashga aylantiradi.',
    featuredTag:
      language === 'ru'
        ? 'AI & Automation Systems'
        : language === 'en'
        ? 'AI & Automation Systems'
        : 'AI & Avtomatlashtirish Tizimlari',
  };

  const quickServices = [
    { id: 'web-dev', name: t.hero.quickServices.web, image: websiteDevelopmentImage },
    { id: 'ecommerce', name: t.hero.quickServices.ecommerce, image: ecommerceSolutionsImage },
    { id: 'ai-automation', name: t.hero.quickServices.ai, image: aiAgentsAutomationImage },
    { id: 'digital-marketing', name: t.hero.quickServices.marketing, image: digitalMarketingImage },
    { id: 'media-content', name: t.hero.quickServices.content, image: photoVideoContentImage },
    { id: 'branding', name: t.hero.quickServices.branding, image: brandingDesignImage },
  ];

  return (
    <section className="relative w-full overflow-hidden pb-12 pt-4 sm:pb-20 sm:pt-6">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-full max-w-6xl -translate-x-1/2 bg-gradient-to-b from-blue-500/8 via-cyan-500/6 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute left-0 top-40 -z-10 h-72 w-72 rounded-full bg-cyan-500/8 blur-[100px] sm:h-96 sm:w-96" />

      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-5 text-left lg:col-span-5 sm:space-y-6">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-sm backdrop-blur-md ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-900/80 text-slate-200'
                : 'border-slate-200 bg-white/90 text-slate-700'
            }`}>
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span className="text-xs font-semibold sm:text-[13px]">{heroCopy.badge}</span>
            </div>

            <h1 className={`text-3xl font-extrabold leading-[1.08] tracking-[-0.05em] sm:text-5xl xl:text-[58px] ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {heroCopy.headline1} <br />
              <span className="bg-gradient-to-r from-slate-100 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                {heroCopy.headline2}
              </span>
            </h1>

            <p className={`max-w-lg text-sm font-normal leading-relaxed sm:text-base lg:text-lg ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {heroCopy.subtitle}
            </p>

            <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
              <button
                onClick={() => onNavigate('contact')}
                className="flex items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-slate-100 via-white to-slate-200 px-6 py-3.5 text-xs font-bold text-slate-900 shadow-[0_18px_40px_rgba(148,163,184,0.25)] transition-all hover:scale-[1.01] sm:px-7 sm:text-sm"
              >
                <span>{t.hero.ctaWorkTogether}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('services')}
                className={`flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-xs font-semibold transition-all sm:px-6 sm:text-sm ${
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-600 hover:bg-slate-800/80'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Play className="h-3 w-3 fill-current text-blue-400" />
                <span>{t.hero.ctaExploreServices}</span>
              </button>
            </div>

            <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                <span>Official Meta Partner</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span>Telegram Bot API</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                <span>Zero Hallucination</span>
              </span>
            </div>
          </div>

          <div className="relative flex w-full select-none items-center justify-center lg:col-span-7">
            <div className={`absolute inset-x-8 bottom-2 h-20 rounded-full blur-2xl ${
              theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-cyan-600/25 to-indigo-500/15' : 'bg-gradient-to-r from-blue-300/25 via-cyan-300/25 to-indigo-300/20'
            }`} />

            <div className={`relative aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-[28px] transition-all duration-500 ${
              theme === 'dark' ? 'bg-[#080C14] shadow-[0_35px_90px_rgba(15,23,42,0.5)]' : 'bg-white shadow-[0_30px_90px_rgba(148,163,184,0.4)]'
            }`}>
              <video
                className="pointer-events-none h-full w-full object-cover opacity-95 transition-opacity duration-500"
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
                disableRemotePlayback
                preload="auto"
              >
                <source src="/assets/1.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        <div className={`mt-10 border-t pt-6 sm:mt-14 ${theme === 'dark' ? 'border-white/[0.08]' : 'border-slate-200'}`}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {quickServices.map((qs) => {
              return (
                <button
                  key={qs.id}
                  onClick={() => onNavigate('service-detail', qs.id)}
                  className={`group flex min-h-[156px] min-w-0 flex-col gap-2 rounded-2xl border p-2.5 text-left transition-all sm:min-h-[176px] sm:p-3 ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={qs.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[566/356] w-full rounded-xl border border-white/10 object-cover transition-[filter] duration-300 group-hover:brightness-110"
                  />
                  <div className="flex w-full min-w-0 flex-1 items-center justify-between gap-1">
                    <span className="text-xs font-semibold leading-snug sm:text-[13px]">{qs.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`relative mt-8 overflow-hidden rounded-[28px] border p-5 shadow-2xl sm:mt-12 sm:p-8 lg:p-10 ${
          theme === 'dark'
            ? 'border-slate-800 bg-gradient-to-r from-[#08111d] via-[#0b1525] to-[#09131f]'
            : 'border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50'
        }`}>
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />

          <div className="relative grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-4 lg:col-span-6">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-5 rounded-full bg-blue-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-blue-300">
                  {heroCopy.featuredTag}
                </span>
              </div>

              <h2 className={`text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl lg:text-4xl ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {t.hero.featuredProductTitle}
              </h2>

              <p className={`max-w-xl text-sm leading-relaxed sm:text-base ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {t.hero.featuredProductDesc}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className={`rounded-[24px] border p-5 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-white/90'}`}>
                <div className="mb-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="text-lg font-black text-white">24/7</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Support</div>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="text-lg font-black text-white">3s</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Reply</div>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                    <div className="text-lg font-black text-white">+40%</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Leads</div>
                  </div>
                </div>
                <div className={`rounded-2xl border p-4 text-sm ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                  {t.hero.featuredProductDesc}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
