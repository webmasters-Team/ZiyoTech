/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PlatformProvider } from './context/PlatformContext';
import { Header } from './components/public/Header';
import { Footer } from './components/public/Footer';
import { PublicHome } from './pages/PublicHome';
import { ProductSalesAgentPage } from './pages/ProductSalesAgentPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PlatformLayout } from './components/platform/PlatformLayout';
import { ServicesSection } from './components/public/ServicesSection';
import { AiSolutionsSection } from './components/public/AiSolutionsSection';
import { AboutSection } from './components/public/AboutSection';
import { PortfolioSection } from './components/public/PortfolioSection';
import { ContactSection } from './components/public/ContactSection';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Mic } from 'lucide-react';

type AppLanguage = 'uz' | 'ru' | 'en';

const getAssistantPrompt = (language: AppLanguage) => {
  if (language === 'uz') return 'Nima qidiryapsiz?';
  if (language === 'ru') return 'Что вы хотите найти?';
  return 'What would you like to search for?';
};

const getRecognitionLanguage = (language: AppLanguage) => {
  if (language === 'uz') return 'uz-UZ';
  if (language === 'ru') return 'ru-RU';
  return 'en-US';
};

const speakAssistantPrompt = (language: AppLanguage) => {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(getAssistantPrompt(language));
  utterance.lang = getRecognitionLanguage(language);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferredFemaleVoices = voices.filter((voice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    const currentLanguagePattern =
      language === 'uz'
        ? /uz|uzbek|zira|samantha|aria|victoria|freya|jenny|ava|karen/
        : language === 'ru'
          ? /ru|russian|zira|samantha|aria|victoria|freya|jenny|ava|karen/
          : /en|english|zira|samantha|aria|victoria|freya|jenny|ava|karen/;

    return (
      currentLanguagePattern.test(name) ||
      (currentLanguagePattern.test(lang) && /female|woman|girl|zira|samantha|aria|victoria|freya|jenny|ava|karen/i.test(name))
    );
  });

  const chosenVoice =
    preferredFemaleVoices.find((voice) => /zira|samantha|aria|victoria|freya|jenny|ava|karen/i.test(voice.name)) ||
    preferredFemaleVoices[0] ||
    voices.find((voice) => new RegExp(getRecognitionLanguage(language).slice(0, 2), 'i').test(voice.lang));

  if (chosenVoice && /male|man/i.test(chosenVoice.name) === false) {
    utterance.voice = chosenVoice;
  } else if (!chosenVoice) {
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ProfessionalRobotIcon = () => (
  <svg viewBox="0 0 96 96" className="h-8 w-8 drop-shadow-[0_3px_8px_rgba(96,165,250,0.35)]" aria-hidden="true">
    <defs>
      <linearGradient id="robotBodyProfessional" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="45%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#93c5fd" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="20" r="7" fill="#7dd3fc" />
    <path d="M48 7 L48 0" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 10 V 22" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
    <rect x="20" y="22" width="56" height="46" rx="16" fill="url(#robotBodyProfessional)" stroke="#f8fbff" strokeWidth="3" />
    <circle cx="38" cy="42" r="6" fill="#0f172a" />
    <circle cx="58" cy="42" r="6" fill="#0f172a" />
    <circle cx="36" cy="40" r="2" fill="#ffffff" />
    <circle cx="56" cy="40" r="2" fill="#ffffff" />
    <path d="M42 54 Q48 60 54 54" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M28 18 L38 8" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
    <path d="M68 18 L58 8" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 70 L24 82" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
    <path d="M64 70 L72 82" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
    <circle cx="24" cy="84" r="5" fill="#bfdbfe" />
    <circle cx="72" cy="84" r="5" fill="#bfdbfe" />
  </svg>
);

const ProfessionalRobotButton = ({ onClick, isOpen }: { onClick: () => void; isOpen?: boolean }) => (
  <button
    onClick={onClick}
    className={`group relative flex h-15 w-15 items-center justify-center rounded-2xl border transition-all duration-300 ${
      isOpen
        ? 'border-cyan-200/60 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_12px_28px_rgba(56,189,248,0.4)]'
        : 'border-cyan-300/40 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_12px_28px_rgba(59,130,246,0.4)]'
    } text-white hover:scale-105 hover:shadow-[0_16px_30px_rgba(59,130,246,0.5)] active:scale-95`}
    aria-label="Open platform assistant"
    title="Platform AI Assistant"
  >
    <span className="absolute -top-1.5 right-2 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
    {isOpen ? <Mic className="h-6 w-6" /> : <ProfessionalRobotIcon />}
  </button>
);

function FloatingPlatformAssistant({ onNavigate }: { onNavigate: (page: string, serviceId?: string) => void }) {
  const { language } = useLanguage();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const routeVoiceQuery = (query: string) => {
    const normalized = normalizeText(query);
    if (!normalized) return;

    const routeMap: Array<{ keywords: string[]; page: string; serviceId?: string }> = [
      {
        keywords: ['website', 'websites', 'veb sayt', 'veb saytlar', 'sayt yaratish', 'sayt yasash', 'web design', 'web development', 'landing page', 'build website', 'create website'],
        page: 'service-detail',
        serviceId: 'web-dev',
      },
      {
        keywords: ['e commerce', 'online store', 'shop', 'veb magazin', 'onlayn do kon', 'do kon', 'magazin', 'digital store', 'ecommerce'],
        page: 'service-detail',
        serviceId: 'ecommerce',
      },
      {
        keywords: ['ai agent', 'ai sales agent', 'sales agent', 'chatbot', 'automation', 'ai solution', 'ai solutions', 'ai yechim', 'ai yechimlar', 'savdo agenti'],
        page: 'ai-solutions',
      },
      {
        keywords: ['portfolio', 'portfoliolar', 'ishlar', 'projects', 'bizning ishlar', 'loyihalar'],
        page: 'portfolio',
      },
      {
        keywords: ['about', 'about us', 'biz haqimizda', 'kompaniya', 'kim biz', 'who we are'],
        page: 'about',
      },
      {
        keywords: ['contact', 'contact us', 'boglanish', 'biz bilan boglanish', 'aloqa', 'call us', 'talk to us'],
        page: 'contact',
      },
      {
        keywords: ['product sales agent', 'sales agent', 'mahsulot savdo agenti', 'savdo agenti'],
        page: 'product-sales-agent',
      },
      {
        keywords: ['home', 'main page', 'bosh sahifa', 'asosiy sahifa', 'start', 'boshlash'],
        page: 'home',
      },
      {
        keywords: ['services', 'service', 'xizmatlar', 'xizmat', 'what do you do', 'what services', 'nima qilasiz'],
        page: 'services',
      },
    ];

    const match = routeMap.find(({ keywords }) =>
      keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
    );

    if (match) {
      onNavigate(match.page, match.serviceId);
      return;
    }

    onNavigate('services');
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    speakAssistantPrompt(language);

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getRecognitionLanguage(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setAssistantOpen(true);
    recognition.onresult = (event: any) => {
      const spokenText = event.results?.[0]?.[0]?.transcript || '';
      if (spokenText) {
        routeVoiceQuery(spokenText);
      }
    };
    recognition.onerror = () => {
      setAssistantOpen(false);
    };
    recognition.onend = () => {
      setAssistantOpen(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3">
      {assistantOpen && (
        <div className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] text-cyan-100 shadow-[0_10px_30px_rgba(14,116,144,0.25)] backdrop-blur-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          {language === 'uz' ? 'ESITISH' : language === 'ru' ? 'СЛУШАЮ' : 'LISTENING'}
        </div>
      )}

      <ProfessionalRobotButton onClick={startVoiceSearch} isOpen={assistantOpen} />
    </div>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/app' || path.startsWith('/app/')) return 'platform';
    if (path === '/products' || path === '/ai-sales-agent') return 'product-sales-agent';
    if (path === '/services' || path === '/service-detail') return 'services';
    if (path === '/ai-solutions') return 'ai-solutions';
    if (path === '/about') return 'about';
    if (path === '/portfolio') return 'portfolio';
    if (path === '/contact') return 'contact';
    return 'home';
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string>('web-dev');

  const handleNavigate = (page: string, serviceId?: string) => {
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    setCurrentPage(page);

    const path = page === 'home' ? '/' : `/${page === 'platform' ? 'app' : page}`;
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/app' || path.startsWith('/app/')) setCurrentPage('platform');
      else if (path === '/products' || path === '/ai-sales-agent') setCurrentPage('product-sales-agent');
      else if (path === '/services' || path === '/service-detail') setCurrentPage('services');
      else if (path === '/ai-solutions') setCurrentPage('ai-solutions');
      else if (path === '/about') setCurrentPage('about');
      else if (path === '/portfolio') setCurrentPage('portfolio');
      else if (path === '/contact') setCurrentPage('contact');
      else setCurrentPage('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPublicPage = () => {
    switch (currentPage) {
      case 'home':
        return <PublicHome onNavigate={handleNavigate} />;
      case 'services':
        return (
          <div className="py-8">
            <ServicesSection onNavigate={handleNavigate} />
          </div>
        );
      case 'service-detail':
        return <ServiceDetailPage serviceId={selectedServiceId} onNavigate={handleNavigate} />;
      case 'ai-solutions':
        return (
          <div className="py-8">
            <AiSolutionsSection onNavigate={handleNavigate} />
          </div>
        );
      case 'product-sales-agent':
        return <ProductSalesAgentPage onNavigate={handleNavigate} />;
      case 'about':
        return (
          <div className="py-8">
            <AboutSection onNavigate={handleNavigate} />
          </div>
        );
      case 'portfolio':
        return (
          <div className="py-8">
            <PortfolioSection onNavigate={handleNavigate} />
          </div>
        );
      case 'contact':
        return (
          <div className="py-8">
            <ContactSection />
          </div>
        );
      default:
        return <PublicHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#080C14] text-slate-100' : 'bg-slate-50 text-slate-900'
      } selection:bg-blue-600 selection:text-white`}
    >
      <FloatingPlatformAssistant onNavigate={handleNavigate} />

      {currentPage === 'platform' ? (
        <PlatformLayout onBackToSite={() => handleNavigate('home')} />
      ) : (
        <>
          <Header onNavigate={handleNavigate} currentPage={currentPage} />
          <main className="flex-1">{renderPublicPage()}</main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PlatformProvider>
          <AppContent />
        </PlatformProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
