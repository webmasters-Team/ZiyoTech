import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { servicesData } from '../../data/servicesData';
import { LegalModal } from './LegalModal';
import { ArrowUpRight, Shield, Globe } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface FooterProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="w-full bg-[#050811] border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Col 1 & 2: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" />

            <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div>Tashkent & Global Tech Operations</div>
              <div className="text-cyan-400 font-mono text-[11px]">contact@ziyotech.uz</div>
            </div>
          </div>

          {/* Col 3: Company Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-300 transition-colors">
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-cyan-300 transition-colors">
                  {t.nav.services}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-solutions')} className="hover:text-cyan-300 transition-colors">
                  {t.nav.aiSolutions}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-cyan-300 transition-colors">
                  {t.nav.aboutUs}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('portfolio')} className="hover:text-cyan-300 transition-colors">
                  {t.nav.portfolio}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-cyan-300 transition-colors">
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footer.services}
            </h4>
            <ul className="space-y-2 text-xs">
              {servicesData.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onNavigate('service-detail', s.id)}
                    className="hover:text-cyan-300 transition-colors text-left"
                  >
                    {s.name[language]}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>{language === 'ru' ? 'Все 8 услуг' : language === 'en' ? 'All 8 Services' : 'Barcha 8 xizmat'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: SaaS Products & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footer.products}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('product-sales-agent')}
                  className="text-white hover:text-cyan-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>ZiyoTech AI Sales Agent</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-950 text-cyan-400 border border-blue-800 rounded">
                    SaaS
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  {language === 'ru' ? 'Корпоративные Решения' : language === 'en' ? 'Enterprise Digital Solutions' : 'Korporativ Raqamli Tizimlar'}
                </button>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block mt-4">
                  Meta Instagram Official Graph API Compliant
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-400">
            © {new Date().getFullYear()} ZiyoTech. {t.footer.allRightsReserved}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setLegalType('privacy')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {t.footer.privacyPolicy}
            </button>
            <button
              onClick={() => setLegalType('terms')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {t.footer.termsOfService}
            </button>
          </div>
        </div>

      </div>

      {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
    </footer>
  );
};
