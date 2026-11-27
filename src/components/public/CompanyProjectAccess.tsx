import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../lib/api';
import type { ClientPortalActions, ClientPortalProject } from './ClientProjectDashboard';

const CLIENT_PORTAL_ENABLED = import.meta.env.VITE_CLIENT_PORTAL_ENABLED === 'true';

type SessionResponse = { authenticated: true; csrfToken: string; companyName: string };
type ProjectResponse = { projects: unknown };
type CompanyProjectAccessProps = {
  onAuthenticated: (companyName: string, projects: ClientPortalProject[], logout: () => Promise<void>, actions: ClientPortalActions) => void;
  onSignedOut: () => void;
};

class PortalRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

type PortalRecord = Record<string, unknown>;

function isPortalRecord(value: unknown): value is PortalRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function portalRecords(value: unknown): PortalRecord[] {
  return Array.isArray(value) ? value.filter(isPortalRecord) : [];
}

function finiteNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProjects(payload: ProjectResponse): ClientPortalProject[] {
  if (!Array.isArray(payload.projects)) throw new Error('The project server returned an incomplete response. Please retry.');

  return payload.projects.map((value) => {
    if (!isPortalRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string' || !isPortalRecord(value.progress)) {
      throw new Error('Project details are incomplete. Please retry or contact ZiyoTech.');
    }

    const progress = value.progress;
    const overallPercentage = finiteNumber(progress.overallPercentage, Number.NaN);
    if (!Number.isFinite(overallPercentage)) throw new Error('Project progress is temporarily unavailable. Please retry.');

    const validMilestoneStatuses = new Set(['upcoming', 'in_progress', 'blocked', 'completed', 'delayed']);
    const milestones = portalRecords(value.milestones).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      title: typeof item.title === 'string' ? item.title : 'Project milestone',
      description: typeof item.description === 'string' ? item.description : '',
      status: validMilestoneStatuses.has(String(item.status)) ? String(item.status) : 'upcoming',
      weight: finiteNumber(item.weight),
      completionPercentage: Math.min(100, Math.max(0, finiteNumber(item.completionPercentage))),
      taskIds: Array.isArray(item.taskIds) ? item.taskIds.filter((id): id is string => typeof id === 'string') : [],
    }));
    const tasks = portalRecords(value.tasks).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      milestoneId: typeof item.milestoneId === 'string' ? item.milestoneId : '',
      title: typeof item.title === 'string' ? item.title : 'Project task',
      status: typeof item.status === 'string' ? item.status : 'upcoming',
    }));
    const stages = portalRecords(value.stages).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      title: typeof item.title === 'string' ? item.title : 'Development stage',
      status: typeof item.status === 'string' ? item.status : 'upcoming',
      completionPercentage: Math.min(100, Math.max(0, finiteNumber(item.completionPercentage))),
      startDate: typeof item.startDate === 'string' ? item.startDate : undefined,
      dueDate: typeof item.dueDate === 'string' ? item.dueDate : undefined,
    }));
    const updates = portalRecords(value.updates).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      title: typeof item.title === 'string' ? item.title : 'Project update',
      body: typeof item.body === 'string' ? item.body : '',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
      authorDisplayName: typeof item.authorDisplayName === 'string' ? item.authorDisplayName : '',
      resources: portalRecords(item.resources).filter((resource) => typeof resource.id === 'string').map((resource) => ({
        id: String(resource.id),
        title: typeof resource.title === 'string' ? resource.title : 'Project resource',
        resourceType: ['image', 'video', 'document', 'link'].includes(String(resource.resourceType)) ? resource.resourceType as 'image' | 'video' | 'document' | 'link' : 'link',
      })),
    }));
    const resources = portalRecords(value.resources).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      title: typeof item.title === 'string' ? item.title : 'Project resource',
      resourceType: ['image', 'video', 'document', 'link'].includes(String(item.resourceType)) ? item.resourceType as 'image' | 'video' | 'document' | 'link' : 'link',
      externalUrl: typeof item.externalUrl === 'string' ? item.externalUrl : '',
      fileName: typeof item.fileName === 'string' ? item.fileName : '',
      description: typeof item.description === 'string' ? item.description : '',
    }));
    const feedback = portalRecords(value.feedback).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      kind: typeof item.kind === 'string' ? item.kind : 'feedback',
      status: typeof item.status === 'string' ? item.status : 'submitted',
      message: typeof item.message === 'string' ? item.message : '',
      adminResponse: typeof item.adminResponse === 'string' ? item.adminResponse : '',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    }));
    const approvals = portalRecords(value.approvals).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      milestoneId: typeof item.milestoneId === 'string' ? item.milestoneId : '',
      status: typeof item.status === 'string' ? item.status : 'pending',
      clientComment: typeof item.clientComment === 'string' ? item.clientComment : '',
      requestedAt: typeof item.requestedAt === 'string' ? item.requestedAt : '',
    }));
    const activity = portalRecords(value.activity).filter((item) => typeof item.id === 'string').map((item) => ({
      ...item,
      id: String(item.id),
      eventType: typeof item.eventType === 'string' ? item.eventType : 'project_update',
      entityType: typeof item.entityType === 'string' ? item.entityType : 'project',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
    }));
    const history = portalRecords(progress.history).filter((item) => typeof item.date === 'string'
      && Number.isFinite(Number(item.plannedPercentage)) && Number.isFinite(Number(item.actualPercentage))).map((item) => ({
      date: String(item.date),
      plannedPercentage: Math.min(100, Math.max(0, finiteNumber(item.plannedPercentage))),
      actualPercentage: Math.min(100, Math.max(0, finiteNumber(item.actualPercentage))),
    }));

    return {
      ...value,
      id: String(value.id),
      title: String(value.title),
      description: typeof value.description === 'string' ? value.description : '',
      status: typeof value.status === 'string' ? value.status : 'planning',
      progress: {
        ...progress,
        overallPercentage: Math.min(100, Math.max(0, overallPercentage)),
        history,
        phases: portalRecords(progress.phases).filter((phase) => typeof phase.milestoneId === 'string').map((phase) => ({
          milestoneId: String(phase.milestoneId),
          label: typeof phase.label === 'string' ? phase.label : 'Project phase',
          completionPercentage: Math.min(100, Math.max(0, finiteNumber(phase.completionPercentage))),
        })),
      },
      milestones,
      tasks,
      stages,
      updates,
      resources,
      feedback,
      approvals,
      activity,
    } as ClientPortalProject;
  });
}

const unavailableMessage = {
  en: 'Client portal access is not available yet.',
  ru: 'Доступ к кабинету клиента пока недоступен.',
  uz: 'Mijozlar portaliga kirish hali mavjud emas.',
} as const;

const introduction = {
  en: {
    title: 'Your Project, Always Within Reach',
    body: "We've provided you with a unique access code for your ongoing project. Enter your code below and click 'Access My Project' to view your project's progress, milestones, and estimated completion date.",
  },
  ru: {
    title: 'Ваш проект всегда под рукой',
    body: 'Введите выданный вам код доступа, чтобы посмотреть ход работ, этапы и ожидаемую дату завершения проекта.',
  },
  uz: {
    title: 'Loyihangiz doimo qo‘l ostingizda',
    body: 'Loyiha jarayoni, bosqichlari va kutilayotgan yakunlanish sanasini ko‘rish uchun sizga berilgan kirish kodini kiriting.',
  },
} as const;

async function portalRequest<T>(path: string, options: { method?: string; body?: unknown; csrfToken?: string } = {}): Promise<T> {
  const headers = new Headers();
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (options.csrfToken) headers.set('X-CSRF-Token', options.csrfToken);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new PortalRequestError(payload.error || 'Client portal request could not be completed.', response.status);
  return payload;
}

export const CompanyProjectAccess: React.FC<CompanyProjectAccessProps> = ({ onAuthenticated, onSignedOut }) => {
  const { language } = useLanguage();
  const intro = introduction[language];
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(CLIENT_PORTAL_ENABLED);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const refreshing = useRef(false);
  const csrfToken = useRef('');

  const clearSession = useCallback(() => {
    setAuthenticated(false);
    setCompanyName('');
    csrfToken.current = '';
    setError('');
    onSignedOut();
  }, [onSignedOut]);

  const expireSession = useCallback(() => {
    clearSession();
    setMessage(language === 'ru' ? 'Сессия завершилась. Введите код доступа снова.' : language === 'uz' ? 'Sessiya tugadi. Kirish kodini qayta kiriting.' : 'Your client session expired. Enter your access code again.');
  }, [clearSession, language]);

  const logout = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      await portalRequest('/api/client-portal/logout', { method: 'POST', body: {}, csrfToken: csrfToken.current });
      clearSession();
      setMessage(language === 'ru' ? 'Вы вышли из клиентского портала.' : language === 'uz' ? 'Mijozlar portalidan chiqdingiz.' : 'You have signed out of the client portal.');
    } catch (requestError) {
      if (requestError instanceof PortalRequestError && requestError.status === 401) expireSession();
      else setError(requestError instanceof PortalRequestError ? requestError.message : 'The client portal server could not be reached. Check your connection and retry.');
    } finally {
      setBusy(false);
    }
  }, [clearSession, expireSession, language]);

  const loadProjects = useCallback(async (session: SessionResponse) => {
    const result = await portalRequest<ProjectResponse>('/api/client-portal/projects');
    const projects = normalizeProjects(result);
    const refresh = async () => {
      const refreshedSession = await portalRequest<SessionResponse>('/api/client-portal/session');
      const updated = await portalRequest<ProjectResponse>('/api/client-portal/projects');
      csrfToken.current = refreshedSession.csrfToken;
      onAuthenticated(refreshedSession.companyName, normalizeProjects(updated), logout, actions);
    };
    const actions: ClientPortalActions = {
      submitFeedback: async (projectId, kind, message, milestoneId) => {
        await portalRequest(`/api/client-portal/projects/${projectId}/feedback`, { method: 'POST', body: { kind, message, milestoneId }, csrfToken: csrfToken.current });
        await refresh();
      },
      resolveApproval: async (approvalId, status, comment) => {
        await portalRequest(`/api/client-portal/approvals/${approvalId}`, { method: 'PATCH', body: { status, comment }, csrfToken: csrfToken.current });
        await refresh();
      },
    };
    csrfToken.current = session.csrfToken;
    setCompanyName(session.companyName);
    onAuthenticated(session.companyName, projects, logout, actions);
    setAuthenticated(true);
  }, [logout, onAuthenticated]);

  const restoreSession = useCallback(async (isActive: () => boolean = () => true) => {
    if (!CLIENT_PORTAL_ENABLED) {
      setRestoring(false);
      return;
    }
    setRestoring(true);
    setRestoreFailed(false);
    setError('');
    try {
      const session = await portalRequest<SessionResponse>('/api/client-portal/session');
      if (isActive()) await loadProjects(session);
    } catch (requestError: unknown) {
      if (!isActive()) return;
      if (requestError instanceof PortalRequestError && requestError.status === 401) clearSession();
      else {
        setRestoreFailed(true);
        setError(requestError instanceof PortalRequestError
          ? requestError.message
          : 'The client portal server could not be reached. Check your connection and retry.');
      }
    } finally {
      if (isActive()) setRestoring(false);
    }
  }, [clearSession, loadProjects]);

  useEffect(() => {
    let active = true;
    void restoreSession(() => active);
    return () => { active = false; };
  }, [restoreSession]);

  useEffect(() => {
    if (!CLIENT_PORTAL_ENABLED || !authenticated) return undefined;
    let active = true;
    const refresh = async () => {
      if (refreshing.current) return;
      refreshing.current = true;
      try {
        const session = await portalRequest<SessionResponse>('/api/client-portal/session');
        if (active) await loadProjects(session);
      } catch (requestError) {
        if (!active) return;
        if (requestError instanceof PortalRequestError && requestError.status === 401) expireSession();
        else setError(requestError instanceof PortalRequestError
          ? requestError.message
          : 'The client portal server could not be reached. Check your connection and retry.');
      } finally { refreshing.current = false; }
    };
    const timer = window.setInterval(() => { void refresh(); }, 20_000);
    const onVisibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, [authenticated, expireSession, loadProjects]);

  const submitAccessCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const code = new FormData(form).get('accessCode');
    form.reset();
    setError('');
    if (!CLIENT_PORTAL_ENABLED) {
      setMessage(unavailableMessage[language]);
      return;
    }
    if (typeof code !== 'string' || code.length < 10 || code.length > 15) {
      setError(language === 'ru' ? 'Введите корректный код доступа.' : language === 'uz' ? 'Yaroqli kirish kodini kiriting.' : 'Enter a valid access code.');
      return;
    }
    setBusy(true);
    try {
      const session = await portalRequest<SessionResponse>('/api/client-portal/access', { method: 'POST', body: { code } });
      await loadProjects(session);
      setMessage('');
      document.getElementById('demo-project-dashboard')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } catch (requestError) {
      setError(requestError instanceof PortalRequestError ? requestError.message : 'The client portal server could not be reached. Check your connection and retry.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="client-project-access" className="py-10 sm:py-12 lg:py-14" aria-labelledby="client-access-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0b1420] via-[#0a111b] to-[#071522] p-6 shadow-[0_24px_70px_rgba(2,6,23,0.34)] sm:p-9 lg:p-11">
          <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.06] blur-3xl" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <h2 className="text-xl font-bold tracking-tight text-cyan-100 sm:text-2xl">{intro.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">{intro.body}</p>
            <h3 id="client-access-title" className="mt-6 text-2xl font-black tracking-tight text-white sm:mt-7 sm:text-3xl">Client Project Portal</h3>
            {authenticated ? <div className="mt-5 w-full rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3 text-left"><p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Authenticated client</p><p className="mt-1 text-sm font-semibold text-white">{companyName}</p></div> : <form onSubmit={(event) => void submitAccessCode(event)} className="w-full max-w-xl" autoComplete="off">
              <label htmlFor="company-access-code" className="sr-only">Company Access Code</label>
              <input
                id="company-access-code"
                name="accessCode"
                type="password"
                minLength={10}
                maxLength={15}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Company Access Code"
                disabled={!CLIENT_PORTAL_ENABLED || busy || restoring}
                aria-describedby="portal-unavailable-message portal-error-message"
                className="mt-4 min-h-12 w-full rounded-xl border border-slate-700 bg-[#080e17] px-4 text-center text-sm tracking-[0.12em] text-white outline-none transition-colors placeholder:tracking-normal placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
              />
              <button
                type="submit"
                disabled={!CLIENT_PORTAL_ENABLED || busy || restoring}
                aria-describedby="portal-unavailable-message"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a111b] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none sm:w-auto sm:min-w-56"
              >
                {busy || restoring ? <><RefreshCw aria-hidden="true" className="h-4 w-4 animate-spin" />{restoring ? 'Checking secure session…' : 'Loading project…'}</> : <>Access My Project<ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
              </button>
            </form>}
            <p id="portal-unavailable-message" role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-amber-200/90">
              {message || (!CLIENT_PORTAL_ENABLED ? unavailableMessage[language] : '')}
            </p>
            {error && <p id="portal-error-message" role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
            {restoreFailed && error && !authenticated && <button type="button" onClick={() => void restoreSession()} disabled={restoring || busy} className="mt-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-300/50 disabled:opacity-50">Try again</button>}
          </div>
        </div>
      </div>
    </section>
  );
};
