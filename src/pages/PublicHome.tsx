import React from 'react';
import { Hero } from '../components/public/Hero';
import { EasyExplainerSection } from '../components/public/EasyExplainerSection';
import { ServicesSection } from '../components/public/ServicesSection';
import { AboutSection } from '../components/public/AboutSection';
import { AiSolutionsSection } from '../components/public/AiSolutionsSection';

interface PublicHomeProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onNavigate }) => {
  return (
    <div className="w-full overflow-hidden">
      <Hero onNavigate={onNavigate} />
      <AboutSection onNavigate={onNavigate} />
      <EasyExplainerSection onNavigate={onNavigate} />
      <AiSolutionsSection onNavigate={onNavigate} />
      <ServicesSection onNavigate={onNavigate} />
    </div>
  );
};
