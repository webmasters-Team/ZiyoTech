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

export const LiveProjectShowcase: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const labels = copy[language];
  const [now, setNow] = useState(() => new Date());
  const [period, setPeriod] = useState<TrendPeriod>('weekly');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('frontend');
  const [selectedPoint, setSelectedPoint] = useState(7);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const milestones = useMemo(() => milestoneData.map((item) => ({
    ...item,
    title: labels.phase[item.id as keyof typeof labels.phase],
    status: getMilestoneStatus(item, now) as ClientMilestoneStatus,
  })), [labels, now]);

  const selectedMilestone = milestones.find((item) => item.id === selectedMilestoneId) || milestones[0];
  const progress = calculateWeightedProgress(milestoneData);
  const remaining = getRemainingWorkPercentage(progress);
  const elapsed = calculateElapsedPercentage(demoProject.startDate, demoProject.originalDeadline, now);
  const elapsedDays = calculateCalendarDaysBetween(demoProject.startDate, now);
  const remainingDays = calculateRemainingCalendarDays(demoProject.originalDeadline, now);
  const chart = useMemo(() => transformProgressHistory({ history: demoProgressHistory, startDate: demoProject.startDate, endDate: demoProject.originalDeadline, now, period }), [now, period]);
  const safePoint = Math.min(selectedPoint, Math.max(0, chart.length - 1));
  const deliveryStatus = getProjectDeliveryStatus(demoProject.originalDeadline, progress, now);
  const schedulePoints = transformProgressHistory({ history: demoProgressHistory, startDate: demoProject.startDate, endDate: demoProject.originalDeadline, now, period: 'weekly' });
  const schedulePoint = [...schedulePoints].reverse().find((point) => point.actualPercentage !== undefined);
  const scheduleStatus = getScheduleStatus(schedulePoint?.plannedPercentage, schedulePoint?.actualPercentage, demoProject.originalDeadline, now);
  const isAtRisk = scheduleStatus === 'at_risk';

  const openDemo = () => {
    document.getElementById('demo-project-dashboard')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
    setSelectedMilestoneId('frontend');
  };

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
          <button type="button" onClick={openDemo} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/[0.08] px-4 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-200/60 hover:bg-cyan-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transition-none">
            {labels.explore}<ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>

        <article id="demo-project-dashboard" className="scroll-mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#080e17] shadow-[0_28px_80px_rgba(2,6,23,0.48)]">
          <div className="flex flex-col gap-4 border-b border-slate-800/80 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200"><Sparkles aria-hidden="true" className="h-5 w-5" /></div>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-base font-bold text-white sm:text-lg">{labels.project}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-200">{labels.fictional}</span>
                </div>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{labels.projectDesc}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(demoProject.startDate, language)} — {formatDate(demoProject.originalDeadline, language)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className={'h-2 w-2 rounded-full ' + (deliveryStatus === 'delayed' ? 'bg-rose-400' : 'bg-cyan-300')} />
              {labels.status[deliveryStatus]}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-800/70 sm:grid-cols-4">
            <Metric label={labels.completed} value={progress.toFixed(1) + '%'} accent />
            <Metric label={labels.remaining} value={remaining.toFixed(1) + '%'} />
            <Metric label={labels.estimate} value={formatDate(demoProject.estimatedCompletionDate, language)} detail={labels.target + ': ' + formatDate(demoProject.originalDeadline, language)} />
            <Metric label={labels.schedule} value={scheduleStatus === 'delayed' || deliveryStatus === 'delayed' ? labels.delayed : scheduleStatus === 'at_risk' ? labels.atRisk : scheduleStatus === 'on_track' ? labels.onTrack : '—'} detail={labels.target} alert={isAtRisk || deliveryStatus === 'delayed'} />
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
                  <button key={milestone.id} type="button" onClick={() => setSelectedMilestoneId(milestone.id)} aria-pressed={selectedMilestone.id === milestone.id}
                    className={'relative grid w-full grid-cols-[12px_minmax(0,1fr)_auto] items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transition-none ' + (selectedMilestone.id === milestone.id ? 'bg-slate-900/80' : '')}>
                    <span className={'relative z-10 mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-[#0b121d] ' + (milestone.status === 'completed' ? 'bg-emerald-300' : milestone.status === 'delayed' ? 'bg-rose-300' : milestone.status === 'blocked' ? 'bg-amber-300' : milestone.status === 'in_progress' ? 'bg-cyan-300' : 'bg-slate-600')} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-slate-200">{milestone.title}</span>
                      <span className="mt-1 block text-[10px] text-slate-500">{labels.due} {formatDate(milestone.dueDate, language)}</span>
                    </span>
                    <span className={'mt-0.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ' + statusStyle[milestone.status]}>{labels.status[milestone.status]}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                <span>{labels.start}: {formatDate(demoProject.startDate, language)}</span>
                <span>{labels.target}: {formatDate(demoProject.originalDeadline, language)}</span>
              </div>
              <div className="mt-4 border-t border-slate-800 pt-4">
                <div className="mb-4 flex justify-between gap-3 text-[10px] text-slate-500">
                  <span>{labels.start} · {formatDate(demoProject.startDate, language)}</span>
                  <span>{labels.target} · {formatDate(demoProject.originalDeadline, language)}</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-slate-800" role="img" aria-label={labels.calendar + ': ' + (elapsed === null ? '—' : elapsed + '%')}>
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: (elapsed === null ? 0 : elapsed) + '%' }} />
                  <span className="absolute -top-1.5 h-4 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]" style={{ left: 'clamp(0%, ' + (elapsed === null ? 0 : elapsed) + '%, 100%)' }} />
                  <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-cyan-200" style={{ left: 'clamp(0%, ' + (elapsed === null ? 0 : elapsed) + '%, 100%)' }}>{labels.now}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-2 text-[10px] text-slate-500">
                <span>{labels.estimate}: {formatDate(demoProject.estimatedCompletionDate, language)}</span>
                <span>{labels.forecastNote}</span>
              </div>
            </section>

            <div className="min-w-0 space-y-5">
              <ProgressTrend
                labels={labels}
                period={period}
                setPeriod={(next) => {
                  const nextChart = transformProgressHistory({ history: demoProgressHistory, startDate: demoProject.startDate, endDate: demoProject.originalDeadline, now, period: next });
                  setPeriod(next);
                  setSelectedPoint(Math.max(0, nextChart.reduce((last, point, index) => point.actualPercentage !== undefined ? index : last, 0)));
                }}
                chart={chart}
                selectedPoint={safePoint}
                onSelectPoint={setSelectedPoint}
                startDate={demoProject.startDate}
                endDate={demoProject.originalDeadline}
                language={language}
              />

              <section className="rounded-2xl border border-slate-800 bg-[#0b121d] p-4 sm:p-5" aria-labelledby="milestone-chart-title">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h4 id="milestone-chart-title" className="text-sm font-bold text-white">{labels.phaseChart}</h4>
                  <span className="text-xs tabular-nums text-slate-400">{selectedMilestone.completionPercentage}%</span>
                </div>
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <button key={milestone.id} type="button" onClick={() => setSelectedMilestoneId(milestone.id)} aria-pressed={selectedMilestone.id === milestone.id}
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

function ProgressTrend({ labels, period, setPeriod, chart, selectedPoint, onSelectPoint, startDate, endDate, language }: {
  labels: (typeof copy)[keyof typeof copy];
  period: TrendPeriod;
  setPeriod: (period: TrendPeriod) => void;
  chart: ReturnType<typeof transformProgressHistory>;
  selectedPoint: number;
  onSelectPoint: (point: number) => void;
  startDate: string;
  endDate: string;
  language: keyof typeof locale;
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
      <span className="text-slate-500">{labels.trendNote}</span>
    </div>
    <div className="mt-2 overflow-x-auto">
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
    </div>
    <div className="mt-1 flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-3 py-2 text-[11px]" aria-live="polite">
      <span className="text-slate-300">{selected ? formatDate(selected.date, language) : '—'}</span>
      <span className="text-blue-300">{labels.planned} <strong className="tabular-nums text-blue-100">{selected?.plannedPercentage ?? '—'}%</strong></span>
      <span className="text-cyan-300">{labels.actual} <strong className="tabular-nums text-cyan-100">{selected?.actualPercentage ?? '—'}%</strong></span>
    </div>
  </section>;
}
