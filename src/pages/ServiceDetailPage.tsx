import React from 'react';
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
  ArrowLeft
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

  const otherServices = servicesData.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <div className="py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Breadcrumb / Back button */}
      <div>
        <button
          onClick={() => onNavigate('services')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ru' ? 'Назад ко всем услугам' : language === 'en' ? 'Back to All Services' : 'Barcha xizmatlarga qaytish'}</span>
        </button>
      </div>

      {/* Hero of Service */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{service.category}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {service.name[language]}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            {service.fullDesc[language]}
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/30 transition-all"
            >
              <span>{language === 'ru' ? 'Заказать Услугу' : language === 'en' ? 'Commission Service' : 'Xizmatga Buyurtma Berish'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-center">
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-[#080C14] border border-blue-500/30 flex items-center justify-center text-cyan-400 shadow-2xl shadow-blue-950/50">
            <Icon className="w-24 h-24" />
          </div>
        </div>
      </div>

      {/* Deliverables & Benefits 2-Col Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Deliverables */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span>{language === 'ru' ? 'Что Входит в Результат' : language === 'en' ? 'Tangible Deliverables' : 'Kutiladigan Natijalar'}</span>
          </h3>

          <ul className="space-y-3">
            {service.deliverables[language].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>{language === 'ru' ? 'Преимущества для Бизнеса' : language === 'en' ? 'Commercial Advantage' : 'Biznes Uchun Afzalliklari'}</span>
          </h3>

          <ul className="space-y-3">
            {service.benefits[language].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Other Services */}
      <div className="pt-8 border-t border-slate-800/80 space-y-6">
        <h3 className="text-xl font-bold text-white">
          {language === 'ru' ? 'Другие Услуги ZiyoTech' : language === 'en' ? 'Complementary Capabilities' : 'ZiyoTech\'ning Boshqa Xizmatlari'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherServices.map((other) => {
            const OtherIcon = iconMap[other.icon] || Code2;
            return (
              <div
                key={other.id}
                onClick={() => onNavigate('service-detail', other.id)}
                className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <OtherIcon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                  {other.name[language]}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {other.shortDesc[language]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
