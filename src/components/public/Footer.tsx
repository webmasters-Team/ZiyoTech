import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Box,
  CalendarDays,
  Camera,
  ChevronRight,
  Code2,
  Globe2,
  LayoutGrid,
  Layers3,
  Link2,
  Mail,
  MapPin,
  Megaphone,
  PhoneCall,
  Settings2,
  ShoppingCart,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { servicesData } from '../../data/servicesData';
import { BrandLogo } from '../common/BrandLogo';

interface FooterProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

const contacts = [
  { country: 'Uzbekistan', number: '+998 93 052 53 17', href: 'tel:+998930525317', flag: '/flags/uz.svg' },
  { country: 'South Korea', number: '+82 10 8197 1996', href: 'tel:+821081971996', flag: '/flags/kr.svg' },
  { country: 'Japan', number: '+81 3 1760 0096', href: 'tel:+81317600096', flag: '/flags/jp.svg' },
];

const serviceIcons = [Code2, ShoppingCart, Settings2, Megaphone, Camera];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const isEnglish = language === 'en';
  const footerCopy = language === 'en'
    ? {
        consultationLead: 'Require a tailored',
        consultationHighlight: 'digital roadmap',
        consultationTail: 'for your enterprise?',
        consultationDesc: 'Our solution architects will analyze your operational bottlenecks, provide cost projections, and deliver an actionable execution blueprint.',
        requestConsultation: 'Request Consultation',
        companyDesc: 'Full-service digital agency and AI automation company engineering high-performance websites, AI agents, and digital products for global businesses.',
      }
    : language === 'ru'
      ? {
          consultationLead: 'Нужна индивидуальная',
          consultationHighlight: 'цифровая дорожная карта',
          consultationTail: 'для вашей компании?',
          consultationDesc: 'Наши специалисты проанализируют рабочие процессы, подготовят прогноз затрат и практический план внедрения.',
          requestConsultation: 'Запросить консультацию',
          companyDesc: t.footer.desc,
        }
      : {
          consultationLead: 'Kompaniyangiz uchun maxsus',
          consultationHighlight: 'raqamli yo‘l xaritasi',
          consultationTail: 'kerakmi?',
          consultationDesc: 'Mutaxassislarimiz ish jarayonlaringizni tahlil qilib, xarajatlar prognozi va amalga oshirish rejasini tayyorlaydi.',
          requestConsultation: 'Konsultatsiya so‘rash',
          companyDesc: t.footer.desc,
        };

  return (
    <footer className="relative isolate overflow-hidden bg-[#040914] text-slate-300">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(9,44,88,0.23),transparent_54%)]" />
      <div className="relative mx-auto max-w-[1540px] px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
        <section
          aria-labelledby="footer-consultation-title"
          className="relative mb-10 overflow-hidden rounded-2xl border border-blue-500/55 bg-[#071328] px-5 py-6 shadow-[0_0_42px_rgba(0,102,255,0.09)] sm:mb-12 sm:px-8 sm:py-7 lg:px-10"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -right-10 top-0 h-full w-[48%] bg-[radial-gradient(ellipse_at_68%_85%,rgba(0,132,255,0.18),transparent_56%)]" />
            <svg className="absolute inset-y-0 right-0 h-full w-[52%] text-blue-500/25" viewBox="0 0 600 180" preserveAspectRatio="none" fill="none">
              <path d="M90 180C205 136 268 46 435 0M126 180C240 136 301 47 469 0M164 180C277 136 337 49 504 0M202 180C314 138 374 50 540 0M240 180C350 139 410 51 578 0" stroke="currentColor" strokeWidth="1" />
              <path d="M130 180C225 141 300 98 408 20M174 180C270 141 342 98 450 20M218 180C313 142 384 100 492 21" stroke="#168BFF" strokeOpacity=".3" strokeWidth=".6" />
            </svg>
          </div>

          <div className="relative grid items-center gap-6 sm:grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[72px_minmax(0,1fr)_auto] lg:gap-7">
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/70 bg-blue-950/40 text-sky-400 shadow-[0_0_26px_rgba(0,132,255,0.18)] sm:flex">
              <Layers3 aria-hidden="true" className="h-8 w-8" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 border-l-0 sm:border-l sm:border-slate-700/80 sm:pl-6">
              <h2 id="footer-consultation-title" className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl lg:text-[27px]">
                {footerCopy.consultationLead}{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">{footerCopy.consultationHighlight}</span>{' '}
                {footerCopy.consultationTail}
              </h2>
              <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">{footerCopy.consultationDesc}</p>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/35 transition duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-400 hover:shadow-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071328] sm:w-fit lg:min-w-[285px]"
            >
              <CalendarDays aria-hidden="true" className="h-5 w-5" />
              <span>{footerCopy.requestConsultation}</span>
              <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 xl:grid-cols-[1.18fr_0.78fr_1.2fr_1fr] xl:gap-0">
          <section className="space-y-4 xl:pr-8">
            <h2 className="sr-only">ZiyoTech</h2>
            <BrandLogo size="lg" className="[&>span]:!text-white" />
            <p className="max-w-md text-sm leading-[1.65] text-slate-300">{footerCopy.companyDesc}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-900/60 bg-blue-950/25 px-3 py-2 text-xs font-medium text-slate-200">
                <MapPin aria-hidden="true" className="h-4 w-4 text-sky-400" />Seoul, South Korea
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-900/60 bg-blue-950/25 px-3 py-2 text-xs font-medium text-slate-200">
                <Globe2 aria-hidden="true" className="h-4 w-4 text-sky-400" />Global Tech Operations
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm">
              <a href="https://ziyotech.net" className="inline-flex items-center gap-2 text-cyan-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                <Link2 aria-hidden="true" className="h-4 w-4" />ziyotech.net
              </a>
              <a href="mailto:contact@ziyotech.net" className="inline-flex items-center gap-2 text-cyan-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                <Mail aria-hidden="true" className="h-4 w-4" />contact@ziyotech.net
              </a>
            </div>
          </section>

          <nav aria-label={t.footer.quickLinks} className="border-t border-slate-700/70 pt-6 sm:border-t-0 sm:pt-0 xl:border-l xl:border-t-0 xl:pl-8 xl:pr-5">
            <h2 className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white">
              <Link2 aria-hidden="true" className="h-5 w-5 text-sky-400" />{t.footer.quickLinks}
            </h2>
            <ul className="space-y-3">
              {[
                ['home', t.nav.home], ['services', t.nav.services], ['ai-solutions', t.nav.aiSolutions],
                ['about', t.nav.aboutUs], ['portfolio', t.nav.portfolio], ['contact', t.nav.contact],
              ].map(([page, label]) => (
                <li key={page}>
                  <button onClick={() => onNavigate(page)} className="group inline-flex items-center gap-2 text-left text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                    <ChevronRight aria-hidden="true" className="h-4 w-4 text-sky-400 transition-transform group-hover:translate-x-0.5" />{label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.services} className="border-t border-slate-700/70 pt-6 sm:border-t-0 sm:pt-0 xl:border-l xl:border-t-0 xl:pl-8 xl:pr-7">
            <h2 className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white">
              <Layers3 aria-hidden="true" className="h-5 w-5 text-sky-400" />{isEnglish ? 'Our Services' : t.footer.services}
            </h2>
            <ul className="space-y-3.5">
              {servicesData.slice(0, 5).map((service, index) => {
                const Icon = serviceIcons[index] || Layers3;
                return (
                  <li key={service.id}>
                    <button onClick={() => onNavigate('service-detail', service.id)} className="group flex items-start gap-3 text-left text-sm leading-snug text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                      <Icon aria-hidden="true" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-sky-400 transition-colors group-hover:text-cyan-300" />
                      <span>{service.name[language]}</span>
                    </button>
                  </li>
                );
              })}
              <li className="pt-0.5">
                <button onClick={() => onNavigate('services')} className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                  {language === 'ru' ? 'Все 8 услуг' : language === 'en' ? 'Explore All 8 Services' : 'Barcha 8 xizmat'}
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </li>
            </ul>
          </nav>

          <section className="border-t border-slate-700/70 pt-6 sm:border-t-0 sm:pt-0 xl:border-l xl:border-t-0 xl:pl-8">
            <h2 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white">
              <LayoutGrid aria-hidden="true" className="h-5 w-5 text-sky-400" />{isEnglish ? 'Our Products' : t.footer.products}
            </h2>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => onNavigate('product-sales-agent')} className="group flex items-center gap-3 text-left text-sm text-slate-200 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                  <BarChart3 aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-sky-400" />ZiyoTech AI Sales Agent
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="group flex items-center gap-3 text-left text-sm text-slate-200 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                  <Box aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-sky-400" />
                  {language === 'ru' ? 'Корпоративные решения' : language === 'en' ? 'Enterprise Digital Solutions' : 'Korporativ Raqamli Tizimlar'}
                </button>
              </li>
            </ul>

            <div className="my-5 border-t border-slate-700/80" />
            <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white">
              <PhoneCall aria-hidden="true" className="h-5 w-5 text-sky-400" />{isEnglish ? 'Contact Us' : t.nav.contact}
            </h3>
            <ul className="space-y-3.5">
              {contacts.map((contact) => (
                <li key={contact.country}>
                  <a href={contact.href} className="group grid grid-cols-[32px_68px_minmax(0,1fr)] items-center gap-1.5 rounded-md text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                    <span className="flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-white/25 bg-white">
                      <img src={contact.flag} alt={`${contact.country} flag`} width="40" height="20" className="h-full w-full object-contain" />
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-slate-200">{contact.country}</span>
                    <span className="whitespace-nowrap text-xs font-semibold tracking-tight text-slate-100 xl:text-[13px]">{contact.number}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="relative mt-9 flex flex-col items-center justify-between gap-4 border-t border-cyan-500/80 py-5 text-xs sm:mt-10 sm:flex-row sm:pt-6">
          <p className="text-slate-300">© {new Date().getFullYear()} ZiyoTech. {t.footer.allRightsReserved}</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={() => onNavigate('privacy-policy')} className="text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{t.footer.privacyPolicy}</button>
            <span aria-hidden="true" className="h-4 w-px bg-slate-600" />
            <button onClick={() => onNavigate('terms-of-service')} className="text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{t.footer.termsOfService}</button>
          </div>
        </div>
      </div>

      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 w-full opacity-60 sm:h-32" viewBox="0 0 1600 170" preserveAspectRatio="none">
        <defs>
          <pattern id="footer-dot-mesh" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#168BFF" />
          </pattern>
          <linearGradient id="footer-wave-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#06142A" stopOpacity="0" />
            <stop offset="1" stopColor="#087BFA" stopOpacity=".56" />
          </linearGradient>
        </defs>
        <path d="M0 107C160 96 191 150 354 137s214-70 370-66 207 70 365 60 206-71 355-56 119 35 156 39v56H0z" fill="url(#footer-dot-mesh)" opacity=".47" />
        <path d="M0 131c181-61 250-19 377-11s186-92 347-69 206 93 340 77 212-85 351-46 126 30 185 14" fill="none" stroke="url(#footer-wave-fade)" strokeWidth="2" />
        <path d="M0 151c174-58 258-12 381-6s177-83 343-63 202 80 340 66 206-73 346-38 142 28 190 11" fill="none" stroke="#087BFA" strokeOpacity=".42" strokeWidth="1" />
      </svg>
    </footer>
  );
};
