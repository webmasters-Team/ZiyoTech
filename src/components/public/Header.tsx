import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';
import { servicesData } from '../../data/servicesData';
import {
  ChevronDown,
  Globe,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  Check,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onNavigate: (page: string, serviceId?: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const languages: { code: Language; label: string; short: string; flag: string }[] = [
    { code: 'uz', label: "O'zbekcha", short: 'UZ', flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', short: 'RU', flag: '🇷🇺' },
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];
  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-2xl transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-[#080C14]/95 border-b border-white/[0.08]'
        : 'bg-white/95 border-b border-slate-200 shadow-sm'
    }`}>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-16 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Zone (Logo & Company Name - Pinned Far Left) */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg shrink-0"
        >
          <BrandLogo size="md" />
        </button>

        {/* Center Nav Links - Centered across wide PC screens */}
        <nav className={`hidden lg:flex items-center justify-center gap-1 xl:gap-3 2xl:gap-5 text-[13.5px] font-medium flex-1 mx-4 ${
          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
        }`}>
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 relative ${
              currentPage === 'home'
                ? theme === 'dark'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-cyan-400 after:rounded-full'
                  : 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:rounded-full'
                : theme === 'dark'
                  ? 'hover:text-white hover:bg-white/[0.04]'
                  : 'hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            {t.nav.home}
          </button>

          <button
            onClick={() => onNavigate('services')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 relative ${
              currentPage === 'services' || currentPage === 'service-detail'
                ? theme === 'dark'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-cyan-400 after:rounded-full'
                  : 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:rounded-full'
                : theme === 'dark'
                  ? 'hover:text-white hover:bg-white/[0.04]'
                  : 'hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            {t.nav.services}
          </button>

          <button
            onClick={() => onNavigate('ai-solutions')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 relative ${
              currentPage === 'ai-solutions'
                ? theme === 'dark'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-cyan-400 after:rounded-full'
                  : 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:rounded-full'
                : theme === 'dark'
                  ? 'hover:text-white hover:bg-white/[0.04]'
                  : 'hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            {t.nav.aiSolutions}
          </button>

          <button
            onClick={() => onNavigate('product-sales-agent')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 relative ${
              currentPage === 'product-sales-agent'
                ? theme === 'dark'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-cyan-400 after:rounded-full'
                  : 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:rounded-full'
                : theme === 'dark'
                  ? 'hover:text-white hover:bg-white/[0.04]'
                  : 'hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            <span>{t.nav.products}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              theme === 'dark'
                ? 'bg-blue-950 text-blue-300 border border-blue-800/80'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              AI Agent
            </span>
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 relative ${
              currentPage === 'about'
                ? theme === 'dark'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-cyan-400 after:rounded-full'
                  : 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:rounded-full'
                : theme === 'dark'
                  ? 'hover:text-white hover:bg-white/[0.04]'
                  : 'hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            {t.nav.aboutUs}
          </button>

          <button
            onClick={() => onNavigate('portfolio')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 relative ${
              currentPage === 'portfolio'
                ? theme === 'dark'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-cyan-400 after:rounded-full'
                  : 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:rounded-full'
                : theme === 'dark'
                  ? 'hover:text-white hover:bg-white/[0.04]'
                  : 'hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            {t.nav.portfolio}
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 relative ${
              currentPage === 'contact'
                ? theme === 'dark'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-cyan-400 after:rounded-full'
                  : 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-cyan-500 after:rounded-full'
                : theme === 'dark'
                  ? 'hover:text-white hover:bg-white/[0.04]'
                  : 'hover:text-blue-600 hover:bg-slate-100'
            }`}
          >
            {t.nav.contact}
          </button>
        </nav>

        {/* Right Side: Theme Toggle, Language Selector & "Boshlash" ("başla") CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-full border transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] text-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-blue-600'
            }`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            title={theme === 'dark' ? 'Yorug‘ rejim (Light mode)' : 'Tungi rejim (Dark mode)'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
                <span className="hidden md:inline text-xs font-semibold text-slate-200">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600" />
                <span className="hidden md:inline text-xs font-semibold text-slate-700">Dark</span>
              </>
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                theme === 'dark'
                  ? 'text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-blue-500/30'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300 hover:border-blue-500/30'
              }`}
              aria-label="Select Language"
            >
              <Globe className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
              <span>{currentLangObj.short}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className={`absolute right-0 mt-2 w-36 rounded-xl border shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                theme === 'dark'
                  ? 'bg-[#0A101D] border-blue-500/20 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'bg-blue-600/20 text-blue-500 font-bold'
                        : theme === 'dark' ? 'text-slate-300 hover:bg-white/[0.06]' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-sm">{l.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary CTA Button: "Boshlash" ("başla" / "Get Started" / "Начать") in Sapphire Cyan Gradient */}
          <button
            onClick={() => onNavigate('contact')}
            className="hidden sm:flex items-center gap-2 px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-full shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            <span>{t.nav.getStarted}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Hamburger (Visible on < lg screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl transition-colors shrink-0 ${
              theme === 'dark'
                ? 'text-slate-300 hover:text-white bg-white/[0.04] border border-white/[0.08]'
                : 'text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* True Full-screen Mobile & Tablet Navigation Modal via React Portal */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed inset-0 w-screen h-screen min-h-dvh z-[99999] flex flex-col justify-between p-5 overflow-y-auto transition-colors ${
            theme === 'dark' ? 'bg-[#080C14] text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Top Bar with Brand, Theme Switcher, Language Switcher and Large Close Button */}
          <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${
            theme === 'dark' ? 'border-white/[0.1]' : 'border-slate-200'
          }`}>
            <BrandLogo size="sm" />

            <div className="flex items-center gap-2">
              {/* Theme toggle in mobile modal */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full border transition-all ${
                  theme === 'dark'
                    ? 'bg-white/[0.08] border-white/[0.15] text-amber-300'
                    : 'bg-white border-slate-300 text-blue-600 shadow-sm'
                }`}
                aria-label="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Language Pills */}
              <div className={`flex items-center rounded-full p-1 border ${
                theme === 'dark' ? 'bg-white/[0.06] border-white/[0.1]' : 'bg-white border-slate-300 shadow-sm'
              }`}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-full transition-colors ${
                      language === l.code
                        ? 'bg-blue-600 text-white font-bold'
                        : theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {l.short}
                  </button>
                ))}
              </div>

              {/* High-visibility Close Button with large 44px tap target */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center active:scale-95 transition-all shrink-0 ${
                  theme === 'dark'
                    ? 'bg-white/[0.08] hover:bg-white/[0.15] border-white/[0.15] text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                }`}
                aria-label="Close Navigation Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Links list */}
          <div className="py-5 space-y-1.5 flex-1">
            {/* Primary Action Button */}
            <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 shadow-xl shadow-blue-600/30 mb-4"
            >
              <span>{t.nav.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'home' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{t.nav.home}</span>
              {currentPage === 'home' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => {
                onNavigate('services');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'services' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{t.nav.services}</span>
              {currentPage === 'services' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => {
                onNavigate('ai-solutions');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'ai-solutions' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{t.nav.aiSolutions}</span>
              {currentPage === 'ai-solutions' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => {
                onNavigate('product-sales-agent');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'product-sales-agent' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{t.nav.products}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  AI Sales Agent
                </span>
              </div>
              {currentPage === 'product-sales-agent' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'about' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{t.nav.aboutUs}</span>
              {currentPage === 'about' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => {
                onNavigate('portfolio');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'portfolio' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{t.nav.portfolio}</span>
              {currentPage === 'portfolio' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                currentPage === 'contact' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span>{t.nav.contact}</span>
              {currentPage === 'contact' && <Check className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>

          {/* Bottom Action */}
          <div className="pt-4 border-t border-white/[0.1] space-y-2 shrink-0">
            <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>{t.services.requestConsultation}</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
