import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Shirt,
  Armchair,
  Smartphone,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  ArrowRight
} from 'lucide-react';

interface IndustriesSectionProps {
  onNavigate: (page: string) => void;
}

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  const industries = [
    {
      title: t.industries.fashion,
      desc: language === 'ru'
        ? 'Автоматизация подбора размеров, проверка остатков на складе и быстрые заказы в Instagram DM.'
        : language === 'en'
        ? 'Automated size recommendations, live warehouse stock checks, and rapid Instagram DM checkout.'
        : "O'lchamlarni tavsiya qilish, ombor qoldig'ini tekshirish va Instagram DM orqali tezkor buyurtmalar.",
      icon: Shirt,
      gradient: 'from-pink-500/10 to-rose-500/10',
    },
    {
      title: t.industries.furniture,
      desc: language === 'ru'
        ? '3D визуализация мебели, консультации по габаритам и интеграция расчета стоимости доставки.'
        : language === 'en'
        ? 'Spatial furniture previews, dimension consultations, and automated regional freight estimation.'
        : "3D mebel ko'rinishi, o'lchamlar bo'yicha maslahat va yetkazib berish narxini hisoblash.",
      icon: Armchair,
      gradient: 'from-amber-500/10 to-orange-500/10',
    },
    {
      title: t.industries.electronics,
      desc: language === 'ru'
        ? 'Синхронизация каталога из 2000+ товаров, сравнение характеристик и оформление рассрочки.'
        : language === 'en'
        ? '2,000+ SKU synchronization, technical specification comparison, and installment payment flows.'
        : "2000+ tovarlar katalogi sinxronizatsiyasi, xususiyatlarni taqqoslash va to'lov turlari.",
      icon: Smartphone,
      gradient: 'from-cyan-500/10 to-blue-500/10',
    },
    {
      title: t.industries.restaurants,
      desc: language === 'ru'
        ? 'Интерактивное цифровое меню, бронирование столиков и боты приема заказов на доставку.'
        : language === 'en'
        ? 'Contactless digital menus, table reservation engines, and automated food delivery dispatching.'
        : "Raqamli interaktiv menyu, stol band qilish va yetkazib berish buyurtmalarini qabul qilish boti.",
      icon: UtensilsCrossed,
      gradient: 'from-cyan-500/10 to-sky-500/10',
    },
    {
      title: t.industries.retail,
      desc: language === 'ru'
        ? 'Единая экосистема для омниканальных продаж: сайт, соцсети, CRM и складской учет.'
        : language === 'en'
        ? 'Unified retail commerce: storefront, Instagram social commerce, CRM, and inventory sync.'
        : "Chakana savdo uchun yagona tizim: veb-sayt, ijtimoiy tarmoqlar, CRM va ombor hisobi.",
      icon: ShoppingBag,
      gradient: 'from-indigo-500/10 to-violet-500/10',
    },
    {
      title: t.industries.services,
      desc: language === 'ru'
        ? 'Квалификация входящих B2B-заявок, автоматическая запись на прием и клиентские порталы.'
        : language === 'en'
        ? 'B2B inbound lead qualification, automated appointment bookings, and private client portals.'
        : "B2B arizalarni saralash, qabulga yozish va mijozlar uchun shaxsiy kabinetlar yaratish.",
      icon: Briefcase,
      gradient: 'from-purple-500/10 to-fuchsia-500/10',
    },
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-[#040713]/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Sector Competency
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t.industries.title}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {t.industries.subtitle}
          </p>
        </div>

        {/* 6 Industries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {ind.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed">
                    {ind.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="text-xs font-semibold text-slate-400 group-hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>{language === 'ru' ? 'Решения для отрасли' : language === 'en' ? 'Industry Solutions' : 'Soha yechimlari'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
