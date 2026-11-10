/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
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

function AppContent() {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState<string>(() => {
    // Check initial pathname or hash
    const path = window.location.pathname;
    if (path === '/app' || path.startsWith('/app/')) return 'platform';
    if (path === '/products' || path === '/ai-sales-agent') return 'product-sales-agent';
    if (path === '/services') return 'services';
    if (path === '/ai-solutions') return 'ai-solutions';
    if (path === '/about') return 'about';
    if (path === '/portfolio') return 'portfolio';
    if (path === '/contact') return 'contact';
    return 'home';
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string>('web-dev');

  // Handle navigation
  const handleNavigate = (page: string, serviceId?: string) => {
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    setCurrentPage(page);

    // Sync window history gracefully
    const path = page === 'home' ? '/' : `/${page === 'platform' ? 'app' : page}`;
    window.history.pushState(null, '', path);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/app' || path.startsWith('/app/')) setCurrentPage('platform');
      else if (path === '/products' || path === '/ai-sales-agent') setCurrentPage('product-sales-agent');
      else if (path === '/services') setCurrentPage('services');
      else if (path === '/ai-solutions') setCurrentPage('ai-solutions');
      else if (path === '/about') setCurrentPage('about');
      else if (path === '/portfolio') setCurrentPage('portfolio');
      else if (path === '/contact') setCurrentPage('contact');
      else setCurrentPage('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#080C14] text-slate-100' : 'bg-slate-50 text-slate-900'
    } selection:bg-blue-600 selection:text-white`}>
      {currentPage === 'platform' ? (
        <PlatformLayout onBackToSite={() => handleNavigate('home')} />
      ) : (
        <>
          <Header onNavigate={handleNavigate} currentPage={currentPage} />

          <main className="flex-1">
            {currentPage === 'home' && <PublicHome onNavigate={handleNavigate} />}
            {currentPage === 'services' && (
              <div className="py-8">
                <ServicesSection onNavigate={handleNavigate} />
              </div>
            )}
            {currentPage === 'service-detail' && (
              <ServiceDetailPage
                serviceId={selectedServiceId}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'ai-solutions' && (
              <div className="py-8">
                <AiSolutionsSection onNavigate={handleNavigate} />
              </div>
            )}
            {currentPage === 'product-sales-agent' && (
              <ProductSalesAgentPage onNavigate={handleNavigate} />
            )}
            {currentPage === 'about' && (
              <div className="py-8">
                <AboutSection onNavigate={handleNavigate} />
              </div>
            )}
            {currentPage === 'portfolio' && (
              <div className="py-8">
                <PortfolioSection onNavigate={handleNavigate} />
              </div>
            )}
            {currentPage === 'contact' && (
              <div className="py-8">
                <ContactSection />
              </div>
            )}
          </main>

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
