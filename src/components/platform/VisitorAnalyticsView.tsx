import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, ChevronLeft, ChevronRight, Clock3, Globe2, Monitor, RefreshCw, Search, Users, UserRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AnalyticsCharts, type AnalyticsChartsData } from './AnalyticsCharts';

const API_BASE = (import.meta.env.VITE_ASSISTANT_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')).replace(/\/+$/, '');
type Section = 'overview' | 'guests' | 'users';
type Overview = {
  totals: {
    automaticGuestVisits: number; guestVisitors: number; registeredAccounts: number; totalUniqueVisitors: number; totalVisits: number; guestVisits: number; authenticatedVisits: number;
    activeGuests: number; activeRegisteredUsers: number; activeVisitors: number; activeSessions: number; averageGuestDurationSeconds: number;
    averageAuthenticatedDurationSeconds: number; averageSessionDurationSeconds: number; pageViews: number; measuredActiveSeconds: number;
  };
  definitions: Record<string, string>;
};
type Guest = {
  visitor_number: number; label: string; first_visit_at: string; last_seen_at: string; device_category: string;
  browser_category: string; referral_source: string | null; country_code: string | null; visits: number;
  total_active_seconds: number; average_visit_seconds: number | null; is_active: number; last_page: string | null;
};
type RegisteredUser = {
  id: string; name: string; email: string; photoUrl: string | null; authProvider: string; registeredAt: string;
  lastSignIn: string | null; visits: number; totalActiveSeconds: number; averageVisitSeconds: number | null;
  lastActivity: string | null; isActive: number;
};
type ActivityDetail = {
  account?: RegisteredUser;
  visitor?: { label: string; firstVisitAt: string; lastSeenAt: string; deviceCategory: string; browserCategory: string; referralSource: string | null; countryCode: string | null };
  sessions: Array<{ session_id: string; startedAt: string; lastSeenAt: string; endedAt: string | null; activeSeconds: number; isCurrent: number; pageHistory: string | null }>;
};
type PageData<T> = { items: T[]; total: number; page: number; pageSize: number };
type RecentActivity = { type: 'guest' | 'registered'; displayName: string; startedAt: string; lastActivity: string; activeSeconds: number; pagePath: string | null; isActive: boolean };
type AnalyticsRange = '24h' | '7d' | '30d' | 'custom';

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, { credentials: 'include', signal, cache: 'no-store' });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('ziyotech-admin-session-expired'));
    const error = new Error(body.error || 'Visitor analytics could not be loaded.') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return body as T;
}

function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleString();
}

export const VisitorAnalyticsView: React.FC = () => {
  const { language } = useLanguage();
  const [section, setSection] = useState<Section>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [guests, setGuests] = useState<PageData<Guest> | null>(null);
  const [users, setUsers] = useState<PageData<RegisteredUser> | null>(null);
  const [recent, setRecent] = useState<RecentActivity[] | null>(null);
  const [charts, setCharts] = useState<AnalyticsChartsData | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRange>('24h');
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [detailTarget, setDetailTarget] = useState<{ type: 'guest'; visitorNumber: number } | { type: 'user'; id: string } | null>(null);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [accessRequired, setAccessRequired] = useState(false);
  const activeRequestRef = useRef<AbortController | null>(null);
  const requestSequenceRef = useRef(0);
  const inFlightRef = useRef(false);
  const queryKeyRef = useRef('');

  const labels = language === 'ru'
    ? { title: 'Аналитика посетителей', subtitle: 'Анонимные гости и зарегистрированные пользователи учитываются отдельно.', overview: 'Обзор', guests: 'Гости', users: 'Зарегистрированные пользователи', guestVisitors: 'Гости', accounts: 'Аккаунты', totalVisits: 'Всего визитов', guestVisits: 'Визиты гостей', authVisits: 'Авторизованные визиты', activeGuests: 'Активные гости', activeUsers: 'Активные пользователи', avgGuest: 'Среднее время гостя', avgUser: 'Среднее время пользователя', pageViews: 'Просмотры страниц', measured: 'Измеренное активное время', search: 'Поиск', from: 'С даты', to: 'По дату', status: 'Статус', active: 'Активен', inactive: 'Неактивен', device: 'Устройство', browser: 'Браузер', location: 'Страна', referral: 'Источник', visits: 'Визиты', totalTime: 'Всего времени', averageTime: 'Средний визит', firstVisit: 'Первый визит', lastSignIn: 'Последний вход', lastActivity: 'Последняя активность', registration: 'Регистрация', provider: 'Вход через', pages: 'История страниц', currentSession: 'Текущий сеанс', noData: 'Пока нет данных аналитики.', noActivity: 'Нет активности', access: 'Войдите в аккаунт с ролью администратора, назначенной в базе пользователей, чтобы просматривать аналитику.', previous: 'Назад', next: 'Далее', timeNote: 'Активное время оценивается по видимости вкладки и недавней активности; это не точное измерение внимания.' }
    : language === 'en'
      ? { title: 'Visitor Analytics', subtitle: 'Anonymous guests and registered users are measured separately.', overview: 'Overview', guests: 'Guest Visitors', users: 'Registered Users', guestVisitors: 'Guest visitors', accounts: 'Registered accounts', totalVisits: 'Total visits', guestVisits: 'Guest visits', authVisits: 'Authenticated visits', activeGuests: 'Active guests', activeUsers: 'Active registered users', avgGuest: 'Average guest visit', avgUser: 'Average authenticated visit', pageViews: 'Page views', measured: 'Measured active time', search: 'Search', from: 'From', to: 'To', status: 'Status', active: 'Active', inactive: 'Inactive', device: 'Device', browser: 'Browser', location: 'Country', referral: 'Referral', visits: 'Visits', totalTime: 'Total time', averageTime: 'Average visit', firstVisit: 'First visit', lastSignIn: 'Last sign-in', lastActivity: 'Last activity', registration: 'Registered', provider: 'Provider', pages: 'Page history', currentSession: 'Current session', noData: 'No analytics data yet.', noActivity: 'No tracked activity', access: 'Sign in to an account with the administrator role provisioned in the user database to view analytics.', previous: 'Previous', next: 'Next', timeNote: 'Active time is estimated from tab visibility and recent activity; it is not an exact measure of attention.' }
      : { title: 'Tashriflar tahlili', subtitle: 'Anonim mehmonlar va ro‘yxatdan o‘tgan foydalanuvchilar alohida hisoblanadi.', overview: 'Umumiy', guests: 'Mehmonlar', users: 'Ro‘yxatdan o‘tganlar', guestVisitors: 'Mehmonlar', accounts: 'Hisoblar', totalVisits: 'Jami tashriflar', guestVisits: 'Mehmon tashriflari', authVisits: 'Tasdiqlangan tashriflar', activeGuests: 'Faol mehmonlar', activeUsers: 'Faol foydalanuvchilar', avgGuest: 'Mehmon tashrifining o‘rtachasi', avgUser: 'Foydalanuvchi tashrifining o‘rtachasi', pageViews: 'Sahifa ko‘rishlari', measured: 'O‘lchangan faol vaqt', search: 'Qidirish', from: 'Boshlanish', to: 'Tugash', status: 'Holat', active: 'Faol', inactive: 'Faol emas', device: 'Qurilma', browser: 'Brauzer', location: 'Davlat', referral: 'Manba', visits: 'Tashriflar', totalTime: 'Jami vaqt', averageTime: 'O‘rtacha tashrif', firstVisit: 'Birinchi tashrif', lastSignIn: 'Oxirgi kirish', lastActivity: 'Oxirgi faollik', registration: 'Ro‘yxatdan o‘tgan', provider: 'Kirish usuli', pages: 'Sahifalar tarixi', currentSession: 'Joriy seans', noData: 'Hozircha tahlil ma’lumotlari yo‘q.', noActivity: 'Faollik qayd etilmagan', access: 'Tahlilni ko‘rish uchun foydalanuvchilar bazasida administrator roli berilgan hisobga kiring.', previous: 'Oldingi', next: 'Keyingi', timeNote: 'Faol vaqt sahifa ko‘rinishi va yaqindagi faollik asosida taxmin qilinadi; bu diqqatning aniq o‘lchovi emas.' };

  const liveCopy = language === 'ru'
    ? { updated: 'Обновлено', recent: 'Недавняя активность', loading: 'Загрузка аналитики…' }
    : language === 'en'
      ? { updated: 'Updated', recent: 'Recent activity', loading: 'Loading analytics…' }
      : { updated: 'Yangilandi', recent: 'So‘nggi faollik', loading: 'Tahlil yuklanmoqda…' };

  const metricCopy = language === 'ru'
    ? { unique: 'Уникальные посетители', active: 'Активные посетители', average: 'Средняя длительность сеанса', range: 'Период', hours: 'Последние 24 часа', days7: 'Последние 7 дней', days30: 'Последние 30 дней', custom: 'Выбрать даты' }
    : language === 'uz'
      ? { unique: 'Noyob tashrifchilar', active: 'Faol tashrifchilar', average: 'O‘rtacha seans davomiyligi', range: 'Davr', hours: 'So‘nggi 24 soat', days7: 'So‘nggi 7 kun', days30: 'So‘nggi 30 kun', custom: 'Sanani tanlash' }
      : { unique: 'Unique visitors', active: 'Active visitors', average: 'Average session duration', range: 'Date range', hours: 'Last 24 hours', days7: 'Last 7 days', days30: 'Last 30 days', custom: 'Custom dates' };

  const visitMetricCopy = language === 'ru'
    ? { automatic: 'Автоматические гостевые визиты', uniqueTracked: 'Уникальные отслеживаемые посетители (с согласия)', uniqueGuests: 'Уникальные гости (с согласия)', pageViews: 'Просмотры страниц (с согласия)', guestSessions: 'Сеансы гостей (с согласия)', note: 'Примерный почасовой подсчет новых открытий публичного сайта. Люди не идентифицируются; перезагрузка и переходы внутри сайта не учитываются. Разные вкладки могут считаться отдельно.', trackedSessions: 'Отслеживаемые визиты (сеансы с согласия)' }
    : language === 'uz'
      ? { automatic: 'Avtomatik mehmon tashriflari', uniqueTracked: 'Noyob kuzatilgan tashrifchilar (rozilik asosida)', uniqueGuests: 'Noyob mehmonlar (rozilik asosida)', pageViews: 'Sahifa ko‘rishlari (rozilik asosida)', guestSessions: 'Mehmon seanslari (rozilik asosida)', note: 'Ommaviy saytning yangi ochilishlari taxminan soatlik hisoblanadi. Shaxs aniqlanmaydi; qayta yuklash va sayt ichidagi o‘tishlar sanalmaydi. Alohida tablar alohida sanalishi mumkin.', trackedSessions: 'Kuzatilgan tashriflar (rozilik asosidagi seanslar)' }
      : { automatic: 'Automatic Guest Visits', uniqueTracked: 'Unique tracked visitors (consent-based)', uniqueGuests: 'Unique Guest Visitors (consent-based)', pageViews: 'Page Views (consent-based)', guestSessions: 'Guest Sessions (consent-based)', note: 'Approximate hourly count of new public-site openings. People are not identified; reloads and in-site navigation are excluded. Separate tabs may count separately.', trackedSessions: 'Tracked Visits (consent-based sessions)' };

  const queryKey = JSON.stringify([section, page, search, from, to, detailTarget, analyticsRange]);
  queryKeyRef.current = queryKey;
  const load = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (document.visibilityState === 'hidden') return;
    if (analyticsRange === 'custom' && (!from || !to || from > to)) {
      setError(language === 'ru' ? 'Выберите корректный период дат.' : language === 'uz' ? 'To‘g‘ri sana oralig‘ini tanlang.' : 'Choose a valid custom date range.');
      if (!silent) setLoading(false);
      return;
    }
    if (inFlightRef.current && activeRequestRef.current && !activeRequestRef.current.signal.aborted) return;
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    inFlightRef.current = true;
    const requestId = ++requestSequenceRef.current;
    const requestKey = queryKey;
    const dateQuery = new URLSearchParams();
    if (from) dateQuery.set('from', from);
    if (to) dateQuery.set('to', to);
    const overviewQuery = new URLSearchParams();
    if (analyticsRange === 'custom') {
      overviewQuery.set('range', 'custom');
      if (from) overviewQuery.set('from', from);
      if (to) overviewQuery.set('to', to);
    } else overviewQuery.set('range', analyticsRange);
    const directoryQuery = new URLSearchParams(dateQuery);
    directoryQuery.set('page', String(page));
    directoryQuery.set('pageSize', '25');
    if (search.trim()) directoryQuery.set('search', search.trim());
    const recentQuery = section === 'overview' ? overviewQuery : dateQuery;
    if (!silent) setLoading(true);
    try {
      const [nextOverview, nextGuests, nextUsers, nextRecent, nextCharts] = await Promise.all([
        requestJson<Overview>(`/api/visitor-analytics/overview?${overviewQuery.toString()}`, controller.signal),
        requestJson<PageData<Guest>>(`/api/visitor-analytics/guests?${directoryQuery.toString()}`, controller.signal),
        requestJson<PageData<RegisteredUser>>(`/api/visitor-analytics/users?${directoryQuery.toString()}`, controller.signal),
        requestJson<RecentActivity[]>(`/api/visitor-analytics/recent?${recentQuery.toString()}`, controller.signal),
        requestJson<AnalyticsChartsData>(`/api/visitor-analytics/charts?${overviewQuery.toString()}`, controller.signal),
      ]);
      const nextDetail = detailTarget
        ? await requestJson<ActivityDetail>(detailTarget.type === 'guest'
          ? `/api/visitor-analytics/guests/${detailTarget.visitorNumber}`
          : `/api/visitor-analytics/users/${encodeURIComponent(detailTarget.id)}`, controller.signal)
        : null;
      if (controller.signal.aborted || requestId !== requestSequenceRef.current || requestKey !== queryKeyRef.current) return;
      setOverview(nextOverview);
      setGuests(nextGuests);
      setUsers(nextUsers);
      setRecent(nextRecent);
      setCharts(nextCharts);
      if (detailTarget) setDetail(nextDetail);
      setLastUpdated(new Date());
      setError('');
      setAccessRequired(false);
    } catch (requestError) {
      if (controller.signal.aborted || (requestError instanceof Error && requestError.name === 'AbortError')) return;
      const status = (requestError as Error & { status?: number }).status;
      setAccessRequired(status === 401 || status === 403);
      setError(requestError instanceof Error ? requestError.message : 'Visitor analytics could not be loaded.');
    } finally {
      if (requestId === requestSequenceRef.current) {
        inFlightRef.current = false;
        activeRequestRef.current = null;
        if (!silent) setLoading(false);
      }
    }
  }, [analyticsRange, detailTarget, from, language, page, queryKey, search, to]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !inFlightRef.current) void load({ silent: true });
    }, 5000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void load({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      requestSequenceRef.current += 1;
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
      inFlightRef.current = false;
    };
  }, [load]);

  useEffect(() => {
    setPage(1);
    setDetail(null);
    setDetailTarget(null);
  }, [section, search, from, to, analyticsRange]);

  const openGuest = (visitorNumber: number) => {
    setDetail(null);
    setDetailTarget({ type: 'guest', visitorNumber });
  };
  const openUser = (id: string) => {
    setDetail(null);
    setDetailTarget({ type: 'user', id });
  };

  const statCards = overview ? [
    [visitMetricCopy.automatic, overview.totals.automaticGuestVisits ?? 0, Activity],
    [language === 'ru' ? 'Всего визитов' : language === 'uz' ? 'Jami tashriflar' : 'Overall Visits', overview.totals.totalVisits, Activity],
    [visitMetricCopy.pageViews, overview.totals.pageViews, Monitor],
    [visitMetricCopy.guestSessions, overview.totals.guestVisits, Activity],
    [labels.accounts, overview.totals.registeredAccounts, UserRound],
    [labels.authVisits, overview.totals.authenticatedVisits, Activity],
    [labels.activeGuests, overview.totals.activeGuests, Globe2],
    [labels.activeUsers, overview.totals.activeRegisteredUsers, UserRound],
    [metricCopy.active, overview.totals.activeVisitors, Activity],
    [metricCopy.average, formatDuration(overview.totals.averageSessionDurationSeconds), Clock3],
    [labels.avgGuest, formatDuration(overview.totals.averageGuestDurationSeconds), Clock3],
    [labels.avgUser, formatDuration(overview.totals.averageAuthenticatedDurationSeconds), Clock3],
    [labels.measured, formatDuration(overview.totals.measuredActiveSeconds), Clock3],
  ] as const : [];

  const currentData = section === 'guests' ? guests : users;
  const totalPages = Math.max(1, Math.ceil((currentData?.total || 0) / (currentData?.pageSize || 25)));

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{labels.title}</h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-400 sm:text-sm">{labels.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-slate-500" aria-live="polite">{lastUpdated ? `${liveCopy.updated} ${lastUpdated.toLocaleTimeString()}` : liveCopy.loading}</span>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-700 hover:bg-cyan-950/30 hover:text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{language === 'ru' ? 'Обновить' : language === 'uz' ? 'Yangilash' : 'Refresh'}</button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {(['overview', 'guests', 'users'] as const).map((value) => {
          const label = value === 'overview' ? labels.overview : value === 'guests' ? labels.guests : labels.users;
          return <button type="button" key={value} onClick={() => setSection(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${section === value ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-700/60' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>{label}</button>;
        })}
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {section === 'overview' ? <>
          <label className="flex items-center gap-3 text-xs text-slate-400"><span>{metricCopy.range}</span><select value={analyticsRange} onChange={(event) => setAnalyticsRange(event.target.value as AnalyticsRange)} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-600"><option value="24h">{metricCopy.hours}</option><option value="7d">{metricCopy.days7}</option><option value="30d">{metricCopy.days30}</option><option value="custom">{metricCopy.custom}</option></select></label>
          {analyticsRange === 'custom' && <>
            <label className="flex items-center gap-2 text-xs text-slate-400">{labels.from}<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600" /></label>
            <label className="flex items-center gap-2 text-xs text-slate-400">{labels.to}<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600" /></label>
          </>}
        </> : <>
          <label className="relative"><span className="sr-only">{labels.search}</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={labels.search} className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-cyan-600" /></label>
          <label className="flex items-center gap-2 text-xs text-slate-400">{labels.from}<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600" /></label>
          <label className="flex items-center gap-2 text-xs text-slate-400">{labels.to}<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600" /></label>
        </>}
      </div>

      {error && <div role="alert" className={`rounded-xl border p-4 text-sm ${accessRequired ? 'border-amber-800/60 bg-amber-950/30 text-amber-200' : 'border-rose-800/60 bg-rose-950/30 text-rose-200'}`}>{accessRequired ? labels.access : error}</div>}

      {section === 'overview' && overview && <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {statCards.map(([label, value, Icon]) => {
            const primary = label === visitMetricCopy.automatic;
            return <div key={label} className={`group flex min-h-[112px] flex-col justify-between rounded-2xl border p-4 transition-colors ${primary ? 'border-cyan-700/70 bg-gradient-to-br from-cyan-950/80 to-slate-900/70 shadow-lg shadow-cyan-950/20' : 'border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/45 hover:border-cyan-900/80'}`}><div className="flex items-start justify-between gap-3 text-xs font-medium leading-5 text-slate-400"><span className={primary ? 'text-cyan-200' : ''}>{label}</span><Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" /></div><div className="mt-3 text-2xl font-bold tracking-tight text-white tabular-nums sm:text-3xl">{value}</div></div>;
          })}
        </div>
        <p className="-mt-2 rounded-xl border border-cyan-900/50 bg-cyan-950/20 px-4 py-3 text-xs leading-relaxed text-slate-400">{visitMetricCopy.note} {language === 'ru' ? 'Всего визитов включает измеренные с согласия сеансы гостей и авторизованных пользователей; автоматические визиты не включены, так как их нельзя безопасно объединить без идентификаторов.' : language === 'uz' ? 'Jami tashriflar rozilik asosida o‘lchangan mehmon va autentifikatsiyalangan seanslarni o‘z ichiga oladi; identifikatorlarsiz avtomatik tashriflarni ular bilan xavfsiz birlashtirib bo‘lmagani uchun kiritilmagan.' : 'Overall Visits includes consent-based guest and authenticated sessions. Automatic Guest Visits is excluded because it cannot be safely reconciled with those sessions without identifiers.'}</p>
        <AnalyticsCharts data={charts} language={language} />
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-5"><h2 className="text-sm font-semibold text-white">{liveCopy.recent}</h2><span className="text-[10px] text-slate-500">{recent?.length || 0}</span></div>
          {recent?.length ? <div className="divide-y divide-slate-800/80">{recent.slice(0, 8).map((item, index) => <div key={`${item.type}-${item.startedAt}-${index}`} className="grid gap-1 px-4 py-3 text-xs sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4 sm:px-5"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${item.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} /><span className="truncate font-semibold text-slate-100">{item.displayName}</span><span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] capitalize text-slate-400">{item.type}</span></div><div className="mt-1 truncate pl-4 text-[10px] text-slate-500">{item.pagePath || labels.noActivity}</div></div><span className="text-slate-400">{formatDuration(item.activeSeconds)}</span><span className="text-[10px] text-slate-500">{formatDate(item.lastActivity)}</span></div>)}</div> : !loading && <p className="px-5 py-8 text-center text-sm text-slate-500">{labels.noData}</p>}
        </section>
        <p className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-xs leading-relaxed text-slate-400">{labels.timeNote} {language === 'ru' ? 'Данные хранятся 90 дней. Гости обозначают случайные идентификаторы браузера, а не личности.' : language === 'en' ? 'Analytics records are retained for 90 days. Guest labels represent random browser IDs, not known people.' : 'Ma’lumotlar 90 kun saqlanadi. Mehmon belgisi shaxsni emas, tasodifiy brauzer ID sini anglatadi.'}</p>
      </>}

      {!overview && loading && <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-12 text-center text-sm text-slate-400"><RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-cyan-400" />{liveCopy.loading}</div>}

      {section === 'guests' && guests && <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm shadow-black/20">
        <div className="overflow-x-auto"><table className="w-full min-w-[1280px] text-left text-xs"><thead className="bg-slate-950/70 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Guest</th><th className="px-4 py-3">{labels.status}</th><th className="px-4 py-3">{labels.device}</th><th className="px-4 py-3">{labels.browser}</th><th className="px-4 py-3">{labels.location}</th><th className="px-4 py-3">{labels.referral}</th><th className="px-4 py-3">{labels.firstVisit}</th><th className="px-4 py-3">{labels.visits}</th><th className="px-4 py-3">{labels.totalTime}</th><th className="px-4 py-3">{labels.averageTime}</th><th className="px-4 py-3">{labels.lastActivity}</th></tr></thead><tbody className="divide-y divide-slate-800">{guests.items.map((guest) => <tr key={guest.visitor_number} className="cursor-pointer text-slate-300 hover:bg-slate-800/40" onClick={() => void openGuest(guest.visitor_number)}><td className="px-4 py-3 font-semibold text-white">{guest.label}<div className="mt-1 max-w-60 truncate text-[10px] font-normal text-slate-500">{guest.last_page || '—'}</div></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] ${guest.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{guest.is_active ? labels.active : labels.inactive}</span></td><td className="px-4 py-3 capitalize">{guest.device_category}</td><td className="px-4 py-3 capitalize">{guest.browser_category}</td><td className="px-4 py-3">{guest.country_code || '—'}</td><td className="px-4 py-3">{guest.referral_source || '—'}</td><td className="px-4 py-3">{formatDate(guest.first_visit_at)}</td><td className="px-4 py-3">{guest.visits}</td><td className="px-4 py-3">{formatDuration(guest.total_active_seconds)}</td><td className="px-4 py-3">{formatDuration(guest.average_visit_seconds || 0)}</td><td className="px-4 py-3">{formatDate(guest.last_seen_at)}</td></tr>)}</tbody></table></div>
        {guests.items.length === 0 && <p className="p-8 text-center text-sm text-slate-500">{labels.noData}</p>}
        <Pagination page={page} pages={totalPages} onPage={setPage} previous={labels.previous} next={labels.next} />
      </div>}

      {section === 'users' && users && <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-sm shadow-black/20">
        <div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-xs"><thead className="bg-slate-950/70 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">{labels.users}</th><th className="px-4 py-3">{labels.provider}</th><th className="px-4 py-3">{labels.status}</th><th className="px-4 py-3">{labels.registration}</th><th className="px-4 py-3">{labels.lastSignIn}</th><th className="px-4 py-3">{labels.visits}</th><th className="px-4 py-3">{labels.totalTime}</th><th className="px-4 py-3">{labels.averageTime}</th><th className="px-4 py-3">{labels.lastActivity}</th></tr></thead><tbody className="divide-y divide-slate-800">{users.items.map((user) => <tr key={user.id} className="cursor-pointer text-slate-300 hover:bg-slate-800/40" onClick={() => void openUser(user.id)}><td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar user={user} /><span className="min-w-0"><span className="block font-semibold text-white">{user.name || '—'}</span><span className="block truncate text-[10px] text-slate-500">{user.email}</span></span></div></td><td className="px-4 py-3 capitalize">{user.authProvider}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] ${user.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{user.isActive ? labels.active : labels.inactive}</span></td><td className="px-4 py-3">{formatDate(user.registeredAt)}</td><td className="px-4 py-3">{formatDate(user.lastSignIn)}</td><td className="px-4 py-3">{user.visits}</td><td className="px-4 py-3">{formatDuration(user.totalActiveSeconds)}</td><td className="px-4 py-3">{formatDuration(user.averageVisitSeconds || 0)}</td><td className="px-4 py-3">{formatDate(user.lastActivity || user.lastSignIn)}</td></tr>)}</tbody></table></div>
        {users.items.length === 0 && <p className="p-8 text-center text-sm text-slate-500">{labels.noData}</p>}
        <Pagination page={page} pages={totalPages} onPage={setPage} previous={labels.previous} next={labels.next} />
      </div>}

      {detailTarget && !detail && loading && <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">{liveCopy.loading}</div>}
      {detail && <ActivityPanel detail={detail} labels={labels} onClose={() => { setDetail(null); setDetailTarget(null); }} />}
      {loading && !lastUpdated && <div className="text-center text-xs text-slate-500" aria-live="polite">{language === 'ru' ? 'Загрузка…' : language === 'uz' ? 'Yuklanmoqda…' : 'Loading…'}</div>}
    </div>
  );
};

function Avatar({ user }: { user: RegisteredUser }) {
  const [failed, setFailed] = useState(false);
  const safePhoto = user.photoUrl && /^https:\/\/(?:[a-z0-9-]+\.)*googleusercontent\.com(?:\/|$)/i.test(user.photoUrl) ? user.photoUrl : null;
  return safePhoto && !failed
    ? <img src={safePhoto} alt={`${user.name || user.email} profile`} onError={() => setFailed(true)} className="h-9 w-9 rounded-full object-cover" />
    : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300"><UserRound className="h-4 w-4" /></span>;
}

function Pagination({ page, pages, onPage, previous, next }: { page: number; pages: number; onPage: (page: number) => void; previous: string; next: string }) {
  return <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs text-slate-400"><span>{page} / {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" />{previous}</button><button disabled={page >= pages} onClick={() => onPage(page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-40">{next}<ChevronRight className="h-3.5 w-3.5" /></button></div></div>;
}

function ActivityPanel({ detail, labels, onClose }: { detail: ActivityDetail; labels: Record<string, string>; onClose: () => void }) {
  const title = detail.account?.name || detail.visitor?.label || 'Activity';
  return <section className="rounded-2xl border border-cyan-900/60 bg-slate-900/70 p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-white">{title}</h2><p className="mt-1 text-xs text-slate-400">{detail.account?.email || `${labels.device}: ${detail.visitor?.deviceCategory || 'unknown'} · ${labels.browser}: ${detail.visitor?.browserCategory || 'unknown'}`}</p></div><button onClick={onClose} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white">Close</button></div>
    {detail.account && <p className="mt-2 text-xs text-slate-400">{labels.provider}: {detail.account.authProvider} · {labels.registration}: {formatDate(detail.account.registeredAt)} · {labels.lastSignIn}: {formatDate(detail.account.lastSignIn)}</p>}
    <h3 className="mb-3 mt-5 text-sm font-semibold text-slate-200">{labels.pages}</h3>
    {detail.sessions.length ? <div className="space-y-2">{detail.sessions.map((session) => <article key={session.session_id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-medium text-white">{formatDate(session.startedAt)}{session.isCurrent ? ` · ${labels.currentSession}` : ''}</span><span className="text-cyan-300">{formatDuration(session.activeSeconds)}</span></div><p className="mt-1 text-[10px] text-slate-500">{session.endedAt ? formatDate(session.endedAt) : `${labels.lastActivity}: ${formatDate(session.lastSeenAt)}`}</p><p className="mt-2 break-words text-xs leading-relaxed text-slate-300">{session.pageHistory || labels.noActivity}</p></article>)}</div> : <p className="text-sm text-slate-500">{labels.noActivity}</p>}
  </section>;
}
