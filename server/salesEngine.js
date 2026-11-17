import { GoogleGenAI } from '@google/genai';

const DEMO_PRODUCTS = [
  { id: 'phone-1', name: 'Samsung Galaxy A35', category: 'smartphone', price: 3300000, currency: 'UZS', stock: 12, description: 'Balanced smartphone with strong camera and battery' },
  { id: 'phone-2', name: 'Tecno Camon 30', category: 'smartphone', price: 2750000, currency: 'UZS', stock: 9, description: 'Camera-focused smartphone with premium photo results' },
  { id: 'phone-3', name: 'Realme C75', category: 'smartphone', price: 2100000, currency: 'UZS', stock: 18, description: 'Affordable everyday smartphone with solid performance' },
  { id: 'watch-1', name: 'Xiaomi Smart Watch', category: 'wearable', price: 980000, currency: 'UZS', stock: 22, description: 'Smart watch for fitness and notifications' },
  { id: 'earbuds-1', name: 'Noise Buds X', category: 'audio', price: 640000, currency: 'UZS', stock: 27, description: 'Wireless earbuds with rich sound and long battery life' },
];

const GEMINI_TIMEOUT_MS = 20000;
const GEMINI_MAX_RETRIES = 2;

function formatMoney(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectCustomerLanguage(message = '') {
  const text = message.toLowerCase();
  const russianHints = ['привет', 'здравствуйте', 'пожалуйста', 'цена', 'товар', 'модель', 'купить', 'сделать'];
  const uzbekHints = ['salom', 'qanday', 'narx', 'mahsulot', 'model', 'sotib', 'harid', 'yordam'];

  if (russianHints.some((hint) => text.includes(hint))) return 'ru';
  if (uzbekHints.some((hint) => text.includes(hint))) return 'uz';
  return 'en';
}

function extractRetryAfterHint(error) {
  const message = `${error?.message || ''} ${error?.details?.message || ''}`.trim();
  const match = message.match(/retry in\s+([0-9hmsd. ]+)/i);
  if (match) return match[1].trim();

  const header = error?.retryAfter || error?.details?.retryAfter;
  if (header) return String(header);

  return null;
}

function isQuotaExceededError(error) {
  const status = Number(error?.status || error?.code || 0);
  const message = `${error?.message || ''} ${error?.toString?.() || ''}`.toLowerCase();
  return status === 429 || /quota|rate limit|too many requests|free tier|exceeded your current quota/i.test(message);
}

function buildTemporaryUnavailableMessage({ language, productList }) {
  const messages = {
    uz: `Salom! 😊 Bizning AI xizmat hozircha band. Iltimos, bir ozdan keyin qayta urinib ko'ring. Hozircha quyidagi mahsulotlarimiz mavjud:\n\n${productList}\n\nAgar qo'shimcha ma'lumot kerak bo'lsa, telefon raqamingizni qoldiring.`,
    ru: `Здравствуйте! 😊 Наш AI сервис сейчас перегружен. Пожалуйста, попробуйте чуть позже. Пока доступны следующие товары:\n\n${productList}\n\nЕсли нужна дополнительная информация, оставьте ваш номер телефона.`,
    en: `Hi! 😊 Our AI service is temporarily busy. Please try again in a moment. For now, here are the available options:\n\n${productList}\n\nIf you want help, leave your phone number and I’ll follow up.`,
  };

  return messages[language] || messages.en;
}

function buildQuotaExceededMessage(language, retryAfterHint) {
  const retryText = retryAfterHint ? ` Iltimos ${retryAfterHint} dan keyin qayta urinib ko'ring.` : ' Iltimos bir ozdan keyin qayta urinib ko\'ring.';

  const catalog = DEMO_PRODUCTS.map((product) => `${product.name} — ${formatMoney(product.price)} (${product.stock} qoldiq)`).join('\n');

  const messages = {
    uz: `Salom! 😊 Bizning AI xizmat hozirda kunlik limitga yetdi. ${retryText}\n\nHozircha quyidagi mahsulotlar mavjud:\n\n${catalog}`,
    ru: `Здравствуйте! 😊 Наш AI сервис сейчас достиг лимита запросов. ${retryText}\n\nПока доступны следующие товары:\n\n${catalog}`,
    en: `Hi! 😊 Our AI service is currently rate-limited. ${retryText}\n\nFor now, these products are still available:\n\n${catalog}`,
  };

  return messages[language] || messages.en;
}

function isRetryableGeminiError(error) {
  const status = error?.status || error?.code || error?.details?.status;
  const message = `${error?.message || ''} ${error?.toString?.() || ''}`.toLowerCase();
  return !isQuotaExceededError(error) && (status === 503 || status === '503' || message.includes('unavailable') || message.includes('overloaded') || message.includes('rate limit'));
}

function logGeminiError({ stage, error, model, attempt, elapsedMs, retryable }) {
  const status = error?.status || error?.code || undefined;
  const message = error?.message || String(error);
  console.warn('[Gemini]', JSON.stringify({
    stage,
    model,
    attempt,
    elapsedMs,
    retryable,
    status,
    message,
  }));
}

function findRelevantProducts(products, userMessage) {
  const text = userMessage.toLowerCase();
  const budgetMatch = text.match(/(\d{1,3}(?:\s?\d{3})*)\s*(?:so['’]m|sum|uzs|summa)/i);
  const budgetValue = budgetMatch ? Number(budgetMatch[1].replace(/\s+/g, '')) : null;

  const categoryHints = {
    smartphone: ['telefon', 'phone', 'smartphone', 'smartfon', 'model'],
    wearable: ['watch', 'soat', 'smart watch'],
    audio: ['earbuds', 'quloqchin', 'earphone', 'headphones'],
  };

  let preferredCategory = null;
  for (const [category, hints] of Object.entries(categoryHints)) {
    if (hints.some((hint) => text.includes(hint))) {
      preferredCategory = category;
      break;
    }
  }

  let filtered = (products || []).filter((product) => {
    if (preferredCategory && product.category !== preferredCategory) return false;
    if (budgetValue && product.price > budgetValue) return false;
    return true;
  });

  if (!filtered.length) {
    filtered = products || [];
  }

  return filtered.slice(0, 3);
}

function buildCatalogReply({ message, catalog, language, productList }) {
  const text = (message || '').toLowerCase();
  const productMatches = (catalog || []).filter((product) => {
    const name = `${product.name} ${product.category || ''}`.toLowerCase();
    return text.includes(name) || name.includes(text);
  });

  const greeting = /^(hi|hello|salom|assalom|salam|privet|здравствуйте|привет|hey)/i.test(message || '');
  const wantsCatalog = /(catalog|catalogue|mahsulotlar|products?|tovar|товары|product list|what do you sell|what are you selling)/i.test(message || '');
  const asksPrice = /(narx|price|cost|qiymat|стоимость|цена|skolko|qanch|how much)/i.test(message || '');
  const asksStock = /(bor|available|stock|qoldiq|mavjud|остаток|есть|in stock|sold)/i.test(message || '');
  const thanks = /(rahmat|thanks|спасибо|thank you|xayr)/i.test(message || '');

  if (greeting || wantsCatalog) {
    const messages = {
      uz: `Salom! 😊 Hozirda quyidagi mahsulotlar mavjud:\n\n${productList}`,
      ru: `Здравствуйте! 😊 Сейчас доступны следующие товары:\n\n${productList}`,
      en: `Hello! 😊 These are the current products available:\n\n${productList}`,
    };
    return messages[language] || messages.en;
  }

  if (asksPrice || asksStock) {
    if (productMatches.length) {
      const product = productMatches[0];
      const messages = {
        uz: `${product.name} narxi ${formatMoney(product.price)}. Qoldiq: ${product.stock} dona.`,
        ru: `${product.name} стоит ${formatMoney(product.price)}. В наличии: ${product.stock} шт.`,
        en: `${product.name} costs ${formatMoney(product.price)}. In stock: ${product.stock} units.`,
      };
      return messages[language] || messages.en;
    }

    const messages = {
      uz: `Mahsulot narxlari va qoldig'i:\n\n${productList}`,
      ru: `Цены и остатки товаров:\n\n${productList}`,
      en: `Product prices and stock levels:\n\n${productList}`,
    };
    return messages[language] || messages.en;
  }

  if (thanks) {
    const messages = {
      uz: 'Rahmat! Har doim yordam berishdan xursandmiz.',
      ru: 'Спасибо! Всегда рады помочь.',
      en: 'Thank you! Happy to help any time.',
    };
    return messages[language] || messages.en;
  }

  return null;
}

function shouldUseGemini(message = '') {
  const text = (message || '').toLowerCase();
  if (!text.trim()) return false;

  const simpleCatalogPatterns = [
    'salom', 'hello', 'hi', 'privet', 'assalom', 'salam', 'qalesiz', 'catalog', 'mahsulot', 'products', 'narx', 'price', 'qoldiq', 'stock', 'mavjud', 'available', 'bor', 'rahmat', 'thanks', 'спасибо', 'товар', 'стоимость', 'цена', 'вариант', 'подходящий', 'sotuvda', 'telefon', 'phone', 'model', 'smartphone', 'watch', 'earbuds'
  ];

  return !simpleCatalogPatterns.some((pattern) => text.includes(pattern));
}

export function createSalesAssistant() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const getBusinessContext = () => ({
    name: 'Malditaia',
    language: ['uz', 'ru', 'en'],
    channels: ['telegram'],
    salesGoal: 'Recommend the right product, answer pricing questions, and collect leads',
  });

  const getCatalog = () => DEMO_PRODUCTS;

  async function generateWithRetry({ model, systemPrompt, prompt }) {
    let lastError;

    for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
      const startedAt = Date.now();
      try {
        const result = await Promise.race([
          ai.models.generateContent({
            model,
            contents: `${systemPrompt}\n\n${prompt}`,
          }),
          new Promise((_, reject) => {
            setTimeout(() => reject(Object.assign(new Error(`Gemini request timed out after ${GEMINI_TIMEOUT_MS}ms`), { status: 408, timeout: true })), GEMINI_TIMEOUT_MS);
          }),
        ]);

        const elapsedMs = Date.now() - startedAt;
        console.info('[Gemini] response ok', JSON.stringify({ model, attempt: attempt + 1, elapsedMs }));
        return result;
      } catch (error) {
        const elapsedMs = Date.now() - startedAt;
        lastError = error;

        if (isQuotaExceededError(error)) {
          throw Object.assign(error, { quotaExceeded: true, retryAfter: extractRetryAfterHint(error) });
        }

        const retryable = isRetryableGeminiError(error) || error?.timeout === true;

        logGeminiError({
          stage: 'generateContent',
          error,
          model,
          attempt: attempt + 1,
          elapsedMs,
          retryable,
        });

        if (!retryable || attempt >= GEMINI_MAX_RETRIES) {
          throw error;
        }

        const backoffMs = 400 * (2 ** attempt);
        console.warn('[Gemini] retrying request', JSON.stringify({ model, attempt: attempt + 1, backoffMs }));
        await delay(backoffMs);
      }
    }

    throw lastError;
  }

  async function handleMessage({ businessId, customerName, channel, message, catalog = DEMO_PRODUCTS }) {
    const relevantProducts = findRelevantProducts(catalog, message);
    const productList = relevantProducts
      .map((product) => `${product.name} — ${formatMoney(product.price)} (${product.stock} in stock)`)
      .join('\n');

    const customerLanguage = detectCustomerLanguage(message);

    const quickCatalogReply = buildCatalogReply({
      message,
      catalog: relevantProducts.length ? relevantProducts : catalog,
      language: customerLanguage,
      productList,
    });

    if (quickCatalogReply && !shouldUseGemini(message)) {
      return {
        success: true,
        mode: 'catalog',
        business: getBusinessContext(),
        response: quickCatalogReply,
        products: relevantProducts,
        leadRequired: false,
      };
    }

    const systemPrompt = `You are ZiyoTech Sales AI for a business named Malditaia. You are a helpful sales assistant. Always use the business catalog and never invent products or prices. Respond in the language of the customer. Use natural Uzbek/Russian/English. Recommend only products that exist in the catalog. If customer asks for a price, quote the actual price. If a product is out of stock, say so. If they seem ready to buy, ask for their phone number and name. Keep responses short, friendly, and sales-focused.`;

    const prompt = `Customer name: ${customerName}\nBusiness: ${businessId}\nChannel: ${channel}\nCustomer message: ${message}\nCatalog:\n${productList}`;

    if (!process.env.GEMINI_API_KEY) {
      return {
        success: true,
        mode: 'demo',
        business: getBusinessContext(),
        response: `Salom! 😊 Men yordam beraman. Siz uchun quyidagi variantlar mavjud:\n\n${productList}\n\nAgar bironini tanlamoqchi bo'lsangiz, telefon raqamingizni qoldiring, men sizga qo'shimcha yordam beraman.`,
        products: relevantProducts,
        leadRequired: true,
      };
    }

    try {
      const response = await generateWithRetry({
        model: 'gemini-3.8-flash',
        systemPrompt,
        prompt,
      });

      const reply = response?.text || 'I can help with product recommendations and sales questions.';

      return {
        success: true,
        mode: 'ai',
        business: getBusinessContext(),
        response: reply,
        products: relevantProducts,
        leadRequired: /telefon|raqam|name|ism|buy|sohib|купить|номер|телефон/i.test(message),
      };
    } catch (error) {
      if (isQuotaExceededError(error)) {
        const retryAfterHint = extractRetryAfterHint(error);
        console.warn('[Gemini] quota exceeded response', JSON.stringify({
          model: 'gemini-3.8-flash',
          retryAfter: retryAfterHint,
          businessId,
          channel,
        }));

        return {
          success: true,
          mode: 'quota',
          business: getBusinessContext(),
          response: buildQuotaExceededMessage(customerLanguage, retryAfterHint),
          products: relevantProducts,
          leadRequired: true,
          quotaExceeded: true,
        };
      }

      const fallbackResponse = buildTemporaryUnavailableMessage({
        language: customerLanguage,
        productList,
      });

      console.error('[Gemini] final fallback used', JSON.stringify({
        model: 'gemini-3.8-flash',
        customerLanguage,
        businessId,
        channel,
        messageLength: message.length,
        error: error?.message || String(error),
      }));

      return {
        success: true,
        mode: 'fallback',
        business: getBusinessContext(),
        response: fallbackResponse,
        products: relevantProducts,
        leadRequired: true,
      };
    }
  }

  return { handleMessage, getBusinessContext, getCatalog };
}

export { DEMO_PRODUCTS };
