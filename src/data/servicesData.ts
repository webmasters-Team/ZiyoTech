import { ServiceItem, DemoProject } from '../types';

export const servicesData: ServiceItem[] = [
  {
    id: 'web-dev',
    category: 'Development',
    icon: 'Code2',
    name: {
      uz: 'Veb-saytlar Yaratish',
      ru: 'Веб-разработка',
      en: 'Website Development',
    },
    shortDesc: {
      uz: 'Zamonaviy, tez yuklanuvchi va konversiyasi yuqori korporativ saytlar hamda veb-ilovalar.',
      ru: 'Современные, быстрые и конверсионные корпоративные сайты и веб-приложения.',
      en: 'Modern, high-performance, and conversion-focused corporate websites and web applications.',
    },
    fullDesc: {
      uz: 'Biz bizneslar uchun eng so\'nggi texnologiyalar (React, Next.js, TypeScript, Tailwind) yordamida tez yuklanuvchi, qidiruv tizimlariga (SEO) to\'liq moslashtirilgan va barcha qurilmalarda mukammal ishlaydigan korporativ veb-saytlar, lending sahifalar va veb-platformalarni ishlab chiqamiz.',
      ru: 'Мы проектируем и разрабатываем современные корпоративные сайты, посадочные страницы и веб-сервисы с чистой архитектурой, молниеносной скоростью загрузки и адаптацией под мобильные устройства.',
      en: 'We engineer cutting-edge corporate portals, landing pages, and web apps with clean architecture, enterprise-grade security, mobile responsiveness, and high conversion optimization.',
    },
    deliverables: {
      uz: ['Korporativ saytlar va biznes portallari', 'Yuqori konversiyali lending sahifalar', 'Maxsus veb-ilovalar (SPA/SSR)', 'SEO-arxitektura va tezlikni optimallashtirish', 'Mobil va planshet moslashuvchanligi'],
      ru: ['Корпоративные сайты и порталы', 'Высококонверсионные лендинги', 'Индивидуальные веб-приложения', 'SEO-оптимизация и максимальная скорость', 'Полная адаптивность под любые экраны'],
      en: ['Corporate websites & business platforms', 'High-converting landing pages', 'Custom Single Page Applications', 'SEO-friendly architecture & Core Web Vitals', 'Responsive mobile & tablet layouts'],
    },
    benefits: {
      uz: ['Google qidiruvida yuqori o\'rinlar', 'Mijozlar ishonchini oshiruvchi premium dizayn', 'Maksimal tezlik (< 1.5 sek yuklanish)', 'Admin panel orqali oson boshqaruv'],
      ru: ['Высокие позиции в поисковых системах', 'Премиальный дизайн, вызывающий доверие', 'Быстрая загрузка страниц (< 1.5 сек)', 'Удобная административная панель'],
      en: ['Top search engine visibility', 'Brand authority with refined aesthetics', 'Sub-1.5s page load benchmarks', 'Intuitive content management dashboard'],
    },
  },
  {
    id: 'ecommerce',
    category: 'E-commerce',
    icon: 'ShoppingCart',
    name: {
      uz: 'Elektron Tijorat (E-commerce)',
      ru: 'E-commerce решения',
      en: 'E-commerce Solutions',
    },
    shortDesc: {
      uz: 'Mahsulotlar katalogi, to\'lov tizimlari va qulay buyurtma berish jarayoniga ega onlayn do\'konlar.',
      ru: 'Интернет-магазины с каталогом товаров, платежными шлюзами и автоматизацией заказов.',
      en: 'End-to-end online stores with product catalogs, payment gateways, and order orchestration.',
    },
    fullDesc: {
      uz: 'Tovarlaringizni internet orqali qulay sotish, Click, Payme, Uzum va xalqaro to\'lovlarni qabul qilish, yetkazib berish xizmatlari bilan integratsiya va xaridlarni oson boshqarish imkonini beruvchi to\'liq e-commerce tizimlarini quramiz.',
      ru: 'Создаем комплексные платформы онлайн-продаж: структурированный каталог, корзина, мгновенная оплата через Payme, Click, интеграция со службами доставки и удобный кабинет управления заказами.',
      en: 'We build end-to-end e-commerce solutions featuring streamlined catalogs, multi-currency checkouts (Payme, Click, Stripe), automated delivery dispatching, and robust inventory management.',
    },
    deliverables: {
      uz: ['Zamonaviy onlayn do\'kon', 'Mahsulotlar va toifalar katalogi', 'Click, Payme, Uzum to\'lov integratsiyasi', 'Yetkazib berish kalkulyatori va integratsiyasi', 'Buyurtmalar monitoringi paneli'],
      ru: ['Полнофункциональный интернет-магазин', 'Каталог с фильтрами и вариациями товаров', 'Интеграция платежных систем Payme, Click', 'Расчет стоимости и интеграция доставки', 'Панель управления заказами и остатками'],
      en: ['Full-featured e-commerce storefront', 'Dynamic catalog with SKU & variant filters', 'Local & international payment gateways', 'Automated logistics & courier integration', 'Unified merchant operations dashboard'],
    },
    benefits: {
      uz: ['24/7 uzluksiz avtomatlashtirilgan savdo', 'Mijozlar uchun 3 qadamda qulay to\'lov', 'Ombordagi tovarlar qoldig\'ini aniq hisoblash', 'Savdo tahlili va analitika'],
      ru: ['Продажи 24/7 без участия менеджера', 'Быстрое оформление покупки в 3 шага', 'Синхронизация остатков на складе', 'Подробная аналитика продаж'],
      en: ['Autonomous 24/7 sales pipeline', 'Frictionless 3-step checkout conversion', 'Real-time inventory synchronization', 'Data-driven revenue reporting'],
    },
  },
  {
    id: 'ai-automation',
    category: 'AI & Automation',
    icon: 'Bot',
    name: {
      uz: 'AI Agentlar & Biznes Avtomatlashtirish',
      ru: 'ИИ Агенты и Автоматизация',
      en: 'AI Agents & Business Automation',
    },
    shortDesc: {
      uz: 'Instagram DM, Telegram va veb-saytlar uchun sun\'iy intellekt savdo va qo\'llab-quvvatlash agentlari.',
      ru: 'Интеллектуальные ИИ-агенты продаж и поддержки для Instagram Direct, Telegram и сайтов.',
      en: 'Autonomous AI sales and support agents for Instagram DM, Telegram, and business websites.',
    },
    fullDesc: {
      uz: 'ZiyoTech AI Sales Agent va maxsus biznes avtomatlashtirish tizimlari orqali mijozlarning savollariga 24/7 aniq javob berish, narxlar va ombor qoldig\'ini ko\'rsatish, buyurtma arizalarini to\'plash va kerak bo\'lganda suhbatni jonli xodimga yo\'naltirish imkoniyati.',
      ru: 'Внедрение флагманского ZiyoTech AI Sales Agent и кастомных ИИ-ассистентов для Instagram Direct и мессенджеров. Агент работает по проверенной базе знаний, озвучивает точные цены, формирует заявки и переводит диалог на оператора.',
      en: 'Deployment of proprietary ZiyoTech AI Sales Agents and bespoke automation pipelines. Agents reference verified business data, quote live inventory pricing, capture order requests, and escalate to human staff with full context.',
    },
    deliverables: {
      uz: ['Instagram Direct rasmiy AI avtomatlashtirish', 'Telegram aqlli savdo boti', 'Veb-sayt uchun interaktiv AI chat-vidjet', 'Kompaniya bilimlar bazasi (RAG/Knowledge Base)', 'Xodimga suhbatni topshirish (Human Handover) tizimi'],
      ru: ['Официальная интеграция ИИ с Instagram Direct', 'Интеллектуальный бот для Telegram', 'Виджет ИИ-консультанта на сайте', 'Интеграция корпоративной базы знаний', 'Система передачи диалога живому менеджеру'],
      en: ['Official Meta Instagram DM AI agent', 'Intelligent Telegram commerce bot', 'Interactive website AI sales widget', 'Verified business knowledge retrieval', 'Seamless human escalation & takeover protocol'],
    },
    benefits: {
      uz: ['Mijozlarga 3 soniya ichida tezkor javob', 'Kecha-yu kunduz yo\'qotilmagan arizalar', 'Xodimlar vaqtini 70% gacha tejash', 'O\'zbek va rus tillarida tabiiy muloqot'],
      ru: ['Ответ клиенту за 3 секунды', 'Ноль упущенных заявок в нерабочее время', 'Экономия до 70% времени операторов', 'Естественный диалог на узбекском и русском языках'],
      en: ['Instant sub-3s response speed', 'Zero abandoned inquiries during off-hours', 'Up to 70% operational time reduction', 'Native bilingual Uzbek & Russian fluency'],
    },
  },
  {
    id: 'smm',
    category: 'Marketing',
    icon: 'Share2',
    name: {
      uz: 'Ijtimoiy Tarmoqlarni Boshqarish (SMM)',
      ru: 'Управление Соцсетями (SMM)',
      en: 'Social Media Management',
    },
    shortDesc: {
      uz: 'Instagram va boshqa tarmoqlarda professional strategiya, kontent-reja va doimiy auditoriya jalb qilish.',
      ru: 'Комплексное ведение Instagram: визуальная стратегия, контент-план и вовлечение аудитории.',
      en: 'Strategic social media orchestration, content planning, and audience conversion on Instagram.',
    },
    fullDesc: {
      uz: 'Brendingizni ijtimoiy tarmoqlarda tizimli va yuqori darajada taqdim etish. Oylik kontent-reja tuzish, vizual uslubni shakllantirish, Reels ssenariylari, ta\'sirchan matnlar (kopirayting) va auditoriya bilan faol muloqot.',
      ru: 'Позиционирование бренда в социальных сетях: разработка визуальной концепции, планирование публикаций и сценариев Reels, написание продающих текстов и аналитика охватов.',
      en: 'We craft authentic brand narratives across Instagram: visual feed curation, viral Reels scripting, engaging copywriting, community moderation, and audience growth analytics.',
    },
    deliverables: {
      uz: ['Ijtimoiy tarmoqlar rivojlantirish strategiyasi', 'Oylik kontent-reja (Post & Stories & Reels)', 'Professional kopirayting (o\'zbek va rus tillarida)', 'Stories va interaktiv o\'yinlar', 'Oylik statistik hisobotlar'],
      ru: ['Стратегия продвижения бренда', 'Ежемесячный контент-план (посты, сторис, Reels)', 'Профессиональный копирайтинг (UZ / RU)', 'Оформление ленты и интерактивные сторис', 'Ежемесячные отчеты по динамике охватов'],
      en: ['Comprehensive social growth strategy', 'Monthly multi-format content calendar', 'Targeted bilingual copywriting', 'Curated feed design & daily interactive stories', 'Monthly engagement and reach reporting'],
    },
    benefits: {
      uz: ['Doimiy va barqaror kontent oqimi', 'Mijozlar ishonchi va brend taniluvchanligi', 'Haqiqiy faol auditoriya to\'planishi', 'Sotuvga yo\'naltirilgan ssenariylar'],
      ru: ['Регулярный и предсказуемый выпуск контента', 'Рост узнаваемости и лояльности к бренду', 'Привлечение платежеспособной аудитории', 'Фокус на конверсии подписчиков в покупателей'],
      en: ['Predictable publication rhythm', 'Elevated brand credibility and resonance', 'Organic acquisition of high-intent followers', 'Conversion-optimized storytelling'],
    },
  },
  {
    id: 'media-content',
    category: 'Content',
    icon: 'Camera',
    name: {
      uz: 'Professional Foto va Video Kontent',
      ru: 'Фото и Видео Контент',
      en: 'Professional Photo & Video Content',
    },
    shortDesc: {
      uz: 'Mahsulotlar fotosessiyasi, imidjli reklama roliklari va yuqori sifatli Instagram Reels.',
      ru: 'Предметная фотосъемка, имиджевые рекламные ролики и продающие Instagram Reels.',
      en: 'Commercial product photography, cinematic brand reels, and promotional video production.',
    },
    fullDesc: {
      uz: 'Zamonaviy texnika va yoritish uskunalari yordamida mahsulotlaringizni katalog, reklama va ijtimoiy tarmoqlar uchun professional suratga olish, dinamik videoroliklar va montaj xizmatlari.',
      ru: 'Создаем продающий визуальный контент: студийная предметная фотосъемка, съемка моделей, создание динамичных Reels и рекламных роликов с профессиональной цветокоррекцией и саунд-дизайном.',
      en: 'High-end studio product shoots, commercial lifestyle photography, dynamic short-form video production, and sound design engineered to stop scrolling and drive sales.',
    },
    deliverables: {
      uz: ['Mahsulotlar katalog fotosuratlari', 'Reklama va e\'lonlar uchun video roliklar', 'Instagram Reels uchun qisqa videolar', 'Professional rang tuzatish (color grading)', 'Ovoz va saund-dizayn bilan montaj'],
      ru: ['Каталожная и предметная фотосъемка', 'Имиджевые промо-ролики для рекламы', 'Динамичные короткие видео для Reels', 'Профессиональная цветокоррекция', 'Монтаж с саунд-дизайном и графикой'],
      en: ['Commercial catalog photography', 'Brand identity promotional films', 'High-converting Instagram Reels production', 'Color grading & high-fidelity retouching', 'Dynamic editing with motion graphics & sound'],
    },
    benefits: {
      uz: ['Mahsulot qiymatini oshiruvchi premium vizual', 'Reklamada pastroq narxda yuqori qiziqish (CTR)', 'Barcha platformalar uchun tayyor formatlar', 'Xalqaro brendlar standartidagi tasvir'],
      ru: ['Премиальная подача, повышающая ценность товара', 'Снижение стоимости клика в рекламе (высокий CTR)', 'Готовые форматы для всех площадок', 'Визуальный уровень мировых брендов'],
      en: ['Perceived product value enhancement', 'Significantly higher ad engagement & lower CPA', 'Multi-platform aspect ratio readiness', 'International brand production standards'],
    },
  },
  {
    id: 'branding',
    category: 'Branding',
    icon: 'Palette',
    name: {
      uz: 'Brending & Grafik Dizayn',
      ru: 'Брендинг и Дизайн',
      en: 'Branding & Graphic Design',
    },
    shortDesc: {
      uz: 'Eslab qolinadigan logotip, firma uslubi, brandbook va reklama materiallari dizayni.',
      ru: 'Логотип, фирменный стиль, брендбук и дизайн рекламных носителей под ключ.',
      en: 'Iconic logo design, visual identity systems, brandbooks, and marketing collateral.',
    },
    fullDesc: {
      uz: 'Kompaniyangiz mohiyatini aks ettiruvchi betakror brend identifikatsiyasi: logotip konsepsiyalari, ranglar palitrasi, tipografika, qadoqlash dizayni, taqdimotlar va to\'liq brandbook qo\'llanmasi.',
      ru: 'Разрабатываем айдентику, которая выделяет компанию среди конкурентов: от концепции логотипа и фирменных цветов до упаковки товаров, презентаций и детального брендбука.',
      en: 'We craft unmistakable visual identities: conceptual logos, curated typographic palettes, packaging design, investor pitch decks, and comprehensive brand guideline manuals.',
    },
    deliverables: {
      uz: ['Eksklyuziv logotip konsepsiyalari', 'To\'liq brend uslubi (Brandbook)', 'Firma shriftlari va ranglar kodi', 'Tashrif qog\'ozlari, blanklar va hujjatlar', 'Ijtimoiy tarmoqlar uchun dizayn shablonlari'],
      ru: ['Авторские концепции логотипа', 'Фирменный стиль и брендбук', 'Типографика и палитра фирменных цветов', 'Дизайн полиграфии и деловой документации', 'Шаблоны для социальных сетей и баннеров'],
      en: ['Distinctive logo concepts & vector assets', 'Comprehensive brandbook documentation', 'Curated typographic system & palettes', 'Corporate stationery & collateral suite', 'Social media design templates & banners'],
    },
    benefits: {
      uz: ['Raqobatchilardan yaqqol ajralib turish', 'Mijozlar ongida mustahkam o\'rnashish', 'Barcha reklama kanallarida yagona uslub', 'Biznesingizning obro\'sini oshirish'],
      ru: ['Мгновенное отличие от конкурентов', 'Долгосрочная узнаваемость бренда', 'Единый визуальный стандарт на всех носителях', 'Повышение доверия со стороны партнеров и клиентов'],
      en: ['Unmistakable competitive differentiation', 'Enduring brand equity and recognition', 'Visual coherence across all touchpoints', 'Institutional authority and investor trust'],
    },
  },
  {
    id: 'digital-marketing',
    category: 'Marketing',
    icon: 'Megaphone',
    name: {
      uz: 'Raqamli Marketing (Target & Context)',
      ru: 'Цифровой Маркетинг',
      en: 'Digital Marketing',
    },
    shortDesc: {
      uz: 'Instagram, Facebook va Google orqali aniq maqsadli mijozlarni jalb qilish va konversiyani oshirish.',
      ru: 'Таргетированная реклама в Instagram/Facebook и контекст в Google с фокусом на окупаемость.',
      en: 'Targeted paid advertising across Meta and Google focused on measurable ROI and pipeline.',
    },
    fullDesc: {
      uz: 'Har bir sarflangan so\'m natija keltirishi uchun to\'g\'ri auditoriyani tanlash, kreativ banner va videolarni sinovdan o\'tkazish, reklama byudjetini oqilona boshqarish va sotuv voronkasini tahlil qilish.',
      ru: 'Настройка таргетированной рекламы в Meta (Instagram/Facebook) и Google Ads: глубокий анализ аудитории, тестирование гипотез, оптимизация стоимости лида (CPL) и детальные отчеты о конверсиях.',
      en: 'Data-driven paid media campaigns on Meta and Google Ads: rigorous cohort targeting, multi-variant creative testing, lead acquisition cost optimization, and transparent ROI attribution.',
    },
    deliverables: {
      uz: ['Targeting reklama strategiyasi', 'Reklama kreativlari (foto va video)', 'A/B testlash va auditoriyalarni saralash', 'Konversiya piksellarini sozlash', 'Haftalik va oylik ROI tahlillari'],
      ru: ['Стратегия платного трафика', 'Создание рекламных креативов', 'A/B тестирование гипотез и аудиторий', 'Настройка пикселей конверсий и аналитики', 'Прозрачная еженедельная отчетность по ROI'],
      en: ['Full-funnel paid acquisition strategy', 'High-performing ad creatives & copy', 'Rigorous multi-cohort A/B testing', 'Conversion API & tracking pixel setup', 'Weekly transparent CPA/ROAS reporting'],
    },
    benefits: {
      uz: ['Aniq sotib oluvchi auditoriyaga yetib borish', 'Reklama xarajatlarining shaffofligi', 'Arizalar narxini pasaytirish', 'Doimiy yangi xaridorlar oqimi'],
      ru: ['Привлечение целевых платежеспособных клиентов', 'Полная прозрачность расходования бюджета', 'Снижение стоимости привлечения клиента (CAC)', 'Предсказуемый поток входящих обращений'],
      en: ['Direct access to high-intent buyers', 'Complete budget allocation transparency', 'Continuous customer acquisition cost reduction', 'Predictable pipeline and sales velocity'],
    },
  },
  {
    id: 'custom-solutions',
    category: 'Engineering',
    icon: 'Layers',
    name: {
      uz: 'Maxsus Raqamli Tizimlar (Custom Solutions)',
      ru: 'Кастомные IT-Решения',
      en: 'Custom Digital Solutions',
    },
    shortDesc: {
      uz: 'Biznesingizning o\'ziga xos talablari uchun ichki CRM, boshqaruv panellari va API integratsiyalar.',
      ru: 'Внутренние CRM-системы, аналитические панели, интеграция сервисов и автоматизация процессов.',
      en: 'Tailored internal business tools, custom CRMs, operational dashboards, and API workflows.',
    },
    fullDesc: {
      uz: 'Standart dasturlar mos kelmaydigan biznes jarayonlari uchun maxsus CRM, ombor hisobi, xodimlar KPI tizimlari, to\'lov va buxgalteriya tizimlari integratsiyasi hamda korporativ dasturiy ta\'minot yaratish.',
      ru: 'Разрабатываем кастомное программное обеспечение для нестандартных бизнес-процессов: специализированные CRM, дашборды операционных показателей, интеграция с 1С, складскими сервисами и внешними API.',
      en: 'We engineer bespoke software architecture for unique business logic: tailor-made CRMs, executive metric command centers, ERP/accounting integrations, and enterprise automated workflows.',
    },
    deliverables: {
      uz: ['Maxsus CRM va ERP tizimlari', 'Boshqaruv panellari (Executive Dashboards)', 'Tashqi xizmatlar bilan API integratsiyalar', 'Ma\'lumotlar bazasini loyihalash va migratsiya', 'Xavfsiz bulutli infratuzilma'],
      ru: ['Индивидуальные CRM и ERP системы', 'Аналитические дашборды для руководства', 'Сложные API-интеграции с внешними сервисами', 'Проектирование и защита баз данных', 'Настройка безопасной облачной инфраструктуры'],
      en: ['Custom CRM & ERP micro-systems', 'Real-time executive KPI dashboards', 'Robust API & third-party integrations', 'Scalable relational database architecture', 'Hardened enterprise cloud deployments'],
    },
    benefits: {
      uz: ['Biznes jarayonlarini 100% o\'zingizga moslashtirish', 'Qo\'lda bajariladigan xatoliklarni bartaraf etish', 'Barcha bo\'limlar o\'rtasida uzluksiz ma\'lumot almashinuvi', 'Korporativ ma\'lumotlar xavfsizligi'],
      ru: ['100% соответствие процессам именно вашей компании', 'Исключение человеческого фактора и ошибок', 'Единая синхронизация между всеми отделами', 'Полная защита конфиденциальных данных'],
      en: ['100% alignment with proprietary operating models', 'Eradication of manual clerical errors', 'Seamless cross-departmental synchronization', 'Ironclad proprietary data sovereignty'],
    },
  },
];

export const demoCaseStudies: DemoProject[] = [
  {
    id: 'demo-1',
    title: 'Milano Style Store',
    clientType: {
      uz: 'Moda va Kiyim-Kechak Brendi',
      ru: 'Бренд модной одежды и обуви',
      en: 'Premium Apparel & Footwear Retailer',
    },
    description: {
      uz: 'Instagram DM orqali keladigan 300+ kunlik murojaatlarni ZiyoTech AI Sales Agent orqali avtomatlashtirish va Click/Payme to\'lovli onlayn do\'kon yaratish.',
      ru: 'Автоматизация более 300 ежедневных запросов в Instagram Direct с помощью ZiyoTech AI Sales Agent и запуск интернет-магазина.',
      en: 'Autonomous processing of 300+ daily Instagram direct inquiries via ZiyoTech AI Sales Agent combined with high-converting online storefront.',
    },
    services: ['AI Agents', 'E-commerce', 'Instagram Automation'],
    technologies: ['React', 'NestJS', 'PostgreSQL', 'Instagram Graph API', 'OpenAI'],
    metrics: '+240% Order Inquiries · Sub-3s Response',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'demo-2',
    title: 'Arredo Modern Living',
    clientType: {
      uz: 'Zamonaviy Mebel va Interyer Saloni',
      ru: 'Салон дизайнерской мебели и интерьера',
      en: 'Luxury Furniture & Spatial Design Studio',
    },
    description: {
      uz: '3D katalog va interaktiv veb-sayt ishlab chiqish, shuningdek mijozlarga o\'lcham va materiallar bo\'yicha maslahat beruvchi sun\'iy intellekt konsultanti.',
      ru: 'Разработка интерактивного 3D-каталога мебели и консультационного ИИ-агента для расчета индивидуальных размеров.',
      en: 'Interactive 3D furniture showcase platform with an embedded AI spatial consultant for dimension and fabric inquiries.',
    },
    services: ['Website Development', 'AI Knowledge Base', 'Branding'],
    technologies: ['Next.js', 'Tailwind CSS', 'Vector DB', 'TypeScript'],
    metrics: '+68% Lead Conversion · 94% Automated FAQ',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'demo-3',
    title: 'ElectroHub Smart Tech',
    clientType: {
      uz: 'Elektronika va Gadjetlar Do\'koni',
      ru: 'Сеть магазинов гаджетов и умного дома',
      en: 'Omnichannel Smart Tech Retail Network',
    },
    description: {
      uz: 'Ombordagi 2,500 dan ortiq tovar qoldiqlari va narxlarini real vaqtda tekshiruvchi hamda buyurtmalarni Telegram va Instagram orqali qabul qiluvchi yagona tizim.',
      ru: 'Интеграция каталога из 2500+ товаров с ИИ-агентом для проверки остатков и оформления заказов в Telegram и Instagram.',
      en: 'Real-time synchronization of 2,500+ SKUs with multi-channel AI agents coordinating sales across Instagram and Telegram.',
    },
    services: ['Custom Solutions', 'E-commerce', 'AI Automation'],
    technologies: ['Node.js', 'PostgreSQL', 'Redis', 'BullMQ', 'Telegram Bot API'],
    metrics: '12,400+ Conversations Handled · 850+ Orders',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
  },
];
