export type Language = 'uz' | 'ru' | 'en';

export type UserRole = 'super_admin' | 'business_owner' | 'employee';

export interface ServiceItem {
  id: string;
  name: Record<Language, string>;
  shortDesc: Record<Language, string>;
  fullDesc: Record<Language, string>;
  icon: string;
  category: string;
  deliverables: Record<Language, string[]>;
  benefits: Record<Language, string[]>;
}

export interface DemoProject {
  id: string;
  title: string;
  clientType: Record<Language, string>;
  description: Record<Language, string>;
  services: string[];
  technologies: string[];
  metrics: string;
  image: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  image: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerHandle: string;
  phone: string;
  productName: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  source: 'Instagram DM' | 'Telegram' | 'Web';
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'human';
  text: string;
  timestamp: string;
  productCard?: {
    name: string;
    price: string;
    image: string;
  };
}

export interface Conversation {
  id: string;
  customerName: string;
  customerHandle: string;
  customerAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  status: 'ai_handling' | 'human_takeover' | 'resolved';
  channel: 'instagram' | 'telegram' | 'web';
  language: 'uz' | 'ru' | 'en';
  assignedTo?: string;
  tags: string[];
  messages: ChatMessage[];
  customerNotes?: string;
}

export interface AiAgentConfig {
  isEnabled: boolean;
  model: string;
  primaryLanguage: 'uz' | 'ru' | 'both';
  tone: 'professional' | 'friendly' | 'casual';
  autoHumanHandover: boolean;
  handoverThreshold: number; // e.g. 80%
  autoOrderDrafting: boolean;
  businessName: string;
  workingHours: string;
  deliveryPolicy: string;
  returnPolicy: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'faq' | 'delivery' | 'returns' | 'policy' | 'product_specs';
  content: string;
  lastUpdated: string;
}

export interface ProjectRequest {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phoneOrTelegram: string;
  serviceId: string;
  projectDesc: string;
  preferredLang: Language;
  status: 'new' | 'review' | 'contacted' | 'completed';
  source: 'website';
  createdAt: string;
}
