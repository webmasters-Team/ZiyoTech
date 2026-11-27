import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Check, Copy, KeyRound, Plus, RefreshCw, Search, ShieldOff } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import { searchCompanies } from '../../lib/companySearch.js';
import { useLanguage } from '../../context/LanguageContext';
import { ClientProjectManagementView } from './ClientProjectManagementView';

type Company = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  description: string;
  website: string;
  logoUrl: string;
  industry: string;
  internalNotes: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  hasActiveCode: boolean;
  projectCount: number;
  inProgressProjects: number;
  blockedProjects: number;
  completedProjects: number;
  averageProgress: number;
  projectNames?: string[];
  projectStatuses?: string[];
};

type CompanyDraft = Pick<Company, 'companyName' | 'contactPerson' | 'email' | 'phone' | 'description' | 'website' | 'logoUrl' | 'industry' | 'internalNotes'>;
type ProjectStats = { totalProjects: number; activeProjects: number; completedProjects: number; overdueProjects: number };
type ProjectManager = { id: string; fullName: string; email: string };
type AccessCodeResponse = { code: string; expiresAt: string | null };
type InitialProjectDraft = { name: string; category: string; description: string; status: string; priority: string; startDate: string; expectedCompletionDate: string; assignedManagerId: string };

const emptyDraft: CompanyDraft = { companyName: '', contactPerson: '', email: '', phone: '', description: '', website: '', logoUrl: '', industry: '', internalNotes: '' };
const emptyInitialProject: InitialProjectDraft = { name: '', category: 'general', description: '', status: 'planning', priority: 'normal', startDate: '', expectedCompletionDate: '', assignedManagerId: '' };

const labels = {
  en: {
    website: 'Company Website (HTTPS)', logoUrl: 'Company Logo URL (HTTPS)', industry: 'Industry / Business Category', internalNotes: 'Internal Notes',
    initialProjectName: 'Initial Project Name (optional)', initialProjectDescription: 'Project Description', projectStatus: 'Project Status', startDate: 'Start Date', expectedCompletion: 'Expected Completion Date',
    title: 'Project Management', subtitle: 'Register client companies and issue private access codes.', companies: 'Companies',
    openWorkspace: 'Open company workspace',
    searchCompanies: 'Search companies and projects',
    projectsHeading: 'Projects', searchProjects: 'Search projects by name', noProjects: 'No projects have been created yet.', noProjectMatches: 'No projects match that search.', manager: 'Assigned manager', deadline: 'Deadline', openProject: 'Open project workspace',
    totalProjects: 'Total projects', activeProjects: 'Active projects', overdueProjects: 'Overdue projects', filterStatus: 'Filter by status', allStatuses: 'All statuses', start: 'Start date', lastUpdated: 'Last updated', category: 'Project category', priority: 'Priority',
    projectCount: 'Projects', progress: 'Average progress', inProgressProjects: 'In progress', blockedProjects: 'Blocked', completedProjects: 'Completed',
    addCompany: 'Add Company', editCompany: 'Edit company', saveCompany: 'Save Company', saveChanges: 'Save Changes', cancel: 'Cancel',
    companyName: 'Company Name', contactPerson: 'Contact Person', email: 'Email Address', phone: 'Phone Number', notes: 'Company Description',
    accessCode: 'Client Access Code', codeHelp: 'Save the company first. The backend generates a secure code and stores only its verifier.',
    generateCode: 'Generate Code', rotateCode: 'Generate New Code', copyCode: 'Copy Code', copied: 'Access code copied.',
    codeIssued: 'A new access code is ready. Copy it now and share it privately; it will not be shown again.', codeActive: 'An active code exists. Generating a new code revokes the previous code and sessions.',
    confirmRotate: 'Generate a new code? The current code and its client sessions will be revoked.', confirmRevoke: 'Revoke this code and all active client sessions?', confirmDeactivate: 'Deactivate this company? Its access code and active client sessions will be revoked.',
    revokeCode: 'Revoke Code', revoked: 'Access code revoked.', active: 'Active', inactive: 'Inactive', activeCode: 'Access code active', noActiveCode: 'No active access code',
    view: 'View details', hide: 'Hide details', noCompanies: 'No companies have been registered yet.', noMatches: 'No companies match that search.',
    loading: 'Loading companies…', retry: 'Retry', required: 'Company name is required.', created: 'Company saved. You can now generate its access code.', updated: 'Company details saved.',
    copyError: 'Could not copy the code. Select it and copy manually.', requestError: 'The request could not be completed.',
    unavailable: 'Project Management is unavailable until its PostgreSQL migration and server configuration are ready.',
  },
  ru: {
    confirmRotate: 'Создать новый код? Текущий код и клиентские сессии будут отозваны.', confirmRevoke: 'Отозвать код и все активные клиентские сессии?', confirmDeactivate: 'Деактивировать компанию? Её код и активные сессии будут отозваны.',
    openWorkspace: 'Открыть рабочее пространство компании',
    searchCompanies: 'Поиск компаний и проектов',
    projectCount: 'Проекты', progress: 'Средний прогресс', inProgressProjects: 'В работе', blockedProjects: 'Заблокировано', completedProjects: 'Завершено',
    website: 'Сайт компании (HTTPS)', logoUrl: 'Ссылка на логотип (HTTPS)', industry: 'Отрасль / категория бизнеса', internalNotes: 'Внутренние заметки',
    projectsHeading: 'Проекты', searchProjects: 'Поиск проектов по названию', noProjects: 'Проекты ещё не созданы.', noProjectMatches: 'По запросу проекты не найдены.', manager: 'Ответственный менеджер', deadline: 'Срок', openProject: 'Открыть рабочее пространство проекта',
    totalProjects: 'Всего проектов', activeProjects: 'Активные проекты', overdueProjects: 'Просроченные проекты', filterStatus: 'Фильтр статуса', allStatuses: 'Все статусы', start: 'Начало', lastUpdated: 'Обновлено', category: 'Категория проекта', priority: 'Приоритет',
    initialProjectName: 'Название первого проекта (необязательно)', initialProjectDescription: 'Описание проекта', projectStatus: 'Статус проекта', startDate: 'Дата начала', expectedCompletion: 'Ожидаемая дата завершения',
    title: 'Управление проектами', subtitle: 'Регистрируйте компании-клиенты и выдавайте приватные коды доступа.', companies: 'Компании',
    addCompany: 'Добавить компанию', editCompany: 'Изменить компанию', saveCompany: 'Сохранить компанию', saveChanges: 'Сохранить изменения', cancel: 'Отмена',
    companyName: 'Название компании', contactPerson: 'Контактное лицо', email: 'Электронная почта', phone: 'Телефон', notes: 'Описание / заметки',
    accessCode: 'Код доступа клиента', codeHelp: 'Сначала сохраните компанию. Сервер создаст защищённый код и сохранит только его проверочное значение.',
    generateCode: 'Создать код', rotateCode: 'Создать новый код', copyCode: 'Скопировать код', copied: 'Код доступа скопирован.',
    codeIssued: 'Новый код готов. Скопируйте его сейчас и передайте конфиденциально; повторно он не отобразится.', codeActive: 'У компании уже есть активный код. Новый код отзовёт предыдущий код и сессии.',
    revokeCode: 'Отозвать код', revoked: 'Код доступа отозван.', active: 'Активна', inactive: 'Неактивна', activeCode: 'Код доступа активен', noActiveCode: 'Нет активного кода доступа',
    view: 'Подробнее', hide: 'Скрыть', noCompanies: 'Компании ещё не добавлены.', noMatches: 'Компании по запросу не найдены.',
    loading: 'Загрузка компаний…', retry: 'Повторить', required: 'Укажите название компании.', created: 'Компания сохранена. Теперь можно создать код доступа.', updated: 'Данные компании сохранены.',
    copyError: 'Не удалось скопировать код. Выделите его и скопируйте вручную.', requestError: 'Не удалось выполнить запрос.',
    unavailable: 'Управление проектами недоступно до подготовки миграции PostgreSQL и настройки сервера.',
  },
  uz: {
    confirmRotate: 'Yangi kod yaratilsinmi? Joriy kod va mijoz sessiyalari bekor qilinadi.', confirmRevoke: 'Kodni va barcha faol mijoz sessiyalarini bekor qilasizmi?', confirmDeactivate: 'Kompaniya faolsizlantirilsinmi? Uning kodi va faol sessiyalari bekor qilinadi.',
    openWorkspace: 'Kompaniya ish maydonini ochish',
    searchCompanies: 'Kompaniya va loyihalarni qidirish',
    projectCount: 'Loyihalar', progress: 'O‘rtacha jarayon', inProgressProjects: 'Jarayonda', blockedProjects: 'To‘silgan', completedProjects: 'Yakunlangan',
    website: 'Kompaniya veb-sayti (HTTPS)', logoUrl: 'Kompaniya logotipi URL (HTTPS)', industry: 'Soha / biznes toifasi', internalNotes: 'Ichki izohlar',
    projectsHeading: 'Loyihalar', searchProjects: 'Loyihalarni nomi bo‘yicha qidirish', noProjects: 'Hozircha loyihalar yaratilmagan.', noProjectMatches: 'Bu qidiruv bo‘yicha loyiha topilmadi.', manager: 'Mas’ul menejer', deadline: 'Muddat', openProject: 'Loyiha ish maydonini ochish',
    totalProjects: 'Jami loyihalar', activeProjects: 'Faol loyihalar', overdueProjects: 'Muddati o‘tgan', filterStatus: 'Holat bo‘yicha saralash', allStatuses: 'Barcha holatlar', start: 'Boshlanish', lastUpdated: 'Yangilangan', category: 'Loyiha toifasi', priority: 'Muhimlik',
    initialProjectName: 'Boshlang‘ich loyiha nomi (ixtiyoriy)', initialProjectDescription: 'Loyiha tavsifi', projectStatus: 'Loyiha holati', startDate: 'Boshlanish sanasi', expectedCompletion: 'Kutilayotgan yakunlanish sanasi',
    title: 'Loyihalarni boshqarish', subtitle: 'Mijoz kompaniyalarini ro‘yxatdan o‘tkazing va maxfiy kirish kodlarini bering.', companies: 'Kompaniyalar',
    addCompany: 'Kompaniya qo‘shish', editCompany: 'Kompaniyani tahrirlash', saveCompany: 'Kompaniyani saqlash', saveChanges: 'O‘zgarishlarni saqlash', cancel: 'Bekor qilish',
    companyName: 'Kompaniya nomi', contactPerson: 'Aloqa uchun shaxs', email: 'Elektron pochta', phone: 'Telefon raqami', notes: 'Tavsif / izohlar',
    accessCode: 'Mijoz kirish kodi', codeHelp: 'Avval kompaniyani saqlang. Server xavfsiz kod yaratadi va faqat uning tekshiruv qiymatini saqlaydi.',
    generateCode: 'Kod yaratish', rotateCode: 'Yangi kod yaratish', copyCode: 'Kodni nusxalash', copied: 'Kirish kodi nusxalandi.',
    codeIssued: 'Yangi kod tayyor. Uni hozir nusxalang va maxfiy tarzda ulashing; kod qayta ko‘rsatilmaydi.', codeActive: 'Faol kod mavjud. Yangi kod eskisini va sessiyalarni bekor qiladi.',
    revokeCode: 'Kodni bekor qilish', revoked: 'Kirish kodi bekor qilindi.', active: 'Faol', inactive: 'Faol emas', activeCode: 'Kirish kodi faol', noActiveCode: 'Faol kirish kodi yo‘q',
    view: 'Tafsilotlarni ko‘rish', hide: 'Yopish', noCompanies: 'Hali kompaniyalar ro‘yxatdan o‘tkazilmagan.', noMatches: 'Qidiruv bo‘yicha kompaniya topilmadi.',
    loading: 'Kompaniyalar yuklanmoqda…', retry: 'Qayta urinish', required: 'Kompaniya nomini kiriting.', created: 'Kompaniya saqlandi. Endi kirish kodini yaratishingiz mumkin.', updated: 'Kompaniya ma’lumotlari saqlandi.',
    copyError: 'Kodni nusxalab bo‘lmadi. Uni belgilang va qo‘lda nusxalang.', requestError: 'So‘rovni bajarib bo‘lmadi.',
    unavailable: 'PostgreSQL migratsiyasi va server sozlamalari tayyor bo‘lmaguncha loyihalarni boshqarib bo‘lmaydi.',
  },
};

const buttonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/60 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';
const primaryButtonClass = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50';
const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10';
const sectionClass = 'rounded-2xl border border-slate-800 bg-slate-900/45 p-4 sm:p-5';

function readAdminCsrfToken() {
  if (typeof document === 'undefined') return '';
  const cookie = document.cookie.split(';').map((part) => part.trim()).find((part) =>
    part.startsWith('__Host-ziyo_admin_csrf=') || part.startsWith('ziyo_admin_csrf='));
  if (!cookie) return '';
  try { return decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1)); } catch { return ''; }
}

async function requestJson<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = options.method || 'GET';
  const headers = new Headers();
  let body: string | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }
  if (method !== 'GET') {
    const csrfToken = readAdminCsrfToken();
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { method, credentials: 'include', headers, body });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {};
  if (!response.ok) {
    const data = payload as { error?: string };
    if (response.status === 401) throw new Error('Administrator session expired. Sign in again.');
    if (response.status === 403) throw new Error(data.error || 'Administrator access or CSRF validation failed.');
    if (response.status === 503) throw new Error(data.error || 'Project Management is unavailable until its PostgreSQL migration is ready.');
    if (response.status === 404) throw new Error(data.error || 'The requested company was not found.');
    if (response.status === 400) throw new Error(data.error || 'Review the company details and try again.');
    throw new Error(data.error || `The request failed (${response.status}).`);
  }
  return payload as T;
}

function Field({ label, value, onChange, type = 'text', required = false, maxLength = 160 }: {
  label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; maxLength?: number;
}) {
  return <label className="block min-w-0 space-y-1.5">
    <span className="text-xs font-medium text-slate-300">{label}{required && <span aria-hidden="true" className="ml-1 text-cyan-300">*</span>}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={maxLength} className={inputClass} />
  </label>;
}

function CompanyLogo({ logoUrl, companyName }: { logoUrl: string; companyName: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [logoUrl]);
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
    {logoUrl && !failed
      ? <img src={logoUrl} alt={`${companyName} logo`} referrerPolicy="no-referrer" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain" />
      : <Building2 aria-label={`${companyName} logo unavailable`} className="h-5 w-5 text-cyan-300" />}
  </div>;
}

export const CompanyManagementStageOneView: React.FC = () => {
  const { language } = useLanguage();
  const t = labels[language];
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats>({ totalProjects: 0, activeProjects: 0, completedProjects: 0, overdueProjects: 0 });
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [projectStatusFilter, setProjectStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codeBusy, setCodeBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [workspaceCompanyId, setWorkspaceCompanyId] = useState<string | null>(null);
  const [workspaceProjectId, setWorkspaceProjectId] = useState<string | null>(null);
  const [revealedCode, setRevealedCode] = useState<{ companyId: string; code: string } | null>(null);
  const [draft, setDraft] = useState<CompanyDraft>(emptyDraft);
  const [initialProject, setInitialProject] = useState<InitialProjectDraft>(emptyInitialProject);
  const companySearchRequest = useRef(0);

  const loadCompanies = useCallback(async () => {
    const requestId = ++companySearchRequest.current;
    setLoading(true);
    setError('');
    try {
      const result = await requestJson<Company[]>('/api/admin/client-projects/companies?all=true');
      if (requestId === companySearchRequest.current) setCompanies(Array.isArray(result) ? result : []);
    } catch (loadError) {
      if (requestId === companySearchRequest.current) setError(loadError instanceof Error ? loadError.message : t.requestError);
    } finally {
      if (requestId === companySearchRequest.current) setLoading(false);
    }
  }, [t.requestError]);

  const loadProjectStats = useCallback(async () => {
    try { setProjectStats(await requestJson<ProjectStats>('/api/admin/client-projects/stats')); }
    catch { setProjectStats({ totalProjects: 0, activeProjects: 0, completedProjects: 0, overdueProjects: 0 }); }
  }, []);

  useEffect(() => {
    let active = true;
    void requestJson<ProjectManager[]>('/api/admin/client-projects/managers')
      .then((result) => { if (active) setProjectManagers(Array.isArray(result) ? result : []); })
      .catch(() => { if (active) setProjectManagers([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => { void loadProjectStats(); }, [loadProjectStats]);

  useEffect(() => { void loadCompanies(); }, [loadCompanies]);

  const visibleCompanies = useMemo(() => searchCompanies(
    companies.filter((company) => !projectStatusFilter || (company.projectStatuses || []).includes(projectStatusFilter)), search, 6,
  ), [companies, projectStatusFilter, search]);
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId) || null;
  const editingCompany = companies.find((company) => company.id === editingCompanyId) || null;
  const hasActiveCode = Boolean(editingCompany?.hasActiveCode);
  const generatedCodeForForm = revealedCode?.companyId === editingCompanyId ? revealedCode.code : '';

  if (workspaceCompanyId) {
    return <ClientProjectManagementView selectedCompanyId={workspaceCompanyId} selectedProjectId={workspaceProjectId || undefined} onBackToCompanies={() => { setWorkspaceCompanyId(null); setWorkspaceProjectId(null); void loadCompanies(); void loadProjectStats(); }} />;
  }

  const resetForm = () => {
    setFormOpen(false);
    setEditingCompanyId(null);
    setDraft(emptyDraft);
    setInitialProject(emptyInitialProject);
    setRevealedCode(null);
    setError('');
  };

  const openCreateForm = () => {
    setDraft(emptyDraft);
    setInitialProject(emptyInitialProject);
    setEditingCompanyId(null);
    setRevealedCode(null);
    setSelectedCompanyId(null);
    setError('');
    setNotice('');
    setFormOpen(true);
  };

  const openEditForm = (company: Company) => {
    setDraft({ companyName: company.companyName, contactPerson: company.contactPerson, email: company.email, phone: company.phone, description: company.description, website: company.website || '', logoUrl: company.logoUrl || '', industry: company.industry || '', internalNotes: company.internalNotes || '' });
    setInitialProject(emptyInitialProject);
    setEditingCompanyId(company.id);
    setRevealedCode(null);
    setError('');
    setNotice('');
    setFormOpen(true);
  };

  const saveCompany = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const companyName = draft.companyName.trim();
    if (!companyName) { setError(t.required); return; }

    setSaving(true);
    setError('');
    setNotice('');
    const body = {
      ...draft,
      companyName,
      contactPerson: draft.contactPerson.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      description: draft.description.trim(),
      website: draft.website.trim(),
      logoUrl: draft.logoUrl.trim(),
      industry: draft.industry.trim(),
      internalNotes: draft.internalNotes.trim(),
      initialProjectName: initialProject.name.trim(),
      initialProjectDescription: initialProject.description.trim(),
      initialProjectStatus: initialProject.status,
      initialProjectCategory: initialProject.category.trim(),
      initialProjectPriority: initialProject.priority,
      initialProjectStartDate: initialProject.startDate || null,
      initialProjectExpectedCompletionDate: initialProject.expectedCompletionDate || null,
      initialProjectAssignedManagerId: initialProject.assignedManagerId || null,
    };
    try {
      if (editingCompanyId) {
        const updated = await requestJson<Company>(`/api/admin/client-projects/companies/${encodeURIComponent(editingCompanyId)}`, { method: 'PUT', body });
        setCompanies((current) => current.map((company) => company.id === updated.id ? { ...company, ...updated } : company));
        setNotice(t.updated);
      } else {
        const result = await requestJson<{ company: Company; accessCode: AccessCodeResponse }>('/api/admin/client-projects/companies/provision', { method: 'POST', body });
        const saved = { ...result.company, hasActiveCode: true };
        setCompanies((current) => [saved, ...current.filter((company) => company.id !== saved.id)].slice(0, 6));
        setEditingCompanyId(saved.id);
        setSelectedCompanyId(saved.id);
        setRevealedCode({ companyId: saved.id, code: result.accessCode.code });
        setInitialProject(emptyInitialProject);
        setSearch('');
        await loadCompanies();
        setNotice(t.codeIssued);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.requestError);
    } finally {
      setSaving(false);
    }
  };

  const generateCode = async () => {
    if (!editingCompanyId) { setError(t.codeHelp); return; }
    if (hasActiveCode && !window.confirm(t.confirmRotate)) return;
    setCodeBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await requestJson<AccessCodeResponse>(`/api/admin/client-projects/companies/${encodeURIComponent(editingCompanyId)}/access-code`, { method: 'POST', body: {} });
      setRevealedCode({ companyId: editingCompanyId, code: result.code });
      setCompanies((current) => current.map((company) => company.id === editingCompanyId ? { ...company, hasActiveCode: true } : company));
      setNotice(t.codeIssued);
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : t.requestError);
    } finally {
      setCodeBusy(false);
    }
  };

  const copyCode = async () => {
    if (!generatedCodeForForm) return;
    try {
      await navigator.clipboard.writeText(generatedCodeForForm);
      setNotice(t.copied);
      setError('');
    } catch {
      setError(t.copyError);
    }
  };

  const revokeCode = async () => {
    if (!editingCompanyId) return;
    if (!window.confirm(t.confirmRevoke)) return;
    setCodeBusy(true);
    setError('');
    setNotice('');
    try {
      await requestJson<{ success: true }>(`/api/admin/client-projects/companies/${encodeURIComponent(editingCompanyId)}/access-code`, { method: 'DELETE' });
      setRevealedCode(null);
      setCompanies((current) => current.map((company) => company.id === editingCompanyId ? { ...company, hasActiveCode: false } : company));
      setNotice(t.revoked);
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : t.requestError);
    } finally {
      setCodeBusy(false);
    }
  };

  const toggleStatus = async (company: Company) => {
    if (company.status === 'active' && !window.confirm(t.confirmDeactivate)) return;
    setError('');
    setNotice('');
    try {
      await requestJson<{ success: true }>(`/api/admin/client-projects/companies/${encodeURIComponent(company.id)}/status`, {
        method: 'PATCH', body: { status: company.status === 'active' ? 'inactive' : 'active' },
      });
      setCompanies((current) => current.map((item) => item.id === company.id ? { ...item, status: company.status === 'active' ? 'inactive' : 'active', hasActiveCode: company.status === 'active' ? false : item.hasActiveCode } : item));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : t.requestError);
    }
  };

  return <section className="space-y-5" aria-labelledby="project-management-title">
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div><h2 id="project-management-title" className="text-lg font-bold text-white sm:text-xl">{t.title}</h2><p className="mt-1 text-xs text-slate-400 sm:text-sm">{t.subtitle}</p></div>
      <button type="button" onClick={openCreateForm} className={primaryButtonClass}><Plus className="h-4 w-4" />{t.addCompany}</button>
    </header>

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label={t.projectsHeading}>
      {[[t.totalProjects, projectStats.totalProjects], [t.activeProjects, projectStats.activeProjects], [t.completedProjects, projectStats.completedProjects], [t.overdueProjects, projectStats.overdueProjects]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>)}
    </div>

    <section className={sectionClass} aria-labelledby="project-directory-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 id="project-directory-title" className="text-base font-bold text-white">{t.projectsHeading}</h3><p className="mt-1 text-xs text-slate-500">{t.openWorkspace}</p></div>
        <label><span className="sr-only">{t.filterStatus}</span><select aria-label={t.filterStatus} value={projectStatusFilter} onChange={(event) => setProjectStatusFilter(event.target.value)} className={inputClass}><option value="">{t.allStatuses}</option>{['planning','in_progress','under_review','blocked','delayed','on_hold','completed','cancelled'].map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
      </div>
      {error && <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-rose-800/60 bg-rose-950/30 p-3 text-xs text-rose-200"><span>{error}</span><button type="button" className="underline" onClick={() => void loadCompanies()}>{t.retry}</button></div>}
      {notice && <div role="status" className="mb-3 rounded-xl border border-emerald-800/60 bg-emerald-950/25 p-3 text-sm text-emerald-200">{notice}</div>}
      {!loading && <label className="relative mb-4 block w-full sm:max-w-md"><span className="sr-only">{t.searchCompanies}</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input type="search" aria-label={t.searchCompanies} placeholder={t.searchCompanies} value={search} onChange={(event) => { setSearch(event.target.value); setSelectedCompanyId(null); }} className={`${inputClass} pl-9`} /></label>}
      {loading ? <p role="status" className="text-sm text-slate-400"><RefreshCw className="mr-2 inline h-4 w-4 animate-spin text-cyan-300" />{t.loading}</p>
        : companies.length === 0 ? <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400"><Building2 className="h-5 w-5 text-cyan-300" />{t.noCompanies}</div>
          : visibleCompanies.length === 0 ? <p className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">{search ? t.noMatches : t.noProjectMatches}</p>
            : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleCompanies.map((company) => <article key={company.id} className="flex min-w-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-cyan-900/70 sm:p-5">
              <div className="flex min-w-0 items-start gap-3"><CompanyLogo logoUrl={company.logoUrl} companyName={company.companyName} /><div className="min-w-0 flex-1"><h4 className="break-words text-sm font-bold text-white sm:text-base">{company.companyName}</h4><p className="mt-1 truncate text-xs text-slate-400">{company.contactPerson || '—'}</p></div></div>
              <div className="mt-4 flex flex-wrap gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${company.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{company.status === 'active' ? t.active : t.inactive}</span><span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] text-slate-300">{company.hasActiveCode ? t.activeCode : t.noActiveCode}</span></div>
              <p className="mt-3 truncate text-xs text-slate-400">{company.email || company.phone || '—'}</p>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div className="flex items-center justify-between gap-2 text-xs"><span className="text-slate-400">{t.projectCount}</span><span className="font-semibold text-slate-200">{company.projectCount}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-label={t.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={company.averageProgress}><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-[width]" style={{ width: `${Math.max(0, Math.min(100, company.averageProgress))}%` }} /></div><p className="mt-1 text-right text-[10px] text-slate-400">{company.averageProgress}% {t.progress}</p><div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">{company.inProgressProjects > 0 && <span>{company.inProgressProjects} {t.inProgressProjects}</span>}{company.blockedProjects > 0 && <span className="text-amber-300">{company.blockedProjects} {t.blockedProjects}</span>}{company.completedProjects > 0 && <span className="text-emerald-300">{company.completedProjects} {t.completedProjects}</span>}</div></div>
              <div className="mt-auto flex flex-wrap gap-2 pt-4"><button type="button" className={primaryButtonClass} onClick={() => setWorkspaceCompanyId(company.id)}>{t.openWorkspace}</button><button type="button" className={buttonClass} onClick={() => setSelectedCompanyId((current) => current === company.id ? null : company.id)}>{selectedCompanyId === company.id ? t.hide : t.view}</button><button type="button" className={buttonClass} onClick={() => openEditForm(company)}>{t.editCompany}</button><button type="button" className={buttonClass} onClick={() => void toggleStatus(company)}>{company.status === 'active' ? t.inactive : t.active}</button></div>
            </article>)}</div>}
      {selectedCompany && <section className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-labelledby="selected-company-title"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 id="selected-company-title" className="text-base font-bold text-white">{selectedCompany.companyName}</h4><p className="mt-1 text-sm text-slate-400">{selectedCompany.contactPerson || '—'}</p></div><div className="flex gap-2"><button type="button" className={buttonClass} onClick={() => openEditForm(selectedCompany)}>{t.editCompany}</button><button type="button" className={buttonClass} onClick={() => setSelectedCompanyId(null)}>{t.hide}</button></div></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-500">{t.email}</dt><dd className="mt-1 break-all text-slate-200">{selectedCompany.email || '—'}</dd></div><div><dt className="text-xs text-slate-500">{t.phone}</dt><dd className="mt-1 text-slate-200">{selectedCompany.phone || '—'}</dd></div><div className="sm:col-span-2"><dt className="text-xs text-slate-500">{t.notes}</dt><dd className="mt-1 whitespace-pre-wrap text-slate-200">{selectedCompany.description || '—'}</dd></div></dl></section>}
    </section>

    {formOpen && <form onSubmit={(event) => void saveCompany(event)} className={sectionClass}>
      <div className="mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-cyan-300" /><h3 className="text-sm font-bold text-white">{editingCompanyId ? t.editCompany : t.addCompany}</h3></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Field label={t.companyName} value={draft.companyName} onChange={(value) => setDraft((current) => ({ ...current, companyName: value }))} required />
        <Field label={t.contactPerson} value={draft.contactPerson} onChange={(value) => setDraft((current) => ({ ...current, contactPerson: value }))} />
        <Field label={t.email} type="email" maxLength={254} value={draft.email} onChange={(value) => setDraft((current) => ({ ...current, email: value }))} />
        <Field label={t.phone} type="tel" maxLength={40} value={draft.phone} onChange={(value) => setDraft((current) => ({ ...current, phone: value }))} />
        <Field label={t.website} type="url" maxLength={2048} value={draft.website} onChange={(value) => setDraft((current) => ({ ...current, website: value }))} />
        <Field label={t.logoUrl} type="url" maxLength={2048} value={draft.logoUrl} onChange={(value) => setDraft((current) => ({ ...current, logoUrl: value }))} />
        <Field label={t.industry} maxLength={160} value={draft.industry} onChange={(value) => setDraft((current) => ({ ...current, industry: value }))} />
        <label className="block space-y-1.5 sm:col-span-2 xl:col-span-3"><span className="text-xs font-medium text-slate-300">{t.notes}</span><textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows={3} maxLength={5000} className={`${inputClass} resize-y`} /></label>
        <label className="block space-y-1.5 sm:col-span-2 xl:col-span-3"><span className="text-xs font-medium text-slate-300">{t.internalNotes}</span><textarea value={draft.internalNotes} onChange={(event) => setDraft((current) => ({ ...current, internalNotes: event.target.value }))} rows={3} maxLength={5000} className={`${inputClass} resize-y`} /></label>
      </div>

      {!editingCompanyId && <section className="mt-5 rounded-xl border border-slate-800 bg-slate-950/45 p-4" aria-label={t.initialProjectName}>
        <h4 className="mb-3 text-sm font-semibold text-white">{t.initialProjectName}</h4>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label={t.initialProjectName} value={initialProject.name} onChange={(value) => setInitialProject((current) => ({ ...current, name: value }))} />
          <label className="block space-y-1.5"><span className="text-xs font-medium text-slate-300">{t.projectStatus}</span><select value={initialProject.status} onChange={(event) => setInitialProject((current) => ({ ...current, status: event.target.value }))} className={inputClass}>{['planning', 'in_progress', 'under_review', 'on_hold', 'completed', 'cancelled', 'blocked', 'delayed'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
          <Field label={t.category} value={initialProject.category} onChange={(value) => setInitialProject((current) => ({ ...current, category: value }))} maxLength={100} />
          <label className="block space-y-1.5"><span className="text-xs font-medium text-slate-300">{t.priority}</span><select value={initialProject.priority} onChange={(event) => setInitialProject((current) => ({ ...current, priority: event.target.value }))} className={inputClass}>{['low','normal','high','urgent'].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          <Field label={t.startDate} type="date" value={initialProject.startDate} onChange={(value) => setInitialProject((current) => ({ ...current, startDate: value }))} />
          <Field label={t.expectedCompletion} type="date" value={initialProject.expectedCompletionDate} onChange={(value) => setInitialProject((current) => ({ ...current, expectedCompletionDate: value }))} />
          <label className="block space-y-1.5"><span className="text-xs font-medium text-slate-300">{t.manager}</span><select value={initialProject.assignedManagerId} onChange={(event) => setInitialProject((current) => ({ ...current, assignedManagerId: event.target.value }))} className={inputClass}><option value="">—</option>{projectManagers.map((manager) => <option key={manager.id} value={manager.id}>{manager.fullName || manager.email}</option>)}</select></label>
          <label className="block space-y-1.5 sm:col-span-2 xl:col-span-3"><span className="text-xs font-medium text-slate-300">{t.initialProjectDescription}</span><textarea value={initialProject.description} onChange={(event) => setInitialProject((current) => ({ ...current, description: event.target.value }))} rows={2} maxLength={5000} className={`${inputClass} resize-y`} /></label>
        </div>
      </section>}

      <section className="mt-5 rounded-xl border border-cyan-900/60 bg-cyan-950/15 p-4" aria-labelledby="company-access-code-title">
        <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-cyan-300" /><h4 id="company-access-code-title" className="text-sm font-semibold text-white">{t.accessCode}</h4></div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{t.codeHelp}</p>
        {hasActiveCode && !generatedCodeForForm && <p className="mt-2 text-xs text-amber-200">{t.codeActive}</p>}
        {generatedCodeForForm && <div className="mt-3 flex flex-col gap-2 rounded-lg border border-cyan-800/50 bg-slate-950/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <code className="break-all font-mono text-base tracking-[0.18em] text-cyan-100" aria-label={t.accessCode}>{generatedCodeForForm}</code>
          <button type="button" className={buttonClass} onClick={() => void copyCode()}><Copy className="h-3.5 w-3.5" />{t.copyCode}</button>
        </div>}
        <div className="mt-3 flex flex-wrap gap-2">
          <button type={editingCompanyId ? 'button' : 'submit'} className={buttonClass} disabled={codeBusy || saving} onClick={editingCompanyId ? () => void generateCode() : undefined}>
            {codeBusy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}{hasActiveCode ? t.rotateCode : t.generateCode}
          </button>
          {hasActiveCode && <button type="button" className={buttonClass} disabled={codeBusy || saving} onClick={() => void revokeCode()}><ShieldOff className="h-3.5 w-3.5" />{t.revokeCode}</button>}
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className={primaryButtonClass} disabled={saving || codeBusy}>{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{editingCompanyId ? t.saveChanges : t.saveCompany}</button>
        <button type="button" className={buttonClass} disabled={saving || codeBusy} onClick={resetForm}>{t.cancel}</button>
      </div>
    </form>}

  </section>;
};
