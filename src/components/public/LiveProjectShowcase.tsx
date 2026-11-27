import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  calculateElapsedPercentage,
  calculateCalendarDaysBetween,
  calculateRemainingCalendarDays,
  calculateWeightedProgress,
  getScheduleStatus,
  transformProgressHistory,
  getMilestoneStatus,
  getProjectDeliveryStatus,
  getRemainingWorkPercentage,
} from '../../lib/projectProgress';
import type { ClientMilestoneStatus } from '../../types/clientProjects';
import type { ClientPortalActions, ClientPortalProject } from './ClientProjectDashboard';
import { getClientProgressSeries } from '../../lib/clientProgressChart.js';
import { API_BASE_URL } from '../../lib/api';

const demoProject = {
  name: 'Digital Commerce Platform',
  startDate: '2026-10-06',
  originalDeadline: '2026-12-22',
  estimatedCompletionDate: '2026-12-29',
  actualCompletionDate: undefined as string | undefined,
};

const milestoneData = [
  { id: 'planning', weight: 10, completionPercentage: 100, dueDate: '2026-10-14' },
  { id: 'design', weight: 15, completionPercentage: 100, dueDate: '2026-10-28' },
  { id: 'frontend', weight: 25, completionPercentage: 70, dueDate: '2026-11-30' },
  { id: 'backend', weight: 25, completionPercentage: 55, dueDate: '2026-12-08', blocked: true },
  { id: 'testing', weight: 15, completionPercentage: 0, dueDate: '2026-12-17' },
  { id: 'delivery', weight: 10, completionPercentage: 0, dueDate: '2026-12-22' },
] as const;

const demoProgressHistory = [
  { date: '2026-10-06', plannedPercentage: 0, actualPercentage: 0 },
  { date: '2026-10-20', plannedPercentage: 21, actualPercentage: 15 },
  { date: '2026-11-03', plannedPercentage: 42, actualPercentage: 34 },
  { date: '2026-11-17', plannedPercentage: 63, actualPercentage: 50 },
  { date: '2026-11-23', plannedPercentage: 73, actualPercentage: 56.3 },
  { date: '2026-12-22', plannedPercentage: 100 },
] as const;
type TrendPeriod = 'daily' | 'weekly' | 'monthly';

const copy = {
  en: {
    eyebrow: 'A CLEAR VIEW OF EVERY PROJECT',
    title: 'Your Project. Full Transparency. Every Step of the Way.',
    description: 'See how a ZiyoTech project can move from first requirements to launch, with progress, milestones, and timing in one place.',
    explore: 'Explore Demo Project',
    fictional: 'Fictional demo • not live client data',
    project: 'Digital Commerce Platform',
    projectDesc: 'A fictional commerce platform with a custom storefront, operations tools, and payment integrations.',
    daysAfterTarget: 'days after target',
    completed: 'Work complete',
    remaining: 'Remaining work',
    estimate: 'Delivery forecast',
    schedule: 'Schedule status',
    atRisk: 'At risk',
    onTrack: 'On schedule',
    delayed: 'Past target',
    calendar: 'Calendar elapsed',
    timeline: 'Project timeline',
    phaseChart: 'Milestone completion',
    trend: 'Planned vs actual progress',
    rangeLabel: 'Chart time range',
    periods: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
    interval: { daily: 'Day', weekly: 'Week', monthly: 'Month' },
    trendNote: 'Illustrative demo curve, not historical project reporting.',
    planned: 'Planned',
    actual: 'Actual work',
    elapsedDays: 'Elapsed calendar days',
    remainingDays: 'Calendar days remaining',
    forecastNote: 'Illustrative forecast only; no task estimates are available.',
    due: 'Due',
    start: 'Start',
    target: 'Target delivery',
    now: 'Today',
    selectMilestone: 'Select a milestone to inspect its stage.',
    status: { completed: 'Complete', in_progress: 'In progress', blocked: 'Blocked', upcoming: 'Upcoming', delayed: 'Delayed' },
    phase: { planning: 'Planning & requirements', design: 'UI/UX design', frontend: 'Frontend development', backend: 'Backend development', testing: 'Testing & QA', delivery: 'Final delivery' },

  },
  ru: {
    eyebrow: 'ПРОЗРАЧНОСТЬ НА КАЖДОМ ЭТАПЕ',
    title: 'Ваш проект. Полная прозрачность. На каждом этапе.',
    description: 'Посмотрите, как проект ZiyoTech проходит путь от требований до запуска: прогресс, этапы и сроки собраны в одном месте.',
    explore: 'Открыть демо проекта',
    fictional: 'Вымышленное демо • не данные клиента',
    project: 'Платформа электронной торговли',
    projectDesc: 'Вымышленная торговая платформа с индивидуальным магазином, инструментами управления и платёжными интеграциями.',
    daysAfterTarget: 'дней позже цели',
    completed: 'Выполнено',
    remaining: 'Осталось',
    estimate: 'Прогноз сдачи',
    schedule: 'Сроки',
    atRisk: 'Риск срока',
    onTrack: 'По графику',
    delayed: 'Срок прошёл',
    calendar: 'Календарный срок',
    timeline: 'Этапы проекта',
    phaseChart: 'Выполнение этапов',
    trend: 'План и фактический прогресс',
    rangeLabel: 'Период графика',
    periods: { daily: 'По дням', weekly: 'По неделям', monthly: 'По месяцам' },
    interval: { daily: 'День', weekly: 'Неделя', monthly: 'Месяц' },
    trendNote: 'Иллюстративная демо-кривая, не история реального проекта.',
    planned: 'План',
    actual: 'Фактически',
    elapsedDays: 'Календарных дней прошло',
    remainingDays: 'Календарных дней осталось',
    forecastNote: 'Примерный прогноз; оценки задач не предоставлены.',
    due: 'Срок',
    start: 'Начало',
    target: 'Плановая сдача',
    now: 'Сегодня',
    selectMilestone: 'Выберите этап, чтобы посмотреть детали.',
    status: { completed: 'Завершён', in_progress: 'В работе', blocked: 'Заблокирован', upcoming: 'Предстоит', delayed: 'Задержка' },
    phase: { planning: 'Планирование и требования', design: 'UI/UX-дизайн', frontend: 'Frontend-разработка', backend: 'Backend-разработка', testing: 'Тестирование и QA', delivery: 'Финальная сдача' },

  },
  uz: {
    eyebrow: 'HAR BIR BOSQICHDA OCHIQ JARAYON',
    title: 'Loyihangiz. To‘liq shaffoflik. Har bir qadamda.',
    description: 'ZiyoTech loyihasi talablarni aniqlashdan ishga tushirishgacha qanday borishini kuzating: jarayon, bosqichlar va muddatlar bir joyda.',
    explore: 'Namunaviy loyihani ko‘rish',
    fictional: 'Xayoliy namuna • mijoz ma’lumotlari emas',
    project: 'Raqamli savdo platformasi',
    projectDesc: 'Maxsus do‘kon, boshqaruv vositalari va to‘lov integratsiyalariga ega xayoliy savdo platformasi.',
    daysAfterTarget: 'kun maqsad sanasidan keyin',
    completed: 'Bajarilgan',
    remaining: 'Qolgan ish',
    estimate: 'Topshirish prognozi',
    schedule: 'Muddat holati',
    atRisk: 'Muddat xavfi',
    onTrack: 'Reja bo‘yicha',
    delayed: 'Muddat o‘tgan',
    calendar: 'Kalendar vaqti',
    timeline: 'Loyiha bosqichlari',
    phaseChart: 'Bosqichlar bajarilishi',
    trend: 'Reja va haqiqiy jarayon',
    rangeLabel: 'Grafik davri',
    periods: { daily: 'Kunlik', weekly: 'Haftalik', monthly: 'Oylik' },
    interval: { daily: 'Kun', weekly: 'Hafta', monthly: 'Oy' },
    trendNote: 'Namunaviy demo chizig‘i, haqiqiy loyiha tarixi emas.',
    planned: 'Reja',
    actual: 'Haqiqiy ish',
    elapsedDays: 'O‘tgan kalendar kunlari',
    remainingDays: 'Qolgan kalendar kunlari',
    forecastNote: 'Faqat namunaviy prognoz; vazifa baholari mavjud emas.',
    due: 'Muddat',
    start: 'Boshlanishi',
    target: 'Topshirish maqsadi',
    now: 'Bugun',
    selectMilestone: 'Tafsilotlarni ko‘rish uchun bosqichni tanlang.',
    status: { completed: 'Yakunlangan', in_progress: 'Jarayonda', blocked: 'To‘xtatilgan', upcoming: 'Kutilmoqda', delayed: 'Kechikkan' },
    phase: { planning: 'Rejalashtirish va talablar', design: 'UI/UX dizayni', frontend: 'Frontend ishlab chiqish', backend: 'Backend ishlab chiqish', testing: 'Sinov va QA', delivery: 'Yakuniy topshirish' },

  },
} as const;

const locale = { en: 'en-US', ru: 'ru-RU', uz: 'uz-UZ' } as const;
const statusStyle: Record<ClientMilestoneStatus, string> = {
  completed: 'bg-emerald-400/10 text-emerald-300',
  in_progress: 'bg-cyan-300/10 text-cyan-200',
  upcoming: 'bg-slate-800 text-slate-400',
  delayed: 'bg-rose-400/10 text-rose-300',
  blocked: 'bg-amber-400/10 text-amber-200',
};

const portalLabels = {
  en: { historyUnavailable: 'No recorded progress history is available yet.', forecastUnavailable: 'Not available yet', unknown: 'Unavailable', authenticated: 'Authenticated client', company: 'Company', signOut: 'Sign out', chooseProject: 'Choose project', noProjects: 'No projects have been assigned to this company yet.' },
  ru: { historyUnavailable: 'История записей о прогрессе пока недоступна.', forecastUnavailable: 'Пока недоступно', unknown: 'Недоступно', authenticated: 'Вход клиента выполнен', company: 'Компания', signOut: 'Выйти', chooseProject: 'Выберите проект', noProjects: 'Этой компании пока не назначены проекты.' },
  uz: { historyUnavailable: 'Hali saqlangan jarayon tarixi mavjud emas.', forecastUnavailable: 'Hozircha mavjud emas', unknown: 'Mavjud emas', authenticated: 'Mijoz sifatida kirdingiz', company: 'Kompaniya', signOut: 'Chiqish', chooseProject: 'Loyihani tanlang', noProjects: 'Bu kompaniyaga hali loyihalar biriktirilmagan.' },
} as const;

function formatDate(value: string | undefined, language: keyof typeof locale) {
  if (!value || !Number.isFinite(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat(locale[language], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
}

function pointPosition(date: string, value: number, startDate: string, endDate: string) {
  const start = Date.parse(startDate + 'T00:00:00Z');
  const end = Date.parse(endDate + 'T00:00:00Z');
  const time = Date.parse(date + 'T00:00:00Z');
  return { x: 46 + Math.max(0, Math.min(1, (time - start) / (end - start))) * 620, y: 16 + ((100 - value) / 100) * 150 };
}

function linePath(points: readonly { date: string; value?: number }[], startDate: string, endDate: string) {
  return points.filter((point) => Number.isFinite(point.value)).map((point, index) => {
    const position = pointPosition(point.date, point.value as number, startDate, endDate);
    return (index === 0 ? 'M' : 'L') + position.x.toFixed(1) + ' ' + position.y.toFixed(1);
  }).join(' ');
}

export const LiveProjectShowcase: React.FC<{ onNavigate: (page: string) => void; clientAuthenticated?: boolean; clientProjects?: ClientPortalProject[]; clientCompanyName?: string; onClientLogout?: () => Promise<void>; clientActions?: ClientPortalActions }> = ({ onNavigate, clientAuthenticated = false, clientProjects, clientCompanyName, onClientLogout, clientActions }) => {
  const { language } = useLanguage();
  const labels = copy[language];
  const [now, setNow] = useState(() => new Date());
  const [period, setPeriod] = useState<TrendPeriod>('weekly');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('frontend');
  const [selectedPoint, setSelectedPoint] = useState(7);
  const [selectedProjectId, setSelectedProjectId] = useState(clientProjects?.[0]?.id || '');
  const [clientFeedback, setClientFeedback] = useState({ kind: 'feedback' as 'feedback' | 'revision_request', milestoneId: '', message: '' });
  const [approvalComments, setApprovalComments] = useState<Record<string, string>>({});
  const [clientActionError, setClientActionError] = useState('');
  const [clientActionNotice, setClientActionNotice] = useState('');
  const [clientActionBusy, setClientActionBusy] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; title: string } | null>(null);

  const clientProject = clientProjects?.find((project) => project.id === selectedProjectId) || clientProjects?.[0];
  const authenticated = clientAuthenticated && Boolean(clientProject);
  const startDate = authenticated ? clientProject?.startDate || '' : demoProject.startDate;
  const targetDate = authenticated ? clientProject?.targetCompletionDate || '' : demoProject.originalDeadline;
  const forecastDate = authenticated ? clientProject?.estimatedCompletionDate : demoProject.estimatedCompletionDate;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const milestones = useMemo(() => authenticated
    ? (clientProject?.milestones || []).map((item) => ({ ...item, status: item.status as ClientMilestoneStatus }))
    : milestoneData.map((item) => ({
      ...item,
      title: labels.phase[item.id as keyof typeof labels.phase],
      status: getMilestoneStatus(item, now) as ClientMilestoneStatus,
    })), [authenticated, clientProject, labels, now]);

  useEffect(() => {
    if (!milestones.some((milestone) => milestone.id === selectedMilestoneId)) setSelectedMilestoneId(milestones[0]?.id || '');
  }, [milestones, selectedMilestoneId]);
  useEffect(() => {
    if (!clientProjects?.some((project) => project.id === selectedProjectId)) setSelectedProjectId(clientProjects?.[0]?.id || '');
  }, [clientProjects, selectedProjectId]);

  const selectedMilestone = milestones.find((item) => item.id === selectedMilestoneId) || milestones[0];
  const progress = authenticated ? Number(clientProject?.progress.overallPercentage || 0) : calculateWeightedProgress(milestoneData);
  const remaining = getRemainingWorkPercentage(progress);
  const elapsed = startDate && targetDate ? calculateElapsedPercentage(startDate, targetDate, now) : null;
  const elapsedDays = startDate ? calculateCalendarDaysBetween(startDate, now) : null;
  const remainingDays = targetDate ? calculateRemainingCalendarDays(targetDate, now) : null;
  const chart = useMemo(() => authenticated && clientProject
    ? getClientProgressSeries(clientProject.progress.history, period, now)
    : transformProgressHistory({ history: demoProgressHistory, startDate: demoProject.startDate, endDate: demoProject.originalDeadline, now, period }), [authenticated, clientProject, now, period]);
  const safePoint = Math.min(selectedPoint, Math.max(0, chart.length - 1));
  const deliveryStatus = targetDate ? getProjectDeliveryStatus(targetDate, progress, now) : 'in_progress';
  const schedulePoints = authenticated && clientProject
    ? getClientProgressSeries(clientProject.progress.history, 'weekly', now)
    : transformProgressHistory({ history: demoProgressHistory, startDate: demoProject.startDate, endDate: demoProject.originalDeadline, now, period: 'weekly' });
  const schedulePoint = [...schedulePoints].reverse().find((point) => point.actualPercentage !== undefined);
  const scheduleStatus = schedulePoint ? getScheduleStatus(schedulePoint.plannedPercentage, schedulePoint.actualPercentage, targetDate, now) : 'unknown';
  const isAtRisk = scheduleStatus === 'at_risk';
  const chartStartDate = startDate || chart[0]?.date || demoProject.startDate;
  const rawChartEndDate = targetDate || chart[chart.length - 1]?.date || demoProject.originalDeadline;
  const chartEndDate = Date.parse(`${rawChartEndDate}T00:00:00Z`) <= Date.parse(`${chartStartDate}T00:00:00Z`)
    ? new Date(Date.parse(`${chartStartDate}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10)
    : rawChartEndDate;

  const openDemo = () => {
    document.getElementById('demo-project-dashboard')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
    setSelectedMilestoneId('frontend');
  };

  const submitClientFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clientProject || !clientActions || !clientFeedback.message.trim()) return;
    setClientActionBusy(true); setClientActionError(''); setClientActionNotice('');
    try {
      await clientActions.submitFeedback(clientProject.id, clientFeedback.kind, clientFeedback.message.trim(), clientFeedback.milestoneId || undefined);
      setClientFeedback((previous) => ({ ...previous, message: '' }));
      setClientActionNotice('Your feedback was sent securely.');
    } catch (error) { setClientActionError(error instanceof Error ? error.message : 'Feedback could not be sent.'); }
    finally { setClientActionBusy(false); }
  };

  const resolveClientApproval = async (approvalId: string, status: 'approved' | 'changes_requested') => {
    if (!clientActions) return;
    setClientActionBusy(true); setClientActionError(''); setClientActionNotice('');
    try {
      await clientActions.resolveApproval(approvalId, status, approvalComments[approvalId] || '');
      setClientActionNotice(status === 'approved' ? 'Milestone approval recorded.' : 'Your requested changes were sent.');
    } catch (error) { setClientActionError(error instanceof Error ? error.message : 'The response could not be saved.'); }
    finally { setClientActionBusy(false); }
  };

  if (clientAuthenticated && !clientProject) {
    return <section id="project-showcase" className="relative overflow-hidden py-12 sm:py-16 lg:py-20" aria-labelledby="live-project-title">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8"><h2 id="live-project-title" className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{labels.title}</h2></header>
        <article className="overflow-hidden rounded-3xl border border-slate-800 bg-[#080e17] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.48)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200">{portalLabels[language].authenticated}</p><p className="mt-2 text-sm text-cyan-200">{portalLabels[language].company}: {clientCompanyName}</p><p className="mt-3 text-sm text-slate-400">{portalLabels[language].noProjects}</p></div>{onClientLogout && <button type="button" onClick={() => void onClientLogout()} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white">{portalLabels[language].signOut}</button>}</div>
        </article>
      </div>
    </section>;
  }

  return (
    <section id="project-showcase" className="relative overflow-hidden py-12 sm:py-16 lg:py-20" aria-labelledby="live-project-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_5%,rgba(34,211,238,0.09),transparent_38%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col items-start justify-between gap-5 md:mb-10 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles aria-hidden="true" className="h-4 w-4" />{labels.eyebrow}
            </div>
            <h2 id="live-project-title" className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{labels.title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{labels.description}</p>
          </div>
      {!authenticated && <button type="button" onClick={openDemo} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/[0.08] px-4 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-200/60 hover:bg-cyan-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transition-none">
            {labels.explore}<ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>}
        </header>

        <article id="demo-project-dashboard" className="scroll-mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#080e17] shadow-[0_28px_80px_rgba(2,6,23,0.48)]">
          <div className="flex flex-col gap-4 border-b border-slate-800/80 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200"><Sparkles aria-hidden="true" className="h-5 w-5" /></div>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-base font-bold text-white sm:text-lg">{clientProject?.title || labels.project}</h3>
                  {authenticated
                    ? <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-200">{portalLabels[language].authenticated}</span>
                    : <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-200">{labels.fictional}</span>}
                </div>
                {authenticated && <p className="mt-1 text-xs font-medium text-cyan-200">{portalLabels[language].company}: {clientCompanyName}</p>}
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{clientProject?.description || labels.projectDesc}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(startDate || undefined, language)} — {formatDate(targetDate || undefined, language)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              {clientProjects && clientProjects.length > 1 && <label className="sr-only" htmlFor="authenticated-project-select">{portalLabels[language].chooseProject}</label>}
              {clientProjects && clientProjects.length > 1 && <select id="authenticated-project-select" value={clientProject?.id || ''} onChange={(event) => setSelectedProjectId(event.target.value)} className="max-w-56 rounded-lg border border-slate-700 bg-[#080e17] px-3 py-2 text-xs text-white">{clientProjects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select>}
              {authenticated && onClientLogout && <button type="button" onClick={() => void onClientLogout()} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white">{portalLabels[language].signOut}</button>}
              <span className={'h-2 w-2 rounded-full ' + (deliveryStatus === 'delayed' ? 'bg-rose-400' : 'bg-cyan-300')} />
              {clientProject?.status.replaceAll('_', ' ') || labels.status[deliveryStatus]}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-800/70 sm:grid-cols-4">
            <Metric label={labels.completed} value={progress.toFixed(1) + '%'} accent />
            <Metric label={labels.remaining} value={remaining.toFixed(1) + '%'} />
            <Metric label={labels.estimate} value={forecastDate ? formatDate(forecastDate, language) : authenticated ? portalLabels[language].forecastUnavailable : formatDate(demoProject.estimatedCompletionDate, language)} detail={labels.target + ': ' + formatDate(targetDate || undefined, language)} />
            <Metric label={labels.schedule} value={scheduleStatus === 'delayed' || deliveryStatus === 'delayed' ? labels.delayed : scheduleStatus === 'at_risk' ? labels.atRisk : scheduleStatus === 'on_track' ? labels.onTrack : scheduleStatus === 'completed' ? labels.status.completed : authenticated ? portalLabels[language].unknown : '—'} detail={labels.target} alert={isAtRisk || deliveryStatus === 'delayed'} />
          </div>

          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6 lg:p-7">
            <section className="min-w-0 rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5" aria-labelledby="project-timeline-title">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h4 id="project-timeline-title" className="text-sm font-bold text-white">{labels.timeline}</h4>
                  <p className="mt-1 text-[11px] text-slate-500">{labels.selectMilestone}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{labels.calendar}</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-cyan-200">{elapsed === null ? '—' : elapsed + '%'}</p>
                  <p className="mt-1 text-[10px] tabular-nums text-slate-500">{elapsedDays ?? '—'} {labels.elapsedDays}</p>
                  <p className="text-[10px] tabular-nums text-slate-500">{remainingDays ?? '—'} {labels.remainingDays}</p>
                </div>
              </div>
              <div className="relative space-y-1">
                <div className="absolute bottom-5 left-[5px] top-5 w-px bg-slate-800" />
                {milestones.map((milestone) => (
                  <button key={milestone.id} type="button" onClick={() => setSelectedMilestoneId(milestone.id)} aria-pressed={selectedMilestone?.id === milestone.id}
                    className={'relative grid w-full grid-cols-[12px_minmax(0,1fr)_auto] items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transition-none ' + (selectedMilestone?.id === milestone.id ? 'bg-slate-900/80' : '')}>
                    <span className={'relative z-10 mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-[#0b121d] ' + (milestone.status === 'completed' ? 'bg-emerald-300' : milestone.status === 'delayed' ? 'bg-rose-300' : milestone.status === 'blocked' ? 'bg-amber-300' : milestone.status === 'in_progress' ? 'bg-cyan-300' : 'bg-slate-600')} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-slate-200">{milestone.title}</span>
                      <span className="mt-1 block text-[10px] text-slate-500">{labels.due} {formatDate(milestone.dueDate, language)}</span>
                    </span>
                    <span className={'mt-0.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ' + statusStyle[milestone.status]}>{labels.status[milestone.status]}</span>
                  </button>
                ))}
                {authenticated && milestones.length === 0 && <p className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-500">{portalLabels[language].historyUnavailable}</p>}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                <span>{labels.start}: {formatDate(startDate || undefined, language)}</span>
                <span>{labels.target}: {formatDate(targetDate || undefined, language)}</span>
              </div>
              <div className="mt-4 border-t border-slate-800 pt-4">
                <div className="mb-4 flex justify-between gap-3 text-[10px] text-slate-500">
                  <span>{labels.start} · {formatDate(startDate || undefined, language)}</span>
                  <span>{labels.target} · {formatDate(targetDate || undefined, language)}</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-slate-800" role="img" aria-label={labels.calendar + ': ' + (elapsed === null ? '—' : elapsed + '%')}>
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: (elapsed === null ? 0 : elapsed) + '%' }} />
                  <span className="absolute -top-1.5 h-4 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]" style={{ left: 'clamp(0%, ' + (elapsed === null ? 0 : elapsed) + '%, 100%)' }} />
                  <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-cyan-200" style={{ left: 'clamp(0%, ' + (elapsed === null ? 0 : elapsed) + '%, 100%)' }}>{labels.now}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-[10px] text-slate-500">
                <span>{labels.estimate}: {forecastDate ? formatDate(forecastDate, language) : authenticated ? portalLabels[language].forecastUnavailable : formatDate(demoProject.estimatedCompletionDate, language)}</span>
                <span>{authenticated ? (forecastDate ? 'Administrator supplied estimate' : portalLabels[language].forecastUnavailable) : labels.forecastNote}</span>
              </div>
            </section>

            <div className="min-w-0 space-y-5">
              <ProgressTrend
                labels={labels}
                period={period}
                setPeriod={(next) => {
                  const nextChart = authenticated && clientProject
                    ? getClientProgressSeries(clientProject.progress.history, next, now)
                    : transformProgressHistory({ history: demoProgressHistory, startDate: demoProject.startDate, endDate: demoProject.originalDeadline, now, period: next });
                  setPeriod(next);
                  setSelectedPoint(Math.max(0, nextChart.reduce((last, point, index) => point.actualPercentage !== undefined ? index : last, 0)));
                }}
                chart={chart}
                selectedPoint={safePoint}
                onSelectPoint={setSelectedPoint}
                startDate={chartStartDate}
                endDate={chartEndDate}
                language={language}
                authenticated={authenticated}
              />

              <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5" aria-labelledby="milestone-chart-title">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h4 id="milestone-chart-title" className="text-sm font-bold text-white">{labels.phaseChart}</h4>
                  <span className="text-xs tabular-nums text-slate-400">{selectedMilestone?.completionPercentage ?? 0}%</span>
                </div>
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                      <button key={milestone.id} type="button" onClick={() => setSelectedMilestoneId(milestone.id)} aria-pressed={selectedMilestone?.id === milestone.id}
                      aria-label={milestone.title + ': ' + milestone.completionPercentage + '%, ' + labels.status[milestone.status]}
                      className="grid w-full grid-cols-[minmax(80px,0.9fr)_minmax(0,1.2fr)_auto_32px] items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:gap-3">
                      <span className="truncate text-[11px] text-slate-400">{milestone.title}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-slate-800"><span className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 motion-safe:transition-all motion-reduce:transition-none" style={{ width: milestone.completionPercentage + '%' }} /></span>
                      <span className={'rounded px-1.5 py-1 text-[9px] font-medium ' + statusStyle[milestone.status]}>{labels.status[milestone.status]}</span>
                      <span className="text-right text-[10px] tabular-nums text-slate-300">{milestone.completionPercentage}%</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </article>
        {authenticated && clientProject && <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5" aria-labelledby="client-stage-title">
            <h3 id="client-stage-title" className="text-sm font-bold text-white">Development stages</h3>
            <ol className="mt-4 space-y-3">{(clientProject.stages || []).map((stage) => <li key={stage.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-200">{stage.title}</span><span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-cyan-200">{stage.status.replaceAll('_', ' ')}</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${stage.completionPercentage}%` }} /></div>
              <p className="mt-2 text-[10px] text-slate-500">{stage.completionPercentage}% · {formatDate(stage.startDate, language)} – {formatDate(stage.dueDate, language)}</p>
            </li>)}</ol>
            {(clientProject.stages || []).length === 0 && <p className="mt-3 text-xs text-slate-500">Development stages will appear when they are published.</p>}
            <p className="mt-4 border-t border-slate-800 pt-3 text-[10px] text-slate-500">Tasks: {clientProject.progress.completedTaskCount ?? clientProject.tasks.filter((task) => task.status === 'completed').length} completed · {clientProject.progress.remainingTaskCount ?? clientProject.tasks.filter((task) => task.status !== 'completed').length} remaining · {clientProject.progress.overdueMilestoneCount ?? 0} overdue milestones</p>
          </section>
          <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5" aria-labelledby="client-feedback-title">
            <h3 id="client-feedback-title" className="text-sm font-bold text-white">Feedback and milestone approvals</h3>
            {(clientProject.approvals || []).filter((approval) => approval.status === 'pending').map((approval) => {
              const milestone = clientProject.milestones.find((item) => item.id === approval.milestoneId);
              return <div key={approval.id} className="mt-3 rounded-xl border border-amber-900/50 bg-amber-950/10 p-3">
                <p className="text-xs font-semibold text-amber-100">Milestone approval · {milestone?.title || 'Project milestone'}</p>
                <label className="mt-2 block"><span className="sr-only">Optional approval comment</span><textarea maxLength={3000} value={approvalComments[approval.id] || ''} onChange={(event) => setApprovalComments((previous) => ({ ...previous, [approval.id]: event.target.value }))} rows={2} placeholder="Optional comment or requested changes" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500" /></label>
                <div className="mt-2 flex flex-wrap gap-2"><button type="button" disabled={clientActionBusy} onClick={() => void resolveClientApproval(approval.id, 'approved')} className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">Approve milestone</button><button type="button" disabled={clientActionBusy} onClick={() => void resolveClientApproval(approval.id, 'changes_requested')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 disabled:opacity-50">Request changes</button></div>
              </div>;
            })}
            {(clientProject.approvals || []).filter((approval) => approval.status !== 'pending').map((approval) => <p key={approval.id} className="mt-2 text-[10px] text-slate-500">{clientProject.milestones.find((item) => item.id === approval.milestoneId)?.title || 'Milestone'} · {approval.status.replaceAll('_', ' ')}</p>)}
            <form onSubmit={(event) => void submitClientFeedback(event)} className="mt-4 space-y-2 border-t border-slate-800 pt-4">
              <label className="block text-[10px] font-semibold text-slate-400">Send feedback or request a revision<select value={clientFeedback.kind} onChange={(event) => setClientFeedback((previous) => ({ ...previous, kind: event.target.value as 'feedback' | 'revision_request' }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"><option value="feedback">Feedback</option><option value="revision_request">Request revision</option></select></label>
              <label className="block text-[10px] font-semibold text-slate-400">Related milestone (optional)<select value={clientFeedback.milestoneId} onChange={(event) => setClientFeedback((previous) => ({ ...previous, milestoneId: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"><option value="">General project feedback</option>{clientProject.milestones.map((milestone) => <option key={milestone.id} value={milestone.id}>{milestone.title}</option>)}</select></label>
              <label className="block text-[10px] font-semibold text-slate-400">Message<textarea required maxLength={5000} value={clientFeedback.message} onChange={(event) => setClientFeedback((previous) => ({ ...previous, message: event.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" /></label>
              <button type="submit" disabled={clientActionBusy || !clientActions} className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">Send message</button>
            </form>
            {clientActionError && <p role="alert" className="mt-2 text-xs text-rose-300">{clientActionError}</p>}{clientActionNotice && <p role="status" className="mt-2 text-xs text-emerald-300">{clientActionNotice}</p>}
            <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">{(clientProject.feedback || []).map((entry) => <article key={entry.id} className="rounded-lg bg-slate-950/50 p-3"><div className="flex justify-between gap-2 text-[10px] text-slate-500"><span>{entry.kind === 'revision_request' ? 'Revision request' : 'Feedback'} · {entry.status.replaceAll('_', ' ')}</span><time>{new Date(entry.createdAt).toLocaleDateString()}</time></div><p className="mt-2 whitespace-pre-wrap text-xs text-slate-300">{entry.message}</p>{entry.adminResponse && <p className="mt-2 border-l-2 border-cyan-700 pl-2 text-xs text-cyan-100">ZiyoTech: {entry.adminResponse}</p>}</article>)}</div>
          </section>
          {clientProject.resources?.length > 0 && <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5 lg:col-span-2" aria-labelledby="client-resources-title">
            <h3 id="client-resources-title" className="text-sm font-bold text-white">Project gallery and links</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{clientProject.resources.map((resource) => {
              const href = `${API_BASE_URL}/api/client-portal/projects/${clientProject.id}/resources/${resource.id}/content`;
              return <article key={resource.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                {resource.resourceType === 'image' && <button type="button" className="block w-full" aria-label={`View ${resource.title}`} onClick={() => setMediaPreview({ url: href, title: resource.title })}><img src={href} alt={resource.title} loading="lazy" className="mb-2 max-h-56 w-full rounded-lg object-contain" /></button>}
                {resource.resourceType === 'video' && <video controls preload="none" className="mb-2 max-h-56 w-full rounded-lg" src={href} />}
                <p className="text-xs font-semibold text-white">{resource.title}</p>{resource.description && <p className="mt-1 text-[10px] text-slate-400">{resource.description}</p>}
                {resource.resourceType === 'link' ? <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Open secure project link</a> : <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Open or download</a>}
              </article>;
            })}</div>
          </section>}
          {clientProject.updates.length > 0 && <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5 lg:col-span-2" aria-labelledby="client-updates-title"><h3 id="client-updates-title" className="text-sm font-bold text-white">Project updates</h3><ol className="mt-3 space-y-2">{clientProject.updates.map((update) => <li key={update.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"><div className="flex flex-wrap justify-between gap-2"><h4 className="text-xs font-semibold text-white">{update.title}</h4><time className="text-[10px] text-slate-500">{new Date(update.createdAt).toLocaleString()}</time></div>{update.stageTitle && <p className="mt-1 text-[10px] text-cyan-300">{update.stageTitle}</p>}<p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{update.body}</p>{update.resources?.length ? <div className="mt-2 flex flex-wrap gap-2">{update.resources.map((resource) => <span key={resource.id} className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{resource.title}</span>)}</div> : null}</li>)}</ol></section>}
          {clientProject.activity?.length ? <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5 lg:col-span-2"><h3 className="text-sm font-bold text-white">Recent project activity</h3><ol className="mt-3 space-y-2">{clientProject.activity.slice(0, 10).map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 text-[10px] text-slate-400"><span>{item.eventType.replaceAll('_', ' ')}</span><time>{new Date(item.createdAt).toLocaleString()}</time></li>)}</ol></section> : null}
        </div>}
        {mediaPreview && <div role="dialog" aria-modal="true" aria-label={mediaPreview.title} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setMediaPreview(null)}><button type="button" className="absolute right-5 top-5 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => setMediaPreview(null)}>Close</button><img src={mediaPreview.url} alt={mediaPreview.title} className="max-h-[90vh] max-w-[95vw] object-contain" onClick={(event) => event.stopPropagation()} /></div>}
      </div>
    </section>
  );
};

function Metric({ label, value, detail, accent = false, alert = false }: { label: string; value: string; detail?: string; accent?: boolean; alert?: boolean }) {
  return <div className="min-w-0 bg-[#0b121d] px-4 py-4 sm:px-5 sm:py-5">
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    <p className={'mt-2 truncate text-lg font-bold leading-tight sm:text-xl ' + (alert ? 'text-amber-200' : accent ? 'text-cyan-200' : 'text-white')}>{value}</p>
    {detail && <p className="mt-1 truncate text-[10px] text-slate-500">{detail}</p>}
  </div>;
}

function ProgressTrend({ labels, period, setPeriod, chart, selectedPoint, onSelectPoint, startDate, endDate, language, authenticated }: {
  labels: (typeof copy)[keyof typeof copy];
  period: TrendPeriod;
  setPeriod: (period: TrendPeriod) => void;
  chart: Array<{ date: string; plannedPercentage?: number; actualPercentage?: number }>;
  selectedPoint: number;
  onSelectPoint: (point: number) => void;
  startDate: string;
  endDate: string;
  language: keyof typeof locale;
  authenticated: boolean;
}) {
  const views: TrendPeriod[] = ['daily', 'weekly', 'monthly'];
  const selected = chart[selectedPoint];
  const plannedPoints = chart.map((point) => ({ date: point.date, value: point.plannedPercentage }));
  const actualPoints = chart.map((point) => ({ date: point.date, value: point.actualPercentage }));
  const plannedPath = linePath(plannedPoints, startDate, endDate);
  const actualPath = linePath(actualPoints, startDate, endDate);
  const xLabels = chart.filter((_, index) => index === 0 || index === Math.floor((chart.length - 1) / 2) || index === chart.length - 1);

  return <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5" aria-labelledby="progress-trend-title">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <h4 id="progress-trend-title" className="text-sm font-bold text-white">{labels.trend}</h4>
      <div className="inline-flex self-start rounded-lg border border-slate-800 bg-slate-950/70 p-1" role="group" aria-label={labels.rangeLabel}>
        {views.map((view) => <button key={view} type="button" onClick={() => setPeriod(view)} aria-pressed={period === view}
          className={'rounded-md px-2.5 py-1.5 text-[10px] font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transition-none ' + (period === view ? 'bg-cyan-300 text-slate-950' : 'text-slate-400 hover:text-white')}>{labels.periods[view]}</button>)}
      </div>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-400">
      <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-blue-400" />{labels.planned}</span>
      <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-cyan-300" />{labels.actual}</span>
      <span className="text-slate-500">{authenticated ? 'Recorded project progress only.' : labels.trendNote}</span>
    </div>
    {authenticated && chart.length === 0
      ? <p className="py-12 text-center text-xs text-slate-500">{portalLabels[language].historyUnavailable}</p>
      : <div className="mt-2 overflow-x-auto">
      <svg viewBox="0 0 700 210" className="block h-auto min-w-[500px] w-full" role="group" aria-label={labels.trend}>
        {[0, 25, 50, 75, 100].map((value) => {
          const y = 16 + ((100 - value) / 100) * 150;
          return <g key={value}><line x1="46" x2="666" y1={y} y2={y} stroke="#253244" strokeDasharray="3 5" /><text x="35" y={y + 3} fill="#64748b" fontSize="9" textAnchor="end">{value}%</text></g>;
        })}
        <path d={plannedPath} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={actualPath} fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {chart.map((point, index) => {
          const planned = Number.isFinite(point.plannedPercentage) ? pointPosition(point.date, point.plannedPercentage as number, startDate, endDate) : null;
          const actual = Number.isFinite(point.actualPercentage) ? pointPosition(point.date, point.actualPercentage as number, startDate, endDate) : null;
          const label = formatDate(point.date, language);
          return <g key={point.date}>
            {planned && <circle cx={planned.x} cy={planned.y} r="3" fill="#60a5fa"><title>{labels.planned}: {point.plannedPercentage}% · {label}</title></circle>}
            {actual && <circle cx={actual.x} cy={actual.y} r={selectedPoint === index ? 5 : 3.5} fill="#67e8f9" stroke="#0b121d" strokeWidth="2"
              role="button" tabIndex={0} aria-label={label + ': ' + labels.planned + ' ' + point.plannedPercentage + '%, ' + labels.actual + ' ' + point.actualPercentage + '%'}
              onMouseEnter={() => onSelectPoint(index)} onFocus={() => onSelectPoint(index)} onClick={() => onSelectPoint(index)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectPoint(index); } }}><title>{labels.actual}: {point.actualPercentage}% · {label}</title></circle>}
          </g>;
        })}
        {xLabels.map((point) => {
          const x = pointPosition(point.date, 0, startDate, endDate).x;
          return <text key={point.date} x={x} y="190" fill="#94a3b8" fontSize="9" textAnchor="middle">{formatDate(point.date, language)}</text>;
        })}
      </svg>
    </div>}
    {(!authenticated || chart.length > 0) && <div className="mt-1 flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-3 py-2 text-[11px]" aria-live="polite">
      <span className="text-slate-300">{selected ? formatDate(selected.date, language) : '—'}</span>
      <span className="text-blue-300">{labels.planned} <strong className="tabular-nums text-blue-100">{selected?.plannedPercentage ?? '—'}%</strong></span>
      <span className="text-cyan-300">{labels.actual} <strong className="tabular-nums text-cyan-100">{selected?.actualPercentage ?? '—'}%</strong></span>
    </div>}
  </section>;
}
