import React from 'react';
import { Hero } from '../components/public/Hero';
import { EasyExplainerSection } from '../components/public/EasyExplainerSection';
import { ServicesSection } from '../components/public/ServicesSection';

interface PublicHomeProps {
  onNavigate: (page: string, serviceId?: string) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onNavigate }) => {
  return (
    <div className="w-full overflow-hidden">
      <Hero onNavigate={onNavigate} />
      <EasyExplainerSection onNavigate={onNavigate} />
      <ServicesSection onNavigate={onNavigate} />
    </div>
  );
};
