import React from 'react';
import { calculateElapsedPercentage } from '../../lib/projectProgress';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../lib/api';

export type ClientPortalProject = {
  id: string;
  title: string;
  description: string;
  scope?: string;
  status: string;
  startDate?: string;
  targetCompletionDate?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  progress: {
    overallPercentage: number;
    phases: Array<{ milestoneId: string; label: string; completionPercentage: number }>;
    history: Array<{ date: string; plannedPercentage: number; actualPercentage: number }>;
  };
  milestones: Array<{ id: string; title: string; description: string; weight: number; dueDate?: string; status: string; completionPercentage: number; taskIds: string[] }>;
  tasks: Array<{ id: string; milestoneId: string; title: string; description: string; status: string; completionPercentage: number; dueDate?: string }>;
  updates: Array<{ id: string; title: string; body: string; createdAt: string; authorDisplayName: string }>;
  resources: Array<{ id: string; resourceType: 'image' | 'video' | 'document' | 'link'; title: string; description: string; fileName: string; externalUrl: string }>;
};

const uiCopy = {
  en: { noProjects: 'No projects are assigned to this company yet.', choose: 'Choose project', signOut: 'Sign out', overall: 'Overall completion', status: 'Project status', tasksDone: 'Tasks completed', schedule: 'Schedule status', recorded: 'Recorded weighted progress snapshots. Future actual values are never drawn.', history: 'Progress history will appear after the project has recorded updates.', milestones: 'Milestone progress', timeline: 'Project timeline', start: 'Start date', target: 'Target deadline', estimated: 'Estimated completion', elapsed: 'Calendar elapsed', updates: 'Recent project updates', noUpdates: 'No project updates have been published yet.', noMilestones: 'Milestones will appear when they are added to the project.', statuses: { upcoming: 'Upcoming', in_progress: 'In progress', blocked: 'Blocked', completed: 'Completed', delayed: 'Delayed', planning: 'Planning', on_hold: 'On hold' } },
  ru: { noProjects: 'Для этой компании пока нет проектов.', choose: 'Выберите проект', signOut: 'Выйти', overall: 'Выполнено', status: 'Статус проекта', tasksDone: 'Задачи выполнены', schedule: 'Сроки', recorded: 'Сохранённые взвешенные снимки прогресса. Фактические значения за будущие даты не отображаются.', history: 'История появится после обновления проекта.', milestones: 'Выполнение этапов', timeline: 'Сроки проекта', start: 'Начало', target: 'Целевой срок', estimated: 'Оценка завершения', elapsed: 'Прошло календарного времени', updates: 'Последние обновления проекта', noUpdates: 'Обновлений пока нет.', noMilestones: 'Этапы появятся после добавления к проекту.', statuses: { upcoming: 'Предстоит', in_progress: 'В работе', blocked: 'Заблокировано', completed: 'Завершено', delayed: 'Просрочено', planning: 'Планирование', on_hold: 'Приостановлен' } },
  uz: { noProjects: 'Bu kompaniyaga hali loyiha biriktirilmagan.', choose: 'Loyihani tanlang', signOut: 'Chiqish', overall: 'Umumiy bajarilishi', status: 'Loyiha holati', tasksDone: 'Bajarilgan vazifalar', schedule: 'Muddat holati', recorded: 'Saqlangan vaznli jarayon qaydlari. Kelajak sanalar uchun haqiqiy qiymatlar ko‘rsatilmaydi.', history: 'Loyiha yangilangach jarayon tarixi paydo bo‘ladi.', milestones: 'Bosqichlar bajarilishi', timeline: 'Loyiha jadvali', start: 'Boshlanish sanasi', target: 'Maqsadli muddat', estimated: 'Taxminiy yakunlanish', elapsed: 'O‘tgan kalendar vaqti', updates: 'So‘nggi loyiha yangiliklari', noUpdates: 'Hozircha yangiliklar e’lon qilinmagan.', noMilestones: 'Bosqichlar loyihaga qo‘shilgach ko‘rinadi.', statuses: { upcoming: 'Kutilmoqda', in_progress: 'Jarayonda', blocked: 'To‘silgan', completed: 'Yakunlangan', delayed: 'Kechikkan', planning: 'Rejalashtirish', on_hold: 'To‘xtatilgan' } },
} as const;

const dateLabel = (value: string | undefined, language: 'en' | 'ru' | 'uz') => {
  if (!value) return '—';
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  const locale = language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US';
  return Number.isNaN(parsed.valueOf()) ? '—' : parsed.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
};

function buildPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}

export const ClientProjectDashboard: React.FC<{ projects: ClientPortalProject[]; onLogout: () => void }> = ({ projects, onLogout }) => {
  const { language } = useLanguage();
  const labels = uiCopy[language];
  const statusLabel = (status: string) => labels.statuses[status as keyof typeof labels.statuses] || status.replaceAll('_', ' ');
  const [selectedId, setSelectedId] = React.useState(projects[0]?.id || '');
  React.useEffect(() => {
    if (!projects.some((project) => project.id === selectedId)) setSelectedId(projects[0]?.id || '');
  }, [projects, selectedId]);
  const project = projects.find((item) => item.id === selectedId) || projects[0];
  if (!project) return <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-300" aria-live="polite">{labels.noProjects}</section>;

  const history = [...project.progress.history].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const width = 720; const height = 230; const left = 48; const right = 18; const top = 16; const bottom = 34;
  const minDate = Math.min(Date.parse(project.startDate || history[0]?.date || new Date().toISOString()), Date.parse(history[0]?.date || project.startDate || new Date().toISOString()));
  const maxDate = Math.max(Date.parse(project.targetCompletionDate || history.at(-1)?.date || new Date().toISOString()), Date.parse(history.at(-1)?.date || project.targetCompletionDate || new Date().toISOString()));
  const dateSpan = Math.max(1, maxDate - minDate);
  const xy = (date: string, percentage: number) => ({
    x: left + ((Date.parse(date) - minDate) / dateSpan) * (width - left - right),
    y: top + ((100 - Math.max(0, Math.min(100, percentage))) / 100) * (height - top - bottom),
  });
  const plannedPoints = history.map((point) => xy(point.date, point.plannedPercentage));
  const actualPoints = history.map((point) => xy(point.date, point.actualPercentage));
  const elapsed = project.startDate && project.targetCompletionDate ? calculateElapsedPercentage(project.startDate, project.targetCompletionDate) : null;
  const completedTasks = project.tasks.filter((task) => task.status === 'completed').length;
  const latest = history.at(-1);
  const schedule = latest && project.targetCompletionDate && new Date(`${project.targetCompletionDate}T23:59:59Z`) < new Date() && latest.actualPercentage < 100
    ? statusLabel('delayed')
    : latest && latest.actualPercentage + 10 < latest.plannedPercentage ? (language === 'ru' ? 'Риск срока' : language === 'uz' ? 'Muddat xavfi' : 'At risk') : (language === 'ru' ? 'По графику' : language === 'uz' ? 'Reja bo‘yicha' : 'On schedule');
  const axisDates = [project.startDate || history[0]?.date, history[Math.floor((history.length - 1) / 2)]?.date, project.targetCompletionDate || history.at(-1)?.date].filter((value, index, items): value is string => Boolean(value) && items.indexOf(value) === index);

  return <section className="mt-6 space-y-4 text-left" aria-label="Authorized client projects">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="min-w-0 flex-1"><label htmlFor="client-project-select" className="sr-only">{labels.choose}</label><select id="client-project-select" value={project.id} onChange={(event) => setSelectedId(event.target.value)} className="w-full max-w-xl rounded-lg border border-slate-700 bg-[#080e17] px-3 py-2 text-sm font-semibold text-white">{projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><p className="mt-1 text-xs text-slate-400">{project.description}</p>{project.scope && <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">{project.scope}</p>}</div>
      <button type="button" onClick={onLogout} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{labels.signOut}</button>
    </div>
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 sm:grid-cols-4">
      {[["Overall completion", `${project.progress.overallPercentage}%`], ['Project status', project.status.replaceAll('_', ' ')], ['Tasks completed', `${completedTasks}/${project.tasks.length}`], ['Schedule status', schedule]].map(([label, value]) => <div key={label} className="min-w-0 bg-[#0b121d] p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 truncate text-sm font-bold text-white sm:text-base">{value}</p></div>)}
    </div>
    <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5" aria-labelledby="client-progress-chart-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h3 id="client-progress-chart-title" className="text-sm font-bold text-white">Planned vs. actual progress</h3><p className="mt-1 text-[11px] text-slate-500">Recorded project snapshots only. Future actual values are never drawn.</p></div><div className="flex gap-4 text-[10px] text-slate-400"><span className="inline-flex items-center gap-2"><i className="h-0.5 w-4 bg-blue-400" />Planned</span><span className="inline-flex items-center gap-2"><i className="h-0.5 w-4 bg-cyan-300" />Actual</span></div></div>
      {history.length === 0 ? <p className="py-12 text-center text-xs text-slate-500">Progress history will appear after the project has recorded updates.</p> : <div className="overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} className="block h-auto min-w-[520px] w-full" role="img" aria-label="Planned versus actual progress over project dates">
        {[0, 25, 50, 75, 100].map((value) => { const y = top + ((100 - value) / 100) * (height - top - bottom); return <g key={value}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#263449" strokeDasharray="3 5" /><text x={left - 8} y={y + 3} fill="#64748b" fontSize="10" textAnchor="end">{value}%</text></g>; })}
        {history.length > 1 && <><path d={buildPath(plannedPoints)} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6 5" />{history.length > 0 && <path d={buildPath(actualPoints)} fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />}</>}
        {history.map((point) => { const p = xy(point.date, point.plannedPercentage); const a = xy(point.date, point.actualPercentage); return <g key={`${point.date}:${point.actualPercentage}`}><circle cx={p.x} cy={p.y} r="3" fill="#60a5fa"><title>{dateLabel(point.date, language)} — planned {point.plannedPercentage}%</title></circle><circle cx={a.x} cy={a.y} r="4" fill="#67e8f9" stroke="#0b121d" strokeWidth="2"><title>{dateLabel(point.date, language)} — actual {point.actualPercentage}%</title></circle></g>; })}
        {axisDates.map((date) => { const p = xy(date, 0); return <text key={date} x={p.x} y={height - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">{dateLabel(date, language)}</text>; })}
      </svg></div>}
    </section>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5"><h3 className="mb-4 text-sm font-bold text-white">Milestone progress</h3><div className="space-y-3">{project.milestones.map((milestone) => <div key={milestone.id}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-slate-300">{milestone.title}</span><span className="shrink-0 text-slate-500">{milestone.status} · {milestone.completionPercentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${milestone.completionPercentage}%` }} /></div></div>)}</div>{project.milestones.length === 0 && <p className="text-xs text-slate-500">Milestones will appear when they are added to the project.</p>}</section>
      <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5"><h3 className="mb-4 text-sm font-bold text-white">Project timeline</h3><div className="grid grid-cols-3 gap-2 text-[10px]"><div><p className="text-slate-500">Start date</p><p className="mt-1 font-semibold text-slate-200">{dateLabel(project.startDate, language)}</p></div><div><p className="text-slate-500">Target deadline</p><p className="mt-1 font-semibold text-slate-200">{dateLabel(project.targetCompletionDate, language)}</p></div><div><p className="text-slate-500">Estimated completion</p><p className="mt-1 font-semibold text-cyan-200">{dateLabel(project.estimatedCompletionDate, language)}</p></div></div><div className="mt-6 h-2 rounded-full bg-slate-800" role="img" aria-label={`Calendar elapsed: ${elapsed ?? 0}%`}><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${elapsed ?? 0}%` }} /></div><div className="mt-4 flex flex-wrap gap-2">{project.tasks.map((task) => <span key={task.id} className={`rounded-lg border px-2.5 py-2 text-[10px] ${task.status === 'completed' ? 'border-emerald-800/60 bg-emerald-950/20 text-emerald-200' : 'border-slate-700 bg-slate-950/50 text-slate-300'}`}>{task.title} · {task.status}</span>)}</div></section>
    </div>
    <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5"><h3 className="mb-3 text-sm font-bold text-white">Recent project updates</h3>{project.updates.length ? <ul className="space-y-2">{project.updates.map((update) => <li key={update.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"><div className="flex flex-wrap justify-between gap-2"><h4 className="text-xs font-semibold text-slate-100">{update.title}</h4><time className="text-[10px] text-slate-500">{new Date(update.createdAt).toLocaleString()}</time></div><p className="mt-2 text-xs leading-relaxed text-slate-300">{update.body}</p></li>)}</ul> : <p className="text-xs text-slate-500">No project updates have been published yet.</p>}</section>
    {project.resources?.length > 0 && <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5"><h3 className="mb-3 text-sm font-bold text-white">Project resources</h3><div className="grid gap-3 sm:grid-cols-2">{project.resources.map((resource) => {
      const href = `${API_BASE_URL}/api/client-portal/projects/${project.id}/resources/${resource.id}/content`;
      return <article key={resource.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 p-3">
        {resource.resourceType === 'image' && <img src={href} alt={resource.title} loading="lazy" className="mb-2 max-h-64 w-full rounded-lg object-contain" />}
        {resource.resourceType === 'video' && <video controls preload="none" className="mb-2 max-h-64 w-full rounded-lg" src={href} />}
        <h4 className="text-xs font-semibold text-white">{resource.title}</h4>{resource.description && <p className="mt-1 text-[11px] text-slate-400">{resource.description}</p>}
        {resource.resourceType === 'link' ? <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Open resource</a> : <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">{resource.resourceType === 'document' ? resource.fileName || 'Download document' : 'Open media'}</a>}
      </article>;
    })}</div></section>}
  </section>;
};
