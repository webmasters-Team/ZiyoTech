import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { demoCaseStudies } from '../../data/servicesData';
import { ExternalLink, Sparkles, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

interface PortfolioSectionProps {
  onNavigate: (page: string) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  return (
    <section id="portfolio" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/60 text-xs font-mono text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Demonstrations & Prototypes</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {language === 'ru' ? 'Примеры Реализованных Систем' : language === 'en' ? 'Demonstration Systems' : 'Amaliy Tizimlar Namunasi'}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            {language === 'ru'
              ? 'Демонстрационные проекты, иллюстрирующие возможности интеграции веб-разработки, интернет-магазинов и ИИ-агентов ZiyoTech.'
              : language === 'en'
              ? 'Curated demonstration prototypes illustrating the synergy of high-performance engineering, e-commerce, and ZiyoTech AI Sales Agents.'
              : "ZiyoTech veb-dasturlash, onlayn do'konlar va AI savdo agentlari integratsiyasining amaliy ko'rgazmali namunalari."}
          </p>
          <div className="text-xs text-slate-400 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800 inline-block">
            Note: Demonstrational architecture blueprints crafted to showcase production capabilities.
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {demoCaseStudies.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 overflow-hidden transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Project Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/60 via-slate-900 to-indigo-950/60 -z-1 flex items-center justify-center text-slate-500 font-mono text-xs">
                    {project.title} Blueprint
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-blue-500/30">
                    DEMO BLUEPRINT
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                    {project.clientType[language]}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed">
                    {project.description[language]}
                  </p>

                  {/* Services badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.services.map((srv: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="pt-3 border-t border-slate-800 text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{project.metrics}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onNavigate('contact')}
                  className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2"
                >
                  <span>{language === 'ru' ? 'Запросить аналогичное решение' : language === 'en' ? 'Request Similar Blueprint' : 'Shunday yechimga buyurtma berish'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
