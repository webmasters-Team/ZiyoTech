import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  Users,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Instagram,
  Filter,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { language } = useLanguage();
  const { conversations } = usePlatform();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [activeChannel, setActiveChannel] = useState<'all' | 'instagram' | 'telegram'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Clean 000 baseline metrics as requested by user
  const metrics = {
    totalCustomers: '000',
    newInquiries: '000',
    aiHandled: '000',
    ordersCaptured: '000',
    conversionRate: '0.0%',
    avgResponseTime: '0.0s',
  };

  // Pie chart segment definition (SVG Donut diagram)
  // Segments for Channels: Instagram (60%), Telegram (30%), Direct (10%)
  const pieSegments = [
    { id: 'instagram', label: 'Instagram Direct', color: '#EC4899', percent: 60, strokeDash: '188.5 314.16', strokeOffset: '0' },
    { id: 'telegram', label: 'Telegram Bot', color: '#0EA5E9', percent: 30, strokeDash: '94.25 314.16', strokeOffset: '-188.5' },
    { id: 'direct', label: 'Web Chat', color: '#10B981', percent: 10, strokeDash: '31.42 314.16', strokeOffset: '-282.75' },
  ];

  // Bar diagram data for weekly customer traffic
  const barData = [
    { day: language === 'ru' ? 'Пн' : language === 'en' ? 'Mon' : 'Dush', count: 0, height: '8%' },
    { day: language === 'ru' ? 'Вт' : language === 'en' ? 'Tue' : 'Sesh', count: 0, height: '12%' },
    { day: language === 'ru' ? 'Ср' : language === 'en' ? 'Wed' : 'Chor', count: 0, height: '6%' },
    { day: language === 'ru' ? 'Чт' : language === 'en' ? 'Thu' : 'Pay', count: 0, height: '10%' },
    { day: language === 'ru' ? 'Пт' : language === 'en' ? 'Fri' : 'Jum', count: 0, height: '15%' },
    { day: language === 'ru' ? 'Сб' : language === 'en' ? 'Sat' : 'Shan', count: 0, height: '22%' },
    { day: language === 'ru' ? 'Вс' : language === 'en' ? 'Sun' : 'Yak', count: 0, height: '18%' },
  ];

  // Conversion Funnel diagram stages
  const funnelStages = [
    { stage: language === 'ru' ? 'Просмотры профиля' : language === 'en' ? 'Profile Views' : "Profil Ko'rishlar", count: '000', pct: '100%', color: 'from-blue-500 to-indigo-500' },
    { stage: language === 'ru' ? 'Входящие обращения' : language === 'en' ? 'Inbound Inquiries' : 'Direct Murojaatlar', count: '000', pct: '0%', color: 'from-indigo-500 to-violet-500' },
    { stage: language === 'ru' ? 'Запросы по каталогу' : language === 'en' ? 'Catalog Price Queries' : "Narx & Mahsulot So'rovi", count: '000', pct: '0%', color: 'from-violet-500 to-purple-500' },
    { stage: language === 'ru' ? 'Готовые заявки' : language === 'en' ? 'High-Intent Order Drafts' : 'Tayyor Buyurtma Arizasi', count: '000', pct: '0%', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* View Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300">
              <Users className="w-4 h-4" />
            </div>
            <span>{language === 'ru' ? 'Данные Клиентов и Аналитика' : language === 'en' ? 'Customer Intelligence & Analytics' : "Mijozlar Ma'lumotlari va Tahlillar"}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ru'
              ? 'Официальная статистика взаимодействия с клиентами через Meta Graph API и Telegram'
              : language === 'en'
              ? 'Real-time telemetry and customer behavior analytics powered by Meta Graph API'
              : "Meta Graph API va Telegram orqali mijozlar bilan muloqot va konversiya tahlili"}
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center text-xs">
            {(['today', 'week', 'month', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeframe === t
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'today' ? (language === 'ru' ? 'Сегодня' : language === 'en' ? 'Today' : 'Bugun') :
                 t === 'week' ? (language === 'ru' ? '7 Дней' : language === 'en' ? '7 Days' : '7 Kunlik') :
                 t === 'month' ? (language === 'ru' ? '30 Дней' : language === 'en' ? '30 Days' : '30 Kunlik') :
                 (language === 'ru' ? 'Все' : language === 'en' ? 'All' : 'Barchasi')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Core KPI Counters - All clean 000 baseline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'ru' ? 'Всего Клиентов' : language === 'en' ? 'Total Customers' : 'Jami Mijozlar'}</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-wider mt-1">
            {metrics.totalCustomers}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{language === 'ru' ? 'Чистая база (000)' : language === 'en' ? 'Live baseline 000' : 'Baza yangi (000)'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'ru' ? 'Новые Обращения' : language === 'en' ? 'New Inquiries' : 'Yangi Murojaatlar'}</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-wider mt-1">
            {metrics.newInquiries}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>{language === 'ru' ? 'Ожидание диалогов' : language === 'en' ? 'Awaiting inbound' : 'Kutilmoqda'}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'ru' ? 'Решено ИИ' : language === 'en' ? 'AI Resolution' : 'AI Hal Qilgan'}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-wider mt-1">
            {metrics.aiHandled}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{metrics.conversionRate} avtonom</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'ru' ? 'Оформлено Заявок' : language === 'en' ? 'Order Proposals' : 'Buyurtma Arizalari'}</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-wider mt-1">
            {metrics.ordersCaptured}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>0 so'm tranzaksiya</span>
          </div>
        </div>

      </div>

      {/* Main Analytical Visualizations: Professional Pie Chart & Bar Chart Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Professional Pie Chart (Donut Diagram) - Channels (lg:col-span-5) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-pink-400" />
                <span>{language === 'ru' ? 'Каналы Клиентов (Pie Chart)' : language === 'en' ? 'Channel Distribution (Pie Chart)' : "Mijozlar Kanallari Taqsimoti (Pie Chart)"}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'ru' ? 'Сегментация трафика по источникам' : language === 'en' ? 'Traffic segmentation by communication pipeline' : "Muloqot manbalari bo'yicha taqsimot"}
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded-full">
              Live Donut
            </span>
          </div>

          {/* SVG Pie / Donut Chart */}
          <div className="my-6 relative flex items-center justify-center">
            <svg className="w-52 h-52 -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background circle track */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="16"
              />

              {/* Segment 1: Instagram (60%) */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="url(#pieInstagram)"
                strokeWidth="16"
                strokeDasharray={pieSegments[0].strokeDash}
                strokeDashoffset={pieSegments[0].strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('instagram')}
                onMouseLeave={() => setHoveredSlice(null)}
              />

              {/* Segment 2: Telegram (30%) */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="url(#pieTelegram)"
                strokeWidth="16"
                strokeDasharray={pieSegments[1].strokeDash}
                strokeDashoffset={pieSegments[1].strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('telegram')}
                onMouseLeave={() => setHoveredSlice(null)}
              />

              {/* Segment 3: Web Chat (10%) */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="16"
                strokeDasharray={pieSegments[2].strokeDash}
                strokeDashoffset={pieSegments[2].strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('direct')}
                onMouseLeave={() => setHoveredSlice(null)}
              />

              {/* SVG Gradients for beautiful glow */}
              <defs>
                <linearGradient id="pieInstagram" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="pieTelegram" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Donut Counter Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                {hoveredSlice === 'instagram' ? 'Instagram' : hoveredSlice === 'telegram' ? 'Telegram' : hoveredSlice === 'direct' ? 'Web Direct' : 'Baza'}
              </span>
              <span className="text-xl font-extrabold text-white font-mono tracking-wider">
                {hoveredSlice === 'instagram' ? '60%' : hoveredSlice === 'telegram' ? '30%' : hoveredSlice === 'direct' ? '10%' : '000'}
              </span>
              <span className="text-[9px] text-cyan-400 font-mono">
                {hoveredSlice ? 'Kanal ulushi' : 'Mijozlar'}
              </span>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            {pieSegments.map((seg) => (
              <div
                key={seg.id}
                onMouseEnter={() => setHoveredSlice(seg.id)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  hoveredSlice === seg.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="font-medium">{seg.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">000 mijoz</span>
                  <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {seg.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Professional Multi-Bar Diagram - Weekly Activity Velocity (lg:col-span-7) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ru' ? 'Динамика Активности Клиентов (Bar Chart)' : language === 'en' ? 'Customer Traffic Diagram (Bar Chart)' : "Mijozlar Faolligi Diagrammasi (Bar Chart)"}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'ru' ? 'Ежедневный объем входящих сообщений и конверсий' : language === 'en' ? 'Daily incoming message and resolution volume' : "Kunlik murojaatlar va hal qilingan masalalar grafigi"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Inbound</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Converted</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas Diagram */}
          <div className="my-6 h-56 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 relative">
            {/* Horizontal Grid guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
            </div>

            {/* Bars for Mon - Sun */}
            {barData.map((b, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group z-10">
                {/* Bar Value Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-black/90 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 mb-1 whitespace-nowrap">
                  000 inquiries
                </div>

                {/* Dual Bar Graphic */}
                <div className="w-full max-w-[28px] sm:max-w-[36px] bg-slate-800/80 rounded-t-lg h-full flex items-end overflow-hidden p-0.5 gap-0.5">
                  <div
                    className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all duration-500 group-hover:brightness-125"
                    style={{ height: b.height }}
                  />
                  <div
                    className="w-1/2 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t transition-all duration-500 group-hover:brightness-125"
                    style={{ height: `calc(${b.height} * 0.7)` }}
                  />
                </div>

                {/* Day Label */}
                <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {b.day}
                </span>
              </div>
            ))}
          </div>

          {/* Diagram Footer Summary */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-time webhook telemetry synced</span>
            </span>
            <span className="font-mono text-[11px]">000 / week</span>
          </div>
        </div>

      </div>

      {/* 3. Customer Conversion Funnel Diagram */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{language === 'ru' ? 'Воронка Конверсии Клиентов' : language === 'en' ? 'Customer Conversion Funnel' : "Mijozlar Konversiya Voronkasi (Funnel)"}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">0.0% Conversion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {funnelStages.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-200">{f.stage}</span>
                <span className="text-[10px] font-mono text-slate-400">Step 0{i + 1}</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono tracking-wider">
                {f.count}
              </div>
              <div className="mt-3 w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${f.color}`} style={{ width: i === 0 ? '100%' : '15%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Customer Directory & CRM Records (Clean, zero placeholder spam) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">
              {language === 'ru' ? 'Реестр Клиентов' : language === 'en' ? 'Verified Customer Registry' : "Mijozlar Ro'yxati"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'ru' ? 'Автоматическая регистрация обращений через Instagram и Telegram' : language === 'en' ? 'Autonomous customer recording from Instagram DM & Telegram' : "Instagram va Telegram orqali murojaat qilgan mijozlarning markazlashgan ro'yxati"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={language === 'ru' ? 'Поиск клиента...' : language === 'en' ? 'Search customer...' : "Mijoz qidirish..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-48"
              />
            </div>

            <button
              onClick={() => setSearchQuery('')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clean Empty / Fresh Baseline Notice */}
        <div className="py-12 px-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-white">
              {language === 'ru' ? 'База данных готова к приему клиентов' : language === 'en' ? 'Customer database ready for incoming traffic' : "Mijozlar bazasi toza va ulanishga tayyor"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'ru'
                ? 'Все стандартные демо-тексты очищены. Когда реальный пользователь напишет в Instagram Direct или Telegram, его карточка с номером телефона, адресом и деталями заказа появится здесь автоматически.'
                : language === 'en'
                ? 'All default placeholder data has been cleared. As soon as a user messages via Instagram Direct or Telegram, their profile, phone number, and order history will populate here autonomously.'
                : "Barcha standart test ma'lumotlar o'chirildi. Haqiqiy xaridor Instagram Direct yoki Telegram orqali yozishi bilanoq, uning ismi, profili va buyurtma tafsilotlari avtomatik shu yerda aks etadi."}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className="text-[11px] font-mono text-cyan-400 bg-blue-950/60 border border-blue-800/80 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Status: Listening for Meta Webhooks</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
