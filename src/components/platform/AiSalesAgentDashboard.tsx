import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../lib/api';
import {
  Activity,
  ArrowUpRight,
  Bot,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Package,
  PlugZap,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';

type TabKey = 'overview' | 'conversations' | 'products' | 'leads' | 'ai-config' | 'integrations' | 'settings';

type BusinessMetrics = {
  totalCustomerConversations: number;
  activeConversations: number;
  leadsCollected: number;
  ordersOrSalesRequests: number;
  aiHandled: number;
  humanHandoffs: number;
};

type ActivityItem = {
  id: string;
  customerName: string;
  channel: string;
  message: string;
  time: string;
  status: string;
};

type ProductItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  description: string;
};

type LeadItem = {
  id: string;
  business_id?: string;
  customer_name?: string;
  phone?: string;
  channel?: string;
  status?: string;
  note?: string;
  interested_product?: string;
  conversation_id?: string;
  created_at?: string;
};

type ConversationItem = {
  id: string;
  customer_name: string;
  channel: string;
  status: string;
  last_message: string;
  customer_identifier?: string;
  created_at?: string;
  ai_enabled?: number;
  messages?: Array<{ id: string; role: string; text: string; created_at?: string }>;
};

type SettingsPayload = {
  assistantName: string;
  welcomeMessage: string;
  companyDescription: string;
  businessHours: string;
  supportedLanguages: string;
  salesInstructions: string;
  faq: string;
  humanHandoff: string;
};


const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'conversations', label: 'Conversations', icon: MessageSquareText },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'ai-config', label: 'AI Configuration', icon: Bot },
  { key: 'integrations', label: 'Integrations', icon: PlugZap },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const getBusinessId = (): string => {
  if (typeof window === 'undefined') return 'demo-business';

  try {
    const raw = localStorage.getItem('ziyo-sales-business');
    if (!raw) return 'demo-business';
    const parsed = JSON.parse(raw);
    return parsed?.id || 'demo-business';
  } catch {
    return 'demo-business';
  }
};

const getAdminSession = () => {
  if (typeof window === 'undefined') return null;

  try {
    const savedUser = localStorage.getItem('ziotech-admin-user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && typeof parsed.email === 'string') return parsed;
    }

    const salesUser = localStorage.getItem('ziyo-sales-admin');
    if (salesUser) {
      const parsed = JSON.parse(salesUser);
      if (parsed && typeof parsed.email === 'string') return parsed;
    }

    return null;
  } catch {
    return null;
  }
};

const getAuthHeaders = () => {
  const csrfCookie = typeof document === 'undefined' ? '' : document.cookie.split('; ').find((part) => /(?:^|__Host-)ziyo_(?:admin_)?csrf=/.test(part));
  const csrfToken = csrfCookie?.slice(csrfCookie.indexOf('=') + 1) || '';
  return {
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'X-CSRF-Token': decodeURIComponent(csrfToken) } : {}),
  };
};

const adminFetch = (url: string, options: RequestInit = {}) => {
  const headers = new Headers(getAuthHeaders());
  new Headers(options.headers).forEach((value, key) => headers.set(key, value));
  return fetch(url, { ...options, credentials: 'include', headers }).then((response) => {
    if (response.status === 401) window.dispatchEvent(new Event('ziyotech-admin-session-expired'));
    return response;
  });
};

export const AiSalesAgentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [businessId, setBusinessId] = useState<string>(getBusinessId());
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalCustomerConversations: 0,
    activeConversations: 0,
    leadsCollected: 0,
    ordersOrSalesRequests: 0,
    aiHandled: 0,
    humanHandoffs: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [trend, setTrend] = useState<Array<{ label: string; value: number }>>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [settings, setSettings] = useState<SettingsPayload>({
    assistantName: 'ZiyoTech Sales Agent',
    welcomeMessage: 'Salom! Qanday yordam bera olaman?',
    companyDescription: '',
    businessHours: '09:00-21:00',
    supportedLanguages: 'uz,ru,en',
    salesInstructions: 'Be helpful, sales-focused, and professional.',
    faq: '',
    humanHandoff: 'Escalate complex cases to a human operator.',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'smartphone',
    price: '0',
    stock: '0',
    currency: 'UZS',
    description: '',
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [notify, setNotify] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(getAdminSession());

  const refreshBusinessData = async () => {
    setError('');
    setLoading(true);

    try {
      const [overviewRes, productsRes, leadsRes, conversationsRes, settingsRes] = await Promise.all([
        adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/overview`),
        adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/products`),
        adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/leads`),
        adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/conversations`),
        adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/ai-settings`),
      ]);

      if (!overviewRes.ok || !productsRes.ok || !leadsRes.ok || !conversationsRes.ok || !settingsRes.ok) {
        const errorBody = await overviewRes.text();
        throw new Error(errorBody || 'Unable to load dashboard data.');
      }

      const [overviewData, productsData, leadsData, conversationsData, settingsData] = await Promise.all([
        overviewRes.json(),
        productsRes.json(),
        leadsRes.json(),
        conversationsRes.json(),
        settingsRes.json(),
      ]);

      setMetrics(overviewData.metrics || {
        totalCustomerConversations: 0,
        activeConversations: 0,
        leadsCollected: 0,
        ordersOrSalesRequests: 0,
        aiHandled: 0,
        humanHandoffs: 0,
      });
      setRecentActivity(overviewData.recentActivity || []);
      setTrend(overviewData.trend || []);
      setProducts(productsData || []);
      setLeads(leadsData || []);
      setConversations(conversationsData.conversations || []);
      setSettings({
        assistantName: settingsData.settings?.assistant_name || 'ZiyoTech Sales Agent',
        welcomeMessage: settingsData.settings?.welcome_message || 'Salom! Qanday yordam bera olaman?',
        companyDescription: settingsData.settings?.company_description || '',
        businessHours: settingsData.settings?.business_hours || '09:00-21:00',
        supportedLanguages: settingsData.settings?.supported_languages || 'uz,ru,en',
        salesInstructions: settingsData.settings?.sales_instructions || 'Be helpful, sales-focused, and professional.',
        faq: settingsData.settings?.faq || '',
        humanHandoff: settingsData.settings?.human_handoff || 'Escalate complex cases to a human operator.',
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const syncSessionFromStorage = () => {
      setSessionUser(getAdminSession());
      setBusinessId(getBusinessId());
    };

    window.addEventListener('storage', syncSessionFromStorage);
    syncSessionFromStorage();
    return () => window.removeEventListener('storage', syncSessionFromStorage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void adminFetch(`${API_BASE_URL}/api/admin/session`).then(async (response) => {
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Administrator session is missing. Sign in again.');
      const payload = await response.json() as { authenticated?: boolean; user?: { id?: unknown; name?: unknown; email?: unknown } };
      if (payload.authenticated !== true || typeof payload.user?.id !== 'string' || typeof payload.user.name !== 'string' || typeof payload.user.email !== 'string') throw new Error('Administrator session is missing. Sign in again.');
      if (cancelled) return;
      if (payload.user) {
        setSessionUser(payload.user);
      }
      await refreshBusinessData();
    }).catch((sessionError) => {
      if (cancelled) return;
      setLoading(false);
      setError(sessionError instanceof Error ? sessionError.message : 'Administrator session is missing. Sign in again.');
      window.location.href = '/admin';
    });
    return () => { cancelled = true; };
  }, [businessId]);

  useEffect(() => {
    if (!notify) return;
    const timer = window.setTimeout(() => setNotify(''), 2200);
    return () => window.clearTimeout(timer);
  }, [notify]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((product) => {
      return product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
    });
  }, [products, search]);

  const addProduct = async () => {
    if (!productForm.name.trim()) {
      setError('Product name is required.');
      return;
    }

    setSavingProduct(true);
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/products`, {
        method: 'POST',
        body: JSON.stringify({
          name: productForm.name,
          category: productForm.category,
          price: Number(productForm.price),
          currency: productForm.currency,
          stock: Number(productForm.stock),
          description: productForm.description,
        }),
      });

      if (!response.ok) throw new Error('Unable to create product.');
      setProductForm({ name: '', category: 'smartphone', price: '0', stock: '0', currency: 'UZS', description: '' });
      setNotify('Product added successfully');
      await refreshBusinessData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Unable to update lead status.');
      setNotify('Lead status updated');
      await refreshBusinessData();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update lead status.');
    }
  };

  const updateConversationStatus = async (conversationId: string, status: string) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Unable to update conversation.');
      setNotify('Conversation updated');
      await refreshBusinessData();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Unable to update conversation.');
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/businesses/${businessId}/ai-settings`, {
        method: 'PUT',
        body: JSON.stringify({
          assistantName: settings.assistantName,
          welcomeMessage: settings.welcomeMessage,
          companyDescription: settings.companyDescription,
          businessHours: settings.businessHours,
          supportedLanguages: settings.supportedLanguages,
          salesInstructions: settings.salesInstructions,
          faq: settings.faq,
          humanHandoff: settings.humanHandoff,
        }),
      });

      if (!response.ok) throw new Error('Unable to save AI settings.');
      setNotify('AI settings saved');
      await refreshBusinessData();
    } catch (settingsError) {
      setError(settingsError instanceof Error ? settingsError.message : 'Unable to save settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { label: 'Total customer conversations', value: metrics.totalCustomerConversations, icon: MessageSquareText },
          { label: 'Active conversations', value: metrics.activeConversations, icon: Activity },
          { label: 'Leads collected', value: metrics.leadsCollected, icon: Users },
          { label: 'Orders / sales requests', value: metrics.ordersOrSalesRequests, icon: Briefcase },
          { label: 'AI-handled conversations', value: metrics.aiHandled, icon: Bot },
          { label: 'Human handoffs', value: metrics.humanHandoffs, icon: UserRound },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-4 text-3xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Conversation trends</h3>
            <ArrowUpRight className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex h-44 items-end gap-3">
            {trend.length > 0 ? trend.map((point) => (
              <div key={point.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-400" style={{ height: `${Math.max(18, (point.value / Math.max(...trend.map((t) => t.value), 1)) * 100)}%` }} />
                <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{point.label}</span>
              </div>
            )) : (
              <div className="text-sm text-slate-400">No conversation trend data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="text-base font-bold text-white">Recent customer activity</h3>
          <div className="mt-4 space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{entry.customerName}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-cyan-400">{entry.channel}</span>
                </div>
                <p className="mt-2 text-xs text-slate-300">{entry.message}</p>
                <div className="mt-2 text-[10px] text-slate-500">{entry.time}</div>
              </div>
            )) : (
              <div className="text-sm text-slate-400">No recent customer activity yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConversations = () => (
    <div className="space-y-4">
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">No conversations yet for this business.</div>
      ) : conversations.map((conversation) => (
        <div key={conversation.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{conversation.customer_name || 'Unknown customer'}</span>
                <span className="rounded-full border border-cyan-800 bg-cyan-900/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cyan-300">{conversation.channel}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">{conversation.customer_identifier || 'No customer identifier provided'}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-300">{conversation.status}</span>
              <button onClick={() => updateConversationStatus(conversation.id, conversation.status === 'human_takeover' ? 'active' : 'human_takeover')} className="rounded-full border border-amber-700 bg-amber-950/40 px-3 py-1.5 text-[10px] font-bold text-amber-200">Human takeover</button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(conversation.messages || []).map((message) => (
              <div key={message.id} className={`rounded-xl border p-3 ${message.role === 'human' ? 'border-indigo-800 bg-indigo-950/30' : 'border-slate-800 bg-slate-950/60'}`}>
                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{message.role}</div>
                <div className="mt-1 text-sm text-slate-200">{message.text}</div>
              </div>
            )) || <div className="text-sm text-slate-400">No message history available.</div>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Catalog</h3>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-56 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500" />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">No products match your current search.</div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{product.name}</div>
                      <div className="mt-1 text-xs text-slate-400">{product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-300">{Number(product.price).toLocaleString()} {product.currency}</div>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Stock {product.stock}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{product.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="text-base font-bold text-white">Add product</h3>
          <div className="mt-4 space-y-3">
            <input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} placeholder="Product name" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <input value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} placeholder="Category" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <div className="grid grid-cols-2 gap-3">
              <input value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} placeholder="Price" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
              <input value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} placeholder="Stock" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            </div>
            <input value={productForm.currency} onChange={(event) => setProductForm({ ...productForm, currency: event.target.value })} placeholder="Currency" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} rows={4} placeholder="Description" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500" />
            <button onClick={addProduct} disabled={savingProduct} className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-slate-950">{savingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save product</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-4">
      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">No leads captured for this business yet.</div>
      ) : leads.map((lead) => (
        <div key={lead.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-white">{lead.customer_name || 'Unknown customer'}</div>
              <div className="mt-1 text-xs text-slate-400">{lead.phone || 'No phone shared'} · {lead.channel || 'Unknown channel'}</div>
            </div>
            <div className="flex items-center gap-2">
              <select value={lead.status || 'new'} onChange={(event) => updateLeadStatus(lead.id, event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Interested product</div><div className="mt-2 font-medium text-white">{lead.interested_product || 'Not specified'}</div></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Source</div><div className="mt-2 font-medium text-white">{lead.channel || 'Unknown'}</div></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Created</div><div className="mt-2 font-medium text-white">{lead.created_at ? new Date(lead.created_at).toLocaleString() : 'Unknown'}</div></div>
          </div>
          {lead.note ? <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-300">{lead.note}</div> : null}
        </div>
      ))}
    </div>
  );

  const renderAiConfig = () => (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Assistant name</label>
          <input value={settings.assistantName} onChange={(event) => setSettings({ ...settings, assistantName: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Business hours</label>
          <input value={settings.businessHours} onChange={(event) => setSettings({ ...settings, businessHours: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Welcome message</label>
        <textarea value={settings.welcomeMessage} onChange={(event) => setSettings({ ...settings, welcomeMessage: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Company description</label>
        <textarea value={settings.companyDescription} onChange={(event) => setSettings({ ...settings, companyDescription: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Supported languages</label>
        <input value={settings.supportedLanguages} onChange={(event) => setSettings({ ...settings, supportedLanguages: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Sales instructions</label>
        <textarea value={settings.salesInstructions} onChange={(event) => setSettings({ ...settings, salesInstructions: event.target.value })} rows={4} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">FAQ / knowledge snippets</label>
        <textarea value={settings.faq} onChange={(event) => setSettings({ ...settings, faq: event.target.value })} rows={4} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-slate-400">Human handoff preferences</label>
        <textarea value={settings.humanHandoff} onChange={(event) => setSettings({ ...settings, humanHandoff: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
      </div>

      <div className="flex justify-end">
        <button onClick={saveSettings} disabled={settingsSaving} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-slate-950">{settingsSaving ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}Save settings</button>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Telegram</h3>
          <span className="rounded-full border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-300">Connected</span>
        </div>
        <p className="mt-3 text-sm text-slate-300">Bot token is currently disabled because no secure token has been configured. Dashboard operations remain available without Telegram.</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Instagram</h3>
          <span className="rounded-full border border-amber-800 bg-amber-950/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-200">Coming soon</span>
        </div>
        <p className="mt-3 text-sm text-slate-300">Instagram integration is not active yet. The dashboard remains ready for official API integration when credentials are available.</p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Website chat</h3>
          <span className="rounded-full border border-cyan-800 bg-cyan-950/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-300">Ready</span>
        </div>
        <p className="mt-3 text-sm text-slate-300">Website chat is available for future embedding and is designed to reuse the same business-scoped logic and AI configuration.</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center gap-2 text-cyan-300"><Settings className="h-4 w-4" /> <span className="font-bold">Business account settings</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Business ID</div><div className="mt-2 font-medium text-white">{businessId}</div></div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Account status</div><div className="mt-2 flex items-center gap-2 font-medium text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Active</div></div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">All data is scoped by the selected business and remains isolated from other businesses. Product and conversation access are validated server-side.</div>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'conversations': return renderConversations();
      case 'products': return renderProducts();
      case 'leads': return renderLeads();
      case 'ai-config': return renderAiConfig();
      case 'integrations': return renderIntegrations();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <Bot className="h-5 w-5" />
            <span className="text-[11px] uppercase tracking-[0.2em]">AI Sales Agent</span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-white">Business automation dashboard</h2>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">Business: <span className="font-semibold text-white">{businessId}</span></div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${active ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'}`}>
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</div> : null}
      {notify ? <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">{notify}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-slate-300"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading AI sales dashboard...</div>
      ) : (
        renderTab()
      )}
    </div>
  );
};
