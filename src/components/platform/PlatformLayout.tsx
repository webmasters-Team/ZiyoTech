import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import { OverviewView } from './OverviewView';
import { InboxView } from './InboxView';
import { ProductsView } from './ProductsView';
import { OrdersView } from './OrdersView';
import { CustomersView } from './CustomersView';
import { AiConfigView } from './AiConfigView';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { AnalyticsView } from './AnalyticsView';
import { InstagramAccountsView } from './InstagramAccountsView';
import { TeamView } from './TeamView';
import { SettingsView } from './SettingsView';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  MessageSquare,
  Instagram,
  Package,
  ShoppingBag,
  Bot,
  Database,
  BarChart3,
  Users,
  Settings,
  ArrowLeft,
  Shield,
  Menu,
  X,
  Globe
} from 'lucide-react';

interface PlatformLayoutProps {
  onBackToSite: () => void;
}

export const PlatformLayout: React.FC<PlatformLayoutProps> = ({ onBackToSite }) => {
  const { role, setRole, conversations } = usePlatform();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const navItems = [
    { id: 'overview', label: t.platform.overview, icon: LayoutDashboard },
    { id: 'inbox', label: t.platform.inbox, icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: 'instagram', label: t.platform.instagramAccounts, icon: Instagram },
    { id: 'products', label: t.platform.products, icon: Package },
    { id: 'orders', label: t.platform.orders, icon: ShoppingBag },
    { id: 'customers', label: language === 'ru' ? 'Данные Клиентов' : language === 'en' ? 'Customer Intelligence' : "Mijozlar Ma'lumoti", icon: Users },
    { id: 'ai-config', label: t.platform.aiAssistant, icon: Bot },
    { id: 'knowledge', label: t.platform.knowledgeBase, icon: Database },
    { id: 'analytics', label: t.platform.analytics, icon: BarChart3 },
    { id: 'team', label: t.platform.team, icon: Users },
    { id: 'settings', label: t.platform.settings, icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView onNavigateTab={setActiveTab} />;
      case 'inbox':
        return <InboxView />;
      case 'instagram':
        return <InstagramAccountsView />;
      case 'products':
        return <ProductsView />;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'ai-config':
        return <AiConfigView />;
      case 'knowledge':
        return <KnowledgeBaseView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0A101D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-950/50"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={onBackToSite}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-blue-950/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.platform.backToSite}</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Logo Mark */}
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <span className="text-sm font-bold text-white tracking-tight">ZiyoTech Platform</span>
          </div>
        </div>

        {/* Right Info: Role & Language */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-900/60 text-xs">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">{t.platform.role}</span>
            <span className="font-semibold text-white capitalize">{role.replace('_', ' ')}</span>
          </div>

          {/* Lang switcher */}
          <div className="flex items-center gap-1 bg-blue-950/40 border border-blue-900/60 rounded-full px-2 py-0.5 text-xs">
            <Globe className="w-3 h-3 text-slate-400" />
            {(['uz', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold uppercase ${
                  language === l ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#09101D] p-4 space-y-1 shrink-0 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/25 to-cyan-600/25 text-cyan-300 border border-blue-500/40 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-blue-950/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-slate-800 px-3">
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/60 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200">Production Dashboard</div>
              <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Instagram Webhook Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/80 backdrop-blur-sm flex">
            <div className="w-64 bg-[#09101D] h-full p-4 space-y-1 border-r border-slate-800">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Platform Menu</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-blue-600/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-blue-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>

      </div>

    </div>
  );
};
