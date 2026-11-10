import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  TrendingUp,
  BarChart3,
  Bot,
  UserCheck,
  Clock,
  Instagram,
  ShoppingBag,
  Percent,
  PieChart as PieChartIcon,
  Layers,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { language } = useLanguage();
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Clean 000 baseline metrics as requested by user
  const metrics = {
    resolutionRate: '0.0%',
    medianResponseTime: '0.0s',
    escalationRatio: '0.0%',
    inquiryConversion: '0.0%',
    totalConversations: '000',
    ordersCaptured: '000',
  };

  const channelSlices = [
    { id: 'instagram', label: 'Instagram Direct', color: '#EC4899', percent: 65, strokeDash: '204.2 314.16', strokeOffset: '0' },
    { id: 'telegram', label: 'Telegram Bot', color: '#0EA5E9', percent: 25, strokeDash: '78.5 314.16', strokeOffset: '-204.2' },
    { id: 'web', label: 'Web Widget', color: '#10B981', percent: 10, strokeDash: '31.42 314.16', strokeOffset: '-282.7' },
  ];

  const weeklyTraffic = [
    { day: language === 'ru' ? 'Пн' : language === 'en' ? 'Mon' : 'Du', height: '10%' },
    { day: language === 'ru' ? 'Вт' : language === 'en' ? 'Tue' : 'Se', height: '14%' },
    { day: language === 'ru' ? 'Ср' : language === 'en' ? 'Wed' : 'Ch', height: '8%' },
    { day: language === 'ru' ? 'Чт' : language === 'en' ? 'Thu' : 'Pa', height: '18%' },
    { day: language === 'ru' ? 'Пт' : language === 'en' ? 'Fri' : 'Ju', height: '24%' },
    { day: language === 'ru' ? 'Сб' : language === 'en' ? 'Sat' : 'Sh', height: '32%' },
    { day: language === 'ru' ? 'Вс' : language === 'en' ? 'Sun' : 'Ya', height: '20%' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span>{language === 'ru' ? 'Аналитика и Телеметрия Системы' : language === 'en' ? 'Operational Telemetry & Analytics' : "Operatsion Telemetriya va Tahlillar"}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ru'
              ? 'Точные показатели автоматизации, распределения каналов и конверсии'
              : language === 'en'
              ? 'Real-time telemetry tracking automated resolution and conversion metrics'
              : "Avtonom javob berish tezligi va konversiya ko'rsatkichlari grafigi"}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Meta API Stream: 000 req/s</span>
        </div>
      </div>

      {/* KPI Cards: Clean 000 Baseline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400">
            {language === 'ru' ? 'Эффективность ИИ' : language === 'en' ? 'AI Resolution Rate' : 'AI Yechish Samaradorligi'}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono tracking-wider">
            {metrics.resolutionRate}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>000 avto-yechim</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400">
            {language === 'ru' ? 'Среднее Время Ответа' : language === 'en' ? 'Median Response Latency' : "O'rtacha Javob Vaqti"}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1 font-mono tracking-wider">
            {metrics.medianResponseTime}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Webhook sub-second
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400">
            {language === 'ru' ? 'Перевод на Оператора' : language === 'en' ? 'Human Escalation' : 'Xodimga Topshirish'}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 font-mono tracking-wider">
            {metrics.escalationRatio}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            000 eskalatsiya
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="text-xs text-slate-400">
            {language === 'ru' ? 'Конверсия в Заказ' : language === 'en' ? 'Inquiry-to-Order' : 'Buyurtmaga Konversiya'}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-1 font-mono tracking-wider">
            {metrics.inquiryConversion}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            000 rasmiylashtirilgan
          </div>
        </div>

      </div>

      {/* Analytical Visualizations: Pie Chart & Bar Chart Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Professional Donut Pie Chart */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-pink-400" />
                <span>{language === 'ru' ? 'Трафик по Каналам (Pie Chart)' : language === 'en' ? 'Channel Traffic (Pie Chart)' : "Kanallar Bo'yicha Tahlil (Pie Chart)"}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Instagram Direct, Telegram Bot, Web Chat
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Donut
            </span>
          </div>

          {/* SVG Pie Chart Canvas */}
          <div className="my-6 relative flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1e293b" strokeWidth="16" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="url(#pieGradInsta)"
                strokeWidth="16"
                strokeDasharray={channelSlices[0].strokeDash}
                strokeDashoffset={channelSlices[0].strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('instagram')}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="url(#pieGradTg)"
                strokeWidth="16"
                strokeDasharray={channelSlices[1].strokeDash}
                strokeDashoffset={channelSlices[1].strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('telegram')}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="16"
                strokeDasharray={channelSlices[2].strokeDash}
                strokeDashoffset={channelSlices[2].strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                onMouseEnter={() => setHoveredSlice('web')}
                onMouseLeave={() => setHoveredSlice(null)}
              />
              <defs>
                <linearGradient id="pieGradInsta" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <linearGradient id="pieGradTg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Center Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                {hoveredSlice || 'Baza'}
              </span>
              <span className="text-xl font-extrabold text-white font-mono tracking-wider">
                {hoveredSlice === 'instagram' ? '65%' : hoveredSlice === 'telegram' ? '25%' : hoveredSlice === 'web' ? '10%' : '000'}
              </span>
              <span className="text-[9px] text-cyan-400 font-mono">
                {hoveredSlice ? 'Ulush' : 'Murojaatlar'}
              </span>
            </div>
          </div>

          {/* Slices Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            {channelSlices.map((s) => (
              <div
                key={s.id}
                onMouseEnter={() => setHoveredSlice(s.id)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  hoveredSlice === s.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400">000</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 font-bold text-white">
                    {s.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Bar Chart Diagram */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ru' ? 'График Нагрузки и Трафика (Diagram)' : language === 'en' ? 'Traffic Velocity Diagram' : "Murojaatlar Dinamikasi Diagrammasi"}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Haftalik kunlar kesimida avtomatlashtirilgan oqim
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Mon - Sun
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="my-6 h-52 w-full flex items-end justify-between gap-3 px-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
              <div className="border-b border-slate-700 w-full" />
            </div>

            {weeklyTraffic.map((w, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group z-10">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-black text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 mb-1">
                  000 req
                </div>
                <div className="w-full max-w-[28px] sm:max-w-[34px] bg-slate-800/80 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-600 via-indigo-600 to-purple-500 rounded-t transition-all duration-500 group-hover:brightness-125"
                    style={{ height: w.height }}
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400 group-hover:text-cyan-400">
                  {w.day}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-emerald-400 flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-time telemetry ready</span>
            </span>
            <span className="font-mono text-[11px]">Baseline: 000</span>
          </div>
        </div>

      </div>

    </div>
  );
};
