import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Target, Eye, Shield, Zap, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutSectionProps {
  onNavigate: (page: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  const values = [
    {
      title: language === 'ru' ? 'Инновации и Прагматизм' : language === 'en' ? 'Innovation with Pragmatism' : 'Innovatsiya va Amaliylik',
      desc: language === 'ru'
        ? 'Мы внедряем передовые ИИ-модели только там, где они приносят осязаемую ценность бизнесу, исключая технологический хайп.'
        : language === 'en'
        ? 'We deploy bleeding-edge AI models only where they deliver measurable bottom-line leverage, avoiding superficial hype.'
        : "Sun'iy intellekt texnologiyalarini faqat biznesingizga real foyda va daromad keltiradigan nuqtalarda joriy qilamiz.",
      icon: Zap,
    },
    {
      title: language === 'ru' ? 'Абсолютная Точность Данных' : language === 'en' ? 'Absolute Data Integrity' : 'Ma\'lumotlar Aniqligi',
      desc: language === 'ru'
        ? 'Никаких галлюцинаций цен или фальшивых остатков. Наш ИИ оперирует исключительно верифицированной структурированной базой.'
        : language === 'en'
        ? 'Zero hallucination tolerance. Our automated agents compute only against verified database schemas and verified policy documents.'
        : "Hech qanday yolg'on narxlar yoki xato ma'lumotlar yo'q. AI agent faqat tasdiqlangan ombor va ma'lumotlar bazasi asosida ishlaydi.",
      icon: Shield,
    },
    {
      title: language === 'ru' ? 'Один Партнер — Полный Цикл' : language === 'en' ? 'Unified Full-Cycle Stewardship' : 'Yagona Mas\'ul Hamkor',
      desc: language === 'ru'
        ? 'От создания фирменного стиля и видеоконтента до веб-платформы и автоматизации продаж — единая слаженная инженерная команда.'
        : language === 'en'
        ? 'From brand identity and commercial cinematography to web platforms and AI automation — unified execution without vendor friction.'
        : "Brending, foto/video kontent, veb-platforma va AI savdo tizimigacha — barchasi yagona professional jamoa qo'lida.",
      icon: Target,
    },
  ];

  return (
    <section id="about" className="py-14 sm:py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/60 text-xs font-mono text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Company Identity & Ethos</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {language === 'ru' ? 'О Компании ZiyoTech' : language === 'en' ? 'About ZiyoTech' : 'ZiyoTech Kompaniyasi Haqida'}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {language === 'ru'
              ? 'ZiyoTech — это цифровое агентство полного цикла и разработчик передовых систем автоматизации бизнеса на базе искусственного интеллекта.'
              : language === 'en'
              ? 'ZiyoTech is a full-service digital agency and AI automation engineering firm built to power next-generation business growth.'
              : "ZiyoTech — to'liq xizmatli raqamli agentlik va biznesni sun'iy intellekt orqali avtomatlashtiruvchi innovatsion texnologik kompaniya."}
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-[#080C14] border border-blue-900/60 p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center border border-blue-500/30">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Наша Миссия' : language === 'en' ? 'Our Mission' : 'Bizning Missiyamiz'}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              "{language === 'ru'
                ? 'Помогать бизнесу внедрять современные технологии, оптимизировать операционную деятельность и достигать устойчивого роста за счет интеллектуальных цифровых решений.'
                : language === 'en'
                ? 'To help businesses embrace modern technology, improve their operations, and achieve sustainable growth through intelligent digital solutions.'
                : "Bizneslarga zamonaviy texnologiyalarni joriy qilish, operatsion jarayonlarni soddalashtirish va aqlli raqamli yechimlar orqali barqaror o'sishga erishishda yordam berish."}"
            </p>
          </div>

          {/* Vision */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-[#080C14] border border-indigo-900/60 p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              {language === 'ru' ? 'Наше Видение' : language === 'en' ? 'Our Vision' : 'Bizning Qarashimiz'}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              "{language === 'ru'
                ? 'Стать надежным технологическим и ИИ-партнером для компаний в Узбекистане и на международных рынках, формируя новый стандарт цифрового превосходства.'
                : language === 'en'
                ? 'To become a trusted technology and AI partner for businesses in Uzbekistan and international markets.'
                : "O'zbekiston va xalqaro bozorlardagi bizneslar uchun eng ishonchli texnologik va AI hamkoriga aylanish."}"
            </p>
          </div>
        </div>

        {/* Why Choose Us 4-Box */}
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 sm:p-12 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {t.whyUs.title}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base mt-2">
              {t.whyUs.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-cyan-400 font-bold mb-2">01</div>
              <h4 className="text-base font-bold text-white mb-2">{t.whyUs.point1Title}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t.whyUs.point1Desc}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-cyan-400 font-bold mb-2">02</div>
              <h4 className="text-base font-bold text-white mb-2">{t.whyUs.point2Title}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t.whyUs.point2Desc}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-cyan-400 font-bold mb-2">03</div>
              <h4 className="text-base font-bold text-white mb-2">{t.whyUs.point3Title}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t.whyUs.point3Desc}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-cyan-400 font-bold mb-2">04</div>
              <h4 className="text-base font-bold text-white mb-2">{t.whyUs.point4Title}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t.whyUs.point4Desc}</p>
            </div>
          </div>
        </div>

        {/* Values 3-Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-cyan-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{v.title}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
