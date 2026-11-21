import React, { useMemo, useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Bot,
  Users,
  Instagram,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

interface OverviewViewProps {
  onNavigateTab: (tab: string) => void;
}

type ActivityPoint = { date: Date; conversations: number; inquiries: number };
type Coordinate = { x: number; y: number };

const smoothPath = (points: Coordinate[]) => {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const control = (point.x - previous.x) / 2;
    return `${path} C ${previous.x + control} ${previous.y}, ${point.x - control} ${point.y}, ${point.x} ${point.y}`;
  }, '');
};

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab }) => {
  const { language } = useLanguage();
  const {
    conversations,
    projectRequests,
    projectRequestsLoadStatus,
    orders,
    products,
    instagramAccount,
    aiConfig
  } = usePlatform();

  const totalConversations = conversations.length;
  const aiHandledCount = conversations.filter((conversation) => conversation.status === 'ai_handling').length;
  const humanHandledCount = conversations.filter((conversation) => conversation.status === 'human_takeover').length;
  const totalOrdersCount = orders.length;
  const [activityRange, setActivityRange] = useState<7 | 30 | 90>(30);
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const activityPoints = useMemo<ActivityPoint[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDay = new Date(today);
    firstDay.setDate(firstDay.getDate() - activityRange + 1);
    const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const buckets = Array.from({ length: activityRange }, (_, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      return { date, conversations: 0, inquiries: 0 };
    });
    const byDate = new Map(buckets.map((point) => [dayKey(point.date), point]));

    // Legacy conversation timestamps may contain only a clock time or relative text.
    // Count only records carrying a full date so historic activity is never guessed.
    conversations.forEach((conversation) => {
      if (!/^\d{4}-\d{2}-\d{2}T/.test(conversation.lastTimestamp)) return;
      const date = new Date(conversation.lastTimestamp);
      if (!Number.isNaN(date.getTime())) {
        const bucket = byDate.get(dayKey(date));
        if (bucket) bucket.conversations += 1;
      }
    });
    projectRequests.forEach((request) => {
      if (!/^\d{4}-\d{2}-\d{2}T/.test(request.createdAt)) return;
      const date = new Date(request.createdAt);
      if (!Number.isNaN(date.getTime())) {
        const bucket = byDate.get(dayKey(date));
        if (bucket) bucket.inquiries += 1;
      }
    });
    return buckets;
  }, [activityRange, conversations, projectRequests]);

  const activityTotals = activityPoints.reduce((totals, point) => ({
    conversations: totals.conversations + point.conversations,
    inquiries: totals.inquiries + point.inquiries,
  }), { conversations: 0, inquiries: 0 });
  const activityTotal = activityTotals.conversations + activityTotals.inquiries;
  const chartCopy = language === 'ru'
    ? { title: 'Активность диалогов и обращений', description: 'Число диалогов с датой последней активности и отправленных заявок по дням.', conversations: 'Диалоги', inquiries: 'Заявки', total: 'Всего действий', last7: '7 дней', last30: '30 дней', last90: '90 дней', empty: 'За выбранный период нет записей с подтвержденными датами.', loading: 'Загрузка активности…', error: 'Не удалось загрузить заявки. Попробуйте обновить страницу.', dataNote: 'Диалоги без полной даты исключены. Общее число действий — сумма диалогов с датой активности и отправленных заявок.', day: 'день', tooltipDate: 'Дата', range: 'Период' }
    : language === 'uz'
      ? { title: 'Suhbatlar va so‘rovlar faolligi', description: 'Oxirgi faollik sanasi mavjud suhbatlar va yuborilgan so‘rovlar kunlar bo‘yicha.', conversations: 'Suhbatlar', inquiries: 'So‘rovlar', total: 'Jami faollik', last7: '7 kun', last30: '30 kun', last90: '90 kun', empty: 'Tanlangan davrda sanasi tasdiqlangan yozuvlar yo‘q.', loading: 'Faollik yuklanmoqda…', error: 'So‘rovlarni yuklab bo‘lmadi. Sahifani yangilab ko‘ring.', dataNote: 'To‘liq sanasi bo‘lmagan suhbatlar chiqarib tashlanadi. Jami faollik sanali suhbatlar va yuborilgan so‘rovlar yig‘indisidir.', day: 'kun', tooltipDate: 'Sana', range: 'Davr' }
      : { title: 'Conversation & Inquiry Activity', description: 'Dated conversations and submitted project inquiries by day.', conversations: 'Conversations', inquiries: 'Inquiries', total: 'Total activity', last7: '7 days', last30: '30 days', last90: '90 days', empty: 'No records with reliable dates were found for this period.', loading: 'Loading activity…', error: 'Inquiry data could not be loaded. Try refreshing the page.', dataNote: 'Conversations without a full date are excluded. Total activity is the sum of dated conversations and submitted inquiries.', day: 'day', tooltipDate: 'Date', range: 'Date range' };
  const chartGeometry = { width: 760, height: 250, left: 48, right: 18, top: 18, bottom: 38 };
  const chartMax = Math.max(1, ...activityPoints.flatMap((point) => [point.conversations, point.inquiries]));
  const chartCoords = (values: number[]): Coordinate[] => values.map((value, index) => ({
    x: chartGeometry.left + (activityPoints.length <= 1 ? 0 : (index / (activityPoints.length - 1)) * (chartGeometry.width - chartGeometry.left - chartGeometry.right)),
    y: chartGeometry.top + (chartGeometry.height - chartGeometry.top - chartGeometry.bottom) * (1 - value / chartMax),
  }));
  const conversationCoords = chartCoords(activityPoints.map((point) => point.conversations));
  const inquiryCoords = chartCoords(activityPoints.map((point) => point.inquiries));
  const conversationPath = smoothPath(conversationCoords);
  const inquiryPath = smoothPath(inquiryCoords);
  const areaPath = (path: string, coords: Coordinate[]) => coords.length ? `${path} L ${coords[coords.length - 1].x} ${chartGeometry.height - chartGeometry.bottom} L ${coords[0].x} ${chartGeometry.height - chartGeometry.bottom} Z` : '';
  const formatActivityDate = (date: Date) => new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(date);

  return (
    <div className="space-y-8">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-indigo-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-cyan-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Interactive Business Operations Dashboard</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Live data from your connected systems.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('inbox')}
          className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 font-sans transition-colors"
        >
          Open Inbox
        </button>
      </div>

      {/* KPI Stats Grid (Matches the 3D tablet dashboard in the hero screenshot!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Conversations */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Conversations</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalConversations}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>live feed</span>
          </div>
        </div>

        {/* Orders Generated */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Order Requests</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalOrdersCount}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>orders</span>
          </div>
        </div>

        {/* AI Resolution Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>AI Resolution Rate</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalConversations ? `${Math.round((aiHandledCount / totalConversations) * 100)}%` : '0%'}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>{aiHandledCount} automated</span>
          </div>
        </div>

        {/* Instagram Account Connection */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Instagram AI Agent</span>
            <div className="p-1.5 rounded-lg bg-pink-950/60 text-pink-400">
              <Instagram className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active & Online</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {instagramAccount.username} · {instagramAccount.followers} followers
          </div>
        </div>
      </div>

      {/* Main Split: Trend Chart & Active Live Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-4 shadow-xl shadow-black/20 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-base font-bold tracking-tight text-white sm:text-lg">{chartCopy.title}</h3>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">{chartCopy.description}</p>
              </div>
              <div className="inline-flex shrink-0 rounded-xl border border-slate-800 bg-slate-950/70 p-1" role="group" aria-label={chartCopy.range}>
                {([7, 30, 90] as const).map((days) => <button key={days} type="button" onClick={() => { setActivityRange(days); setActivePoint(null); }} aria-pressed={activityRange === days} className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${activityRange === days ? 'bg-cyan-500/15 text-cyan-200 shadow-sm' : 'text-slate-500 hover:text-slate-200'}`}>{days === 7 ? chartCopy.last7 : days === 30 ? chartCopy.last30 : chartCopy.last90}</button>)}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: chartCopy.total, value: activityTotal, tone: 'text-white' },
                { label: chartCopy.conversations, value: activityTotals.conversations, tone: 'text-cyan-300' },
                { label: chartCopy.inquiries, value: activityTotals.inquiries, tone: 'text-violet-300' },
              ].map((metric) => <div key={metric.label} className="min-w-0 rounded-xl border border-slate-800/90 bg-slate-950/55 px-3 py-2.5 sm:px-4"><div className="truncate text-[10px] font-medium text-slate-500 sm:text-xs">{metric.label}</div><div className={`mt-1 text-lg font-bold tabular-nums sm:text-xl ${metric.tone}`}>{metric.value}</div></div>)}
            </div>

            <div className="relative min-h-[230px] rounded-xl border border-slate-800/70 bg-slate-950/35 px-1 py-3 sm:px-3">
              {projectRequestsLoadStatus === 'loading' ? <div className="flex min-h-[225px] animate-pulse flex-col justify-center gap-4 px-6" role="status" aria-live="polite"><div className="h-3 w-40 rounded bg-slate-800" /><div className="h-32 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800/70 to-slate-900" /><span className="text-xs text-slate-500">{chartCopy.loading}</span></div>
                : projectRequestsLoadStatus === 'error' ? <div className="flex min-h-[225px] flex-col items-center justify-center px-5 text-center" role="alert"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-rose-900/60 bg-rose-950/30 text-rose-300"><AlertCircle className="h-5 w-5" /></div><p className="text-sm font-medium text-slate-200">{chartCopy.error}</p><p className="mt-1 max-w-md text-xs text-slate-500">{chartCopy.dataNote}</p></div>
                  : activityTotal > 0 ? <>
                <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="h-[225px] w-full overflow-visible" role="group" aria-label={`${chartCopy.title}, ${activityRange} days`}>
                  <defs>
                    <linearGradient id="overviewConversationArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0" /></linearGradient>
                    <linearGradient id="overviewInquiryArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity="0.2" /><stop offset="100%" stopColor="#a78bfa" stopOpacity="0" /></linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((tick) => {
                    const y = chartGeometry.top + tick * (chartGeometry.height - chartGeometry.top - chartGeometry.bottom) / 3;
                    const value = Math.ceil(chartMax * (1 - tick / 3));
                    return <g key={tick}><line x1={chartGeometry.left} x2={chartGeometry.width - chartGeometry.right} y1={y} y2={y} stroke="#263244" strokeDasharray="3 6" /><text x={chartGeometry.left - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{value}</text></g>;
                  })}
                  <path d={areaPath(conversationPath, conversationCoords)} fill="url(#overviewConversationArea)" />
                  <path d={areaPath(inquiryPath, inquiryCoords)} fill="url(#overviewInquiryArea)" />
                  <path d={conversationPath} fill="none" stroke="#22d3ee" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  <path d={inquiryPath} fill="none" stroke="#a78bfa" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  {activityPoints.filter((_, index) => index === 0 || index === activityPoints.length - 1 || index % Math.max(1, Math.ceil(activityPoints.length / 6)) === 0).map((point) => {
                    const index = activityPoints.indexOf(point);
                    const x = conversationCoords[index].x;
                    return <text key={point.date.toISOString()} x={x} y={chartGeometry.height - 8} textAnchor="middle" fill="#64748b" fontSize="10">{formatActivityDate(point.date)}</text>;
                  })}
                  {activityPoints.map((point, index) => {
                    const x = conversationCoords[index].x;
                    const activeY = Math.min(conversationCoords[index].y, inquiryCoords[index].y);
                    return <g key={point.date.toISOString()} onMouseEnter={() => setActivePoint(index)} onMouseLeave={() => setActivePoint(null)} onFocus={() => setActivePoint(index)} onBlur={() => setActivePoint(null)}>
                      <line x1={x} x2={x} y1={chartGeometry.top} y2={chartGeometry.height - chartGeometry.bottom} stroke={activePoint === index ? '#475569' : 'transparent'} strokeDasharray="3 5" />
                      <circle cx={x} cy={conversationCoords[index].y} r={activePoint === index ? 4.5 : 3} fill="#22d3ee" stroke="#0f172a" strokeWidth="2" className="transition-all duration-150" />
                      <circle cx={x} cy={inquiryCoords[index].y} r={activePoint === index ? 4.5 : 3} fill="#a78bfa" stroke="#0f172a" strokeWidth="2" className="transition-all duration-150" />
                      <circle cx={x} cy={activeY} r="12" fill="transparent" tabIndex={0} role="button" aria-label={`${chartCopy.tooltipDate} ${formatActivityDate(point.date)}: ${chartCopy.conversations} ${point.conversations}, ${chartCopy.inquiries} ${point.inquiries}`} className="cursor-crosshair outline-none focus-visible:stroke-cyan-300 focus-visible:stroke-2" />
                    </g>;
                  })}
                </svg>
                {activePoint !== null && activityPoints[activePoint] && <div role="tooltip" className="pointer-events-none absolute right-3 top-3 z-10 min-w-40 rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2.5 text-xs shadow-xl shadow-black/40 sm:right-5 sm:top-5">
                  <div className="mb-2 font-semibold text-white">{formatActivityDate(activityPoints[activePoint].date)}, {activityPoints[activePoint].date.getFullYear()}</div>
                  <div className="flex items-center justify-between gap-5 text-slate-300"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-cyan-400" />{chartCopy.conversations}</span><b className="tabular-nums text-white">{activityPoints[activePoint].conversations}</b></div>
                  <div className="mt-1 flex items-center justify-between gap-5 text-slate-300"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-400" />{chartCopy.inquiries}</span><b className="tabular-nums text-white">{activityPoints[activePoint].inquiries}</b></div>
                </div>}
              </> : <div className="flex min-h-[225px] flex-col items-center justify-center px-5 text-center"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-500"><TrendingUp className="h-5 w-5" /></div><p className="text-sm font-medium text-slate-300">{chartCopy.empty}</p><p className="mt-1 max-w-md text-xs text-slate-500">{chartCopy.dataNote}</p></div>}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-cyan-400" />{chartCopy.conversations}</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-violet-400" />{chartCopy.inquiries}</span></div>
              <span>{activityRange} {chartCopy.day}{language === 'en' ? 's' : ''}</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">{chartCopy.dataNote}</p>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400">Autonomous AI Handled</div>
                <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
                  {aiHandledCount} ({totalConversations ? `${Math.round((aiHandledCount / totalConversations) * 100)}%` : '0%'})
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400">Human Operator Escalations</div>
                <div className="text-lg font-bold text-slate-200 mt-1 font-mono">
                  {humanHandledCount} ({totalConversations ? `${Math.round((humanHandledCount / totalConversations) * 100)}%` : '0%'})
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Live Inbound Stream</h3>
              <button
                onClick={() => onNavigateTab('inbox')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({conversations.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
                  No live inbound data available.
                </div>
              ) : (
                conversations.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onNavigateTab('inbox')}
                    className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.customerAvatar}
                          alt={c.customerName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">{c.customerName}</div>
                          <div className="text-[10px] text-slate-400">@{c.customerHandle}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          c.status === 'ai_handling'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : c.status === 'human_takeover'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {c.status === 'ai_handling' ? 'AI Active' : c.status === 'human_takeover' ? 'Operator' : 'Resolved'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-1">
                      {c.lastMessage}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>{c.lastTimestamp}</span>
                      <span className="uppercase">{c.language}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Instagram Orders Captured by AI</h3>
            <p className="text-xs text-slate-400">Real-time draft orders populated directly from customer DM negotiations</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{ord.orderNumber}</td>
                  <td className="py-3 px-4 text-white font-medium">
                    <div>{ord.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ord.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{ord.productName}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-white font-bold">
                    {ord.amount.toLocaleString()} UZS
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ord.status === 'delivered'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{ord.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
