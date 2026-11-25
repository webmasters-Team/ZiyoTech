import React, { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import { Activity, Building2, Check, ChevronDown, ChevronRight, Copy, KeyRound, Plus, RefreshCw, ShieldOff } from 'lucide-react';
import { ProjectProgressChart } from './ProjectProgressChart';

type Company = { id: string; companyName: string; contactPerson: string; email: string; phone: string; description: string; status: 'active' | 'inactive'; projectCount: number; hasActiveCode: boolean };
type Task = { id: string; milestoneId: string; title: string; description: string; weight: number; status: 'upcoming' | 'in_progress' | 'blocked' | 'completed'; completionPercentage: number; dueDate?: string; developmentNotes: string; blocker: string };
type Milestone = { id: string; title: string; description: string; weight: number; dueDate?: string; startDate?: string; completionPercentage: number; status: string; taskIds: string[] };
type Resource = { id: string; projectId: string; resourceType: 'image' | 'video' | 'document' | 'link'; fileName: string; mimeType: string; sizeBytes: number; externalUrl: string; title: string; description: string; visibility: 'private' | 'client'; createdAt: string };
type Project = { id: string; companyId: string; companyName: string; title: string; description: string; scope: string; status: string; startDate?: string; targetCompletionDate?: string; estimatedCompletionDate?: string; actualCompletionDate?: string; progress: { overallPercentage: number; history: Array<{ date: string; plannedPercentage: number; actualPercentage: number }>; phases: Array<{ milestoneId: string; label: string; completionPercentage: number }> }; milestones: Milestone[]; tasks: Task[]; updates: Array<{ id: string; title: string; body: string; createdAt: string; authorDisplayName: string }>; resources: Resource[]; activity?: Array<{ id: string; eventType: string; entityType: string; createdAt: string }> };
type Dashboard = { companies: Company[]; projects: Project[] };

const labels = {
  en: { title: 'Client & Project Management', subtitle: 'Manage client companies, private access codes, project milestones, tasks, and progress.', companies: 'Companies', addCompany: 'Add company', edit: 'Edit', save: 'Save changes', cancel: 'Cancel', name: 'Company name', contact: 'Contact person', email: 'Email', phone: 'Telephone', description: 'Description or notes', active: 'Active', inactive: 'Inactive', deactivate: 'Deactivate', activate: 'Activate', code: 'Company access code', generateCode: 'Generate / rotate code', revokeCode: 'Revoke code', copyCode: 'Copy code', copied: 'Copied', codeWarning: 'This code is shown only now. Share it privately; the database stores only its verifier.', createProject: 'Assign a project', projectTitle: 'Project title', projectDescription: 'Project description', start: 'Start date', target: 'Target completion', estimate: 'Estimated delivery', status: 'Status', create: 'Create', projects: 'Projects', progress: 'Complete', milestones: 'Milestones', addMilestone: 'Add milestone', weight: 'Weight', due: 'Deadline', tasks: 'Tasks', addTask: 'Add task', taskTitle: 'Task title', taskStatus: 'Task status', progressPct: 'Completion %', notes: 'Development notes', blocker: 'Blocker / delay note', update: 'Progress update', updateTitle: 'Update title', updateBody: 'Client-visible update', publish: 'Publish update', activity: 'Activity history', noCompanies: 'No client companies have been added.', noProjects: 'No projects assigned yet.', noTasks: 'No tasks yet.', loading: 'Loading management data…', error: 'Management data could not be loaded.', retry: 'Retry', dashboard: 'Project details', select: 'Open details', saveTask: 'Save task', saveMilestone: 'Save milestone', unknown: 'Unknown status', copiedError: 'Could not copy. Select and copy the code manually.' },
  ru: { title: 'Клиенты и проекты', subtitle: 'Управляйте компаниями, кодами доступа, этапами, задачами и ходом проектов.', companies: 'Компании', addCompany: 'Добавить компанию', edit: 'Изменить', save: 'Сохранить', cancel: 'Отмена', name: 'Название компании', contact: 'Контактное лицо', email: 'Эл. почта', phone: 'Телефон', description: 'Описание или заметки', active: 'Активна', inactive: 'Неактивна', deactivate: 'Отключить', activate: 'Активировать', code: 'Код доступа компании', generateCode: 'Создать / заменить код', revokeCode: 'Отозвать код', copyCode: 'Скопировать код', copied: 'Скопировано', codeWarning: 'Код показывается только сейчас. Передайте его лично; в базе хранится только проверочное значение.', createProject: 'Назначить проект', projectTitle: 'Название проекта', projectDescription: 'Описание проекта', start: 'Дата начала', target: 'Целевой срок', estimate: 'Оценка сдачи', status: 'Статус', create: 'Создать', projects: 'Проекты', progress: 'Выполнено', milestones: 'Этапы', addMilestone: 'Добавить этап', weight: 'Вес', due: 'Срок', tasks: 'Задачи', addTask: 'Добавить задачу', taskTitle: 'Название задачи', taskStatus: 'Статус задачи', progressPct: 'Выполнено, %', notes: 'Заметки разработки', blocker: 'Блокер / задержка', update: 'Обновление проекта', updateTitle: 'Заголовок обновления', updateBody: 'Обновление для клиента', publish: 'Опубликовать', activity: 'История действий', noCompanies: 'Компании пока не добавлены.', noProjects: 'Назначенных проектов пока нет.', noTasks: 'Задач пока нет.', loading: 'Загрузка данных…', error: 'Не удалось загрузить данные.', retry: 'Повторить', dashboard: 'Сведения о проекте', select: 'Открыть сведения', saveTask: 'Сохранить задачу', saveMilestone: 'Сохранить этап', unknown: 'Неизвестный статус', copiedError: 'Не удалось скопировать код. Скопируйте его вручную.' },
  uz: { title: 'Mijozlar va loyihalarni boshqarish', subtitle: 'Kompaniyalar, kirish kodlari, loyiha bosqichlari, vazifalar va jarayonni boshqaring.', companies: 'Kompaniyalar', addCompany: 'Kompaniya qo‘shish', edit: 'Tahrirlash', save: 'Saqlash', cancel: 'Bekor qilish', name: 'Kompaniya nomi', contact: 'Aloqa vakili', email: 'Email', phone: 'Telefon', description: 'Tavsif yoki izohlar', active: 'Faol', inactive: 'Faol emas', deactivate: 'Faolsizlantirish', activate: 'Faollashtirish', code: 'Kompaniya kirish kodi', generateCode: 'Kod yaratish / almashtirish', revokeCode: 'Kodni bekor qilish', copyCode: 'Kodni nusxalash', copied: 'Nusxalandi', codeWarning: 'Kod faqat hozir ko‘rsatiladi. Uni maxfiy ulashing; bazada faqat tekshiruvchi qiymat saqlanadi.', createProject: 'Loyiha biriktirish', projectTitle: 'Loyiha nomi', projectDescription: 'Loyiha tavsifi', start: 'Boshlanish sanasi', target: 'Maqsadli muddat', estimate: 'Topshirish bahosi', status: 'Holat', create: 'Yaratish', projects: 'Loyihalar', progress: 'Bajarilgan', milestones: 'Bosqichlar', addMilestone: 'Bosqich qo‘shish', weight: 'Vazn', due: 'Muddat', tasks: 'Vazifalar', addTask: 'Vazifa qo‘shish', taskTitle: 'Vazifa nomi', taskStatus: 'Vazifa holati', progressPct: 'Bajarilishi %', notes: 'Ishlab chiqish izohlari', blocker: 'To‘siq / kechikish izohi', update: 'Jarayon yangilanishi', updateTitle: 'Yangilanish sarlavhasi', updateBody: 'Mijozga ko‘rinadigan yangilik', publish: 'E’lon qilish', activity: 'Faoliyat tarixi', noCompanies: 'Hozircha kompaniyalar qo‘shilmagan.', noProjects: 'Hozircha loyihalar biriktirilmagan.', noTasks: 'Hozircha vazifalar yo‘q.', loading: 'Ma’lumot yuklanmoqda…', error: 'Boshqaruv ma’lumotini yuklab bo‘lmadi.', retry: 'Qayta urinish', dashboard: 'Loyiha tafsilotlari', select: 'Tafsilotlarni ochish', saveTask: 'Vazifani saqlash', saveMilestone: 'Bosqichni saqlash', unknown: 'Noma’lum holat', copiedError: 'Nusxalab bo‘lmadi. Kodni qo‘lda belgilang va nusxalang.' },
} as const;

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-600';
const buttonClass = 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-700 hover:text-cyan-100 disabled:opacity-50';
let adminCsrfToken = '';

function csrfCookie() {
  const parts = document.cookie.split(';').map((part) => part.trim());
  const found = parts.find((part) => part.startsWith('__Host-ziyo_admin_csrf='))
    || parts.find((part) => part.startsWith('ziyo_admin_csrf='))
    || parts.find((part) => part.startsWith('__Host-ziyo_csrf='))
    || parts.find((part) => part.startsWith('ziyo_csrf='));
  return found ? decodeURIComponent(found.slice(found.indexOf('=') + 1)) : '';
}

async function requestJson<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.method && options.method !== 'GET') headers['X-CSRF-Token'] = adminCsrfToken || csrfCookie();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET', credentials: 'include', cache: 'no-store', headers,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new Error(`Could not reach the configured ZiyoTech API at ${API_BASE_URL || 'the local backend'}. Verify that the original my_company backend is running.`);
  }
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {};
  if (!response.ok) {
    if (response.status === 401) adminCsrfToken = '';
    if (response.status === 401) window.dispatchEvent(new Event('ziyotech-admin-session-expired'));
    const message = response.status === 404 && !contentType.includes('application/json')
      ? `Project Management routes are not registered on the configured API at ${API_BASE_URL || 'the local backend'}. Restart the original my_company backend after updating its server source.`
      : response.status === 404
        ? data.error || 'The requested company or project was not found.'
        : response.status === 401
          ? 'Administrator session expired. Sign in again to manage projects.'
          : response.status === 403
            ? data.error || 'Administrator access is required for this action.'
            : response.status === 400
              ? data.error || 'Some company or project details are invalid. Review the fields and try again.'
              : response.status >= 500
                ? data.error || 'The backend could not complete this request. Check database connectivity and migration 003.'
                : data.error || `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return data as T;
}

function Field({ label, value, onChange, type = 'text', required = false, multiline = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; multiline?: boolean }) {
  return <label className="block min-w-0 space-y-1.5"><span className="text-[11px] font-medium text-slate-400">{label}</span>{multiline
    ? <textarea value={value} onChange={(event) => onChange(event.target.value)} required={required} rows={2} maxLength={5000} className={inputClass + ' resize-y'} />
    : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={type === 'email' ? 254 : 160} className={inputClass} />}</label>;
}

function DateField({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <Field label={label} type="date" value={value || ''} onChange={onChange} />;
}

export const ClientProjectManagementView: React.FC = () => {
  const { language } = useLanguage();
  const t = labels[language];
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [codeExpiry, setCodeExpiry] = useState<Record<string, string>>({});
  const [companyDraft, setCompanyDraft] = useState({ companyName: '', contactPerson: '', email: '', phone: '', description: '' });
  const [projectDrafts, setProjectDrafts] = useState<Record<string, { title: string; description: string; scope: string; startDate: string; targetCompletionDate: string; estimatedCompletionDate: string }>>({});
  const [milestoneDrafts, setMilestoneDrafts] = useState<Record<string, { title: string; description: string; weight: string; startDate: string; dueDate: string }>>({});
  const [taskDrafts, setTaskDrafts] = useState<Record<string, { title: string; weight: string; dueDate: string; status: Task['status']; completionPercentage: string; developmentNotes: string; blocker: string }>>({});
  const [updateDrafts, setUpdateDrafts] = useState<Record<string, { title: string; body: string }>>({});
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setData(await requestJson<Dashboard>('/api/admin/client-projects')); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : t.error); }
    finally { setLoading(false); }
  }, [t.error]);

  useEffect(() => {
    void requestJson<{ csrfToken?: string }>('/api/admin/session')
      .then((session) => { adminCsrfToken = session.csrfToken || ''; return load(); })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : t.error));
  }, [load, t.error]);

  const refreshProject = async (projectId: string) => {
    const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}`);
    setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
  };

  const refreshAll = async () => { await load(); };
  const run = async (action: () => Promise<unknown>, success?: string) => {
    setError(''); setNotice('');
    try { await action(); if (success) setNotice(success); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : t.error); }
  };

  const saveCompany = async (event: React.FormEvent) => {
    event.preventDefault();
    await run(async () => {
      await requestJson(editingCompany ? `/api/admin/client-projects/companies/${editingCompany}` : '/api/admin/client-projects/companies', { method: editingCompany ? 'PUT' : 'POST', body: companyDraft });
      setCompanyDraft({ companyName: '', contactPerson: '', email: '', phone: '', description: '' });
      setEditingCompany(null); setCompanyFormOpen(false); await refreshAll();
    });
  };

  const startCompanyEdit = (company: Company) => {
    setCompanyDraft({ companyName: company.companyName, contactPerson: company.contactPerson, email: company.email, phone: company.phone, description: company.description });
    setEditingCompany(company.id); setCompanyFormOpen(true);
  };

  const createProjectFor = async (event: React.FormEvent, companyId: string) => {
    event.preventDefault();
    const draft = projectDrafts[companyId];
    if (!draft) return;
    await run(async () => {
      await requestJson('/api/admin/client-projects/projects', { method: 'POST', body: { ...draft, companyId, status: 'planning' } });
      setProjectDrafts((previous) => ({ ...previous, [companyId]: { title: '', description: '', scope: '', startDate: '', targetCompletionDate: '', estimatedCompletionDate: '' } }));
      await refreshAll();
    });
  };

  const issueCode = async (companyId: string) => run(async () => {
    const expiresAt = codeExpiry[companyId] ? new Date(`${codeExpiry[companyId]}T23:59:59.999Z`).toISOString() : null;
    const result = await requestJson<{ code: string; expiresAt: string | null }>(`/api/admin/client-projects/companies/${companyId}/access-code`, { method: 'POST', body: { expiresAt } });
    setRevealedCodes((previous) => ({ ...previous, [companyId]: result.code }));
    setNotice(result.expiresAt ? `Access code expires ${new Date(result.expiresAt).toLocaleDateString()}.` : 'Access code has no expiration date.');
    await refreshAll();
  });

  const copyCode = async (companyId: string) => {
    const code = revealedCodes[companyId];
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setNotice(t.copied); }
    catch { setError(t.copiedError); }
  };

  const publishMilestone = async (event: React.FormEvent, projectId: string) => {
    event.preventDefault();
    const draft = milestoneDrafts[projectId];
    if (!draft) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/milestones`, { method: 'POST', body: { ...draft, weight: Number(draft.weight) } });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setMilestoneDrafts((previous) => ({ ...previous, [projectId]: { title: '', description: '', weight: '10', startDate: '', dueDate: '' } }));
    });
  };

  const saveMilestone = async (event: React.FormEvent, projectId: string) => {
    event.preventDefault();
    if (!editingMilestone) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/milestones/${editingMilestone.id}`, { method: 'PUT', body: { ...editingMilestone, weight: Number(editingMilestone.weight) } });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setEditingMilestone(null);
    });
  };

  const createTaskFor = async (event: React.FormEvent, projectId: string, milestoneId: string) => {
    event.preventDefault();
    const key = `${projectId}:${milestoneId}`;
    const draft = taskDrafts[key];
    if (!draft) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/milestones/${milestoneId}/tasks`, { method: 'POST', body: { ...draft, weight: Number(draft.weight), completionPercentage: Number(draft.completionPercentage) } });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setTaskDrafts((previous) => ({ ...previous, [key]: { title: '', weight: '1', dueDate: '', status: 'upcoming', completionPercentage: '0', developmentNotes: '', blocker: '' } }));
    });
  };

  const saveTask = async (projectId: string, task: Task, patch: Partial<Task>) => run(async () => {
    const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/tasks/${task.id}`, { method: 'PATCH', body: { ...task, ...patch } });
    setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
  });

  const saveTaskEdit = async (event: React.FormEvent, projectId: string) => {
    event.preventDefault(); if (!editingTask) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/tasks/${editingTask.id}`, { method: 'PATCH', body: { ...editingTask, weight: Number(editingTask.weight), completionPercentage: Number(editingTask.completionPercentage) } });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setEditingTask(null);
    });
  };

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault(); if (!editingProject) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${editingProject.id}`, { method: 'PUT', body: editingProject });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === project.id ? project : item) } : previous);
      setEditingProject(null);
    });
  };

  const publishUpdate = async (event: React.FormEvent, projectId: string) => {
    event.preventDefault(); const draft = updateDrafts[projectId]; if (!draft) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/updates`, { method: 'POST', body: draft });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setUpdateDrafts((previous) => ({ ...previous, [projectId]: { title: '', body: '' } }));
    });
  };

  const uploadProjectResource = async (event: React.FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const file = fields.get('file');
    if (!(file instanceof File) || !file.size) { setError('Choose a file first.'); return; }
    const title = String(fields.get('title') || '').trim() || file.name;
    const visibility = String(fields.get('visibility') || 'private');
    await run(async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/client-projects/projects/${projectId}/resources/upload`, {
        method: 'POST', credentials: 'include', headers: {
          'Content-Type': file.type, 'X-CSRF-Token': adminCsrfToken || csrfCookie(),
          'X-Resource-Title': encodeURIComponent(title), 'X-Resource-Description': encodeURIComponent(String(fields.get('description') || '')),
          'X-Resource-Visibility': visibility, 'X-Resource-File-Name': encodeURIComponent(file.name),
        }, body: await file.arrayBuffer(),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Project resource upload failed.');
      await refreshProject(projectId);
      form.reset();
    });
  };

  const addProjectLink = async (event: React.FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form);
    await run(async () => {
      await requestJson(`/api/admin/client-projects/projects/${projectId}/resources/link`, { method: 'POST', body: { title: fields.get('title'), description: fields.get('description'), url: fields.get('url'), visibility: fields.get('visibility') } });
      await refreshProject(projectId); form.reset();
    });
  };

  const formGrid = 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3';
  const sectionClass = 'rounded-2xl border border-slate-800 bg-slate-900/45 p-4 sm:p-5';

  return <section className="space-y-5" aria-labelledby="client-project-management-title">
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div><h2 id="client-project-management-title" className="text-lg font-bold text-white sm:text-xl">{t.title}</h2><p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.subtitle}</p></div>
      <button type="button" onClick={() => { setCompanyFormOpen((value) => !value); setEditingCompany(null); setCompanyDraft({ companyName: '', contactPerson: '', email: '', phone: '', description: '' }); }} className={buttonClass}><Plus className="h-4 w-4" />{t.addCompany}</button>
    </header>
    {error && <div role="alert" className="rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-sm text-rose-200">{error}<button type="button" className="ml-3 underline" onClick={() => void load()}>{t.retry}</button></div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-800/60 bg-emerald-950/25 p-3 text-sm text-emerald-200">{notice}</div>}
    {companyFormOpen && <form onSubmit={(event) => void saveCompany(event)} className={sectionClass}>
      <h3 className="mb-4 text-sm font-bold text-white">{editingCompany ? t.edit : t.addCompany}</h3>
      <div className={formGrid}>
        <Field label={t.name} value={companyDraft.companyName} onChange={(value) => setCompanyDraft({ ...companyDraft, companyName: value })} required />
        <Field label={t.contact} value={companyDraft.contactPerson} onChange={(value) => setCompanyDraft({ ...companyDraft, contactPerson: value })} />
        <Field label={t.email} type="email" value={companyDraft.email} onChange={(value) => setCompanyDraft({ ...companyDraft, email: value })} />
        <Field label={t.phone} type="tel" value={companyDraft.phone} onChange={(value) => setCompanyDraft({ ...companyDraft, phone: value })} />
        <div className="sm:col-span-2"><Field label={t.description} value={companyDraft.description} onChange={(value) => setCompanyDraft({ ...companyDraft, description: value })} multiline /></div>
      </div>
      <div className="mt-4 flex gap-2"><button className={buttonClass} type="submit">{t.save}</button><button className={buttonClass} type="button" onClick={() => { setCompanyFormOpen(false); setEditingCompany(null); }}>{t.cancel}</button></div>
    </form>}

    {loading && <div className={sectionClass}><RefreshCw className="mr-2 inline h-4 w-4 animate-spin text-cyan-300" />{t.loading}</div>}
    {!loading && data?.companies.length === 0 && <div className={sectionClass}><Building2 className="mb-2 h-5 w-5 text-cyan-300" />{t.noCompanies}</div>}
    {!loading && data?.companies.map((company) => {
      const companyProjects = data.projects.filter((project) => project.companyId === company.id);
          const projectDraft = projectDrafts[company.id] || { title: '', description: '', scope: '', startDate: '', targetCompletionDate: '', estimatedCompletionDate: '' };
      return <article key={company.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 p-4 sm:p-5">
          <div className="flex min-w-0 items-start gap-3"><Building2 className="mt-1 h-5 w-5 shrink-0 text-cyan-300" /><div className="min-w-0"><h3 className="truncate text-base font-bold text-white">{company.companyName}</h3><p className="mt-1 text-xs text-slate-400">{[company.contactPerson, company.email, company.phone].filter(Boolean).join(' · ')}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] ${company.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{company.status === 'active' ? t.active : t.inactive} · {companyProjects.length} {t.projects.toLocaleLowerCase()}</span></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => startCompanyEdit(company)}>{t.edit}</button><button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson(`/api/admin/client-projects/companies/${company.id}/status`, { method: 'PATCH', body: { status: company.status === 'active' ? 'inactive' : 'active' } }); await refreshAll(); })}>{company.status === 'active' ? t.deactivate : t.activate}</button></div>
        </header>
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:p-5">
          <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4" aria-label={t.code}>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white"><KeyRound className="h-4 w-4 text-cyan-300" />{t.code}</h4>
            <div className="mt-3 flex flex-wrap items-end gap-2"><label className="block space-y-1"><span className="text-[10px] text-slate-500">Optional expiration</span><input aria-label="Optional access-code expiration" type="date" min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} max={new Date(Date.now() + 366 * 86400000).toISOString().slice(0, 10)} value={codeExpiry[company.id] || ''} onChange={(event) => setCodeExpiry((previous) => ({ ...previous, [company.id]: event.target.value }))} className={inputClass} /></label><button type="button" disabled={company.status !== 'active'} className={buttonClass} onClick={() => void issueCode(company.id)}><RefreshCw className="h-3.5 w-3.5" />{t.generateCode}</button>{company.hasActiveCode && <button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson(`/api/admin/client-projects/companies/${company.id}/access-code`, { method: 'DELETE' }); setRevealedCodes((previous) => { const next = { ...previous }; delete next[company.id]; return next; }); await refreshAll(); })}><ShieldOff className="h-3.5 w-3.5" />{t.revokeCode}</button>}</div>
            {revealedCodes[company.id] && <div className="mt-3 rounded-lg border border-cyan-800/50 bg-cyan-950/20 p-3"><code className="block break-all font-mono text-sm tracking-widest text-cyan-100">{revealedCodes[company.id]}</code><button type="button" className={`${buttonClass} mt-2`} onClick={() => void copyCode(company.id)}><Copy className="h-3.5 w-3.5" />{t.copyCode}</button><p className="mt-2 text-[10px] leading-relaxed text-amber-200/80">{t.codeWarning}</p></div>}
          </section>
          <form onSubmit={(event) => void createProjectFor(event, company.id)} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Plus className="h-4 w-4 text-cyan-300" />{t.createProject}</h4>
            <div className="grid gap-3 sm:grid-cols-2"><Field label={t.projectTitle} required value={projectDraft.title} onChange={(value) => setProjectDrafts((previous) => ({ ...previous, [company.id]: { ...projectDraft, title: value } }))} /><Field label={t.projectDescription} value={projectDraft.description} onChange={(value) => setProjectDrafts((previous) => ({ ...previous, [company.id]: { ...projectDraft, description: value } }))} /><Field label="Project scope" value={projectDraft.scope} onChange={(value) => setProjectDrafts((previous) => ({ ...previous, [company.id]: { ...projectDraft, scope: value } }))} multiline /><DateField label={t.start} value={projectDraft.startDate} onChange={(value) => setProjectDrafts((previous) => ({ ...previous, [company.id]: { ...projectDraft, startDate: value } }))} /><DateField label={t.target} value={projectDraft.targetCompletionDate} onChange={(value) => setProjectDrafts((previous) => ({ ...previous, [company.id]: { ...projectDraft, targetCompletionDate: value } }))} /><DateField label={t.estimate} value={projectDraft.estimatedCompletionDate} onChange={(value) => setProjectDrafts((previous) => ({ ...previous, [company.id]: { ...projectDraft, estimatedCompletionDate: value } }))} /></div>
            <button type="submit" className={`${buttonClass} mt-3`} disabled={company.status !== 'active'}>{t.createProject}</button>
          </form>
        </div>
        <div className="border-t border-slate-800 p-4 sm:p-5"><h4 className="mb-3 text-sm font-semibold text-slate-200">{t.projects}</h4>
          {companyProjects.length === 0 ? <p className="text-xs text-slate-500">{t.noProjects}</p> : <div className="space-y-3">{companyProjects.map((project) => {
            const expanded = expandedProject === project.id;
            return <div key={project.id} className="rounded-xl border border-slate-800 bg-slate-950/45">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{project.title}</p><p className="mt-1 text-[11px] text-slate-500">{project.status} · {t.progress} {project.progress.overallPercentage}% · {project.targetCompletionDate || t.unknown}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${project.progress.overallPercentage}%` }} /></div></div><button type="button" className={buttonClass} onClick={() => setExpandedProject(expanded ? null : project.id)}>{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}{t.select}</button></div>
              {expanded && <div className="space-y-4 border-t border-slate-800 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h5 className="text-xs font-bold uppercase tracking-wide text-cyan-200">{t.dashboard}</h5><button type="button" className={buttonClass} onClick={() => setEditingProject(project)}>{t.edit}</button></div>
                {editingProject?.id === project.id && <form onSubmit={(event) => void saveProject(event)} className="grid gap-3 rounded-xl border border-slate-800 p-3 sm:grid-cols-2">
                  <Field label={t.projectTitle} required value={editingProject.title} onChange={(value) => setEditingProject({ ...editingProject, title: value })} /><Field label={t.projectDescription} value={editingProject.description} onChange={(value) => setEditingProject({ ...editingProject, description: value })} /><Field label="Project scope" value={editingProject.scope || ''} onChange={(value) => setEditingProject({ ...editingProject, scope: value })} multiline />
                  <DateField label={t.start} value={editingProject.startDate} onChange={(value) => setEditingProject({ ...editingProject, startDate: value })} /><DateField label={t.target} value={editingProject.targetCompletionDate} onChange={(value) => setEditingProject({ ...editingProject, targetCompletionDate: value })} /><DateField label={t.estimate} value={editingProject.estimatedCompletionDate} onChange={(value) => setEditingProject({ ...editingProject, estimatedCompletionDate: value })} />
                  <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">{t.status}</span><select className={inputClass} value={editingProject.status} onChange={(event) => setEditingProject({ ...editingProject, status: event.target.value })}>{['planning','in_progress','blocked','delayed','completed','on_hold'].map((status) => <option key={status}>{status}</option>)}</select></label>
                  <div className="flex gap-2 sm:col-span-2"><button type="submit" className={buttonClass}>{t.save}</button><button type="button" className={buttonClass} onClick={() => setEditingProject(null)}>{t.cancel}</button></div>
                </form>}
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[t.progress, `${project.progress.overallPercentage}%`], [t.target, project.targetCompletionDate || '—'], [t.estimate, project.estimatedCompletionDate || '—'], [t.tasks, String(project.tasks.length)]] .map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"><p className="text-[10px] uppercase text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>)}</div>
                <ProjectProgressChart history={project.progress.history} startDate={project.startDate} targetDate={project.targetCompletionDate} />
                <form onSubmit={(event) => void publishMilestone(event, project.id)} className="rounded-xl border border-slate-800 p-3"><h5 className="mb-3 text-xs font-bold text-white">{t.addMilestone}</h5><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{(() => { const draft = milestoneDrafts[project.id] || { title: '', description: '', weight: '10', startDate: '', dueDate: '' }; return <><Field label={t.milestones} required value={draft.title} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, title: value } }))} /><Field label={t.description} value={draft.description} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, description: value } }))} /><Field label={t.weight} type="number" value={draft.weight} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, weight: value } }))} /><DateField label={t.start} value={draft.startDate} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, startDate: value } }))} /><DateField label={t.due} value={draft.dueDate} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, dueDate: value } }))} /></>; })()}</div><button className={`${buttonClass} mt-3`} type="submit">{t.addMilestone}</button></form>
                <div className="space-y-3">{project.milestones.map((milestone) => {
                  const draftKey = `${project.id}:${milestone.id}`;
                  const taskDraft = taskDrafts[draftKey] || { title: '', weight: '1', dueDate: '', status: 'upcoming' as const, completionPercentage: '0', developmentNotes: '', blocker: '' };
                  return <section key={milestone.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><h6 className="text-sm font-semibold text-white">{milestone.title}</h6><p className="mt-1 text-[10px] text-slate-500">{t.weight}: {milestone.weight} · {t.due}: {milestone.dueDate || '—'} · {milestone.status} · {milestone.completionPercentage}%</p><div className="mt-2 h-1.5 max-w-lg overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${milestone.completionPercentage}%` }} /></div></div><button type="button" className={buttonClass} onClick={() => setEditingMilestone(milestone)}>{t.edit}</button></div>
                    {editingMilestone?.id === milestone.id && <form onSubmit={(event) => void saveMilestone(event, project.id)} className="mt-3 grid gap-2 sm:grid-cols-2"><Field label={t.milestones} required value={editingMilestone.title} onChange={(value) => setEditingMilestone({ ...editingMilestone, title: value })} /><Field label={t.description} value={editingMilestone.description} onChange={(value) => setEditingMilestone({ ...editingMilestone, description: value })} /><Field label={t.weight} type="number" value={String(editingMilestone.weight)} onChange={(value) => setEditingMilestone({ ...editingMilestone, weight: Number(value) })} /><DateField label={t.start} value={editingMilestone.startDate} onChange={(value) => setEditingMilestone({ ...editingMilestone, startDate: value })} /><DateField label={t.due} value={editingMilestone.dueDate} onChange={(value) => setEditingMilestone({ ...editingMilestone, dueDate: value })} /><button type="submit" className={buttonClass}>{t.saveMilestone}</button></form>}
                    {project.tasks.filter((task) => task.milestoneId === milestone.id).map((task) => <div key={task.id} className="mt-3 rounded-lg border border-slate-800/80 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-medium text-slate-200">{task.title}</p><p className="mt-1 text-[10px] text-slate-500">{t.weight}: {task.weight} · {task.completionPercentage}% · {task.dueDate || '—'} · {task.status}</p>{task.blocker && <p className="mt-1 text-[10px] text-amber-200">{task.blocker}</p>}</div><button type="button" className={buttonClass} onClick={() => setEditingTask({ ...task })}>{t.edit}</button></div>
                      {editingTask?.id === task.id && <form onSubmit={(event) => void saveTaskEdit(event, project.id)} className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <Field label={t.taskTitle} required value={editingTask.title} onChange={(value) => setEditingTask({ ...editingTask, title: value })} /><Field label={t.weight} type="number" value={String(editingTask.weight)} onChange={(value) => setEditingTask({ ...editingTask, weight: Number(value) })} />
                        <label className="block space-y-1"><span className="text-[10px] text-slate-500">{t.taskStatus}</span><select value={editingTask.status} onChange={(event) => setEditingTask({ ...editingTask, status: event.target.value as Task['status'] })} className={inputClass}>{['upcoming','in_progress','blocked','completed'].map((status) => <option key={status}>{status}</option>)}</select></label>
                        <Field label={t.progressPct} type="number" value={String(editingTask.completionPercentage)} onChange={(value) => setEditingTask({ ...editingTask, completionPercentage: Number(value) })} /><DateField label={t.due} value={editingTask.dueDate} onChange={(value) => setEditingTask({ ...editingTask, dueDate: value })} />
                        <Field label={t.notes} value={editingTask.developmentNotes} onChange={(value) => setEditingTask({ ...editingTask, developmentNotes: value })} /><Field label={t.blocker} value={editingTask.blocker} onChange={(value) => setEditingTask({ ...editingTask, blocker: value })} />
                        <div className="flex items-end gap-2"><button type="submit" className={buttonClass}>{t.saveTask}</button><button type="button" className={buttonClass} onClick={() => setEditingTask(null)}>{t.cancel}</button></div>
                      </form>}
                    </div>)}
                    <form onSubmit={(event) => void createTaskFor(event, project.id, milestone.id)} className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <Field label={t.taskTitle} required value={taskDraft.title} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, title: value } }))} /><Field label={t.weight} type="number" value={taskDraft.weight} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, weight: value } }))} /><DateField label={t.due} value={taskDraft.dueDate} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, dueDate: value } }))} /><label className="block space-y-1"><span className="text-[10px] text-slate-500">{t.taskStatus}</span><select value={taskDraft.status} onChange={(event) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, status: event.target.value as Task['status'] } }))} className={inputClass}>{['upcoming','in_progress','blocked','completed'].map((status) => <option key={status}>{status}</option>)}</select></label>
                      <Field label={t.progressPct} type="number" value={taskDraft.completionPercentage} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, completionPercentage: value } }))} /><Field label={t.notes} value={taskDraft.developmentNotes} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, developmentNotes: value } }))} /><Field label={t.blocker} value={taskDraft.blocker} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, blocker: value } }))} /><button type="submit" className={`${buttonClass} self-end`}><Plus className="h-3.5 w-3.5" />{t.addTask}</button>
                    </form>
                  </section>;
                })}</div>
                <form onSubmit={(event) => void publishUpdate(event, project.id)} className="grid gap-2 rounded-xl border border-slate-800 p-3 sm:grid-cols-[0.8fr_1.2fr_auto] sm:items-end">{(() => { const draft = updateDrafts[project.id] || { title: '', body: '' }; return <><Field label={t.updateTitle} required value={draft.title} onChange={(value) => setUpdateDrafts((p) => ({ ...p, [project.id]: { ...draft, title: value } }))} /><Field label={t.updateBody} required value={draft.body} onChange={(value) => setUpdateDrafts((p) => ({ ...p, [project.id]: { ...draft, body: value } }))} /><button className={buttonClass} type="submit">{t.publish}</button></>; })()}</form>
                <section className="space-y-3 rounded-xl border border-slate-800 p-3" aria-label="Project media and resources">
                  <h5 className="text-xs font-bold text-slate-300">Project media &amp; resources</h5>
                  <form onSubmit={(event) => void uploadProjectResource(event, project.id)} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <input name="title" maxLength={160} placeholder="Resource title (defaults to file name)" className={inputClass} />
                    <label className="block space-y-1"><span className="text-[10px] text-slate-500">Image, video, or PDF (max 8 MB)</span><input required name="file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf" className="block w-full text-[10px] text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-800 file:px-2 file:py-1.5 file:text-xs file:text-slate-200" /></label>
                    <label className="block space-y-1"><span className="text-[10px] text-slate-500">Visibility</span><select name="visibility" className={inputClass}><option value="private">Private</option><option value="client">Visible to client</option></select></label>
                    <input name="description" maxLength={2000} placeholder="Description" className={inputClass} />
                    <button type="submit" className={`${buttonClass} sm:col-span-2 xl:col-span-4`}>Upload resource</button>
                  </form>
                  <form onSubmit={(event) => void addProjectLink(event, project.id)} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <input required name="title" maxLength={160} placeholder="Link title" className={inputClass} /><input required name="url" type="url" placeholder="https://preview.example.com" className={inputClass} />
                    <input name="description" maxLength={2000} placeholder="Description" className={inputClass} /><select name="visibility" className={inputClass}><option value="private">Private</option><option value="client">Visible to client</option></select>
                    <button type="submit" className={`${buttonClass} sm:col-span-2 xl:col-span-4`}>Add HTTPS link</button>
                  </form>
                  <div className="grid gap-2 sm:grid-cols-2">{(project.resources || []).map((resource) => <article key={resource.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                    {resource.resourceType === 'image' && <img src={`${API_BASE_URL}/api/admin/client-projects/projects/${project.id}/resources/${resource.id}/content`} alt={resource.title} loading="lazy" className="mb-2 max-h-48 w-full rounded-lg object-contain" />}
                    {resource.resourceType === 'video' && <video controls preload="none" className="mb-2 max-h-48 w-full rounded-lg" src={`${API_BASE_URL}/api/admin/client-projects/projects/${project.id}/resources/${resource.id}/content`} />}
                    <p className="text-xs font-semibold text-white">{resource.title}</p><p className="mt-1 text-[10px] text-slate-400">{resource.description || resource.fileName} · {resource.visibility}</p>
                    {resource.resourceType === 'link' ? <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Open link</a> : <a href={`${API_BASE_URL}/api/admin/client-projects/projects/${project.id}/resources/${resource.id}/content`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Open or download</a>}
                    <div className="mt-2 flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson(`/api/admin/client-projects/projects/${project.id}/resources/${resource.id}`, { method: 'PATCH', body: { visibility: resource.visibility === 'client' ? 'private' : 'client' } }); await refreshProject(project.id); })}>{resource.visibility === 'client' ? 'Make private' : 'Share with client'}</button><button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson(`/api/admin/client-projects/projects/${project.id}/resources/${resource.id}`, { method: 'DELETE' }); await refreshProject(project.id); })}>Remove</button></div>
                  </article>)}</div>
                  {project.resources?.length === 0 && <p className="text-[10px] text-slate-500">Resources are private until explicitly shared with the client.</p>}
                </section>
                {project.updates.length > 0 && <div><h5 className="mb-2 text-xs font-bold text-slate-300">{t.update}</h5><ul className="space-y-2">{project.updates.slice(0, 5).map((update) => <li key={update.id} className="rounded-lg bg-slate-900/70 p-3"><p className="text-xs font-semibold text-white">{update.title}</p><p className="mt-1 text-xs text-slate-300">{update.body}</p><p className="mt-1 text-[10px] text-slate-500">{new Date(update.createdAt).toLocaleString()} · {update.authorDisplayName}</p></li>)}</ul></div>}
                {project.activity && <details className="rounded-lg border border-slate-800 p-3"><summary className="cursor-pointer text-xs font-semibold text-slate-300"><Activity className="mr-2 inline h-3.5 w-3.5" />{t.activity}</summary><ul className="mt-2 space-y-1">{project.activity.map((item) => <li key={item.id} className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleString()} · {item.eventType}</li>)}</ul></details>}
              </div>}
            </div>;
          })}</div>}
        </div>
      </article>;
    })}
  </section>;
};
