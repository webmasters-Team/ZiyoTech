import React from 'react';

export type AnalyticsChartPoint = { bucket: string; label: string; guestVisits: number; authenticatedVisits: number; averageActiveSeconds: number };
export type AnalyticsChartsData = {
  range: string;
  timeZone: 'UTC';
  traffic: AnalyticsChartPoint[];
  hourlyActivity: Array<{ hour: number; label: string; visits: number }>;
  topPages: Array<{ pagePath: string; pageViews: number }>;
  visitorDistribution: { guests: number; registeredUsers: number };
  engagementTrend: Array<{ bucket: string; label: string; averageActiveSeconds: number }>;
};

const palettes = {
  en: { traffic: 'Visit traffic', hourly: 'Activity by hour (UTC)', pages: 'Most visited pages', distribution: 'Guest vs registered visitors', engagement: 'Average engagement duration', guest: 'Guest visits', registered: 'Authenticated visits', guests: 'Guests', registeredUsers: 'Registered users', empty: 'No tracked data for this period yet.', utc: 'Times shown in UTC' },
  ru: { traffic: 'Посещения по времени', hourly: 'Активность по часам (UTC)', pages: 'Популярные страницы', distribution: 'Гости и зарегистрированные', engagement: 'Средняя длительность активности', guest: 'Визиты гостей', registered: 'Визиты пользователей', guests: 'Гости', registeredUsers: 'Зарегистрированные', empty: 'За этот период пока нет данных.', utc: 'Время указано в UTC' },
  uz: { traffic: 'Tashriflar oqimi', hourly: 'Soatlar bo‘yicha faollik (UTC)', pages: 'Eng ko‘p ko‘rilgan sahifalar', distribution: 'Mehmonlar va ro‘yxatdan o‘tganlar', engagement: 'O‘rtacha faol vaqt', guest: 'Mehmon tashriflari', registered: 'Foydalanuvchi tashriflari', guests: 'Mehmonlar', registeredUsers: 'Ro‘yxatdan o‘tganlar', empty: 'Bu davr uchun hali ma’lumot yo‘q.', utc: 'Vaqt UTC bo‘yicha ko‘rsatiladi' },
};

type Series = { name: string; values: number[]; color: string };
function LineChart({ points, series, timeZone }: { points: Array<{ label: string }>; series: Series[]; timeZone: string }) {
  const width = 760;
  const height = 224;
  const left = 34;
  const right = 14;
  const top = 14;
  const bottom = 28;
  const max = Math.max(1, ...series.flatMap((item) => item.values));
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const makePath = (values: number[]) => values.map((value, index) => {
    const x = left + (values.length <= 1 ? chartWidth / 2 : (index / (values.length - 1)) * chartWidth);
    const y = top + chartHeight - (value / max) * chartHeight;
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  return <div className="min-w-0">
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">{series.map((item) => <span key={item.name} className="inline-flex items-center gap-1.5 text-[10px] text-slate-400"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>)}</div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${series.map((item) => item.name).join(', ')} chart`} className="h-52 w-full overflow-visible">
      {[0, 1, 2, 3].map((line) => { const y = top + line * chartHeight / 3; return <g key={line}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#263244" strokeDasharray="3 5" /><text x={left - 7} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9">{Math.round(max * (1 - line / 3))}</text></g>; })}
      {series.map((item) => <path key={item.name} d={makePath(item.values)} fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}
      {points.filter((_, index) => index % labelStep === 0 || index === points.length - 1).map((point, visibleIndex) => { const index = points.indexOf(point); const x = left + (points.length <= 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth); return <text key={`${point.label}-${visibleIndex}`} x={x} y={height - 5} textAnchor="middle" fill="#64748b" fontSize="9">{point.label}</text>; })}
    </svg>
    <p className="mt-1 text-right text-[10px] text-slate-600">{timeZone}</p>
  </div>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/30 px-5 text-center text-xs text-slate-500">{message}</div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/55 p-4 sm:p-5"><h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>{children}</section>;
}

export function AnalyticsCharts({ data, language }: { data: AnalyticsChartsData | null; language: 'uz' | 'ru' | 'en' }) {
  const copy = palettes[language] || palettes.en;
  const hasTraffic = Boolean(data?.traffic.length);
  const distributionTotal = (data?.visitorDistribution.guests || 0) + (data?.visitorDistribution.registeredUsers || 0);
  const maxPage = Math.max(1, ...(data?.topPages.map((page) => page.pageViews) || []));
  const maxHour = Math.max(1, ...(data?.hourlyActivity.map((hour) => hour.visits) || []));
  return <div className="grid min-w-0 gap-4 xl:grid-cols-2">
    <Panel title={copy.traffic}>{hasTraffic && data ? <LineChart points={data.traffic} timeZone={copy.utc} series={[{ name: copy.guest, values: data.traffic.map((point) => point.guestVisits), color: '#22d3ee' }, { name: copy.registered, values: data.traffic.map((point) => point.authenticatedVisits), color: '#818cf8' }]} /> : <EmptyChart message={copy.empty} />}</Panel>
    <Panel title={copy.hourly}>{data?.hourlyActivity.length ? <div className="flex h-56 items-end gap-1.5 border-b border-slate-800 px-1 pb-7 pt-3">{data.hourlyActivity.map((point) => <div key={point.hour} className="group relative flex h-full min-w-0 flex-1 items-end justify-center"><div className="w-full max-w-5 rounded-t-sm bg-gradient-to-t from-cyan-700 to-cyan-300 transition-opacity group-hover:opacity-75" style={{ height: point.visits ? `${Math.max(4, (point.visits / maxHour) * 100)}%` : '0%' }} /><span className="absolute -bottom-6 text-[8px] text-slate-600">{point.hour % 3 === 0 ? point.label.slice(0, 2) : ''}</span><span className="pointer-events-none absolute -top-7 hidden rounded bg-slate-800 px-1.5 py-1 text-[9px] text-white group-hover:block">{point.label} · {point.visits}</span></div>)}</div> : <EmptyChart message={copy.empty} />}</Panel>
    <Panel title={copy.pages}>{data?.topPages.length ? <div className="space-y-3">{data.topPages.map((page) => <div key={page.pagePath} className="grid grid-cols-[minmax(0,1fr)_2.2fr_auto] items-center gap-3 text-xs"><span className="truncate text-slate-300" title={page.pagePath}>{page.pagePath}</span><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-300" style={{ width: `${Math.max(2, (page.pageViews / maxPage) * 100)}%` }} /></div><span className="w-8 text-right tabular-nums text-slate-400">{page.pageViews}</span></div>)}</div> : <EmptyChart message={copy.empty} />}</Panel>
    <Panel title={copy.distribution}>{distributionTotal > 0 ? <div className="flex h-56 flex-col items-center justify-center gap-5 sm:flex-row"><div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: `conic-gradient(#22d3ee 0deg ${(data!.visitorDistribution.guests / distributionTotal) * 360}deg, #818cf8 ${(data!.visitorDistribution.guests / distributionTotal) * 360}deg 360deg)` }}><div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-slate-900"><span className="text-2xl font-bold tabular-nums text-white">{distributionTotal}</span><span className="text-[10px] text-slate-500">{language === 'ru' ? 'уникальных' : language === 'uz' ? 'noyob' : 'unique'}</span></div></div><div className="space-y-3 text-xs"><p className="flex items-center gap-2 text-slate-300"><i className="h-2.5 w-2.5 rounded-full bg-cyan-400" />{copy.guests}<b className="ml-2 tabular-nums text-white">{data!.visitorDistribution.guests}</b></p><p className="flex items-center gap-2 text-slate-300"><i className="h-2.5 w-2.5 rounded-full bg-indigo-400" />{copy.registeredUsers}<b className="ml-2 tabular-nums text-white">{data!.visitorDistribution.registeredUsers}</b></p></div></div> : <EmptyChart message={copy.empty} />}</Panel>
    <Panel title={copy.engagement}>{hasTraffic && data ? <LineChart points={data.engagementTrend} timeZone={copy.utc} series={[{ name: language === 'ru' ? 'Секунды на сеанс' : language === 'uz' ? 'Seans soniyasi' : 'Seconds per session', values: data.engagementTrend.map((point) => point.averageActiveSeconds), color: '#34d399' }]} /> : <EmptyChart message={copy.empty} />}</Panel>
  </div>;
}
