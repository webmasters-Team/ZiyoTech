export type AssistantNavigationLanguage = 'uz' | 'ru' | 'en';

export type AssistantDestination = {
  page: string;
  sectionId?: string;
  labels: Record<AssistantNavigationLanguage, string>;
  aliases: string[];
};

const assistantDestinations: AssistantDestination[] = [
  { page: 'home', labels: { en: 'the homepage', uz: 'bosh sahifa', ru: 'главную страницу' }, aliases: ['home', 'homepage', 'home page', 'main page', 'main screen', 'bosh sahifa', 'bosh sahifaga', 'asosiy sahifa', 'asosiy sahifaga', 'boshiga', 'uy sahifa', 'главная', 'главную', 'главная страница', 'домой'] },
  { page: 'services', sectionId: 'services', labels: { en: 'Services', uz: 'Xizmatlar', ru: 'Услуги' }, aliases: ['services', 'service section', 'our services', 'xizmatlar', 'xizmatlarga', 'xizmatlar bolimi', 'xizmatlar bolimiga', 'услуги', 'услугам', 'сервисы'] },
  { page: 'about', sectionId: 'about', labels: { en: 'the company overview', uz: 'kompaniya haqida', ru: 'раздел «О компании»' }, aliases: ['about us', 'about', 'company overview', 'company information', 'biz haqimizda', 'kompaniya haqida', 'biz haqimizda bolimi', 'о нас', 'о компании'] },
  { page: 'about', sectionId: 'about', labels: { en: 'the company overview', uz: 'kompaniya haqida', ru: 'раздел «О компании»' }, aliases: ['team', 'our team', 'team section', 'jamoa', 'jamoaga', 'bizning jamoa', 'жамоа', 'команда', 'команду', 'команде', 'наша команда'] },
  { page: 'portfolio', sectionId: 'portfolio', labels: { en: 'the Portfolio', uz: 'Portfolio', ru: 'Портфолио' }, aliases: ['portfolio', 'completed projects', 'completed work', 'projects', 'loyihalar', 'loyihalarga', 'loyihalarni', 'tugallangan loyihalar', 'bajarilgan loyihalar', 'портфолио', 'проекты', 'проектам', 'завершенные проекты'] },
  { page: 'contact', sectionId: 'contact', labels: { en: 'Contact', uz: 'Aloqa', ru: 'Контакты' }, aliases: ['contact us', 'contact section', 'contact', 'aloqa', 'aloqaga', 'boglanish', 'kontakt', 'контакты', 'контактам', 'связь'] },
];

const normalizeNavigationText = (value: string) => value.toLowerCase().normalize('NFKC')
  .replace(/[’‘`']/g, ' ')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const includesNavigationPhrase = (text: string, phrase: string) => {
  const normalizedText = ` ${normalizeNavigationText(text)} `;
  const normalizedPhrase = normalizeNavigationText(phrase);
  if (!normalizedPhrase) return false;
  if (normalizedText.includes(` ${normalizedPhrase} `)) return true;
  return !normalizedPhrase.includes(' ') && normalizedPhrase.length >= 5
    && normalizedText.trim().split(' ').some((word) => word.startsWith(normalizedPhrase));
};

const navigationActions = [
  'show me', 'show us', 'take me to', 'take me', 'go to', 'navigate to', 'navigate', 'open', 'visit', 'bring me to', 'let me see', 'i want to see', 'id like to see',
  'introduce your team', 'introduce me to your team', 'korsat', 'korsating', 'ko rsat', 'ko rsating', 'olib bor', 'olib boring', 'o ting', 'o tkaz', 'otkaz', 'tanishtir', 'tanishtiring', 'ochib ber', 'ochib bering', 'покажи', 'покажите', 'перейди', 'перейдите', 'перейти', 'отведи', 'отведите', 'проведи меня', 'открой', 'откройте', 'направь', 'давай посмотрим', 'хочу посмотреть',
];

export const resolveAssistantDestination = (message: string): AssistantDestination | null => {
  const hasNavigationAction = navigationActions.some((action) => includesNavigationPhrase(message, action));
  if (!hasNavigationAction) return null;
  return assistantDestinations.find((destination) => destination.aliases.some((alias) => includesNavigationPhrase(message, alias))) || null;
};

export const getAssistantNavigationAcknowledgment = (destination: AssistantDestination, language: AssistantNavigationLanguage) => language === 'uz'
  ? `Albatta, ${destination.labels.uz} bo‘limiga o‘tyapman.`
  : language === 'ru'
    ? `Конечно, перехожу в ${destination.labels.ru}.`
    : `Of course. Taking you to ${destination.labels.en}.`;
