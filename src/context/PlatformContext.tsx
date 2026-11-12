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

const initialOrders: OrderItem[] = [];

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

const initialProjectRequests: ProjectRequest[] = [];

const PROJECT_REQUESTS_STORAGE_KEY = 'ziotech-project-requests';

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('business_owner');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>(initialProjectRequests);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(initialKnowledge);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, PROJECT_REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firebaseRequests = normalizeProjectRequests(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            reqId: docSnap.id,
            ...docSnap.data(),
          }))
        );

        setProjectRequests(firebaseRequests);
      },
      (error) => {
        console.warn('Failed to load project requests from Firestore:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROJECT_REQUESTS_STORAGE_KEY, JSON.stringify(projectRequests));
    }
  }, [projectRequests]);

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
