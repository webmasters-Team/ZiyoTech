import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  ShoppingCart,
  Bot,
  Megaphone,
  Camera,
  Palette,
  Instagram,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface HeroProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const quickServices = [
    { id: 'web-dev', name: t.hero.quickServices.web, icon: Zap, color: 'text-blue-500' },
    { id: 'ecommerce', name: t.hero.quickServices.ecommerce, icon: ShoppingCart, color: 'text-cyan-500' },
    { id: 'ai-automation', name: t.hero.quickServices.ai, icon: Bot, color: 'text-sky-500' },
    { id: 'digital-marketing', name: t.hero.quickServices.marketing, icon: Megaphone, color: 'text-indigo-500' },
    { id: 'media-content', name: t.hero.quickServices.content, icon: Camera, color: 'text-blue-600' },
    { id: 'branding', name: t.hero.quickServices.branding, icon: Palette, color: 'text-cyan-600' },
  ];

  return (
    <section className="relative w-full overflow-hidden pt-4 sm:pt-8 pb-12 sm:pb-20">
      
      {/* Dynamic Ambient background glows in Sapphire & Cyan */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b blur-3xl pointer-events-none -z-10 ${
        theme === 'dark' ? 'from-blue-500/10 via-cyan-600/10 to-transparent' : 'from-blue-200/40 via-cyan-100/30 to-transparent'
      }`} />
      <div className={`absolute top-24 right-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[100px] pointer-events-none -z-10 ${
        theme === 'dark' ? 'bg-blue-600/15' : 'bg-blue-300/20'
      }`} />
      <div className={`absolute top-40 left-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[100px] pointer-events-none -z-10 ${
        theme === 'dark' ? 'bg-cyan-600/10' : 'bg-cyan-300/20'
      }`} />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Top 2-Column Split: Hero Headline & 3D Robot Explaining on Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column: Brand Positioning & CTAs */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 text-left">
            
            {/* Pill Kicker */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md shadow-sm ${
              theme === 'dark'
                ? 'bg-blue-950/40 border-blue-500/30 text-blue-100'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs sm:text-[13px] font-semibold">
                {t.hero.badge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className={`text-3xl sm:text-5xl xl:text-[58px] font-extrabold tracking-tight leading-[1.1] break-words ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {t.hero.headlinePart1} <br />
              <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-300 bg-clip-text text-transparent">
                {t.hero.headlinePart2.split(' ')[0]}
              </span>{' '}
              {t.hero.headlinePart2.split(' ').slice(1).join(' ')}
            </h1>

            {/* Subtitle */}
            <p className={`text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-lg ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t.hero.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('contact')}
                className="flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{t.hero.ctaWorkTogether}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('services')}
                className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full transition-all border ${
                  theme === 'dark'
                    ? 'text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] hover:border-blue-500/30'
                    : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-300 shadow-sm'
                }`}
              >
                <Play className="w-3 h-3 fill-current text-cyan-500" />
                <span>{t.hero.ctaExploreServices}</span>
              </button>
            </div>

            {/* Trust Highlights */}
            <div className={`pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Official Meta Partner</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Telegram Bot API</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Zero Hallucination</span>
              </span>
            </div>
          </div>

          {/* Right Column: 3D Robot & Screen with Interactive Light & Dark Feature */}
          <div className="lg:col-span-7 relative w-full flex flex-col items-center justify-center select-none">
            
            {/* Ambient floor light */}
            <div className={`absolute inset-x-8 bottom-2 h-20 rounded-full blur-2xl animate-pulse-ring pointer-events-none ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600/25 via-cyan-600/30 to-indigo-500/20'
                : 'bg-gradient-to-r from-blue-300/30 via-cyan-300/30 to-indigo-200/30'
            }`} />

            {/* Main Visual Container: 3D Robot Image (Seamless blended presentation with no harsh box) */}
            <div className={`relative w-full max-w-2xl aspect-[16/9] rounded-3xl overflow-hidden transition-all duration-500 ${
              theme === 'dark'
                ? 'shadow-2xl shadow-blue-950/40'
                : 'shadow-2xl shadow-blue-200/50 border border-slate-200'
            }`}>
              {/* Seamless Background Video: Dark or Light Mode */}
              <video
                className="w-full h-full object-cover transition-opacity duration-500 animate-float-subtle"
                autoPlay
                loop
                muted
                playsInline
                poster={theme === 'dark' ? '/assets/brand/hero_robot_dark.jpg' : '/assets/brand/hero_robot_light.jpg'}
              >
                <source
                  src="/assets/1.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Subtle edge vignette to blend seamlessly with platform background */}
              <div className={`absolute inset-0 pointer-events-none ${
                theme === 'dark'
                  ? 'bg-gradient-to-t from-[#080C14]/40 via-transparent to-transparent'
                  : 'bg-gradient-to-t from-slate-50/20 via-transparent to-transparent'
              }`} />
            </div>

          </div>

        </div>

        {/* 6 Quick Capability Cards Bar */}
        <div className={`mt-10 sm:mt-14 pt-6 border-t ${
          theme === 'dark' ? 'border-white/[0.08]' : 'border-slate-200'
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {quickServices.map((qs) => {
              const Icon = qs.icon;
              return (
                <button
                  key={qs.id}
                  onClick={() => onNavigate('service-detail', qs.id)}
                  className={`group p-3.5 sm:p-4 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[96px] sm:min-h-[104px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-white/[0.02] hover:bg-blue-950/30 border-white/[0.07] hover:border-blue-500/40 text-slate-200 hover:text-white'
                      : 'bg-white hover:bg-blue-50/60 border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${
                      theme === 'dark' ? 'bg-white/[0.05] text-slate-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${qs.color}`} />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold mt-2 leading-snug">
                    {qs.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Product Teaser: ZiyoTech AI Sales Agent */}
        <div className={`mt-8 sm:mt-12 rounded-3xl border p-5 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-[#091222] via-[#0D1B30] to-[#070D18] border-blue-500/25'
            : 'bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 border-blue-200'
        }`}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 bg-blue-500 rounded-full" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-500">
                  {t.hero.featuredProductTag}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                {t.hero.featuredProductTitle}
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed max-w-xl ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {t.hero.featuredProductDesc}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('product-sales-agent')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400 shadow-md transition-all group"
                >
                  <span>{t.hero.featuredProductCta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('contact')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                    theme === 'dark' ? 'text-slate-300 hover:text-cyan-300' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <span>{t.services.requestConsultation}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right side phone mockup: Uses high-res Sapphire Sales Phone asset */}
            <div className="lg:col-span-6 flex justify-center">
              <div className={`relative w-full max-w-md rounded-2xl overflow-hidden border shadow-2xl aspect-[16/9] ${
                theme === 'dark' ? 'border-blue-500/20 bg-black/60' : 'border-slate-300 bg-white'
              }`}>
                <img
                  src="/assets/brand/sales_phone_sapphire.jpg"
                  alt="ZiyoTech AI Sales Agent Conversation"
                  className="w-full h-full object-cover"
                />

                {/* Animated shimmer sweep over the phone screen */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/[0.08] to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
