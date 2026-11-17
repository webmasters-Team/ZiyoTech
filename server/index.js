import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createSalesAssistant } from './salesEngine.js';
import { createTelegramBot } from './telegramBot.js';
import {
  getBusinessProfile,
  listBusinesses,
  listProducts,
  listLeads,
  addLead,
  listConversations,
  addConversation,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listConversationMessages,
  updateConversationStatus,
  addConversationMessage,
  getAiSettingsByBusiness,
  upsertAiSettings,
  updateLeadStatus,
} from './businessService.js';
import {
  verifyAdminCredentials,
  getAdminSessionPayload,
  issueAdminSession,
  verifyAdminSessionToken,
} from './auth.js';
import { createBusiness, getBusinessById, listBusinesses as listTenants } from './tenantService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const websiteAssistantModel = 'gemini-3.8-flash';
const websiteAssistantClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const WEBSITE_SERVICES_CONTEXT = `
ZiyoTech website service categories currently represented in this project:
- Website Development / AI-ready website development
- E-commerce solutions
- AI agents and business automation
- Social media management (SMM)
- Professional photo and video content
- Branding and graphic design
- Digital marketing
- Custom digital solutions

Use only this verified project information. Do not invent prices or guarantees. If the user asks about a service not clearly listed, explain that the project includes these service categories and ask a clarifying question.
`;

const normalizeLanguage = (value) => {
  const requested = String(value || 'en').trim().toLowerCase();
  return ['uz', 'ru', 'en'].includes(requested) ? requested : 'en';
};

const sanitizeText = (value, maxLength = 2000) => {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (!text) return '';
  return text.slice(0, maxLength);
};

const normalizeHistory = (history, maxItems = 8, maxLength = 1000) => {
  if (!Array.isArray(history)) return [];

  return history
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      role: entry.role === 'assistant' ? 'assistant' : 'user',
      text: sanitizeText(entry.text, maxLength),
    }))
    .filter((entry) => entry.text)
    .slice(-maxItems);
};

const buildAssistantSystemPrompt = (language) => {
  const languageName = language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English';

  return `You are a helpful ZiyoTech website consultant. Speak in ${languageName}. Use only the verified service information in this project. Do not invent prices, promises, guarantees, or company details. If a fact is not clearly present in the project, say you need more detail instead of guessing. Keep answers concise, clear, and professional. This is a website guidance assistant only; do not ask for contact details, create leads, or trigger navigation. Explain the relevant ZiyoTech services clearly and answer user questions about the business offerings represented in the project.\n\n${WEBSITE_SERVICES_CONTEXT}`;
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const salesAssistant = createSalesAssistant();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ziyo-tech-sales-ai', status: 'running' });
});

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'ziyo-tech-sales-ai',
    message: 'API server is running. Use the frontend at http://localhost:3000 or the API routes under /api.',
    endpoints: ['/api/health', '/api/admin/login', '/api/businesses', '/api/catalog'],
  });
});

app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, history, language = 'en' } = req.body || {};
    const normalizedLanguage = normalizeLanguage(language);
    const cleanedMessage = sanitizeText(message, 1200);
    const cleanedHistory = normalizeHistory(history, 8, 1000);

    if (!cleanedMessage) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI assistant is temporarily unavailable.' });
    }

    const chatHistory = cleanedHistory.length
      ? cleanedHistory
          .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.text}`)
          .join('\n')
      : '';

    const prompt = [
      `User language: ${normalizedLanguage}`,
      `Conversation history:\n${chatHistory || 'No previous messages.'}`,
      `Current user message:\n${cleanedMessage}`,
      'Answer as a knowledgeable ZiyoTech website consultant using only the verified service information in the project. Do not invent pricing, promises, or company details. If something is not confirmed by the project, say so clearly and ask a helpful follow-up question.',
    ].join('\n\n');

    const response = await websiteAssistantClient.models.generateContent({
      model: websiteAssistantModel,
      contents: `${buildAssistantSystemPrompt(normalizedLanguage)}\n\n${prompt}`,
    });

    const answer = typeof response?.text === 'string' && response.text.trim()
      ? response.text.trim()
      : 'I can help explain the ZiyoTech services shown in this project. Please tell me which service or question you want to explore.';

    return res.json({
      success: true,
      language: normalizedLanguage,
      response: answer,
      source: 'gemini-server-side',
    });
  } catch (error) {
    const message = error?.message || 'AI assistant failed to respond.';
    console.error('[assistant-chat] failed', message);

    return res.status(500).json({
      success: false,
      error: 'The assistant could not answer at the moment. Please try again shortly.',
    });
  }
});

app.post('/api/chat', async (req, res) => {
  const { message, businessId = 'demo-business', customerName = 'Customer', channel = 'telegram' } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const response = await salesAssistant.handleMessage({
      businessId,
      customerName,
      channel,
      message,
      catalog: listProducts(businessId),
    });

    return res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'AI sales assistant failed to respond.' });
  }
});

app.get('/api/catalog', (req, res) => {
  const businessId = req.query.businessId || 'demo-business';
  return res.json(listProducts(businessId));
});

app.post('/api/products', (req, res) => {
  const { businessId = 'demo-business', name, category, price, currency = 'UZS', stock = 0, description = '' } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  const product = createProduct({
    businessId,
    name,
    category,
    price,
    currency,
    stock,
    description,
  });

  return res.status(201).json(product);
});

app.put('/api/products/:productId', (req, res) => {
  const product = updateProduct(req.params.productId, req.body || {});
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  return res.json(product);
});

app.delete('/api/products/:productId', (req, res) => {
  const deleted = deleteProduct(req.params.productId);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  return res.json({ success: true, deleted: req.params.productId });
});

app.get('/api/businesses', (_req, res) => {
  return res.json(listBusinesses());
});

app.get('/api/leads', (req, res) => {
  const businessId = req.query.businessId || 'demo-business';
  return res.json(listLeads(businessId));
});

app.get('/api/conversations', (req, res) => {
  const businessId = req.query.businessId || 'demo-business';
  return res.json(listConversations(businessId));
});

app.get('/api/demo', (_req, res) => {
  return res.json({
    product: 'ZiyoTech Sales AI MVP',
    description: 'AI-powered sales assistant for retail businesses using Telegram first.',
    demoBusiness: getBusinessProfile('demo-business'),
    sampleCatalog: listProducts('demo-business').slice(0, 5),
  });
});

const telegramBot = createTelegramBot({
  onMessage: async ({ chatId, senderName, message, channel }) => {
    const business = getBusinessProfile('demo-business');
    const result = await salesAssistant.handleMessage({
      businessId: business.id,
      customerName: senderName,
      channel,
      message,
      catalog: listProducts(business.id),
    });

    addConversation({
      businessId: business.id,
      chatId,
      customerName: senderName,
      channel,
      lastMessage: message,
      status: result.leadRequired ? 'needs_follow_up' : 'active',
    });

    if (result.leadRequired) {
      addLead({
        businessId: business.id,
        customerName: senderName,
        channel,
        source: 'telegram',
        status: 'new',
        note: message,
      });
    }

    return { reply: result.response };
  },
});

if (telegramBot) {
  console.log('Telegram bot initialized successfully.');
}

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const valid = verifyAdminCredentials(email, password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const payload = getAdminSessionPayload(email);
  if (!payload) {
    return res.status(500).json({ error: 'Unable to create admin session.' });
  }

  const session = issueAdminSession(email);
  if (!session) {
    return res.status(500).json({ error: 'Unable to create admin session.' });
  }

  return res.json({
    success: true,
    token: session.token,
    expiresAt: session.expiresAt,
    user: payload,
  });
});

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Admin session is missing or expired.' });
  }

  req.admin = session;
  return next();
}

app.post('/api/businesses/onboard', (req, res) => {
  const { name, type = 'retail', language = 'uz', botEnabled = true } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Business name is required.' });
  }

  const business = createBusiness({
    name: name.trim(),
    type,
    language,
    botEnabled,
    status: 'active',
  });

  return res.status(201).json({ success: true, business });
});

app.get('/api/tenants', (_req, res) => {
  return res.json(listTenants());
});

app.get('/api/businesses/:businessId', (req, res) => {
  const business = getBusinessById(req.params.businessId);
  if (!business) {
    return res.status(404).json({ error: 'Business not found.' });
  }

  return res.json(business);
});

app.get('/api/businesses/:businessId/overview', requireAdminAuth, (req, res) => {
  const { businessId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) {
    return res.status(404).json({ error: 'Business not found.' });
  }

  const conversations = listConversations(businessId);
  const leads = listLeads(businessId);
  const products = listProducts(businessId);

  const totalConversations = conversations.length;
  const activeConversations = conversations.filter((c) => c.status === 'active' || c.status === 'needs_follow_up').length;
  const aiHandled = conversations.filter((c) => c.ai_enabled === 1 || c.status === 'active').length;
  const humanHandoffs = conversations.filter((c) => c.status === 'human_takeover').length;
  const leadsCollected = leads.length;
  const ordersOrSalesRequests = leads.filter((lead) => ['new', 'contacted', 'qualified'].includes(lead.status)).length;

  return res.json({
    businessId: business.id,
    businessName: business.name,
    metrics: {
      totalCustomerConversations: totalConversations,
      activeConversations,
      leadsCollected: leadsCollected,
      ordersOrSalesRequests: ordersOrSalesRequests,
      aiHandled,
      humanHandoffs,
    },
    recentActivity: conversations.slice(0, 6).map((conversation) => ({
      id: conversation.id,
      customerName: conversation.customer_name,
      channel: conversation.channel,
      message: conversation.last_message,
      time: conversation.created_at,
      status: conversation.status,
    })),
    trend: [
      { label: 'Mon', value: Math.max(4, totalConversations - 2) },
      { label: 'Tue', value: Math.max(6, totalConversations) },
      { label: 'Wed', value: Math.max(5, totalConversations + 1) },
      { label: 'Thu', value: Math.max(7, totalConversations + 2) },
      { label: 'Fri', value: Math.max(8, totalConversations + 3) },
      { label: 'Sat', value: Math.max(10, totalConversations + 5) },
    ],
    catalogCount: products.length,
  });
});

app.get('/api/businesses/:businessId/conversations', requireAdminAuth, (req, res) => {
  const { businessId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const conversations = listConversations(businessId);
  const messagesByConversation = conversations.reduce((acc, conversation) => {
    acc[conversation.id] = listConversationMessages(businessId, conversation.id);
    return acc;
  }, {});

  return res.json({
    businessId: business.id,
    conversations: conversations.map((conversation) => ({
      ...conversation,
      messages: messagesByConversation[conversation.id] || [],
    })),
  });
});

app.patch('/api/businesses/:businessId/conversations/:conversationId', requireAdminAuth, (req, res) => {
  const { businessId, conversationId } = req.params;
  const { status } = req.body || {};

  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const success = updateConversationStatus(conversationId, businessId, status);
  if (!success) return res.status(404).json({ error: 'Conversation not found.' });

  return res.json({ success: true, conversationId, status });
});

app.post('/api/businesses/:businessId/conversations/:conversationId/messages', requireAdminAuth, (req, res) => {
  const { businessId, conversationId } = req.params;
  const { role = 'human', text } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const message = addConversationMessage({ businessId, conversationId, role, text: text.trim() });
  return res.status(201).json(message);
});

app.get('/api/businesses/:businessId/leads', requireAdminAuth, (req, res) => {
  const { businessId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  return res.json(listLeads(businessId));
});

app.patch('/api/businesses/:businessId/leads/:leadId/status', requireAdminAuth, (req, res) => {
  const { businessId, leadId } = req.params;
  const { status } = req.body || {};

  if (!status) return res.status(400).json({ error: 'Lead status is required.' });

  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const updated = updateLeadStatus(leadId, businessId, status);
  if (!updated) return res.status(404).json({ error: 'Lead not found.' });

  return res.json({ success: true, leadId, status });
});

app.get('/api/businesses/:businessId/ai-settings', requireAdminAuth, (req, res) => {
  const { businessId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const settings = getAiSettingsByBusiness(businessId) || {
    assistant_name: 'ZiyoTech Sales Agent',
    welcome_message: 'Salom! Qanday yordam bera olaman?',
    company_description: '',
    business_hours: '09:00-21:00',
    supported_languages: 'uz,ru,en',
    sales_instructions: 'Be helpful and sales oriented.',
    faq: '',
    human_handoff: 'Escalate serious or complex cases.',
  };

  return res.json({ businessId, settings });
});

app.put('/api/businesses/:businessId/ai-settings', requireAdminAuth, (req, res) => {
  const { businessId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const payload = req.body || {};
  const saved = upsertAiSettings(businessId, {
    assistantName: payload.assistantName || payload.assistant_name,
    welcomeMessage: payload.welcomeMessage || payload.welcome_message,
    companyDescription: payload.companyDescription || payload.company_description,
    businessHours: payload.businessHours || payload.business_hours,
    supportedLanguages: payload.supportedLanguages || payload.supported_languages || 'uz,ru,en',
    salesInstructions: payload.salesInstructions || payload.sales_instructions,
    faq: payload.faq,
    humanHandoff: payload.humanHandoff || payload.human_handoff,
  });

  return res.json({ success: true, settings: saved });
});

app.get('/api/businesses/:businessId/products', requireAdminAuth, (req, res) => {
  const { businessId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  return res.json(listProducts(businessId));
});

app.post('/api/businesses/:businessId/products', requireAdminAuth, (req, res) => {
  const { businessId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const { name, category, price, currency = 'UZS', stock = 0, description = '' } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  const product = createProduct({ businessId, name: name.trim(), category, price, currency, stock, description });
  return res.status(201).json(product);
});

app.put('/api/businesses/:businessId/products/:productId', requireAdminAuth, (req, res) => {
  const { businessId, productId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const product = getProduct(productId);
  if (!product || product.business_id !== businessId) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const updated = updateProduct(productId, req.body || {});
  return res.json(updated);
});

app.delete('/api/businesses/:businessId/products/:productId', requireAdminAuth, (req, res) => {
  const { businessId, productId } = req.params;
  const business = getBusinessById(businessId);
  if (!business) return res.status(404).json({ error: 'Business not found.' });

  const product = getProduct(productId);
  if (!product || product.business_id !== businessId) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const deleted = deleteProduct(productId);
  if (!deleted) return res.status(404).json({ error: 'Product not found.' });

  return res.json({ success: true, deleted: productId });
});

app.listen(PORT, () => {
  console.log(`ZiyoTech Sales AI backend running on http://localhost:${PORT}`);
});
