import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bot,
  Instagram,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  Database,
  Users,
  ChevronDown,
  Sparkles,
  Lock,
  Layers,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

interface ProductSalesAgentPageProps {
  onNavigate: (page: string) => void;
}

export const ProductSalesAgentPage: React.FC<ProductSalesAgentPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const capabilities = [
    {
      title: language === 'ru' ? 'Официальная интеграция с Instagram' : language === 'en' ? 'Official Instagram API' : 'Instagram Rasmiy Integratsiyasi',
      desc: language === 'ru'
        ? 'Подключение через официальный Meta Graph API. Без серых схем, без парсинга и без риска блокировки аккаунта.'
        : language === 'en'
        ? 'Connected strictly via the official Meta Graph API. Zero unauthorized browser automation or scraping risk.'
        : "Rasmiy Meta Graph API orqali ulanish. Xavfsiz, bloklanish xavfisiz va qonuniy.",
      icon: Instagram,
    },
    {
      title: language === 'ru' ? 'Мгновенные ответы на узбекском и русском' : language === 'en' ? 'Native Uzbek & Russian Support' : 'O\'zbek va Rus Tillarida Muloqot',
      desc: language === 'ru'
        ? 'ИИ свободно переключается между узбекским (латиница) и русским языками с пониманием разговорного контекста.'
        : language === 'en'
        ? 'Autonomous language detection and fluent response in Uzbek (Latin) and Russian with colloquial nuances.'
        : "O'zbek (lotin) va rus tillarida tabiiy so'zlashuv uslubida erkin muloqot qilish.",
      icon: Bot,
    },
    {
      title: language === 'ru' ? 'Проверка точных цен и остатков' : language === 'en' ? 'Verified Catalog & Inventory Check' : 'Aniq Narxlar va Ombor Qoldig\'i',
      desc: language === 'ru'
        ? 'Интеграция с каталогом товаров. ИИ никогда не выдумывает цены и сообщает только подтвержденную информацию.'
        : language === 'en'
        ? 'Direct SQL catalog binding. The AI never hallucinates pricing, quoting strictly validated inventory.'
        : "Katalogdagi haqiqiy narx va ombor qoldig'ini tekshiradi. Yolg'on narxlar chiqarish xavfi nolga teng.",
      icon: Database,
    },
    {
      title: language === 'ru' ? 'Сбор заявок на оформление заказа' : language === 'en' ? 'Order Request Drafting' : 'Buyurtma Arizalarini Qabul Qilish',
      desc: language === 'ru'
        ? 'ИИ вежливо запрашивает имя, телефон и адрес клиента с его согласия и создает проект заказа в админ-панели.'
        : language === 'en'
        ? 'Respectfully gathers customer contact dossiers with consent and registers order drafts in the dashboard.'
        : "Mijoz roziligi bilan ism, telefon va manzilni oladi hamda admin panelda buyurtma arizasini yaratadi.",
      icon: ShoppingBag,
    },
    {
      title: language === 'ru' ? 'Бесшовный перевод на оператора' : language === 'en' ? 'Seamless Human Handover' : 'Jonli Xodimga O\'tkazish (Handover)',
      desc: language === 'ru'
        ? 'По запросу клиента или при сложных нестандартных вопросах диалог мгновенно передается живому сотруднику.'
        : language === 'en'
        ? 'Instant operator notification and conversation escalation whenever complex bespoke assistance is demanded.'
        : "Mijoz talab qilganda yoki murakkab holatlarda suhbat bir soniyada jonli operatorga topshiriladi.",
      icon: Users,
    },
    {
      title: language === 'ru' ? 'История диалогов и аналитика' : language === 'en' ? 'Conversation Vault & Telemetry' : 'Muloqotlar Tarixi va Tahlil',
      desc: language === 'ru'
        ? 'Полная статистика обращений, конверсий, процент автоматического разрешения вопросов и активность клиентов.'
        : language === 'en'
        ? 'Comprehensive telemetry: resolution percentage, peak inquiry windows, and conversion analytics.'
        : "Murojaatlar soni, AI hal qilgan savollar ulushi va mijozlar faolligi bo'yicha to'liq hisobotlar.",
      icon: Clock,
    },
  ];

  const faqs = [
    {
      q: language === 'ru'
        ? 'Требуется ли передавать пароль от Instagram аккаунта?'
        : language === 'en'
        ? 'Do I need to share my Instagram account password?'
        : "Instagram akkaunt parolini berish kerakmi?",
      a: language === 'ru'
        ? 'Нет! Подключение происходит исключительно через официальный протокол Meta OAuth. Вы авторизуетесь через официальный интерфейс Facebook/Instagram, не передавая никаких паролей.'
        : language === 'en'
        ? 'No! Authorization occurs strictly via Meta OAuth token delegation. You never share passwords with ZiyoTech.'
        : "Yo'q! Ulanish faqatgina rasmiy Meta OAuth tizimi orqali amalga oshiriladi. Hech qanday parol berilmaydi.",
    },
    {
      q: language === 'ru'
        ? 'Может ли ИИ ошибиться в цене товара?'
        : language === 'en'
        ? 'Can the AI hallucinate product prices?'
        : "AI mahsulot narxida adashishi mumkinmi?",
      a: language === 'ru'
        ? 'Исключено. ZiyoTech использует технологию структурированного запроса (Tool Calling): ИИ не генерирует числа наугад, а считывает точную цену из вашей базы данных товаров.'
        : language === 'en'
        ? 'No. ZiyoTech utilizes deterministic tool-calling against structured database records. The LLM is prohibited from guessing numerals.'
        : "Mumkin emas. ZiyoTech qat'iy ma'lumotlar bazasi integratsiyasidan foydalanadi va narxni to'g'ridan-to'g'ri katalogdan oladi.",
    },
    {
      q: language === 'ru'
        ? 'Что происходит, если клиент пишет на смеси языков?'
        : language === 'en'
        ? 'What if the customer writes in mixed Uzbek-Russian or slang?'
        : "Mijoz aralash tilda yoki shevada yozsa nima bo'ladi?",
      a: language === 'ru'
        ? 'ZiyoTech обучена на реальных диалогах ритейла в Узбекистане. Агент распознает узбекские слова на кириллице и латинице, сленг и вежливо отвечает на выбранном языке.'
        : language === 'en'
        ? 'ZiyoTech models are tuned for Central Asian commerce dialectology, fluently interpreting Latin/Cyrillic mixing and regional colloquial terms.'
        : "ZiyoTech O'zbekistondagi real savdo muloqotlari bo'yicha sozlangan. Lotin, kirill va aralash jumlalarni aniq tushunadi.",
    },
    {
      q: language === 'ru'
        ? 'Как протестировать работу до подключения к реальному аккаунту?'
        : language === 'en'
        ? 'Can I test the system before connecting our live brand profile?'
        : "Haqiqiy akkauntga ulashdan oldin qanday sinab ko'rish mumkin?",
      a: language === 'ru'
        ? 'Мы можем провести для вас живую демонстрацию системы с примером вашего каталога и реальными сценариями ответов.'
        : language === 'en'
        ? 'Our team can conduct a live demonstration configured with your sample catalog and customer workflows.'
        : "Bizning mutaxassislar sizning mahsulotlaringiz misolida tizimning real muloqotini jonli ko'rsatib berishadi.",
    },
  ];

  return (
    <div className="pt-8 pb-24 space-y-24">
      {/* Product Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-cyan-600/20 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/60 text-blue-300 text-xs font-semibold">
              <Instagram className="w-4 h-4" />
              <span>Flagship AI Solution</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              ZiyoTech AI <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-200 bg-clip-text text-transparent">Sales Agent</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              {language === 'ru'
                ? 'Интеллектуальная система продаж и клиентской поддержки для Instagram Direct. Автоматизируйте общение с покупателями 24/7 и кратно увеличьте конверсию в заказы.'
                : language === 'en'
                ? 'Autonomous conversational commerce engine for Instagram Direct. Answer customers within 3 seconds, verify catalog availability, and capture high-intent order requests.'
                : "Instagram Direct uchun sun'iy intellektga asoslangan savdo va mijozlarni qo'llab-quvvatlash tizimi. Murojaatlarni 24/7 kutdirmasdan real xaridorga aylantiring."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('contact')}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/35 transition-all"
              >
                <span>{language === 'ru' ? 'Запросить Демо и Интеграцию' : language === 'en' ? 'Schedule Live Demo & Quote' : 'Jonli Demo va Narxni Bilish'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3.5 rounded-full text-sm font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/40 transition-colors"
              >
                {language === 'ru' ? 'Запросить Интеграцию' : language === 'en' ? 'Schedule Implementation' : 'Ulanish uchun ariza berish'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Core Engine Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {language === 'ru' ? 'Возможности ZiyoTech AI Sales Agent' : language === 'en' ? 'Engine Specifications' : 'Tizimning Asosiy Imkoniyatlari'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            {language === 'ru'
              ? 'Создано с соблюдением требований безопасности Meta и специфики розничных продаж в Узбекистане.'
              : language === 'en'
              ? 'Engineered according to strict Meta developer policies and localized retail behavior.'
              : "Meta xavfsizlik talablari va O'zbekistondagi chakana savdo xususiyatlariga to'liq moslashtirilgan."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300/85 leading-relaxed">{c.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-xs text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Production Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works 3 Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 sm:p-14">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {language === 'ru' ? 'Как Подключить Ваш Бизнес?' : language === 'en' ? 'Three Steps to Launch' : 'Qanday Qilib Ulanadi?'}
          </h2>
          <p className="text-slate-300 text-sm">
            {language === 'ru'
              ? 'Простой и безопасный процесс интеграции без необходимости менять текущие процессы'
              : language === 'en'
              ? 'Fast and safe onboarding workflow without disrupting existing customer operations'
              : "Jarayonlarni to'xtatmasdan xavfsiz va tezkor ulanish bosqichlari"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-[#070E1C] border border-slate-800">
            <div className="text-cyan-400 font-mono text-2xl font-bold mb-3">01</div>
            <h4 className="text-base font-bold text-white mb-2">
              {language === 'ru' ? 'Авторизация в Meta' : language === 'en' ? 'Meta OAuth Authorization' : 'Meta OAuth Ruxsati'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {language === 'ru'
                ? 'Подключите ваш Instagram Business аккаунт в пару кликов через официальное окно подтверждения прав.'
                : language === 'en'
                ? 'Authenticate your verified Instagram Business account securely via the official Meta dialog.'
                : "Rasmiy oyna orqali bir necha tugma bosish bilan Instagram Business hisobingizni ulang."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#060918] border border-slate-800">
            <div className="text-cyan-400 font-mono text-2xl font-bold mb-3">02</div>
            <h4 className="text-base font-bold text-white mb-2">
              {language === 'ru' ? 'Загрузка Каталога и Базы Знаний' : language === 'en' ? 'Catalog & Policy Ingestion' : 'Katalog va Qoidalarni Kiritish'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {language === 'ru'
                ? 'Добавьте прайс-лист товаров, условия доставки и правила возврата в удобную панель управления.'
                : language === 'en'
                ? 'Upload your product SKUs, pricing, delivery terms, and customer FAQs into the management portal.'
                : "Mahsulotlar narxi, yetkazib berish shartlari va do'kon qoidalarini boshqaruv paneliga kiriting."}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#060918] border border-slate-800">
            <div className="text-cyan-400 font-mono text-2xl font-bold mb-3">03</div>
            <h4 className="text-base font-bold text-white mb-2">
              {language === 'ru' ? 'Автономные Продажи 24/7' : language === 'en' ? 'Autonomous 24/7 Sales' : '24/7 Avtomatlashtirilgan Savdo'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {language === 'ru'
                ? 'ИИ мгновенно берет на себя рутинные консультации, а ваши менеджеры получают готовые заявки.'
                : language === 'en'
                ? 'The AI resolves routine inquiries instantly while dispatching warm order proposals to your sales staff.'
                : "AI agent mijozlar savollariga bir zumda javob beradi, xodimlaringiz esa tayyor buyurtmalarni qabul qiladi."}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {language === 'ru' ? 'Часто Задаваемые Вопросы' : language === 'en' ? 'Frequently Asked Questions' : 'Ko\'p So\'raladigan Savollar'}
          </h2>
          <p className="text-slate-400 text-sm">
            {language === 'ru' ? 'Все, что нужно знать о работе агента' : language === 'en' ? 'Key insights into system behavior' : 'Tizim ishlashi bo\'yicha muhim javoblar'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white hover:text-cyan-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          {language === 'ru' ? 'Готовы Автоматизировать Instagram Вашего Бренда?' : language === 'en' ? 'Ready to Automate Your Brand Direct Messages?' : 'Instagram Savdolaringizni Avtomatlashtirishga Tayyormisiz?'}
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
          {language === 'ru'
            ? 'Свяжитесь с нами сегодня, чтобы рассчитать экономию времени и протестировать работу агента на ваших товарах.'
            : language === 'en'
            ? 'Reach out today for a tailored ROI assessment and a private preview calibrated with your actual product line.'
            : "Bugunoq biz bilan bog'laning va biznesingiz uchun moslashtirilgan AI savdo agenti imkoniyatlarini sinab ko'ring."}
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <button
            onClick={() => onNavigate('contact')}
            className="px-8 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>{language === 'ru' ? 'Оставить Заявку' : language === 'en' ? 'Request Proposal' : 'Ariza Qoldirish'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
