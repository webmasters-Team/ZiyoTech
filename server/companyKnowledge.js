// Curated company facts and the public portfolio copy currently published on the site.
// The company owner confirmed that entries 1–13 are completed professional government
// projects and entries 14–16 are demonstrations. This owner confirmation overrides
// the generic "DEMO BLUEPRINT" badge displayed on the first 13 portfolio cards.
export const COMPANY_FACTS = {
  name: 'ZiyoTech',
  owner: 'Doniyor Maksudov',
  ceo: 'Doniyor Maksudov',
  established: 2021,
  placeEstablished: 'Tokyo, Japan',
  founderConfirmed: false,
  services: [
    'Website development and web applications',
    'E-commerce solutions',
    'AI agents and business automation',
    'Social media management and digital marketing',
    'Photo and video content production',
    'Branding and graphic design',
    'Custom digital systems and integrations',
  ],
};

// Descriptions below summarize the published portfolio cards. The classification is
// owner-confirmed; individual linked pages were not independently inspected here.
export const PORTFOLIO = [
  {
    id: 'dentalverse', name: 'Dentalverse', classification: 'completed government project', kind: 'dental clinic UX design',
    description: 'A patient-oriented interactive dental clinic experience with clear clinic information and patient flows.',
    tags: ['healthcare', 'clinic', 'dental', 'design', 'figma', 'ux', 'stomatologiya', 'klinika'],
    url: 'https://www.figma.com/design/PsLCvWSSV5VN3syLxXDvtf/%EB%8D%B4%ED%83%88%EB%B2%84%EC%8A%A4-%ED%94%84%EB%A1%9D%ED%8A%B8--Copy-?node-id=11-986&p=f&t=NrPb5Q9cdBZg4r4H-0',
    urlStatus: 'listed',
  },
  {
    id: 'sdn-controller', name: 'SDN Controller', classification: 'completed government project', kind: 'network management platform',
    description: 'An interactive SDN interface for network resource management, traffic optimization, and operational monitoring.',
    tags: ['network', 'sdn', 'telecom', 'dashboard', 'monitoring', 'automation', 'tarmoq', 'aloqa', 'set', 'setevoy'],
    url: 'https://sdn-albatross.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'ai-pecs', name: 'AI PECS', classification: 'completed government project', kind: 'AI Plant Equipment Controlling System',
    description: 'AI Plant Equipment Controlling System. The portfolio entry does not document additional equipment-control features.',
    tags: ['ai', 'plant', 'equipment', 'controlling system', 'support', 'automation', 'yordam', 'podderzhka'],
    url: 'https://nflux.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'vendora', name: 'Vendora', classification: 'completed government project', kind: 'e-commerce platform',
    description: 'An online commerce platform featuring product discovery, a catalog, order handling, and a shopping flow.',
    tags: ['ecommerce', 'e commerce', 'e-commerce', 'online store', 'store', 'shop', 'marketplace', 'catalog', 'orders', 'payments', 'savdo', 'do‘kon', 'internet do‘kon', 'magazin', 'internet magazin', 'torgovlya'],
    url: 'https://vendorashop-j9rb.onrender.com/', urlStatus: 'listed',
  },
  {
    id: 'job-portal', name: 'Job Portal', classification: 'completed government project', kind: 'employment platform',
    description: 'A job-search platform connecting job seekers and employers through vacancy discovery and hiring flows.',
    tags: ['jobs', 'recruitment', 'hiring', 'employment', 'vacancies', 'ish', 'vakansiya', 'rabota', 'vakansii'],
    url: 'https://job-portal-webmaster.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'learnexa', name: 'Learnexa', classification: 'completed government project', kind: 'online learning platform',
    description: 'An LMS for online courses, learning modules, and tracking student progress.',
    tags: ['education', 'learning', 'lms', 'courses', 'students', 'ta’lim', 'talaba', 'kurs', 'obrazovanie', 'obuchenie'],
    url: null, urlStatus: 'placeholder',
  },
  {
    id: 'meet', name: 'Meet', classification: 'completed government project', kind: 'meetings and networking platform',
    description: 'A platform for meetings, community interaction, and professional networking.',
    tags: ['meetings', 'networking', 'community', 'events', 'uchrashuv', 'vstrechi', 'soobshchestvo'],
    url: 'https://webmasters-meets.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'webshop', name: 'Webshop', classification: 'completed government project', kind: 'online store',
    description: 'An online store for browsing products, managing a cart, and placing orders.',
    tags: ['ecommerce', 'e commerce', 'e-commerce', 'online store', 'store', 'shop', 'cart', 'checkout', 'orders', 'do‘kon', 'internet do‘kon', 'magazin', 'internet magazin', 'korzina'],
    url: 'https://ecommerce-webmasters.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'shopit', name: 'ShopIt', classification: 'completed government project', kind: 'e-commerce storefront',
    description: 'A storefront focused on product selection and a streamlined purchase flow.',
    tags: ['ecommerce', 'e commerce', 'e-commerce', 'online store', 'store', 'shop', 'cart', 'checkout', 'do‘kon', 'internet do‘kon', 'magazin', 'internet magazin', 'korzina'],
    url: 'https://shopit-hobbylink.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'webmasters-online-learning-platform', name: 'Webmasters Online Learning Platform', classification: 'completed government project', kind: 'online learning platform',
    description: 'An online learning platform for browsing courses, accessing learning materials, and following student progress.',
    tags: ['education', 'learning', 'lms', 'courses', 'students', 'ta’lim', 'talaba', 'kurs', 'obrazovanie', 'obuchenie'],
    url: 'https://webmastersolp.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'school-management-system', name: 'School Management System', classification: 'completed government project', kind: 'school management platform',
    description: 'A school administration platform covering students, teachers, schedules, and academic outcomes.',
    tags: ['school', 'education', 'students', 'teachers', 'schedule', 'administration', 'maktab', 'o‘quvchi', 'o‘qituvchi', 'shkol', 'uchenik', 'uchitel'],
    url: 'https://school-management-systemm.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'lms', name: 'LMS', classification: 'completed government project', kind: 'learning management system',
    description: 'A learning management system for organizing courses, lessons, and learner progress.',
    tags: ['education', 'learning', 'lms', 'courses', 'students', 'ta’lim', 'talaba', 'kurs', 'obrazovanie', 'obuchenie'],
    url: 'https://weblsm.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'memories', name: 'Memories', classification: 'completed government project', kind: 'photo archive platform',
    description: 'A platform for saving, organizing, and sharing photographs, events, and personal memories.',
    tags: ['photos', 'memories', 'archive', 'events', 'sharing', 'xotira', 'rasm', 'foto', 'pamyat', 'arkhiv'],
    url: 'https://memorieswb.netlify.app/', urlStatus: 'listed',
  },
  {
    id: 'milano-style-store', name: 'Milano Style Store', classification: 'demonstration project', kind: 'unlinked retail demonstration',
    description: 'The card describes a hypothetical fashion retail storefront with AI-assisted inquiry handling. The stated automation volumes and results are unverified and must not be repeated as facts.',
    tags: ['fashion', 'retail', 'store', 'ecommerce', 'ai', 'instagram', 'kiyim', 'одежда'],
    url: null, urlStatus: 'not provided',
  },
  {
    id: 'arredo-modern-living', name: 'Arredo Modern Living', classification: 'demonstration project', kind: 'unlinked furniture demonstration',
    description: 'The card describes a furniture showcase concept with a 3D catalog and AI spatial consultant. The stated conversion result is unverified and must not be repeated as fact.',
    tags: ['furniture', 'interior', '3d', 'catalog', 'ai', 'ecommerce', 'mebel', 'interyer', 'мебель', 'интерьер'],
    url: null, urlStatus: 'not provided',
  },
  {
    id: 'electrohub-smart-tech', name: 'ElectroHub Smart Tech', classification: 'demonstration project', kind: 'unlinked retail automation demonstration',
    description: 'The card describes a smart technology retail scenario with inventory synchronization and messaging-channel orders. The stated inventory and order metrics are unverified and must not be repeated as facts.',
    tags: ['electronics', 'retail', 'inventory', 'ecommerce', 'ai', 'telegram', 'instagram', 'elektronika', 'ombor', 'электроника', 'склад'],
    url: null, urlStatus: 'not provided',
  },
];

const matchTerms = {
  owner: ['owner', 'owns', 'ownership', 'ceo', 'chief executive', 'rahbar', 'bosh direktor', 'egasi', 'asoschi', 'vladelets', 'sobstvennik', 'direktor', 'rukovoditel'],
  history: ['established', 'founded', 'history', 'when', 'started', 'qachon', 'tashkil', 'tarix', 'kogda', 'osnovan', 'istoriya', 'sozdan'],
  services: ['service', 'services', 'what do you', 'xizmat', 'xizmatlar', 'nima qiladi', 'uslugi', 'chem zanimaetsya'],
  government: ['government', 'public sector', 'state platform', 'davlat', 'hukumat', 'gosudarstven', 'gosudarstvo', 'pravitelstven'],
  portfolio: ['project', 'portfolio', 'similar', 'experience', 'completed work', 'projects', 'loyiha', 'loyihalar', 'bitkazilgan', 'tajriba', 'oxshash', 'proekt', 'opyt', 'raboty'],
};

export const PRIORITY_PORTFOLIO_PROJECT_IDS = [
  'dentalverse',
  'sdn-controller',
  'ai-pecs',
  'vendora',
  'learnexa',
  'shopit',
  'lms',
  'webmasters-online-learning-platform',
];

const hasAny = (text, terms) => terms.some((term) => text.includes(term));
const cyrillicToLatin = ['a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya'];
const normalizeSearchText = (text) => text.toLowerCase().normalize('NFKC')
  .replace(/\u0451/g, 'yo')
  .replace(/[\u0430-\u044f]/g, (character) => cyrillicToLatin[character.charCodeAt(0) - 0x0430] ?? character)
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export function selectPortfolioProjectIds(question, history = []) {
  const query = normalizeSearchText(String(question || ''));
  const completedProjects = PORTFOLIO.filter((project) => project.classification === 'completed government project');
  const exactPortfolioMatches = PORTFOLIO.filter((project) => {
    const name = normalizeSearchText(project.name);
    return name && ` ${query} `.includes(` ${name} `);
  });
  if (exactPortfolioMatches.length && exactPortfolioMatches.every((project) => project.classification === 'demonstration project')) return [];
  const exactMatches = exactPortfolioMatches.filter((project) => project.classification === 'completed government project');

  if (exactMatches.length) {
    return exactMatches
      .sort((first, second) => {
        const firstIndex = PRIORITY_PORTFOLIO_PROJECT_IDS.indexOf(first.id);
        const secondIndex = PRIORITY_PORTFOLIO_PROJECT_IDS.indexOf(second.id);
        return (firstIndex < 0 ? Number.MAX_SAFE_INTEGER : firstIndex) - (secondIndex < 0 ? Number.MAX_SAFE_INTEGER : secondIndex);
      })
      .slice(0, 3)
      .map((project) => project.id);
  }

  if (hasAny(query, matchTerms.government) || hasAny(query, matchTerms.portfolio)) {
    return PRIORITY_PORTFOLIO_PROJECT_IDS;
  }

  const priorUserText = history.filter((item) => item.role === 'user').slice(-1).map((item) => item.text || '').join(' ');
  const contextualQuery = normalizeSearchText(`${priorUserText} ${question || ''}`);
  return completedProjects.map((project) => {
    const name = normalizeSearchText(project.name);
    const terms = [name, ...project.tags.map(normalizeSearchText)];
    const score = terms.reduce((sum, term) => sum + (term && contextualQuery.includes(term) ? (term === name ? 5 : 2) : 0), 0);
    const priorityIndex = PRIORITY_PORTFOLIO_PROJECT_IDS.indexOf(project.id);
    return { project, score, priorityIndex: priorityIndex < 0 ? Number.MAX_SAFE_INTEGER : priorityIndex };
  }).filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score || first.priorityIndex - second.priorityIndex)
    .slice(0, 3)
    .map(({ project }) => project.id);
}

export function retrieveCompanyKnowledge(question, history = [], selectedProjectIds = selectPortfolioProjectIds(question, history)) {
  const recentUserHistory = history.filter((item) => item.role === 'user').slice(-2).map((item) => item.text || '');
  const query = normalizeSearchText([question, ...recentUserHistory].join(' '));
  const sections = [
    `Company: ${COMPANY_FACTS.name}.`,
  ];

  if (hasAny(query, [...matchTerms.owner, ...matchTerms.history])) {
    sections.push(`Owner and CEO: ${COMPANY_FACTS.owner}. Established: ${COMPANY_FACTS.established} in ${COMPANY_FACTS.placeEstablished}. Do not call the owner the founder; founder status is not confirmed.`);
  }

  if (hasAny(query, matchTerms.services) || !hasAny(query, [...matchTerms.owner, ...matchTerms.history, ...matchTerms.government, ...matchTerms.portfolio])) {
    sections.push(`Services listed by ZiyoTech: ${COMPANY_FACTS.services.join('; ')}.`);
  }

  const isGovernmentQuestion = hasAny(query, matchTerms.government);
  if (isGovernmentQuestion) {
    sections.push('The company owner confirmed the classification: the first 13 portfolio entries are completed professional government projects by ZiyoTech or its team; entries 14–16 are demonstrations only. Do not credit the owner personally unless individual work is separately documented. The generic DEMO BLUEPRINT card badge does not describe the classification of the first 13. Use published portfolio descriptions only; do not add undocumented features, technologies, customers, or results.');
  }

  if (isGovernmentQuestion) {
    sections.push('Owner-confirmed classification: entries 1–13 are completed professional government projects by ZiyoTech or its team; entries 14–16 are demonstrations.');
  }

  if (selectedProjectIds.length) {
    const candidates = selectedProjectIds.map((id) => PORTFOLIO.find((project) => project.id === id)).filter(Boolean);
    sections.push('Portfolio evidence rule: the owner confirmed the classification, while the work is attributed to ZiyoTech or its team; do not credit the owner personally without specific evidence. The eight priority project IDs are used for broad portfolio questions; specific questions should use only their matching projects. Entries 1–13 are completed professional government projects; entries 14–16 are demonstrations only. Use only the listed descriptions. Do not include external project URLs; customers can explore the Portfolio section. Do not infer government agency names, implementation details, technology stacks, customer identities, or results.');
    sections.push(candidates.map((project) => {
      return `- ${project.name} (${project.classification}; ${project.kind}): ${project.description}`;
    }).join('\n'));
  }

  sections.push('If asked for a fact not in this context, state that it is not verified and ask a brief clarifying question. Answer naturally in the user requested language.');
  return sections.join('\n');
}
