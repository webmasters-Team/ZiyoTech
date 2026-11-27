import React, { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import { Activity, ArrowDown, ArrowUp, Building2, Check, ChevronDown, ChevronRight, Copy, KeyRound, Plus, RefreshCw, ShieldOff, Trash2 } from 'lucide-react';
import { ProjectProgressChart } from './ProjectProgressChart';

type Company = { id: string; companyName: string; contactPerson: string; email: string; phone: string; description: string; website?: string; logoUrl?: string; industry?: string; internalNotes?: string; status: 'active' | 'inactive'; projectCount: number; hasActiveCode: boolean; createdAt: string };
type ProjectManager = { id: string; fullName: string; email: string };
type Task = { id: string; milestoneId: string; stageId?: string | null; title: string; description: string; weight: number; status: 'upcoming' | 'in_progress' | 'blocked' | 'completed'; completionPercentage: number; dueDate?: string; developmentNotes: string; blocker: string };
type Milestone = { id: string; title: string; description: string; weight: number; dueDate?: string; startDate?: string; completionPercentage: number; status: string; clientVisible: boolean; taskIds: string[] };
type Stage = { id: string; title: string; description: string; stageOrder: number; status: Task['status']; startDate?: string; dueDate?: string; completionPercentage: number; clientVisible: boolean; completedAt?: string };
type Resource = { id: string; projectId: string; resourceType: 'image' | 'video' | 'document' | 'link'; category: string; fileName: string; mimeType: string; sizeBytes: number; externalUrl: string; title: string; description: string; visibility: 'private' | 'client'; createdAt: string };
type Feedback = { id: string; milestoneId?: string | null; kind: 'feedback' | 'revision_request'; message: string; status: string; adminResponse: string; createdAt: string };
type Approval = { id: string; milestoneId: string; requestNote: string; status: string; clientComment: string; requestedAt: string };
type Project = { id: string; companyId: string; companyName: string; companyLogoUrl?: string; assignedManagerId?: string | null; assignedManagerName?: string; category?: string; priority?: string; impact?: string; title: string; description: string; scope: string; status: string; startDate?: string; targetCompletionDate?: string; estimatedCompletionDate?: string; actualCompletionDate?: string; progress: { overallPercentage: number; completedTaskCount: number; remainingTaskCount: number; completedMilestoneCount: number; remainingMilestoneCount: number; overdueMilestoneCount: number; estimatedDaysRemaining: number | null; currentStage: Stage | null; history: Array<{ date: string; plannedPercentage: number; actualPercentage: number }>; phases: Array<{ milestoneId: string; label: string; completionPercentage: number }> }; stages: Stage[]; milestones: Milestone[]; tasks: Task[]; updates: Array<{ id: string; title: string; body: string; stageId?: string; stageTitle?: string; createdAt: string; authorDisplayName: string; resources: Resource[] }>; resources: Resource[]; feedback: Feedback[]; approvals: Approval[]; activity?: Array<{ id: string; eventType: string; entityType: string; createdAt: string }> };
type Dashboard = { companies: Company[]; projects: Project[] };
type AssignmentDraft = { projectId: string; targetCompletionDate: string; estimatedCompletionDate: string; impact: string; priority: string; status: string };
type StageDraft = { title: string; description: string; status: Stage['status']; startDate: string; dueDate: string; clientVisible: boolean; completionPercentage: number };
type UpdateDraft = { title: string; body: string; stageId: string; clientVisible: boolean; resourceIds: string[] };
type WorkspaceTab = 'overview' | 'milestones' | 'tasks' | 'timeline' | 'updates' | 'resources' | 'activity' | 'feedback' | 'settings';
const workspaceTabOrder: WorkspaceTab[] = ['overview', 'milestones', 'tasks', 'timeline', 'updates', 'resources', 'feedback', 'activity', 'settings'];
const workspaceTabNames: Record<'en' | 'ru' | 'uz', Partial<Record<WorkspaceTab, string>>> = {
  en: { overview: 'Overview', milestones: 'Milestones', tasks: 'Tasks', timeline: 'Timeline & stages', updates: 'Updates', resources: 'Files & Resources', activity: 'Activity History', feedback: 'Client feedback', settings: 'Settings' },
  ru: { overview: 'Обзор', milestones: 'Этапы', tasks: 'Задачи', timeline: 'Сроки', updates: 'Обновления', resources: 'Файлы и ресурсы', activity: 'История действий', settings: 'Настройки' },
  uz: { overview: 'Umumiy ma’lumot', milestones: 'Bosqichlar', tasks: 'Vazifalar', timeline: 'Vaqt jadvali', updates: 'Yangilanishlar', resources: 'Fayllar va resurslar', activity: 'Faoliyat tarixi', settings: 'Sozlamalar' },
};

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

function uploadBinary(url: string, method: 'POST' | 'PUT', file: File, headers: Record<string, string>, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', file.type);
    Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); };
    xhr.onerror = () => reject(new Error('Media upload could not reach the configured API.'));
    xhr.onload = () => {
      const data = (() => { try { return JSON.parse(xhr.responseText) as { error?: string }; } catch { return {}; } })();
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(data.error || `Media request failed (${xhr.status}).`));
    };
    xhr.send(file);
  });
}

export const ClientProjectManagementView: React.FC<{ selectedCompanyId?: string; selectedProjectId?: string; onBackToCompanies?: () => void }> = ({ selectedCompanyId, selectedProjectId, onBackToCompanies }) => {
  const { language } = useLanguage();
  const t = labels[language];
  const [data, setData] = useState<Dashboard | null>(null);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [workspaceTabs, setWorkspaceTabs] = useState<Record<string, WorkspaceTab>>({});
  const [companySearch, setCompanySearch] = useState('');
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(selectedCompanyId || null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [codeExpiry, setCodeExpiry] = useState<Record<string, string>>({});
  const [companyDraft, setCompanyDraft] = useState({ companyName: '', contactPerson: '', email: '', phone: '', description: '', website: '', logoUrl: '', industry: '', internalNotes: '' });
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, AssignmentDraft>>({});
  const [projectSearch, setProjectSearch] = useState<Record<string, string>>({});
  const [stageDrafts, setStageDrafts] = useState<Record<string, Omit<StageDraft, 'status' | 'clientVisible' | 'completionPercentage'>>>({});
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<Record<string, { status: string; response: string }>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, { current: number; total: number; percent: number }>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [milestoneDrafts, setMilestoneDrafts] = useState<Record<string, { title: string; description: string; weight: string; startDate: string; dueDate: string }>>({});
  const [taskDrafts, setTaskDrafts] = useState<Record<string, { title: string; weight: string; dueDate: string; stageId: string; status: Task['status']; completionPercentage: string; developmentNotes: string; blocker: string }>>({});
  const [updateDrafts, setUpdateDrafts] = useState<Record<string, UpdateDraft>>({});
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => { setActiveCompanyId(selectedCompanyId || null); }, [selectedCompanyId]);
  useEffect(() => { if (selectedProjectId && data?.projects.some((project) => project.id === selectedProjectId)) setExpandedProject(selectedProjectId); }, [selectedProjectId, data]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboard, managers] = await Promise.all([
        requestJson<Dashboard>('/api/admin/client-projects'),
        requestJson<ProjectManager[]>('/api/admin/client-projects/managers').catch(() => []),
      ]);
      setData(dashboard);
      setProjectManagers(Array.isArray(managers) ? managers : []);
    }
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
      setCompanyDraft({ companyName: '', contactPerson: '', email: '', phone: '', description: '', website: '', logoUrl: '', industry: '', internalNotes: '' });
      setEditingCompany(null); setCompanyFormOpen(false); await refreshAll();
    });
  };

  const startCompanyEdit = (company: Company) => {
    setCompanyDraft({ companyName: company.companyName, contactPerson: company.contactPerson, email: company.email, phone: company.phone, description: company.description, website: company.website || '', logoUrl: company.logoUrl || '', industry: company.industry || '', internalNotes: company.internalNotes || '' });
    setEditingCompany(company.id); setCompanyFormOpen(true);
  };

  const saveAssignment = async (event: React.FormEvent, company: Company, project: Project, draft: AssignmentDraft) => {
    event.preventDefault();
    await run(async () => {
      await requestJson(`/api/admin/client-projects/projects/${project.id}`, { method: 'PUT', body: {
        ...project,
        startDate: company.createdAt?.slice(0, 10) || '',
        targetCompletionDate: draft.targetCompletionDate || null,
        estimatedCompletionDate: draft.estimatedCompletionDate || null,
        impact: draft.impact,
        priority: draft.priority,
        status: draft.status,
      } });
      await refreshAll();
      setNotice('Project schedule and status saved.');
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
      setTaskDrafts((previous) => ({ ...previous, [key]: { title: '', weight: '1', dueDate: '', stageId: '', status: 'upcoming', completionPercentage: '0', developmentNotes: '', blocker: '' } }));
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
      const company = data?.companies.find((item) => item.id === editingProject.companyId);
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${editingProject.id}`, { method: 'PUT', body: { ...editingProject, startDate: company?.createdAt?.slice(0, 10) || editingProject.startDate } });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === project.id ? project : item) } : previous);
      setEditingProject(null);
    });
  };

  const publishStage = async (event: React.FormEvent, projectId: string) => {
    event.preventDefault();
    const draft = stageDrafts[projectId];
    if (!draft?.title.trim()) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/stages`, { method: 'POST', body: draft });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setStageDrafts((previous) => ({ ...previous, [projectId]: { title: '', description: '', startDate: '', dueDate: '' } }));
    });
  };

  const saveStage = async (event: React.FormEvent, projectId: string) => {
    event.preventDefault();
    if (!editingStage) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/stages/${editingStage.id}`, { method: 'PUT', body: editingStage });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setEditingStage(null);
    });
  };

  const moveStage = async (project: Project, stage: Stage, offset: number) => {
    const ordered = [...project.stages].sort((a, b) => a.stageOrder - b.stageOrder);
    const index = ordered.findIndex((item) => item.id === stage.id);
    const destination = index + offset;
    if (index < 0 || destination < 0 || destination >= ordered.length) return;
    [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
    await run(async () => {
      const next = await requestJson<Project>(`/api/admin/client-projects/projects/${project.id}/stages/reorder`, { method: 'PATCH', body: { orderedIds: ordered.map((item) => item.id) } });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === project.id ? next : item) } : previous);
    });
  };

  const requestApproval = (project: Project, milestone: Milestone) => run(async () => {
    await requestJson(`/api/admin/client-projects/projects/${project.id}/milestones/${milestone.id}/approval`, { method: 'POST', body: { requestNote: '' } });
    await refreshProject(project.id);
  }, 'Milestone sent to the client for approval.');

  const saveFeedback = (projectId: string, feedbackId: string) => run(async () => {
    const draft = editingFeedback[feedbackId];
    if (!draft) return;
    await requestJson(`/api/admin/client-projects/feedback/${feedbackId}`, { method: 'PATCH', body: draft });
    await refreshProject(projectId);
  }, 'Client feedback updated.');

  const publishUpdate = async (event: React.FormEvent, projectId: string) => {
    event.preventDefault(); const draft = updateDrafts[projectId]; if (!draft) return;
    await run(async () => {
      const project = await requestJson<Project>(`/api/admin/client-projects/projects/${projectId}/updates`, { method: 'POST', body: draft });
      setData((previous) => previous ? { ...previous, projects: previous.projects.map((item) => item.id === projectId ? project : item) } : previous);
      setUpdateDrafts((previous) => ({ ...previous, [projectId]: { title: '', body: '', stageId: '', clientVisible: true, resourceIds: [] } }));
    });
  };

  const uploadProjectResource = async (event: React.FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const files = fields.getAll('files').filter((file): file is File => file instanceof File && file.size > 0);
    if (!files.length) { setError('Choose at least one file.'); return; }
    const title = String(fields.get('title') || '').trim() || files[0].name;
    const visibility = String(fields.get('visibility') || 'private');
    await run(async () => {
      const description = String(fields.get('description') || '');
      const category = String(fields.get('category') || 'other');
      setUploadProgress((previous) => ({ ...previous, [projectId]: { current: 0, total: files.length, percent: 0 } }));
      for (const [index, file] of files.entries()) {
        const caption = files.length > 1 ? `${title} — ${file.name}` : title;
        await uploadBinary(`${API_BASE_URL}/api/admin/client-projects/projects/${projectId}/resources/upload`, 'POST', file, {
          'X-CSRF-Token': adminCsrfToken || csrfCookie(), 'X-Resource-Title': encodeURIComponent(caption),
          'X-Resource-Description': encodeURIComponent(description), 'X-Resource-Visibility': visibility,
          'X-Resource-File-Name': encodeURIComponent(file.name), 'X-Resource-Category': category,
        }, (percent) => setUploadProgress((previous) => ({ ...previous, [projectId]: { current: index + 1, total: files.length, percent } })));
        setUploadProgress((previous) => ({ ...previous, [projectId]: { current: index + 1, total: files.length, percent: 100 } }));
      }
      await refreshProject(projectId);
      form.reset();
    }).finally(() => setUploadProgress((previous) => { const next = { ...previous }; delete next[projectId]; return next; }));
  };

  const replaceProjectMedia = async (projectId: string, resource: Resource, file: File) => run(async () => {
    const headers = {
      'X-CSRF-Token': adminCsrfToken || csrfCookie(),
      'X-Resource-File-Name': encodeURIComponent(file.name),
      'X-Resource-Title': encodeURIComponent(resource.title),
      'X-Resource-Description': encodeURIComponent(resource.description || ''),
      'X-Resource-Category': resource.category || 'other',
    };
    await uploadBinary(`${API_BASE_URL}/api/admin/client-projects/projects/${projectId}/resources/${resource.id}/replace`, 'PUT', file, headers, () => {});
    await refreshProject(projectId);
  }, 'Media was replaced.');

  const addProjectLink = async (event: React.FormEvent<HTMLFormElement>, projectId: string) => {
    event.preventDefault(); const form = event.currentTarget; const fields = new FormData(form);
    await run(async () => {
      await requestJson(`/api/admin/client-projects/projects/${projectId}/resources/link`, { method: 'POST', body: { title: fields.get('title'), description: fields.get('description'), url: fields.get('url'), visibility: fields.get('visibility'), category: fields.get('category') } });
      await refreshProject(projectId); form.reset();
    });
  };

  const formGrid = 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3';
  const sectionClass = 'rounded-2xl border border-slate-800 bg-slate-900/45 p-4 sm:p-5';
  const matchingCompanies = (data?.companies || []).filter((company) =>
    company.companyName.toLocaleLowerCase().includes(companySearch.trim().toLocaleLowerCase()));
  const visibleCompanies = activeCompanyId
    ? matchingCompanies.filter((company) => company.id === activeCompanyId)
    : matchingCompanies.slice(0, 6);

  return <section className="space-y-5" aria-labelledby="client-project-management-title">
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div><h2 id="client-project-management-title" className="text-lg font-bold text-white sm:text-xl">{t.title}</h2><p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.subtitle}</p></div>
      <div className="flex flex-wrap gap-2">
        {onBackToCompanies && <button type="button" onClick={onBackToCompanies} className={buttonClass}>Back to companies</button>}
        {!onBackToCompanies && <button type="button" onClick={() => { setCompanyFormOpen((value) => !value); setEditingCompany(null); setCompanyDraft({ companyName: '', contactPerson: '', email: '', phone: '', description: '', website: '', logoUrl: '', industry: '', internalNotes: '' }); }} className={buttonClass}><Plus className="h-4 w-4" />{t.addCompany}</button>}
      </div>
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
        <Field label="Company website (HTTPS)" type="url" value={companyDraft.website} onChange={(value) => setCompanyDraft({ ...companyDraft, website: value })} />
        <Field label="Company logo URL (HTTPS)" type="url" value={companyDraft.logoUrl} onChange={(value) => setCompanyDraft({ ...companyDraft, logoUrl: value })} />
        <Field label="Industry / business category" value={companyDraft.industry} onChange={(value) => setCompanyDraft({ ...companyDraft, industry: value })} />
        <div className="sm:col-span-2"><Field label={t.description} value={companyDraft.description} onChange={(value) => setCompanyDraft({ ...companyDraft, description: value })} multiline /></div>
        <div className="sm:col-span-2"><Field label="Internal notes" value={companyDraft.internalNotes} onChange={(value) => setCompanyDraft({ ...companyDraft, internalNotes: value })} multiline /></div>
      </div>
      <div className="mt-4 flex gap-2"><button className={buttonClass} type="submit">{t.save}</button><button className={buttonClass} type="button" onClick={() => { setCompanyFormOpen(false); setEditingCompany(null); }}>{t.cancel}</button></div>
    </form>}

    {loading && <div className={sectionClass}><RefreshCw className="mr-2 inline h-4 w-4 animate-spin text-cyan-300" />{t.loading}</div>}
    {!loading && (data?.companies.length || 0) > 0 && <div className="flex flex-col gap-2 sm:flex-row">
      <input type="search" aria-label="Search all companies" placeholder="Search companies by name" value={companySearch} onChange={(event) => { setCompanySearch(event.target.value); setActiveCompanyId(null); }} className={`${inputClass} sm:max-w-md`} />
      {activeCompanyId && <button type="button" className={buttonClass} onClick={() => setActiveCompanyId(null)}>Back to companies</button>}
    </div>}
    {!loading && data?.companies.length === 0 && <div className={sectionClass}><Building2 className="mb-2 h-5 w-5 text-cyan-300" />{t.noCompanies}</div>}
    {!loading && (data?.companies.length || 0) > 0 && visibleCompanies.length === 0 && <div className={sectionClass}>No companies match your search.</div>}
    {!loading && visibleCompanies.map((company) => {
      const companyProjects = (data?.projects || []).filter((project) => project.companyId === company.id);
      const projectQuery = (projectSearch[company.id] || '').trim().toLocaleLowerCase();
      const matchingCompanyProjects = companyProjects.filter((project) => project.title.toLocaleLowerCase().includes(projectQuery));
      const visibleCompanyProjects = matchingCompanyProjects.slice(0, 6);
      const fallbackProject = companyProjects[0];
      const assignment = assignmentDrafts[company.id] || {
        projectId: fallbackProject?.id || '', targetCompletionDate: fallbackProject?.targetCompletionDate || '',
        estimatedCompletionDate: fallbackProject?.estimatedCompletionDate || '', impact: fallbackProject?.impact || 'standard',
        priority: fallbackProject?.priority || 'normal', status: fallbackProject?.status || 'planning',
      };
      const assignedProject = companyProjects.find((project) => project.id === assignment.projectId);
      return <article key={company.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 p-4 sm:p-5">
          <div className="flex min-w-0 items-start gap-3"><Building2 className="mt-1 h-5 w-5 shrink-0 text-cyan-300" /><div className="min-w-0"><h3 className="truncate text-base font-bold text-white">{company.companyName}</h3><p className="mt-1 text-xs text-slate-400">{[company.contactPerson, company.email, company.phone].filter(Boolean).join(' · ')}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] ${company.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{company.status === 'active' ? t.active : t.inactive} · {companyProjects.length} {t.projects.toLocaleLowerCase()}</span></div></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => setActiveCompanyId(company.id)}>{t.select}</button><button type="button" className={buttonClass} onClick={() => startCompanyEdit(company)}>{t.edit}</button><button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson(`/api/admin/client-projects/companies/${company.id}/status`, { method: 'PATCH', body: { status: company.status === 'active' ? 'inactive' : 'active' } }); await refreshAll(); })}>{company.status === 'active' ? t.deactivate : t.activate}</button></div>
        </header>
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:p-5">
          <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4" aria-label={t.code}>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white"><KeyRound className="h-4 w-4 text-cyan-300" />{t.code}</h4>
            <div className="mt-3 flex flex-wrap items-end gap-2"><label className="block space-y-1"><span className="text-[10px] text-slate-500">Optional expiration</span><input aria-label="Optional access-code expiration" type="date" min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} max={new Date(Date.now() + 366 * 86400000).toISOString().slice(0, 10)} value={codeExpiry[company.id] || ''} onChange={(event) => setCodeExpiry((previous) => ({ ...previous, [company.id]: event.target.value }))} className={inputClass} /></label><button type="button" disabled={company.status !== 'active'} className={buttonClass} onClick={() => void issueCode(company.id)}><RefreshCw className="h-3.5 w-3.5" />{t.generateCode}</button>{company.hasActiveCode && <button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson(`/api/admin/client-projects/companies/${company.id}/access-code`, { method: 'DELETE' }); setRevealedCodes((previous) => { const next = { ...previous }; delete next[company.id]; return next; }); await refreshAll(); })}><ShieldOff className="h-3.5 w-3.5" />{t.revokeCode}</button>}</div>
            {revealedCodes[company.id] && <div className="mt-3 rounded-lg border border-cyan-800/50 bg-cyan-950/20 p-3"><code className="block break-all font-mono text-sm tracking-widest text-cyan-100">{revealedCodes[company.id]}</code><button type="button" className={`${buttonClass} mt-2`} onClick={() => void copyCode(company.id)}><Copy className="h-3.5 w-3.5" />{t.copyCode}</button><p className="mt-2 text-[10px] leading-relaxed text-amber-200/80">{t.codeWarning}</p></div>}
          </section>
          <form onSubmit={(event) => assignedProject && void saveAssignment(event, company, assignedProject, assignment)} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Plus className="h-4 w-4 text-cyan-300" />Assign a project</h4>
            {companyProjects.length === 0 ? <p className="text-xs text-slate-500">Create the project with the company record before assigning its schedule.</p> : <>
              <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Existing project</span><select value={assignment.projectId} onChange={(event) => { const selected = companyProjects.find((item) => item.id === event.target.value); setAssignmentDrafts((current) => ({ ...current, [company.id]: { ...assignment, projectId: event.target.value, targetCompletionDate: selected?.targetCompletionDate || '', estimatedCompletionDate: selected?.estimatedCompletionDate || '', impact: selected?.impact || 'standard', priority: selected?.priority || 'normal', status: selected?.status || 'planning' } })); }} className={inputClass}>{companyProjects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label>
              <label className="mt-3 block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Start date ? company registration date</span><input type="date" value={company.createdAt?.slice(0, 10) || ''} readOnly disabled className={inputClass + ' cursor-not-allowed opacity-70'} /></label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2"><DateField label={t.target} value={assignment.targetCompletionDate} onChange={(value) => setAssignmentDrafts((current) => ({ ...current, [company.id]: { ...assignment, targetCompletionDate: value } }))} /><DateField label={t.estimate} value={assignment.estimatedCompletionDate} onChange={(value) => setAssignmentDrafts((current) => ({ ...current, [company.id]: { ...assignment, estimatedCompletionDate: value } }))} />
                <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Impact</span><select value={assignment.impact} onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [company.id]: { ...assignment, impact: event.target.value } }))} className={inputClass}>{['standard','low','medium','high','critical'].map((impact) => <option key={impact} value={impact}>{impact.replaceAll('_',' ')}</option>)}</select></label>
                <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Priority</span><select value={assignment.priority} onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [company.id]: { ...assignment, priority: event.target.value } }))} className={inputClass}>{['low','normal','high','urgent'].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
                <label className="block space-y-1.5 sm:col-span-2"><span className="text-[11px] font-medium text-slate-400">Status</span><select value={assignment.status} onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [company.id]: { ...assignment, status: event.target.value } }))} className={inputClass}>{['planning','in_progress','under_review','blocked','delayed','on_hold','completed','cancelled'].map((status) => <option key={status}>{status.replaceAll('_',' ')}</option>)}</select></label>
              </div>
              <button type="submit" disabled={!assignedProject || company.status !== 'active'} className={buttonClass + ' mt-3'}>Save project assignment</button>
            </>}
          </form>
        </div>
        <div className="border-t border-slate-800 p-4 sm:p-5"><div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h4 className="text-sm font-semibold text-slate-200">{t.projects} <span className="text-[10px] font-normal text-slate-500">({Math.min(matchingCompanyProjects.length, 6)} / {matchingCompanyProjects.length})</span></h4>{companyProjects.length > 0 && <label className="block sm:w-72"><span className="sr-only">Search projects by name</span><input type="search" aria-label="Search projects by name" value={projectSearch[company.id] || ''} onChange={(event) => setProjectSearch((previous) => ({ ...previous, [company.id]: event.target.value }))} placeholder="Search projects by name" className={inputClass} /></label>}</div>
          {companyProjects.length === 0 ? <p className="text-xs text-slate-500">{t.noProjects}</p> : visibleCompanyProjects.length === 0 ? <p className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-500">No projects match your search.</p> : <div className="space-y-3">{visibleCompanyProjects.map((project) => {
            const expanded = expandedProject === project.id;
            const workspaceTab = workspaceTabs[project.id] || 'overview';
            return <div key={project.id} className="rounded-xl border border-slate-800 bg-slate-950/45">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{project.title}</p><p className="mt-1 text-[11px] text-slate-500">{project.status} · {t.progress} {project.progress.overallPercentage}% · {project.targetCompletionDate || t.unknown}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${project.progress.overallPercentage}%` }} /></div></div><button type="button" className={buttonClass} onClick={() => setExpandedProject(expanded ? null : project.id)}>{expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}{t.select}</button></div>
              {expanded && <div className="space-y-4 border-t border-slate-800 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h5 className="text-xs font-bold uppercase tracking-wide text-cyan-200">{t.dashboard}</h5><button type="button" className={buttonClass} hidden={workspaceTab !== 'settings'} onClick={() => setEditingProject(project)}>{t.edit}</button></div>
                <div role="tablist" aria-label={`${project.title} workspace sections`} className="flex gap-1 overflow-x-auto border-b border-slate-800 pb-2">
                  {workspaceTabOrder.map((tab) => <button key={tab} type="button" role="tab" aria-selected={workspaceTab === tab} id={`project-tab-${project.id}-${tab}`} aria-controls={`project-panel-${project.id}-${tab}`} onClick={() => setWorkspaceTabs((current) => ({ ...current, [project.id]: tab }))} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${workspaceTab === tab ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{workspaceTabNames[language][tab] || workspaceTabNames.en[tab]}</button>)}
                </div>
                {workspaceTab === 'settings' && <section role="tabpanel" id={`project-panel-${project.id}-settings`} aria-labelledby={`project-tab-${project.id}-settings`} className="rounded-xl border border-slate-800 p-3 text-xs text-slate-400">Project settings are administrator-only. Start date follows the company registration date; update delivery dates, impact, priority, and status here.</section>}
                {editingProject?.id === project.id && workspaceTab === 'settings' && <form onSubmit={(event) => void saveProject(event)} className="grid gap-3 rounded-xl border border-slate-800 p-3 sm:grid-cols-2">
                  <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Start date ? company registration date</span><input type="date" value={company.createdAt?.slice(0, 10) || ''} readOnly disabled className={inputClass + ' cursor-not-allowed opacity-70'} /></label>
                  <DateField label={t.target} value={editingProject.targetCompletionDate} onChange={(value) => setEditingProject({ ...editingProject, targetCompletionDate: value })} />
                  <DateField label={t.estimate} value={editingProject.estimatedCompletionDate} onChange={(value) => setEditingProject({ ...editingProject, estimatedCompletionDate: value })} />
                  <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Impact</span><select className={inputClass} value={editingProject.impact || 'standard'} onChange={(event) => setEditingProject({ ...editingProject, impact: event.target.value })}>{['standard','low','medium','high','critical'].map((impact) => <option key={impact}>{impact}</option>)}</select></label>
                  <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Priority</span><select className={inputClass} value={editingProject.priority || 'normal'} onChange={(event) => setEditingProject({ ...editingProject, priority: event.target.value })}>{['low','normal','high','urgent'].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
                  <label className="block space-y-1.5"><span className="text-[11px] font-medium text-slate-400">Status</span><select className={inputClass} value={editingProject.status} onChange={(event) => setEditingProject({ ...editingProject, status: event.target.value })}>{['planning','in_progress','under_review','on_hold','completed','cancelled','blocked','delayed'].map((status) => <option key={status} value={status}>{status.replaceAll('_',' ')}</option>)}</select></label>
                  <div className="flex gap-2 sm:col-span-2"><button type="submit" className={buttonClass}>{t.save}</button><button type="button" className={buttonClass} onClick={() => setEditingProject(null)}>{t.cancel}</button></div>
                </form>}
                 <div role="tabpanel" id={`project-panel-${project.id}-overview`} aria-labelledby={`project-tab-${project.id}-overview`} hidden={workspaceTab!=='overview'} style={{display:workspaceTab==='overview'?'grid':'none'}} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[t.progress, `${project.progress.overallPercentage}%`], [t.target, project.targetCompletionDate || '—'], [t.estimate, project.estimatedCompletionDate || '—'], ['Current stage', project.progress.currentStage?.title || 'Not started'], ['Tasks complete / remaining', `${project.progress.completedTaskCount} / ${project.progress.remainingTaskCount}`], ['Milestones complete / remaining', `${project.progress.completedMilestoneCount} / ${project.progress.remainingMilestoneCount}`], ['Estimated days remaining', project.progress.estimatedDaysRemaining == null ? '—' : String(project.progress.estimatedDaysRemaining)], ['Overdue milestones', String(project.progress.overdueMilestoneCount)]] .map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"><p className="text-[10px] uppercase text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>)}</div>
                <div role="tabpanel" id={"project-panel-" + project.id + "-timeline"} aria-labelledby={"project-tab-" + project.id + "-timeline"} hidden={workspaceTab !== 'timeline'} style={{ display: workspaceTab === 'timeline' ? 'block' : 'none' }} className="space-y-4">
                  <ProjectProgressChart history={project.progress.history} startDate={project.startDate} targetDate={project.targetCompletionDate} />
                  <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h5 className="text-xs font-bold text-white">Custom development stages</h5><p className="mt-1 text-[10px] text-slate-500">Tasks linked to a stage update its weighted progress and completion state automatically.</p></div></div>
                    <ol className="space-y-2">{[...project.stages].sort((a, b) => a.stageOrder - b.stageOrder).map((stage, index) => <li key={stage.id} className="rounded-lg border border-slate-800 p-3">
                      <div className="flex flex-wrap items-center gap-2"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-white">{index + 1}. {stage.title}</span><span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-200">{stage.status.replaceAll('_', ' ')}</span>{!stage.clientVisible && <span className="text-[10px] text-amber-300">Private</span>}</div><p className="mt-1 text-[10px] text-slate-500">{stage.startDate || '?'} ? {stage.dueDate || '?'} ? {stage.completionPercentage}%</p><div className="mt-2 h-1.5 max-w-xl rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: stage.completionPercentage + '%' }} /></div></div>
                      <button type="button" aria-label="Move stage up" disabled={index === 0} className={buttonClass} onClick={() => void moveStage(project, stage, -1)}><ArrowUp className="h-3.5 w-3.5" /></button><button type="button" aria-label="Move stage down" disabled={index === project.stages.length - 1} className={buttonClass} onClick={() => void moveStage(project, stage, 1)}><ArrowDown className="h-3.5 w-3.5" /></button><button type="button" className={buttonClass} onClick={() => setEditingStage(stage)}>Edit</button><button type="button" aria-label="Delete stage" className={buttonClass} onClick={() => void run(async () => { await requestJson("/api/admin/client-projects/projects/" + project.id + "/stages/" + stage.id, { method: 'DELETE' }); await refreshProject(project.id); })}><Trash2 className="h-3.5 w-3.5" /></button></div>
                      {editingStage?.id === stage.id && <form onSubmit={(event) => void saveStage(event, project.id)} className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><Field label="Stage name" required value={editingStage.title} onChange={(value) => setEditingStage({ ...editingStage, title: value })} /><Field label="Description" value={editingStage.description} onChange={(value) => setEditingStage({ ...editingStage, description: value })} /><DateField label="Start date" value={editingStage.startDate} onChange={(value) => setEditingStage({ ...editingStage, startDate: value })} /><DateField label="Completion date" value={editingStage.dueDate} onChange={(value) => setEditingStage({ ...editingStage, dueDate: value })} /><label className="block space-y-1"><span className="text-[10px] text-slate-500">Status</span><select className={inputClass} value={editingStage.status} onChange={(event) => setEditingStage({ ...editingStage, status: event.target.value as Stage['status'] })}>{['upcoming','in_progress','blocked','completed'].map((status) => <option key={status}>{status}</option>)}</select></label><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={editingStage.clientVisible} onChange={(event) => setEditingStage({ ...editingStage, clientVisible: event.target.checked })} />Visible in client portal</label><div className="flex gap-2"><button type="submit" className={buttonClass}>Save stage</button><button type="button" className={buttonClass} onClick={() => setEditingStage(null)}>Cancel</button></div></form>}
                    </li>)}</ol>
                    <form onSubmit={(event) => void publishStage(event, project.id)} className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{(() => { const draft = stageDrafts[project.id] || { title: '', description: '', startDate: project.startDate || '', dueDate: '' }; return <><Field label="Add stage" required value={draft.title} onChange={(value) => setStageDrafts((current) => ({ ...current, [project.id]: { ...draft, title: value } }))} /><Field label="Description" value={draft.description} onChange={(value) => setStageDrafts((current) => ({ ...current, [project.id]: { ...draft, description: value } }))} /><DateField label="Start date" value={draft.startDate} onChange={(value) => setStageDrafts((current) => ({ ...current, [project.id]: { ...draft, startDate: value } }))} /><DateField label="Target date" value={draft.dueDate} onChange={(value) => setStageDrafts((current) => ({ ...current, [project.id]: { ...draft, dueDate: value } }))} /><button type="submit" className={buttonClass}><Plus className="h-3.5 w-3.5" />Add stage</button></>; })()}</form>
                  </section>
                </div>
                <form hidden={workspaceTab!=='milestones'} style={{display:workspaceTab==='milestones'?'block':'none'}} onSubmit={(event) => void publishMilestone(event, project.id)} className="rounded-xl border border-slate-800 p-3"><h5 className="mb-3 text-xs font-bold text-white">{t.addMilestone}</h5><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{(() => { const draft = milestoneDrafts[project.id] || { title: '', description: '', weight: '10', startDate: '', dueDate: '' }; return <><Field label={t.milestones} required value={draft.title} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, title: value } }))} /><Field label={t.description} value={draft.description} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, description: value } }))} /><Field label={t.weight} type="number" value={draft.weight} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, weight: value } }))} /><DateField label={t.start} value={draft.startDate} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, startDate: value } }))} /><DateField label={t.due} value={draft.dueDate} onChange={(value) => setMilestoneDrafts((p) => ({ ...p, [project.id]: { ...draft, dueDate: value } }))} /></>; })()}</div><button className={`${buttonClass} mt-3`} type="submit">{t.addMilestone}</button></form>
                <div role="tabpanel" id={`project-panel-${project.id}-${workspaceTab}`} aria-labelledby={`project-tab-${project.id}-${workspaceTab}`} hidden={workspaceTab!=='milestones' && workspaceTab!=='tasks'} style={{display:workspaceTab==='milestones'||workspaceTab==='tasks'?'block':'none'}} className="space-y-3">{project.milestones.map((milestone) => {
                  const draftKey = `${project.id}:${milestone.id}`;
                   const taskDraft = taskDrafts[draftKey] || { title: '', weight: '1', dueDate: '', stageId: '', status: 'upcoming' as const, completionPercentage: '0', developmentNotes: '', blocker: '' };
                   const approval = project.approvals.find((item) => item.milestoneId === milestone.id && item.status === 'pending');
                  return <section key={milestone.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                     <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><h6 className="text-sm font-semibold text-white">{milestone.title}</h6><p className="mt-1 text-[10px] text-slate-500">{t.weight}: {milestone.weight} · {t.due}: {milestone.dueDate || '—'} · {milestone.status} · {milestone.completionPercentage}%</p><div className="mt-2 h-1.5 max-w-lg overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${milestone.completionPercentage}%` }} /></div></div><button type="button" className={buttonClass} onClick={() => setEditingMilestone(milestone)}>{t.edit}</button>{approval ? <span className="self-center text-[10px] text-amber-200">Awaiting client approval</span> : milestone.status === 'completed' && milestone.clientVisible && <button type="button" className={buttonClass} onClick={() => void requestApproval(project, milestone)}>Request client approval</button>}</div>
                     {editingMilestone?.id === milestone.id && <form onSubmit={(event) => void saveMilestone(event, project.id)} className="mt-3 grid gap-2 sm:grid-cols-2"><Field label={t.milestones} required value={editingMilestone.title} onChange={(value) => setEditingMilestone({ ...editingMilestone, title: value })} /><Field label={t.description} value={editingMilestone.description} onChange={(value) => setEditingMilestone({ ...editingMilestone, description: value })} /><Field label={t.weight} type="number" value={String(editingMilestone.weight)} onChange={(value) => setEditingMilestone({ ...editingMilestone, weight: Number(value) })} /><DateField label={t.start} value={editingMilestone.startDate} onChange={(value) => setEditingMilestone({ ...editingMilestone, startDate: value })} /><DateField label={t.due} value={editingMilestone.dueDate} onChange={(value) => setEditingMilestone({ ...editingMilestone, dueDate: value })} /><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={editingMilestone.clientVisible} onChange={(event) => setEditingMilestone({ ...editingMilestone, clientVisible: event.target.checked })} />Visible to client</label><button type="submit" className={buttonClass}>{t.saveMilestone}</button></form>}
                    {project.tasks.filter((task) => task.milestoneId === milestone.id).map((task) => <div key={task.id} className="mt-3 rounded-lg border border-slate-800/80 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-medium text-slate-200">{task.title}</p><p className="mt-1 text-[10px] text-slate-500">{t.weight}: {task.weight} · {task.completionPercentage}% · {task.dueDate || '—'} · {task.status}</p>{task.blocker && <p className="mt-1 text-[10px] text-amber-200">{task.blocker}</p>}</div><button type="button" className={buttonClass} onClick={() => setEditingTask({ ...task })}>{t.edit}</button></div>
                      {editingTask?.id === task.id && <form onSubmit={(event) => void saveTaskEdit(event, project.id)} className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                         <Field label={t.taskTitle} required value={editingTask.title} onChange={(value) => setEditingTask({ ...editingTask, title: value })} /><Field label={t.weight} type="number" value={String(editingTask.weight)} onChange={(value) => setEditingTask({ ...editingTask, weight: Number(value) })} /><label className="block space-y-1"><span className="text-[10px] text-slate-500">Development stage</span><select className={inputClass} value={editingTask.stageId || ''} onChange={(event) => setEditingTask({ ...editingTask, stageId: event.target.value || null })}><option value="">Unassigned</option>{project.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.title}</option>)}</select></label>
                        <label className="block space-y-1"><span className="text-[10px] text-slate-500">{t.taskStatus}</span><select value={editingTask.status} onChange={(event) => setEditingTask({ ...editingTask, status: event.target.value as Task['status'] })} className={inputClass}>{['upcoming','in_progress','blocked','completed'].map((status) => <option key={status}>{status}</option>)}</select></label>
                        <Field label={t.progressPct} type="number" value={String(editingTask.completionPercentage)} onChange={(value) => setEditingTask({ ...editingTask, completionPercentage: Number(value) })} /><DateField label={t.due} value={editingTask.dueDate} onChange={(value) => setEditingTask({ ...editingTask, dueDate: value })} />
                        <Field label={t.notes} value={editingTask.developmentNotes} onChange={(value) => setEditingTask({ ...editingTask, developmentNotes: value })} /><Field label={t.blocker} value={editingTask.blocker} onChange={(value) => setEditingTask({ ...editingTask, blocker: value })} />
                        <div className="flex items-end gap-2"><button type="submit" className={buttonClass}>{t.saveTask}</button><button type="button" className={buttonClass} onClick={() => setEditingTask(null)}>{t.cancel}</button></div>
                      </form>}
                    </div>)}
                    <form onSubmit={(event) => void createTaskFor(event, project.id, milestone.id)} className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                       <Field label={t.taskTitle} required value={taskDraft.title} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, title: value } }))} /><Field label={t.weight} type="number" value={taskDraft.weight} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, weight: value } }))} /><DateField label={t.due} value={taskDraft.dueDate} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, dueDate: value } }))} /><label className="block space-y-1"><span className="text-[10px] text-slate-500">{t.taskStatus}</span><select value={taskDraft.status} onChange={(event) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, status: event.target.value as Task['status'] } }))} className={inputClass}>{['upcoming','in_progress','blocked','completed'].map((status) => <option key={status}>{status}</option>)}</select></label><label className="block space-y-1"><span className="text-[10px] text-slate-500">Development stage</span><select value={taskDraft.stageId} onChange={(event) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, stageId: event.target.value } }))} className={inputClass}><option value="">Unassigned</option>{project.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.title}</option>)}</select></label>
                      <Field label={t.progressPct} type="number" value={taskDraft.completionPercentage} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, completionPercentage: value } }))} /><Field label={t.notes} value={taskDraft.developmentNotes} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, developmentNotes: value } }))} /><Field label={t.blocker} value={taskDraft.blocker} onChange={(value) => setTaskDrafts((p) => ({ ...p, [draftKey]: { ...taskDraft, blocker: value } }))} /><button type="submit" className={`${buttonClass} self-end`}><Plus className="h-3.5 w-3.5" />{t.addTask}</button>
                    </form>
                  </section>;
                })}</div>
                <form role="tabpanel" id={"project-panel-" + project.id + "-updates"} aria-labelledby={"project-tab-" + project.id + "-updates"} hidden={workspaceTab !== 'updates'} style={{ display: workspaceTab === 'updates' ? 'block' : 'none' }} onSubmit={(event) => void publishUpdate(event, project.id)} className="space-y-3 rounded-xl border border-slate-800 p-3">
                  {(() => { const draft = updateDrafts[project.id] || { title: '', body: '', stageId: '', clientVisible: true, resourceIds: [] }; const visibleResources = project.resources.filter((resource) => !draft.clientVisible || resource.visibility === 'client'); return <>
                    <div className="grid gap-2 sm:grid-cols-2"><Field label={t.updateTitle} required value={draft.title} onChange={(value) => setUpdateDrafts((current) => ({ ...current, [project.id]: { ...draft, title: value } }))} /><Field label="Progress summary" required multiline value={draft.body} onChange={(value) => setUpdateDrafts((current) => ({ ...current, [project.id]: { ...draft, body: value } }))} /></div>
                    <div className="grid gap-2 sm:grid-cols-2"><label className="block space-y-1"><span className="text-[10px] text-slate-500">Related development stage</span><select value={draft.stageId} onChange={(event) => setUpdateDrafts((current) => ({ ...current, [project.id]: { ...draft, stageId: event.target.value } }))} className={inputClass}><option value="">No stage</option>{project.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.title}</option>)}</select></label><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={draft.clientVisible} onChange={(event) => setUpdateDrafts((current) => ({ ...current, [project.id]: { ...draft, clientVisible: event.target.checked, resourceIds: [] } }))} />Publish to client portal</label></div>
                    {visibleResources.length > 0 && <fieldset className="rounded-lg border border-slate-800 p-3"><legend className="px-1 text-[10px] text-slate-500">Attach project media</legend><div className="flex flex-wrap gap-3">{visibleResources.map((resource) => <label key={resource.id} className="flex items-center gap-2 text-[10px] text-slate-300"><input type="checkbox" checked={draft.resourceIds.includes(resource.id)} onChange={(event) => setUpdateDrafts((current) => ({ ...current, [project.id]: { ...draft, resourceIds: event.target.checked ? [...draft.resourceIds, resource.id] : draft.resourceIds.filter((id) => id !== resource.id) } }))} />{resource.title}</label>)}</div></fieldset>}
                    <button className={buttonClass} type="submit">{t.publish}</button>
                  </>; })()}
                </form>
                <section role="tabpanel" id={"project-panel-" + project.id + "-resources"} aria-labelledby={"project-tab-" + project.id + "-resources"} hidden={workspaceTab !== 'resources'} style={{ display: workspaceTab === 'resources' ? 'block' : 'none' }} className="space-y-3 rounded-xl border border-slate-800 p-3" aria-label="Project media and resources">
                  <h5 className="text-xs font-bold text-slate-300">Project media gallery and links</h5>
                  <form onSubmit={(event) => void uploadProjectResource(event, project.id)} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <input name="title" maxLength={160} placeholder="Media title or caption" className={inputClass} />
                    <label className="block space-y-1"><span className="text-[10px] text-slate-500">Image, video, or PDF ? max 8 MB each</span><input required multiple name="files" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf" className="block w-full text-[10px] text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-800 file:px-2 file:py-1.5 file:text-xs file:text-slate-200" /></label>
                    <select name="category" className={inputClass}><option value="screenshot">Screenshot</option><option value="design_preview">Design preview</option><option value="demo_video">Demo video</option><option value="document">Document</option><option value="other">Other</option></select>
                    <select name="visibility" className={inputClass}><option value="private">Private</option><option value="client">Visible to client</option></select>
                    <input name="description" maxLength={2000} placeholder="Caption or description" className={inputClass} />
                    <button type="submit" disabled={Boolean(uploadProgress[project.id])} className={buttonClass + ' sm:col-span-2 xl:col-span-4'}>Upload selected media</button>
                  </form>
                  {uploadProgress[project.id] && <div role="status" className="rounded-lg border border-cyan-900/60 bg-cyan-950/20 p-2 text-[10px] text-cyan-100">Uploading {uploadProgress[project.id].current} of {uploadProgress[project.id].total} ? {uploadProgress[project.id].percent}%<progress className="mt-2 block h-2 w-full accent-cyan-400" max="100" value={uploadProgress[project.id].percent} /></div>}
                  <form onSubmit={(event) => void addProjectLink(event, project.id)} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <input required name="title" maxLength={160} placeholder="Link title" className={inputClass} /><input required name="url" type="url" placeholder="https://preview.example.com" className={inputClass} />
                    <select name="category" className={inputClass}><option value="live_website">Live website</option><option value="development_preview">Development preview</option><option value="figma">Figma design</option><option value="prototype">Interactive prototype</option><option value="application_demo">Application demo</option><option value="documentation">Documentation</option><option value="custom">Custom</option></select>
                    <select name="visibility" className={inputClass}><option value="private">Private</option><option value="client">Visible to client</option></select>
                    <input name="description" maxLength={2000} placeholder="Description" className={inputClass} /><button type="submit" className={buttonClass + ' sm:col-span-2 xl:col-span-4'}>Add secure HTTPS link</button>
                  </form>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{(project.resources || []).map((resource) => {
                    const contentUrl = API_BASE_URL + '/api/admin/client-projects/projects/' + project.id + '/resources/' + resource.id + '/content';
                    return <article key={resource.id} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                      {resource.resourceType === 'image' && <button type="button" className="mb-2 block w-full" aria-label={'View image: ' + resource.title} onClick={() => setPreviewImage({ url: contentUrl, title: resource.title })}><img src={contentUrl} alt={resource.title} loading="lazy" className="max-h-48 w-full rounded-lg object-contain" /></button>}
                      {resource.resourceType === 'video' && <video controls preload="none" className="mb-2 max-h-48 w-full rounded-lg" src={contentUrl} />}
                      <p className="text-xs font-semibold text-white">{resource.title}</p><p className="mt-1 text-[10px] text-slate-400">{resource.category} ? {resource.description || resource.fileName} ? {resource.visibility}</p>
                      {resource.resourceType === 'link' ? <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Open link</a> : <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-cyan-300 underline">Open or download</a>}
                      {resource.resourceType !== 'link' && <label className={buttonClass + ' mt-2 cursor-pointer'}>Replace media<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf" className="sr-only" onChange={(event) => { const replacement = event.target.files?.[0]; if (replacement) void replaceProjectMedia(project.id, resource, replacement); event.currentTarget.value = ''; }} /></label>}
                      <div className="mt-2 flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson('/api/admin/client-projects/projects/' + project.id + '/resources/' + resource.id, { method: 'PATCH', body: { visibility: resource.visibility === 'client' ? 'private' : 'client' } }); await refreshProject(project.id); })}>{resource.visibility === 'client' ? 'Make private' : 'Share with client'}</button><button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson('/api/admin/client-projects/projects/' + project.id + '/resources/' + resource.id, { method: 'DELETE' }); await refreshProject(project.id); })}>Remove</button></div>
                    </article>;
                  })}</div>
                  {project.resources?.length === 0 && <p className="text-[10px] text-slate-500">Resources remain private until explicitly shared. Uploads are stored in a private Supabase Storage bucket.</p>}
                  {previewImage && <div role="dialog" aria-modal="true" aria-label={previewImage.title} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewImage(null)}><button type="button" className="absolute right-5 top-5 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => setPreviewImage(null)}>Close</button><img src={previewImage.url} alt={previewImage.title} className="max-h-[90vh] max-w-[95vw] object-contain" onClick={(event) => event.stopPropagation()} /></div>}
                </section>
                {project.updates.length > 0 && <div hidden={workspaceTab!=='updates'}><h5 className="mb-2 text-xs font-bold text-slate-300">{t.update}</h5><ul className="space-y-2">{project.updates.slice(0, 5).map((update) => <li key={update.id} className="rounded-lg bg-slate-900/70 p-3"><p className="text-xs font-semibold text-white">{update.title}</p><p className="mt-1 text-xs text-slate-300">{update.body}</p><p className="mt-1 text-[10px] text-slate-500">{new Date(update.createdAt).toLocaleString()} · {update.authorDisplayName}</p></li>)}</ul></div>}
                <section role="tabpanel" id={`project-panel-${project.id}-feedback`} aria-labelledby={`project-tab-${project.id}-feedback`} hidden={workspaceTab !== 'feedback'} style={{ display: workspaceTab === 'feedback' ? 'block' : 'none' }} className="rounded-xl border border-slate-800 p-3">
                  <h5 className="text-xs font-bold text-white">Client feedback and milestone approvals</h5>
                  <div className="mt-3 space-y-2">{project.feedback.map((entry) => {
                    const draft = editingFeedback[entry.id] || { status: entry.status, response: entry.adminResponse || '' };
                    return <article key={entry.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-semibold text-white">{entry.kind === 'revision_request' ? 'Revision request' : 'Feedback'} · {entry.status.replaceAll('_', ' ')}</p><time className="text-[10px] text-slate-500">{new Date(entry.createdAt).toLocaleString()}</time></div><p className="mt-2 whitespace-pre-wrap text-xs text-slate-300">{entry.message}</p><form onSubmit={(event) => { event.preventDefault(); void saveFeedback(project.id, entry.id); }} className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.6fr)_auto]">
                      <Field label="Administrator response" value={draft.response} onChange={(response) => setEditingFeedback((previous) => ({ ...previous, [entry.id]: { ...draft, response } }))} multiline />
                      <label className="block space-y-1"><span className="text-[10px] text-slate-500">Feedback status</span><select value={draft.status} onChange={(event) => setEditingFeedback((previous) => ({ ...previous, [entry.id]: { ...draft, status: event.target.value } }))} className={inputClass}>{['open','responded','resolved','revision_requested'].map((status) => <option key={status} value={status}>{status.replaceAll('_',' ')}</option>)}</select></label>
                      <button type="submit" className={buttonClass + ' self-end'}>Save response</button>
                    </form></article>;
                  })}{project.feedback.length === 0 && <p className="text-xs text-slate-500">No client feedback has been submitted.</p>}</div>
                  <div className="mt-4 border-t border-slate-800 pt-3"><h6 className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Approval history</h6><ul className="mt-2 space-y-1">{project.approvals.map((approval) => <li key={approval.id} className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400"><span>{project.milestones.find((item) => item.id === approval.milestoneId)?.title || 'Milestone'} · {approval.status.replaceAll('_',' ')}{approval.clientComment ? ` — ${approval.clientComment}` : ''}</span>{approval.status === 'pending' && <button type="button" className={buttonClass} onClick={() => void run(async () => { await requestJson(`/api/admin/client-projects/approvals/${approval.id}/cancel`, { method: 'PATCH', body: {} }); await refreshProject(project.id); })}>Cancel request</button>}</li>)}</ul>{project.approvals.length === 0 && <p className="mt-2 text-[10px] text-slate-500">Completed technical work and client acceptance are tracked separately.</p>}</div>
                </section>
                {project.activity && <details role="tabpanel" id={`project-panel-${project.id}-activity`} aria-labelledby={`project-tab-${project.id}-activity`} hidden={workspaceTab!=='activity'} style={{display:workspaceTab==='activity'?'block':'none'}} className="rounded-lg border border-slate-800 p-3"><summary className="cursor-pointer text-xs font-semibold text-slate-300"><Activity className="mr-2 inline h-3.5 w-3.5" />{t.activity}</summary><ul className="mt-2 space-y-1">{project.activity.map((item) => <li key={item.id} className="text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleString()} · {item.eventType}</li>)}</ul></details>}
              </div>}
            </div>;
          })}</div>}
        </div>
      </article>;
    })}
  </section>;
};
