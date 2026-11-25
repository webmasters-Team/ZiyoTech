import React from 'react';

export type ProjectProgressPoint = { date: string; plannedPercentage: number; actualPercentage: number };

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const ProjectProgressChart: React.FC<{ history: ProjectProgressPoint[]; startDate?: string; targetDate?: string; title?: string }> = ({ history, startDate, targetDate, title = 'Planned vs. actual progress' }) => {
  const width = 720; const height = 230; const left = 48; const right = 18; const top = 16; const bottom = 38;
  const points = [...history].filter((point) => Number.isFinite(Date.parse(point.date))).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const boundaryValues = [startDate, targetDate, points[0]?.date, points.at(-1)?.date].filter((value): value is string => Boolean(value)).map((value) => Date.parse(value));
  const minDate = Math.min(...boundaryValues, Date.now());
  const maxDate = Math.max(...boundaryValues, Date.now());
  const dateSpan = Math.max(1, maxDate - minDate);
  const xy = (date: string, percentage: number) => ({
    x: left + ((Date.parse(date) - minDate) / dateSpan) * (width - left - right),
    y: top + ((100 - Math.max(0, Math.min(100, percentage))) / 100) * (height - top - bottom),
  });
  const line = (select: (point: ProjectProgressPoint) => number) => points.map((point, index) => {
    const position = xy(point.date, select(point));
    return `${index ? 'L' : 'M'} ${position.x.toFixed(1)} ${position.y.toFixed(1)}`;
  }).join(' ');
  const xLabels = [startDate || points[0]?.date, points[Math.floor((points.length - 1) / 2)]?.date, targetDate || points.at(-1)?.date]
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);

  return <section className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4 sm:p-5" aria-labelledby="admin-project-progress-chart-title">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h4 id="admin-project-progress-chart-title" className="text-sm font-bold text-white">{title}</h4><p className="mt-1 text-[10px] text-slate-500">Recorded weighted progress snapshots</p></div><div className="flex gap-4 text-[10px] text-slate-400"><span className="inline-flex items-center gap-2"><i className="h-0.5 w-4 bg-blue-400" />Planned</span><span className="inline-flex items-center gap-2"><i className="h-0.5 w-4 bg-cyan-300" />Actual</span></div></div>
    {points.length === 0 ? <p className="py-10 text-center text-xs text-slate-500">Progress history will appear after milestones or tasks change.</p> : <div className="overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} className="block h-auto min-w-[520px] w-full" role="img" aria-label="Planned and actual project progress by date">
      {[0, 25, 50, 75, 100].map((value) => { const y = top + ((100 - value) / 100) * (height - top - bottom); return <g key={value}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#263449" strokeDasharray="3 5" /><text x={left - 8} y={y + 3} fill="#64748b" fontSize="10" textAnchor="end">{value}%</text></g>; })}
      {points.length > 1 && <><path d={line((point) => point.plannedPercentage)} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" /><path d={line((point) => point.actualPercentage)} fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" /></>}
      {points.map((point) => { const planned = xy(point.date, point.plannedPercentage); const actual = xy(point.date, point.actualPercentage); return <g key={`${point.date}-${point.actualPercentage}`}><circle cx={planned.x} cy={planned.y} r="3.5" fill="#60a5fa"><title>{formatDate(point.date)} — planned {point.plannedPercentage}%</title></circle><circle cx={actual.x} cy={actual.y} r="4" fill="#67e8f9" stroke="#0b121d" strokeWidth="2"><title>{formatDate(point.date)} — actual {point.actualPercentage}%</title></circle></g>; })}
      {xLabels.map((date) => { const position = xy(date, 0); return <text key={date} x={position.x} y={height - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">{formatDate(date)}</text>; })}
    </svg></div>}
  </section>;
};
