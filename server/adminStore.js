const businessProfiles = [
  {
    id: 'demo-business',
    name: 'Malditaia',
    type: 'electronics',
    language: ['uz', 'ru', 'en'],
    status: 'active',
    botEnabled: true,
    products: [
      {
        id: 'phone-1',
        name: 'Samsung Galaxy A35',
        category: 'smartphone',
        price: 3300000,
        currency: 'UZS',
        stock: 12,
      },
      {
        id: 'phone-2',
        name: 'Tecno Camon 30',
        category: 'smartphone',
        price: 2750000,
        currency: 'UZS',
        stock: 9,
      },
      {
        id: 'phone-3',
        name: 'Realme C75',
        category: 'smartphone',
        price: 2100000,
        currency: 'UZS',
        stock: 18,
      },
      {
        id: 'watch-1',
        name: 'Xiaomi Smart Watch',
        category: 'wearable',
        price: 980000,
        currency: 'UZS',
        stock: 22,
      },
      {
        id: 'earbuds-1',
        name: 'Noise Buds X',
        category: 'audio',
        price: 640000,
        currency: 'UZS',
        stock: 27,
      },
    ],
  },
];

const leads = [];
const conversations = [];

export function getBusinessProfile(businessId) {
  return businessProfiles.find((business) => business.id === businessId) || businessProfiles[0];
}

export function listBusinesses() {
  return businessProfiles;
}

export function addLead(lead) {
  leads.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...lead });
  return leads[leads.length - 1];
}

export function listLeads() {
  return leads;
}

export function addConversation(conversation) {
  conversations.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...conversation });
  return conversations[conversations.length - 1];
}

export function listConversations() {
  return conversations;
}
