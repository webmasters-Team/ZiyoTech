import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

type ConsentChoice = 'accepted' | 'rejected' | null;

const API_BASE = (import.meta.env.VITE_ASSISTANT_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')).replace(/\/+$/, '');
const CONSENT_KEY = 'ziyo-visitor-analytics-consent';
const HEARTBEAT_MS = 30_000;
const IDLE_MS = 5 * 60_000;
const PRIVATE_ROUTE_PREFIXES = ['/admin', '/app', '/platform', '/sales-ai-admin', '/sales-ai-operations', '/sales-ai-login'];
const AGGREGATE_EXCLUDED_ROUTE_PREFIXES = [...PRIVATE_ROUTE_PREFIXES, '/account', '/sales-ai-onboarding'];

function getConsent(): ConsentChoice {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

function browserCategories() {
  const ua = navigator.userAgent;
  const device = /ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop';
  const browser = /edg\//i.test(ua) ? 'edge' : /firefox\//i.test(ua) ? 'firefox' : /chrome\//i.test(ua) ? 'chrome' : /safari\//i.test(ua) ? 'safari' : 'other';
  return { device, browser };
}

function currentPagePath() {
  const path = window.location.pathname;
  if (path === '/account' || path.startsWith('/account/')) return '/account';
  return `${path}`.slice(0, 200);
}

function isPrivatePage(path: string) {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function isAggregateVisitEligible(path: string) {
  return !AGGREGATE_EXCLUDED_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

async function sendAnalytics(path: string, body?: Record<string, unknown>, keepalive = false) {
  try {
    const response = await fetch(`${API_BASE}/api/visitor-analytics/${path}`, {
      method: 'POST',
      credentials: 'include',
      keepalive,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    return response;
  } catch {
    return null;
  }
}

export const VisitorAnalyticsTracker: React.FC = () => {
  const { language } = useLanguage();
  const [consent, setConsent] = useState<ConsentChoice>(getConsent);
  const [showChoices, setShowChoices] = useState(consent === null);
  const [pagePath, setPagePath] = useState(currentPagePath);
  const [hasStarted, setHasStarted] = useState(false);
  const [trackingError, setTrackingError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const lastActivityAt = useRef(Date.now());
  const lastPageView = useRef('');
  const pendingPageView = useRef<{ pagePath: string; eventId: string } | null>(null);
  const aggregateVisitAttempted = useRef(false);
  const shouldTrack = consent === 'accepted' && !isPrivatePage(pagePath);

  useEffect(() => {
    const updatePath = () => setPagePath(currentPagePath());
    const history = window.history;
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    const pushStateWithTracking: History['pushState'] = function (this: History, ...args) {
      originalPushState.apply(this, args);
      updatePath();
    };
    const replaceStateWithTracking: History['replaceState'] = function (this: History, ...args) {
      originalReplaceState.apply(this, args);
      updatePath();
    };
    history.pushState = pushStateWithTracking;
    history.replaceState = replaceStateWithTracking;
    window.addEventListener('popstate', updatePath);
    return () => {
      window.removeEventListener('popstate', updatePath);
      if (history.pushState === pushStateWithTracking) history.pushState = originalPushState;
      if (history.replaceState === replaceStateWithTracking) history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    if (aggregateVisitAttempted.current || !isAggregateVisitEligible(pagePath)) return;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation && navigation.type !== 'navigate') {
      aggregateVisitAttempted.current = true;
      return;
    }
    const visitWindow = window as Window & { __ziyoAggregateVisitAttempted?: boolean };
    if (visitWindow.__ziyoAggregateVisitAttempted) {
      aggregateVisitAttempted.current = true;
      return;
    }

    // In-memory per-document guard only: it does not identify or persist a visitor.
    visitWindow.__ziyoAggregateVisitAttempted = true;
    aggregateVisitAttempted.current = true;
    void fetch(`${API_BASE}/api/visitor-analytics/aggregate-visit`, {
      method: 'POST',
      credentials: 'omit',
      cache: 'no-store',
      keepalive: true,
    }).catch(() => undefined);
  }, [pagePath]);

  useEffect(() => {
    if (consent === 'rejected') void sendAnalytics('end', { forget: true }, true);
  }, [consent]);

  useEffect(() => {
    if (!shouldTrack) {
      setHasStarted(false);
      setTrackingError(false);
      lastPageView.current = '';
      if (consent === 'accepted') void sendAnalytics('end');
      return;
    }
    let cancelled = false;
    setTrackingError(false);
    const { device, browser } = browserCategories();
    const body = {
      device,
      browser,
      referralSource: document.referrer || null,
      visible: document.visibilityState === 'visible',
      active: document.visibilityState === 'visible' && Date.now() - lastActivityAt.current <= IDLE_MS,
    };
    const start = async () => {
      for (let attempt = 0; attempt < 3 && !cancelled; attempt += 1) {
        const response = await sendAnalytics('session', body);
        if (response?.ok) {
          if (!cancelled) {
            setHasStarted(true);
            setTrackingError(false);
          }
          return;
        }
        if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 1500 * (attempt + 1)));
      }
      if (!cancelled) setTrackingError(true);
    };
    void start();
    return () => { cancelled = true; };
  }, [consent, retryCount, shouldTrack]);

  useEffect(() => {
    if (!hasStarted || !shouldTrack || !pagePath || lastPageView.current === pagePath) return;
    lastPageView.current = pagePath;
    const event = pendingPageView.current?.pagePath === pagePath
      ? pendingPageView.current
      : {
        pagePath,
        eventId: typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      };
    pendingPageView.current = event;
    let cancelled = false;
    const sendPageView = async () => {
      for (let attempt = 0; attempt < 3 && !cancelled; attempt += 1) {
        const response = await sendAnalytics('page-view', { eventId: event.eventId, pagePath: event.pagePath });
        if (response?.ok) {
          if (cancelled) return;
          if (pendingPageView.current?.eventId === event.eventId) pendingPageView.current = null;
          setTrackingError(false);
          return;
        }
        const canRetry = !response || response.status === 429 || response.status >= 500;
        if (!canRetry || attempt === 2) break;
        await new Promise((resolve) => window.setTimeout(resolve, 1000 * (attempt + 1)));
      }
      if (!cancelled) {
        // A later manual retry reuses the same event ID, so a lost response
        // cannot create a duplicate page view in SQLite.
        if (lastPageView.current === pagePath) lastPageView.current = '';
        setTrackingError(true);
      }
    };
    void sendPageView();
    return () => { cancelled = true; };
  }, [hasStarted, pagePath, shouldTrack]);

  useEffect(() => {
    if (!hasStarted || !shouldTrack) return;
    const sendHeartbeat = async () => {
      const visible = document.visibilityState === 'visible';
      const active = visible && Date.now() - lastActivityAt.current <= IDLE_MS;
      const response = await sendAnalytics('heartbeat', { visible, active });
      if (!response?.ok) {
        setTrackingError(true);
        return;
      }
      setTrackingError(false);
      if (response?.ok) {
        const result = await response.json().catch(() => null) as { rotate?: boolean } | null;
        if (result?.rotate) {
          setHasStarted(false);
          const { device, browser } = browserCategories();
          const visible = document.visibilityState === 'visible';
          const active = visible && Date.now() - lastActivityAt.current <= IDLE_MS;
          const startResponse = await sendAnalytics('session', { device, browser, visible, active });
          if (startResponse?.ok) setHasStarted(true);
        }
      }
    };
    const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    const markActivity = () => { lastActivityAt.current = Date.now(); };
    const onVisibilityChange = () => { void sendHeartbeat(); };
    activityEvents.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibilityChange);
    const timer = window.setInterval(() => { void sendHeartbeat(); }, HEARTBEAT_MS);
    return () => {
      window.clearInterval(timer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [hasStarted, shouldTrack]);

  const chooseConsent = useCallback((next: Exclude<ConsentChoice, null>) => {
    try { localStorage.setItem(CONSENT_KEY, next); } catch { /* Tracking still follows this page's choice. */ }
    if (next === 'rejected') {
      void sendAnalytics('end', { forget: true }, true);
      setHasStarted(false);
    }
    setConsent(next);
    setShowChoices(false);
  }, []);

  const copy = language === 'ru'
    ? { message: 'Мы считаем анонимные открытия публичного сайта в общем количестве независимо от вашего выбора. Этот счетчик не сохраняет идентификаторы посетителей, cookie, пути страниц или IP-адреса. Разрешить подробную аналитику?', allow: 'Разрешить подробную аналитику', reject: 'Отклонить', choices: 'Настройки конфиденциальности', off: 'Подробная аналитика выключена', on: 'Подробная аналитика включена', retry: 'Повторить', failed: 'Не удалось отправить данные аналитики. Проверьте подключение и повторите попытку.' }
    : language === 'en'
      ? { message: 'We count anonymous public-site openings in aggregate regardless of your choice. This counter stores no visitor IDs, cookies, page paths, or IP addresses. Allow optional detailed analytics?', allow: 'Allow detailed analytics', reject: 'Decline', choices: 'Privacy choices', off: 'Detailed analytics off', on: 'Detailed analytics on', retry: 'Retry', failed: 'Analytics could not be sent. Check your connection and retry.' }
      : { message: 'Tanlovingizdan qat’i nazar, ommaviy sayt ochilishlari anonim tarzda umumiy hisobda sanaladi. Bu hisoblagich tashrifchi identifikatorlari, cookie, sahifa yo‘llari yoki IP manzillarini saqlamaydi. Ixtiyoriy batafsil tahlilga ruxsat berasizmi?', allow: 'Batafsil tahlilga ruxsat berish', reject: 'Rad etish', choices: 'Maxfiylik tanlovlari', off: 'Batafsil tahlil o‘chiq', on: 'Batafsil tahlil yoqilgan', retry: 'Qayta urinish', failed: 'Tahlil ma’lumotini yuborib bo‘lmadi. Ulanishni tekshirib, qayta urinib ko‘ring.' };

  if (isPrivatePage(pagePath)) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[65] max-w-[min(92vw,420px)]">
      {showChoices ? (
        <section className="rounded-2xl border border-slate-600 bg-slate-950 p-4 text-slate-100 shadow-2xl backdrop-blur" aria-label={copy.choices}>
          <p className="text-sm leading-relaxed text-slate-300">{copy.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => chooseConsent('accepted')} className="min-h-10 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">{copy.allow}</button>
            <button type="button" onClick={() => chooseConsent('rejected')} className="min-h-10 rounded-lg border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">{copy.reject}</button>
          </div>
        </section>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowChoices(true)} aria-expanded={showChoices} className="min-h-10 rounded-full border border-slate-500 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-100 shadow-lg hover:border-cyan-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
            {copy.choices}{consent === 'accepted' ? ` · ${copy.on}` : ` · ${copy.off}`}
          </button>
          {trackingError && consent === 'accepted' && <div role="status" className="flex items-center gap-2 rounded-xl border border-amber-800/70 bg-slate-950/95 px-3 py-2 text-[11px] text-amber-200 shadow-lg"><span>{copy.failed}</span><button type="button" onClick={() => { setHasStarted(false); setRetryCount((value) => value + 1); }} className="shrink-0 font-semibold underline underline-offset-2">{copy.retry}</button></div>}
        </div>
      )}
    </div>
  );
};
