import crypto from 'node:crypto';
import { getDb } from './db.js';

const db = getDb();

export async function getBusinessProfile(businessId) {
  return (await db.prepare('SELECT * FROM businesses WHERE id = ?').get(businessId))
    || await db.prepare('SELECT * FROM businesses LIMIT 1').get();
}

export async function listBusinesses() {
  return db.prepare('SELECT * FROM businesses ORDER BY created_at DESC').all();
}

export async function listProducts(businessId) {
  return db.prepare('SELECT * FROM products WHERE business_id = ? ORDER BY price ASC').all(businessId);
}

export async function getProduct(productId) {
  return (await db.prepare('SELECT * FROM products WHERE id = ?').get(productId)) || null;
}

export async function createProduct(product) {
  const id = product.id || crypto.randomUUID();
  const record = {
    id,
    businessId: product.businessId || 'demo-business',
    name: product.name,
    category: product.category || 'general',
    price: Number(product.price || 0),
    currency: product.currency || 'UZS',
    stock: Number(product.stock || 0),
    description: product.description || '',
  };
  await db.prepare(`INSERT INTO products (id, business_id, name, category, price, currency, stock, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(record.id, record.businessId, record.name, record.category, record.price, record.currency, record.stock, record.description);
  return getProduct(record.id);
}

export async function updateProduct(productId, updates) {
  const existing = await getProduct(productId);
  if (!existing) return null;
  const next = {
    ...existing,
    ...updates,
    price: Number(updates.price ?? existing.price),
    stock: Number(updates.stock ?? existing.stock),
  };
  await db.prepare(`UPDATE products SET name = ?, category = ?, price = ?, currency = ?, stock = ?, description = ? WHERE id = ?`)
    .run(next.name, next.category, next.price, next.currency, next.stock, next.description, productId);
  return getProduct(productId);
}

export async function deleteProduct(productId) {
  const result = await db.prepare('DELETE FROM products WHERE id = ?').run(productId);
  return result.changes > 0;
}

export async function listLeads(businessId) {
  return db.prepare('SELECT * FROM leads WHERE business_id = ? ORDER BY created_at DESC').all(businessId);
}

export async function addLead(lead) {
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO leads (id, business_id, customer_name, phone, channel, source, status, note, interested_product, conversation_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, lead.businessId, lead.customerName || null, lead.phone || null, lead.channel || 'telegram', lead.source || 'telegram',
      lead.status || 'new', lead.note || null, lead.interestedProduct || null, lead.conversationId || null);
  return { id, ...lead, createdAt: new Date().toISOString() };
}

export async function updateLeadStatus(leadId, businessId, status) {
  const result = await db.prepare('UPDATE leads SET status = ? WHERE id = ? AND business_id = ?').run(status, leadId, businessId);
  return result.changes > 0;
}

export async function listConversations(businessId) {
  return db.prepare('SELECT * FROM conversations WHERE business_id = ? ORDER BY created_at DESC').all(businessId);
}

export async function addConversation(conversation) {
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO conversations (id, business_id, customer_name, channel, chat_id, last_message, status, customer_identifier, assigned_to, ai_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, conversation.businessId, conversation.customerName || null, conversation.channel || 'telegram', conversation.chatId || null,
      conversation.lastMessage || null, conversation.status || 'active', conversation.customerIdentifier || null,
      conversation.assignedTo || null, conversation.aiEnabled ? 1 : 0);
  return { id, ...conversation, createdAt: new Date().toISOString() };
}

export async function updateConversationStatus(conversationId, businessId, status) {
  const result = await db.prepare('UPDATE conversations SET status = ? WHERE id = ? AND business_id = ?').run(status, conversationId, businessId);
  return result.changes > 0;
}

export async function listConversationMessages(businessId, conversationId) {
  return db.prepare('SELECT * FROM conversation_messages WHERE business_id = ? AND conversation_id = ? ORDER BY created_at ASC').all(businessId, conversationId);
}

export async function addConversationMessage({ businessId, conversationId, role, text }) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.transaction(async () => {
    await db.prepare(`INSERT INTO conversation_messages (id, conversation_id, business_id, role, text, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, conversationId, businessId, role, text, createdAt);
    await db.prepare('UPDATE conversations SET last_message = ? WHERE id = ? AND business_id = ?').run(text, conversationId, businessId);
  })();
  return { id, conversationId, businessId, role, text, createdAt };
}

export async function getAiSettingsByBusiness(businessId) {
  return (await db.prepare('SELECT * FROM ai_settings WHERE business_id = ?').get(businessId)) || null;
}

export async function upsertAiSettings(businessId, settings) {
  const existing = await getAiSettingsByBusiness(businessId);
  const payload = {
    assistantName: settings.assistantName || 'ZiyoTech Sales Agent',
    welcomeMessage: settings.welcomeMessage || 'Salom! Sizga qanday yordam bera olaman?',
    companyDescription: settings.companyDescription || '',
    businessHours: settings.businessHours || '09:00-21:00',
    supportedLanguages: settings.supportedLanguages || 'uz,ru,en',
    salesInstructions: settings.salesInstructions || 'Be helpful and friendly.',
    faq: settings.faq || '',
    humanHandoff: settings.humanHandoff || 'Escalate complex or upset customer cases.',
  };
  if (existing) {
    await db.prepare(`UPDATE ai_settings SET assistant_name = ?, welcome_message = ?, company_description = ?, business_hours = ?,
      supported_languages = ?, sales_instructions = ?, faq = ?, human_handoff = ?, updated_at = CURRENT_TIMESTAMP WHERE business_id = ?`)
      .run(payload.assistantName, payload.welcomeMessage, payload.companyDescription, payload.businessHours, payload.supportedLanguages,
        payload.salesInstructions, payload.faq, payload.humanHandoff, businessId);
    return getAiSettingsByBusiness(businessId);
  }
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO ai_settings (id, business_id, assistant_name, welcome_message, company_description, business_hours,
    supported_languages, sales_instructions, faq, human_handoff) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, businessId, payload.assistantName, payload.welcomeMessage, payload.companyDescription, payload.businessHours,
      payload.supportedLanguages, payload.salesInstructions, payload.faq, payload.humanHandoff);
  return getAiSettingsByBusiness(businessId);
}
