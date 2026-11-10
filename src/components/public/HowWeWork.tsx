import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Compass, Lightbulb, Code2, Rocket, ArrowRight } from 'lucide-react';

interface HowWeWorkProps {
  onNavigate: (page: string) => void;
}

export const HowWeWork: React.FC<HowWeWorkProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const steps = [
    {
      step: '01',
      title: t.process.step1Title,
      desc: t.process.step1Desc,
      icon: Compass,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      step: '02',
      title: t.process.step2Title,
      desc: t.process.step2Desc,
      icon: Lightbulb,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      step: '03',
      title: t.process.step3Title,
      desc: t.process.step3Desc,
      icon: Code2,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      step: '04',
      title: t.process.step4Title,
      desc: t.process.step4Desc,
      icon: Rocket,
      color: 'from-violet-500 to-fuchsia-500',
    },
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Disciplined Execution
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {t.process.title}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {t.process.subtitle}
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl bg-slate-900/50 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  {/* Step badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-2xl font-extrabold text-slate-700 group-hover:text-slate-500 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Phase {index + 1}</span>
                  <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${item.color}`} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
