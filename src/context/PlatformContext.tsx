import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductItem, OrderItem, Conversation, AiAgentConfig, KnowledgeDoc, UserRole, ProjectRequest } from '../types';

const PROJECT_REQUESTS_COLLECTION = 'projectRequests';

const buildProjectRequestDocument = (request: Omit<ProjectRequest, 'id' | 'createdAt' | 'status'> & { id?: string; createdAt?: string; status?: ProjectRequest['status'] }) => ({
  ...request,
  id: request.id || `req-${Date.now()}`,
  createdAt: request.createdAt || new Date().toISOString(),
  status: request.status || 'new',
});

const normalizeProjectRequests = (items: DocumentData[]): ProjectRequest[] =>
  items
    .map((item) => ({
      id: String(item.id || item.reqId || ''),
      name: String(item.name || ''),
      businessName: String(item.businessName || ''),
      email: String(item.email || ''),
      phoneOrTelegram: String(item.phoneOrTelegram || ''),
      serviceId: String(item.serviceId || 'ai-automation'),
      projectDesc: String(item.projectDesc || ''),
      preferredLang: (item.preferredLang === 'ru' || item.preferredLang === 'en' ? item.preferredLang : 'uz') as ProjectRequest['preferredLang'],
      status: (item.status === 'new' || item.status === 'review' || item.status === 'contacted' || item.status === 'completed' ? item.status : 'new') as ProjectRequest['status'],
      source: item.source === 'website' ? 'website' : 'website',
      createdAt: String(item.createdAt || new Date().toISOString()),
    }))
    .filter((item) => item.id);

interface PlatformContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  products: ProductItem[];
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  updateProduct: (id: string, product: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (conversationId: string, text: string, sender?: 'human' | 'ai') => void;
  toggleHumanTakeover: (conversationId: string) => void;
  orders: OrderItem[];
  updateOrderStatus: (orderId: string, status: OrderItem['status']) => void;
  projectRequests: ProjectRequest[];
  addProjectRequest: (request: Omit<ProjectRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateProjectRequestStatus: (requestId: string, status: ProjectRequest['status']) => void;
  aiConfig: AiAgentConfig;
  updateAiConfig: (config: Partial<AiAgentConfig>) => void;
  knowledgeDocs: KnowledgeDoc[];
  addKnowledgeDoc: (doc: Omit<KnowledgeDoc, 'id' | 'lastUpdated'>) => void;
  deleteKnowledgeDoc: (id: string) => void;
  instagramAccount: {
    connected: boolean;
    username: string;
    accountType: string;
    followers: string;
    webhookStatus: 'active' | 'warning' | 'disconnected';
    tokenExpiryDays: number;
  };
  toggleInstagramConnection: () => void;
}

const initialProducts: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Klassik Teri Sumka (Milano Tote)',
    category: 'Aksessuarlar',
    price: 499000,
    stock: 18,
    sku: 'NX-BAG-01',
    description: 'Yuqori sifatli tabiiy charm, zamonaviy dizayn va keng sig\'im.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-2',
    name: 'Oversize Jun Palto (Winter Cashmere)',
    category: 'Ustki Kiyim',
    price: 1250000,
    stock: 7,
    sku: 'NX-COAT-04',
    description: 'Issiq kashmir matosi, qulay bichim, qish mavsumi uchun ideal.',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-3',
    name: 'Minimalist Aqlli Soat (Chronos Pro)',
    category: 'Elektronika',
    price: 890000,
    stock: 24,
    sku: 'NX-WATCH-99',
    description: 'AMOLED ekran, 14 kunlik batareya, yurak urishi va sport monitoringi.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-4',
    name: 'Skandinav Dizayn Kursisi (Nordic Oak)',
    category: 'Mebel',
    price: 1850000,
    stock: 5,
    sku: 'NX-CHAIR-12',
    description: 'Tabiiy eman daraxti, ortopedik yumshoq o\'rindiq.',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-5',
    name: 'Simsiz Shovqinni So\'ndiruvchi Quloqlik',
    category: 'Elektronika',
    price: 640000,
    stock: 32,
    sku: 'NX-AUDIO-02',
    description: 'ANC faol shovqinni to\'sish, Hi-Fi ovoz sifati, 30 soat ishlash.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
  },
];

const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    customerName: 'Madina Umarova',
    customerHandle: 'madina_u',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Albatta! Ushbu mahsulotning narxi — 499 000 so\'m.',
    lastTimestamp: 'Hozirgina',
    unreadCount: 0,
    status: 'ai_handling',
    channel: 'instagram',
    language: 'uz',
    tags: ['Yangi mijoz', 'Sumka so\'rovi'],
    customerNotes: 'Klassik charm sumka qidirmoqda, Toshkent shahriga yetkazib berish so\'radi.',
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Assalomu alaykum, bu sumka qancha turadi?',
        timestamp: '14:20',
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'Vaalaykum assalom, Madina! "Klassik Teri Sumka (Milano Tote)" narxi 499 000 so\'m. Mahsulot hozirda omborimizda 18 dona mavjud. Yetkazib berish Toshkent bo\'yicha 1 kun ichida bepul amalga oshiriladi. Buyurtma berishni xohlaysizmi?',
        timestamp: '14:20',
        productCard: {
          name: 'Klassik Teri Sumka (Milano Tote)',
          price: '499 000 so\'m',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
        },
      },
    ],
  },
  {
    id: 'conv-2',
    customerName: 'Jasur Beknazarov',
    customerHandle: 'jasur_tech',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Здравствуйте! Есть ли в наличии черное пальто размера L?',
    lastTimestamp: '8 daqiqa oldin',
    unreadCount: 1,
    status: 'human_takeover',
    channel: 'instagram',
    language: 'ru',
    assignedTo: 'Alisher (Meneger)',
    tags: ['VIP', 'Katta buyurtma'],
    customerNotes: 'Doimiy xaridor. Xodim bilan gaplashmoqchi bo\'ldi.',
    messages: [
      {
        id: 'm3',
        sender: 'customer',
        text: 'Здравствуйте! Есть ли в наличии черное пальто размера L?',
        timestamp: '14:10',
      },
      {
        id: 'm4',
        sender: 'ai',
        text: 'Здравствуйте! "Oversize Jun Palto" размера L в наличии (осталось 3 единицы). Стоимость 1 250 000 сум.',
        timestamp: '14:10',
      },
      {
        id: 'm5',
        sender: 'customer',
        text: 'Можно соединить с менеджером для примерки в шоуруме?',
        timestamp: '14:12',
      },
      {
        id: 'm6',
        sender: 'ai',
        text: 'Конечно! Передаю ваш диалог нашему ведущему менеджеру Алишеру. Он свяжется с вами в течение пары минут.',
        timestamp: '14:12',
      },
    ],
  },
  {
    id: 'conv-3',
    customerName: 'Dilnoza Karimova',
    customerHandle: 'dilnoza_k',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Yetkazib berish shartlari qanday?',
    lastTimestamp: '25 daqiqa oldin',
    unreadCount: 0,
    status: 'ai_handling',
    channel: 'instagram',
    language: 'uz',
    tags: ['Savol'],
    messages: [
      {
        id: 'm7',
        sender: 'customer',
        text: 'Samarqandga yetkazib berish qancha turadi va necha kunda boradi?',
        timestamp: '13:50',
      },
      {
        id: 'm8',
        sender: 'ai',
        text: 'Assalomu alaykum! Samarqand shahriga yetkazib berish BTS yoki Fargo pochta orqali 25 000 so\'m. Yetkazish muddati 1-2 ish kuni. Qaysi mahsulotga qiziqayapsiz?',
        timestamp: '13:50',
      },
    ],
  },
  {
    id: 'conv-4',
    customerName: 'Shaxzod Aliyev',
    customerHandle: 'shaxzod_al',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Buyurtma tasdiqlandi. Rahmat!',
    lastTimestamp: '1 soat oldin',
    unreadCount: 0,
    status: 'resolved',
    channel: 'instagram',
    language: 'uz',
    tags: ['Xarid qildi'],
    messages: [
      {
        id: 'm9',
        sender: 'customer',
        text: 'Aqlli soatga buyurtma bermoqchiman.',
        timestamp: '13:00',
      },
      {
        id: 'm10',
        sender: 'ai',
        text: 'Ajoyib tanlov! Ismingiz, telefon raqamingiz va yetkazish manzilini yozib qoldiring.',
        timestamp: '13:01',
      },
      {
        id: 'm11',
        sender: 'customer',
        text: 'Shaxzod Aliyev, +998901234567, Yunusobod 14-mavze.',
        timestamp: '13:03',
      },
      {
        id: 'm12',
        sender: 'ai',
        text: 'Buyurtmangiz #NX-858 raqami bilan qabul qilindi. Tez orada kuryer siz bilan bog\'lanadi.',
        timestamp: '13:03',
      },
    ],
  },
];

const initialOrders: OrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: 'NX-858',
    customerName: 'Shaxzod Aliyev',
    customerHandle: '@shaxzod_al',
    phone: '+998 90 123 45 67',
    productName: 'Minimalist Aqlli Soat (Chronos Pro)',
    amount: 890000,
    date: '2026-11-09 13:03',
    status: 'confirmed',
    source: 'Instagram DM',
  },
  {
    id: 'ord-2',
    orderNumber: 'NX-857',
    customerName: 'Nilufar Rahimova',
    customerHandle: '@nilu_style',
    phone: '+998 97 765 43 21',
    productName: 'Klassik Teri Sumka (Milano Tote)',
    amount: 499000,
    date: '2026-11-09 11:42',
    status: 'delivered',
    source: 'Instagram DM',
  },
  {
    id: 'ord-3',
    orderNumber: 'NX-856',
    customerName: 'Bobur Mansurov',
    customerHandle: '@bobur_m',
    phone: '+998 93 555 12 34',
    productName: 'Oversize Jun Palto (Winter Cashmere)',
    amount: 1250000,
    date: '2026-11-08 19:15',
    status: 'confirmed',
    source: 'Instagram DM',
  },
  {
    id: 'ord-4',
    orderNumber: 'NX-855',
    customerName: 'Kamila Saidova',
    customerHandle: '@kamila_s',
    phone: '+998 91 888 99 00',
    productName: 'Simsiz Shovqinni So\'ndiruvchi Quloqlik',
    amount: 640000,
    date: '2026-11-08 15:30',
    status: 'pending',
    source: 'Instagram DM',
  },
];

const initialKnowledge: KnowledgeDoc[] = [
  {
    id: 'kb-1',
    title: 'Yetkazib berish shartlari va tariflari',
    category: 'delivery',
    content: 'Toshkent shahri bo\'yicha 300 000 so\'mdan ortiq buyurtmalar uchun yetkazib berish mutlaqo bepul. 300 000 so\'mgacha bo\'lgan buyurtmalar uchun 20 000 so\'m. Viloyatlarga BTS va Fargo pochta orqali 25 000 - 35 000 so\'m. Yetkazish muddati viloyatlarga 1-2 ish kuni.',
    lastUpdated: '2026-11-05',
  },
  {
    id: 'kb-2',
    title: 'Mahsulotni qaytarish va almashtirish siyosati',
    category: 'returns',
    content: 'Xaridor tovarni qabul qilgan kundan boshlab 14 kun ichida almashtirish yoki qaytarish huquqiga ega. Tovar asl holatida, yorliqlari va cheki saqlangan bo\'lishi shart. To\'lov qaytarish 24 soat ichida plastik kartaga amalga oshiriladi.',
    lastUpdated: '2026-11-02',
  },
  {
    id: 'kb-3',
    title: 'To\'lov turlari va usullari',
    category: 'policy',
    content: 'Biz Payme, Click, Uzum Bank va naqd pulda to\'lovlarni qabul qilamiz. Korporativ mijozlar uchun hisob-kitob varag\'i (perechisleniye) orqali to\'lov ham mavjud.',
    lastUpdated: '2026-11-01',
  },
  {
    id: 'kb-4',
    title: 'Do\'kon ish tartibi va manzillari',
    category: 'faq',
    content: 'Asosiy shourumimiz Toshkent shahri, Amir Temur shox ko\'chasi 45-uy manzilida joylashgan. Ish vaqti: Har kuni soat 10:00 dan 21:00 gacha dam olish kunlarisiz.',
    lastUpdated: '2026-10-28',
  },
];

const initialProjectRequests: ProjectRequest[] = [
  {
    id: 'req-1',
    name: 'Samandar Karimov',
    businessName: 'Kreativ Studio',
    email: 'samandar@kreativstudio.uz',
    phoneOrTelegram: '+998 90 112 34 56',
    serviceId: 'ai-automation',
    projectDesc: 'Instagram va Telegram uchun AI savdo agenti yaratishni xohlayman. Savollarni avtomatik javoblash va buyurtma faoliyatini tezlashtirish kerak.',
    preferredLang: 'uz',
    status: 'new',
    source: 'website',
    createdAt: '2026-11-10T09:30:00.000Z',
  },
  {
    id: 'req-2',
    name: 'Nargiza Tursunova',
    businessName: 'Nargiza Beauty',
    email: 'hello@nargizabeauty.uz',
    phoneOrTelegram: '@nargiza_beauty',
    serviceId: 'website-development',
    projectDesc: 'Brend uchun modern landing page va online booking tizimi kerak. Mobile-friendly va premium dizayn talab qilinadi.',
    preferredLang: 'ru',
    status: 'review',
    source: 'website',
    createdAt: '2026-11-09T15:00:00.000Z',
  },
];

const PROJECT_REQUESTS_STORAGE_KEY = 'ziotech-project-requests';

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('business_owner');
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>(() => {
    if (typeof window === 'undefined') {
      return initialProjectRequests;
    }

    try {
      const saved = window.localStorage.getItem(PROJECT_REQUESTS_STORAGE_KEY);
      if (!saved) return initialProjectRequests;
      const parsed = JSON.parse(saved) as ProjectRequest[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialProjectRequests;
    } catch {
      return initialProjectRequests;
    }
  });
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(initialKnowledge);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROJECT_REQUESTS_STORAGE_KEY, JSON.stringify(projectRequests));
    }
  }, [projectRequests]);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, PROJECT_REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firebaseRequests = normalizeProjectRequests(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
      setProjectRequests((prev) => {
        if (firebaseRequests.length === 0) return prev;
        return firebaseRequests;
      });
    }, () => {
      // ignore snapshot errors and keep local fallback
    });

    return () => unsubscribe();
  }, []);

  const [aiConfig, setAiConfig] = useState<AiAgentConfig>({
    isEnabled: true,
    model: 'gemini-2.5-flash / gpt-4o-mini',
    primaryLanguage: 'both',
    tone: 'professional',
    autoHumanHandover: true,
    handoverThreshold: 75,
    autoOrderDrafting: true,
    businessName: 'ZiyoTech Retail Partner',
    workingHours: '10:00 - 21:00',
    deliveryPolicy: 'Toshkent ichida bepul (300k+), viloyatlarga 25k.',
    returnPolicy: '14 kunlik kafolat va bepul almashtirish.',
  });

  const [instagramAccount, setInstagramAccount] = useState<{
    connected: boolean;
    username: string;
    accountType: string;
    followers: string;
    webhookStatus: 'active' | 'warning' | 'disconnected';
    tokenExpiryDays: number;
  }>({
    connected: true,
    username: '@ziyotech_brand_demo',
    accountType: 'Instagram Professional (Business)',
    followers: '28.4K',
    webhookStatus: 'active',
    tokenExpiryDays: 54,
  });

  const addProduct = (product: Omit<ProductItem, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    setProducts((prev) => [
      {
        ...product,
        id: newId,
      },
      ...prev,
    ]);
  };

  const updateProduct = (id: string, updated: Partial<ProductItem>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const sendMessage = (conversationId: string, text: string, sender: 'human' | 'ai' = 'human') => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: timeStr,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastTimestamp: 'Hozirgina',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  const toggleHumanTakeover = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const nextStatus = c.status === 'ai_handling' ? 'human_takeover' : 'ai_handling';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderItem['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const addProjectRequest = (request: Omit<ProjectRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest = buildProjectRequestDocument({ ...request, id: `req-${Date.now()}` });

    setProjectRequests((prev) => [newRequest, ...prev]);

    if (db) {
      const docRef = doc(db, PROJECT_REQUESTS_COLLECTION, newRequest.id);
      setDoc(docRef, newRequest)
        .catch(() => {
          // no-op: local fallback already saved
        });
    }
  };

  const updateProjectRequestStatus = (requestId: string, status: ProjectRequest['status']) => {
    setProjectRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)));

    if (db) {
      const docRef = doc(db, PROJECT_REQUESTS_COLLECTION, requestId);
      updateDoc(docRef, { status }).catch(() => {
        // no-op: local fallback already saved
      });
    }
  };

  const updateAiConfig = (config: Partial<AiAgentConfig>) => {
    setAiConfig((prev) => ({ ...prev, ...config }));
  };

  const addKnowledgeDoc = (doc: Omit<KnowledgeDoc, 'id' | 'lastUpdated'>) => {
    const newDoc: KnowledgeDoc = {
      ...doc,
      id: `kb-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setKnowledgeDocs((prev) => [newDoc, ...prev]);
  };

  const deleteKnowledgeDoc = (id: string) => {
    setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleInstagramConnection = () => {
    setInstagramAccount((prev) => ({
      ...prev,
      connected: !prev.connected,
      webhookStatus: !prev.connected ? 'active' : 'disconnected',
    }));
  };

  return (
    <PlatformContext.Provider
      value={{
        role,
        setRole,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        toggleHumanTakeover,
        orders,
        updateOrderStatus,
        projectRequests,
        addProjectRequest,
        updateProjectRequestStatus,
        aiConfig,
        updateAiConfig,
        knowledgeDocs,
        addKnowledgeDoc,
        deleteKnowledgeDoc,
        instagramAccount,
        toggleInstagramConnection,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
