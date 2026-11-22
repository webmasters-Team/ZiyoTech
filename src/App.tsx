/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PlatformProvider } from './context/PlatformContext';
import { Header } from './components/public/Header';
import { Footer } from './components/public/Footer';
import { PublicHome } from './pages/PublicHome';
import { ProductSalesAgentPage } from './pages/ProductSalesAgentPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PlatformLayout } from './components/platform/PlatformLayout';
import { VisitorAnalyticsTracker } from './components/public/VisitorAnalyticsTracker';
import { ServicesSection } from './components/public/ServicesSection';
import { AiSolutionsSection } from './components/public/AiSolutionsSection';
import { AboutSection } from './components/public/AboutSection';
import { PortfolioSection } from './components/public/PortfolioSection';
import { ContactSection } from './components/public/ContactSection';
import { demoCaseStudies } from './data/servicesData';
import { getAssistantNavigationAcknowledgment, resolveAssistantDestination, type AssistantDestination } from './lib/assistantNavigation';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AudioLines, Mic, MicOff, Paperclip, Send, Sparkles, X, Square } from 'lucide-react';
import { AdminLoginView } from './components/platform/AdminLoginView';
import SalesAiDashboard from './pages/SalesAiDashboard';
import SalesAiAdmin from './pages/SalesAiAdmin';
import SalesAiOperations from './pages/SalesAiOperations';
import SalesAiLogin from './pages/SalesAiLogin';
import SalesAiOnboarding from './pages/SalesAiOnboarding';
import UserAccountPage from './pages/UserAccountPage';
import { PrivacyPolicyPage, TermsOfServicePage } from './pages/LegalPages';

type AppLanguage = 'uz' | 'ru' | 'en';
type AssistantMessageRole = 'assistant' | 'user';

type AssistantMessage = {
  id: string;
  role: AssistantMessageRole;
  text: string;
  attachments?: AssistantImage[];
  portfolioProjectIds?: string[];
  timestamp: string;
};

type AssistantImage = { previewUrl: string; mimeType: string; data: string };
type PendingAssistantImage = { id: string; file: File; previewUrl: string };
type SpeechRecognitionResultLike = ArrayLike<{ transcript: string }> & { isFinal: boolean };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<SpeechRecognitionResultLike>; resultIndex?: number }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const ASSISTANT_API_BASE = (
  import.meta.env.VITE_ASSISTANT_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : '')
).replace(/\/+$/, '');

async function hasAuthenticatedAdminSession() {
  try {
    const response = await fetch(`${ASSISTANT_API_BASE}/api/admin/session`, { credentials: 'include' });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
    const result = await response.json() as { authenticated?: boolean; user?: { id?: unknown; email?: unknown; name?: unknown } };
    return result.authenticated === true && typeof result.user?.id === 'string' && typeof result.user.email === 'string' && typeof result.user.name === 'string';
  } catch {
    return false;
  }
}

const COMPLETED_PORTFOLIO_PROJECT_IDS = new Set(demoCaseStudies.slice(0, 13).map((project) => project.id));
const PRIORITY_PORTFOLIO_PROJECT_IDS = [
  'dentalverse',
  'sdn-controller',
  'ai-pecs',
  'vendora',
  'learnexa',
  'shopit',
  'lms',
  'webmasters-online-learning-platform',
];
const getAssistantPortfolioProjects = (projectIds?: string[]) => (projectIds || []).filter((projectId, index, ids) => ids.indexOf(projectId) === index).flatMap((projectId) => {
  if (!COMPLETED_PORTFOLIO_PROJECT_IDS.has(projectId)) return [];
  const project = demoCaseStudies.find((item) => item.id === projectId);
  return project ? [project] : [];
}).sort((a, b) => {
  const aRank = PRIORITY_PORTFOLIO_PROJECT_IDS.indexOf(a.id);
  const bRank = PRIORITY_PORTFOLIO_PROJECT_IDS.indexOf(b.id);
  if (aRank >= 0 && bRank >= 0) return aRank - bRank;
  if (aRank >= 0) return -1;
  if (bRank >= 0) return 1;
  return demoCaseStudies.findIndex((item) => item.id === a.id) - demoCaseStudies.findIndex((item) => item.id === b.id);
});

const readFileAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
    if (base64) resolve(base64);
    else reject(new Error('The selected image could not be read.'));
  };
  reader.onerror = () => reject(new Error('The selected image could not be read.'));
  reader.readAsDataURL(file);
});

const getAssistantPrompt = (language: AppLanguage) => {
  if (language === 'uz') return 'Nima qidiryapsiz?';
  if (language === 'ru') return 'Что вы хотите найти?';
  return 'What would you like to explore on the platform?';
};

const getRecognitionLanguage = (language: AppLanguage) => {
  if (language === 'uz') return 'uz-UZ';
  if (language === 'ru') return 'ru-RU';
  return 'en-US';
};

const getLiveGreeting = (text: string, language: AppLanguage) => {
  const normalized = text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
  const greetings = new Set([
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hello ziyotech', 'hi ziyotech',
    'salom', 'assalomu alaykum', 'salom ziyotech', 'assalomu alaykum ziyotech',
    '\u043f\u0440\u0438\u0432\u0435\u0442', '\u0437\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435', '\u0434\u043e\u0431\u0440\u043e\u0435 \u0443\u0442\u0440\u043e',
  ]);
  if (!greetings.has(normalized)) return null;
  if (language === 'uz') return 'Salom! ZiyoTech haqida nimalarni bilmoqchisiz?';
  if (language === 'ru') return '\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435! \u0427\u0435\u043c \u043c\u043e\u0433\u0443 \u043f\u043e\u043c\u043e\u0447\u044c \u0432\u0430\u043c \u0441 ZiyoTech?';
  return 'Hello! What would you like to know about ZiyoTech?';
};

const isLiveStopCommand = (text: string) => {
  const normalized = text.toLowerCase().normalize('NFKC')
    .replace(/[\u2018\u2019\u02bb]/g, "'")
    .replace(/[.,!?\u2026]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return /^(?:please\s+)?(?:stop|stop speaking|stop talking|cancel|enough|that's enough|to'?xta|to'?xtang|to'?xtat|to'?xtating|хватит|стоп|остановись|перестань|замолчи)$/.test(normalized);
};

const isLikelyAssistantSpeechEcho = (transcript: string, spokenText: string) => {
  const words = (value: string) => value.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}']+/gu) || [];
  const heardWords = words(transcript);
  const assistantWords = words(spokenText);
  if (!heardWords.length || !assistantWords.length) return false;
  for (let start = 0; start <= assistantWords.length - heardWords.length; start += 1) {
    if (heardWords.every((word, index) => word === assistantWords[start + index])) return true;
  }
  if (heardWords.length < 3) return false;
  const assistantWordSet = new Set(assistantWords);
  return heardWords.filter((word) => assistantWordSet.has(word)).length / heardWords.length >= 0.85;
};

const prepareSpeechText = (text: string) => text
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^\s{0,3}(?:#{1,6}\s*|>\s*|[-+*]\s+)/gm, '')
  .replace(/^\s*(?:[-*_]\s*){3,}$/gm, ' ')
  .replace(/\bhttps?:\/\/\S+/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/[*_~`]/g, '')
  .replace(/\|/g, ', ')
  .replace(/\r\n?/g, '\n')
  .replace(/[ \t]*\n+[ \t]*/g, '. ')
  .replace(/([.!?])\s*([.!?])+/g, '$1')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

const selectSpeechVoice = (voices: SpeechSynthesisVoice[], locale: string) => {
  const normalizedLocale = locale.toLowerCase();
  const languageCode = normalizedLocale.split('-')[0];
  const sameLanguage = voices.filter((voice) => {
    const voiceLanguage = voice.lang.toLowerCase();
    return voiceLanguage === normalizedLocale || voiceLanguage.split('-')[0] === languageCode;
  });
  return sameLanguage.sort((first, second) => {
    const rank = (voice: SpeechSynthesisVoice) => {
      const exactMatch = voice.lang.toLowerCase() === normalizedLocale ? 2 : 0;
      const neuralHint = /neural|natural|enhanced/i.test(voice.name) ? 2 : 0;
      const localVoice = voice.localService ? 1 : 0;
      return exactMatch + neuralHint + localVoice;
    };
    return rank(second) - rank(first);
  })[0];
};

const speakAssistantPrompt = (language: AppLanguage) => {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(getAssistantPrompt(language));
  utterance.lang = getRecognitionLanguage(language);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferredFemaleVoices = voices.filter((voice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    const currentLanguagePattern =
      language === 'uz'
        ? /uz|uzbek|zira|samantha|aria|victoria|freya|jenny|ava|karen/
        : language === 'ru'
          ? /ru|russian|zira|samantha|aria|victoria|freya|jenny|ava|karen/
          : /en|english|zira|samantha|aria|victoria|freya|jenny|ava|karen/;

    return (
      currentLanguagePattern.test(name) ||
      (currentLanguagePattern.test(lang) && /female|woman|girl|zira|samantha|aria|victoria|freya|jenny|ava|karen/i.test(name))
    );
  });

  const chosenVoice =
    preferredFemaleVoices.find((voice) => /zira|samantha|aria|victoria|freya|jenny|ava|karen/i.test(voice.name)) ||
    preferredFemaleVoices[0] ||
    voices.find((voice) => new RegExp(getRecognitionLanguage(language).slice(0, 2), 'i').test(voice.lang));

  if (chosenVoice && /male|man/i.test(chosenVoice.name) === false) {
    utterance.voice = chosenVoice;
  } else if (!chosenVoice) {
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const AssistantVideoAvatar = ({ active, className }: { active: boolean; className: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(motionPreference.matches);
    motionPreference.addEventListener('change', updatePreference);
    return () => motionPreference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || reducedMotion || playbackFailed) {
      video.pause();
      return;
    }
    void video.play().catch(() => setPlaybackFailed(true));
  }, [active, playbackFailed, reducedMotion]);

  return (
    <div className={`assistant-video-avatar relative box-border flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-sky-400 ${className}`} aria-hidden="true">
      {!reducedMotion && !playbackFailed ? (
        <video
          ref={videoRef}
          src="/chatbot.mp4"
          autoPlay={active}
          loop
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          disableRemotePlayback
          preload={active ? 'auto' : 'metadata'}
          onError={() => setPlaybackFailed(true)}
          className="pointer-events-none h-full w-full object-contain"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : <Sparkles className="h-5 w-5 text-cyan-200 sm:h-6 sm:w-6" />}
    </div>
  );
};

const ProfessionalRobotButton = ({ onClick, isOpen, ariaLabel, assistantStatus = 'idle' }: { onClick: () => void; isOpen?: boolean; ariaLabel: string; assistantStatus?: string }) => (
  <button
    onClick={onClick}
    className="pointer-events-auto group relative flex h-[62px] w-[62px] items-center justify-center overflow-visible rounded-full border-0 bg-transparent p-0 text-white shadow-none transition-transform duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:h-16 sm:w-16 sm:min-h-16 sm:min-w-16"
    aria-label={ariaLabel}
    aria-expanded={Boolean(isOpen)}
    type="button"
  >
    <span
      className={`absolute bottom-1 right-1 z-10 flex h-2.5 w-2.5 items-center justify-center rounded-full ${
        assistantStatus === 'error' || assistantStatus === 'permission' || assistantStatus === 'language' || assistantStatus === 'unsupported'
          ? 'bg-rose-500 text-white'
          : assistantStatus === 'idle'
            ? 'assistant-availability-dot bg-green-500 text-green-950'
            : 'bg-green-500 text-green-950'
      }`}
      aria-hidden="true"
    >
      {assistantStatus === 'idle' ? <span className="assistant-availability-halo absolute inset-0 rounded-full bg-green-500" />
        : assistantStatus === 'listening' ? <Mic className="h-2 w-2" />
          : assistantStatus === 'speaking' ? <AudioLines className="h-2 w-2 animate-pulse motion-reduce:animate-none" />
            : assistantStatus === 'thinking' ? <span className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent motion-reduce:animate-none" />
              : assistantStatus === 'muted' ? <MicOff className="h-2 w-2" />
                : assistantStatus === 'error' || assistantStatus === 'permission' || assistantStatus === 'language' || assistantStatus === 'unsupported' ? <span className="text-[8px] font-bold leading-none">!</span>
                  : null}
    </span>
    <AssistantVideoAvatar active={!isOpen} className="h-[62px] w-[62px] sm:h-16 sm:w-16" />
  </button>
);

function FloatingPlatformAssistant({ onNavigate }: { onNavigate: (page: string, serviceId?: string) => void }) {
  const { language } = useLanguage();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chatWindowRect, setChatWindowRect] = useState(() => {
    if (typeof window === 'undefined') return { width: 420, height: 620, right: 20, bottom: 92 };
    return {
      width: Math.min(420, Math.max(240, window.innerWidth - 32)),
      height: Math.min(620, Math.max(240, window.innerHeight - 120)),
      right: 20,
      bottom: 92,
    };
  });
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1024 : window.innerWidth);
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<PendingAssistantImage[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [{
      id: 'welcome',
      role: 'assistant',
      text: language === 'uz'
        ? 'Salom! ZiyoTech xizmatlari va loyihangiz uchun raqamli yechimlar haqida bemalol so‘rashingiz mumkin.'
        : language === 'ru'
          ? 'Здравствуйте! Спрашивайте об услугах ZiyoTech и цифровых решениях для вашего проекта.'
          : 'Hi! Ask me about ZiyoTech’s services and digital solutions for your project.',
      timestamp: new Date().toISOString(),
  }]);
  const messagesRef = useRef(messages);
  const [isTyping, setIsTyping] = useState(false);
  const [micState, setMicState] = useState<'idle' | 'recording' | 'unsupported' | 'permission' | 'network' | 'no-speech' | 'language' | 'error'>('idle');
  const [liveTalkOpen, setLiveTalkOpen] = useState(false);
  const [liveTalkStatus, setLiveTalkStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'unsupported' | 'permission' | 'language' | 'error'>('idle');
  const [liveTalkError, setLiveTalkError] = useState('');
  const [liveTalkTranscript, setLiveTalkTranscript] = useState('');
  const [liveTalkReply, setLiveTalkReply] = useState('');
  const [liveTalkProjectIds, setLiveTalkProjectIds] = useState<string[]>([]);
  const [assistantError, setAssistantError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionFailedRef = useRef(false);
  const recognitionBaseTextRef = useRef('');
  const liveRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const liveSessionRef = useRef(false);
  const liveMutedRef = useRef(false);
  const liveTurnInProgressRef = useRef(false);
  const liveTurnGenerationRef = useRef(0);
  const liveTurnAbortControllerRef = useRef<AbortController | null>(null);
  const liveLastTranscriptRef = useRef<{ text: string; at: number; source: 'final' | 'silence-timeout' }>({ text: '', at: 0, source: 'final' });
  const livePendingFinalTranscriptRef = useRef('');
  const livePendingInterimTranscriptRef = useRef('');
  const liveFinalizeTimerRef = useRef<number | null>(null);
  const liveTranscriptSubmittedAtRef = useRef<number | null>(null);
  const liveRecognitionErrorRef = useRef(false);
  const liveRecognitionErrorCodeRef = useRef('');
  const liveRecognitionRetryCountRef = useRef(0);
  const liveRecognitionNoSpeechCountRef = useRef(0);
  const liveRecognitionEmptyEndCountRef = useRef(0);
  const liveAssistantSpeechTextRef = useRef('');
  const liveSpeechActiveRef = useRef(false);
  const liveSpeechGenerationRef = useRef(0);
  const liveLastRecognitionResultAtRef = useRef<number | null>(null);
  const liveRestartTimerRef = useRef<number | null>(null);
  const liveRecognitionStartTimerRef = useRef<number | null>(null);
  const speechVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const sendingRef = useRef(false);
  const liveTalkStatusRef = useRef(liveTalkStatus);
  const getChatWindowLimits = () => {
    const maxWidth = Math.max(240, Math.min(760, window.innerWidth - 32));
    const maxHeight = Math.max(240, Math.min(900, window.innerHeight - 120));
    return {
      minWidth: Math.min(320, maxWidth),
      maxWidth,
      minHeight: Math.min(360, maxHeight),
      maxHeight,
    };
  };

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      if (window.innerWidth < 640) return;
      setChatWindowRect((current) => {
        const { minWidth, maxWidth, minHeight, maxHeight } = getChatWindowLimits();
        const width = Math.max(minWidth, Math.min(current.width, maxWidth));
        const height = Math.max(minHeight, Math.min(current.height, maxHeight));
        return {
          width,
          height,
          right: Math.max(16, Math.min(current.right, window.innerWidth - width - 16)),
          bottom: Math.max(16, Math.min(current.bottom, window.innerHeight - height - 16)),
        };
      });
    };
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const beginChatResize = (event: React.PointerEvent<HTMLDivElement>, edges: string) => {
    if (window.innerWidth < 640 || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const start = { ...chatWindowRect, x: event.clientX, y: event.clientY };
    const handleElement = event.currentTarget;
    const pointerId = event.pointerId;
    const cursorByHandle: Record<string, string> = {
      n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
      ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize',
    };
    try {
      handleElement.setPointerCapture(pointerId);
    } catch {
      // Window-level pointer listeners remain as the fallback.
    }
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = cursorByHandle[edges] || 'nwse-resize';

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      let width = start.width + (edges.includes('e') ? dx : edges.includes('w') ? -dx : 0);
      let height = start.height + (edges.includes('s') ? dy : edges.includes('n') ? -dy : 0);
      const { minWidth, maxWidth, minHeight, maxHeight } = getChatWindowLimits();
      width = Math.max(minWidth, Math.min(width, maxWidth));
      height = Math.max(minHeight, Math.min(height, maxHeight));
      let right = start.right + (edges.includes('e') ? start.width - width : 0);
      let bottom = start.bottom + (edges.includes('s') ? start.height - height : 0);
      right = Math.max(16, Math.min(right, window.innerWidth - width - 16));
      bottom = Math.max(16, Math.min(bottom, window.innerHeight - height - 16));
      setChatWindowRect({ width, height, right, bottom });
    };
    const finishResize = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', finishResize);
      window.removeEventListener('pointercancel', finishResize);
      if (handleElement.hasPointerCapture(pointerId)) handleElement.releasePointerCapture(pointerId);
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', finishResize, { once: true });
    window.addEventListener('pointercancel', finishResize, { once: true });
  };

  const transitionLiveTalkStatus = (status: typeof liveTalkStatus) => {
    if (liveTalkStatusRef.current !== status) {
      console.debug(`[Live AI Talk] State ${liveTalkStatusRef.current} -> ${status}`);
      liveTalkStatusRef.current = status;
    }
    setLiveTalkStatus(status);
  };

  const navigateToAssistantDestination = (destination: AssistantDestination) => {
    const scrollToDestination = () => {
      if (!destination.sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const section = document.getElementById(destination.sectionId);
      if (!section) return;
      const top = Math.max(0, section.getBoundingClientRect().top + window.scrollY - 100);
      window.scrollTo({ top, behavior: 'smooth' });
    };

    const sectionAlreadyMounted = destination.sectionId && document.getElementById(destination.sectionId);
    setAssistantError('');
    setAssistantOpen(false);
    if (sectionAlreadyMounted) {
      scrollToDestination();
      return;
    }

    onNavigate(destination.page);
    window.requestAnimationFrame(() => window.requestAnimationFrame(scrollToDestination));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, assistantOpen]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoices = () => {
      speechVoicesRef.current = window.speechSynthesis.getVoices();
    };
    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [inputValue, assistantOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      liveSessionRef.current = false;
      liveRecognitionRef.current?.stop();
      liveTurnGenerationRef.current += 1;
      liveTurnAbortControllerRef.current?.abort();
      if (liveFinalizeTimerRef.current !== null) window.clearTimeout(liveFinalizeTimerRef.current);
      if (liveRecognitionStartTimerRef.current !== null) window.clearTimeout(liveRecognitionStartTimerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (liveRestartTimerRef.current !== null) window.clearTimeout(liveRestartTimerRef.current);
      previewUrlsRef.current.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      previewUrlsRef.current = [];
    };
  }, []);

  const replyFromPrompt = (prompt: string) => {
    const normalized = normalizeText(prompt);
    if (!normalized) {
      return 'I can help you explore the ZiyoTech platform, including services, automation, and digital growth guidance.';
    }

    if (/website|web|landing|brand|design/.test(normalized)) {
      return 'ZiyoTech includes platform services for website development, branding, and AI-ready digital experiences. We can help you build a modern digital presence that matches your goals.';
    }

    if (/e[- ]?commerce|shop|store|online store/.test(normalized)) {
      return 'E-commerce solutions are part of the platform scope, from storefront design to online sales readiness and digital experience improvements.';
    }

    if (/ai|automation|agent|chatbot/.test(normalized)) {
      return 'AI agents and business automation are among the featured platform services. We can design smart workflows and conversational experiences for your business.';
    }

    if (/social|media|smm/.test(normalized)) {
      return 'Social media management is included as a platform service category, with content and digital growth support built around the brand.';
    }

    if (/photo|video|content/.test(normalized)) {
      return 'Professional photo and video content support is part of the services represented in this platform.';
    }

    if (/marketing|digital/.test(normalized)) {
      return 'Digital marketing is part of ZiyoTech’s platform categories, including visibility, growth, and customer engagement work.';
    }

    return 'I can help explain the ZiyoTech platform service categories in this project: website development, e-commerce, AI automation, branding, marketing, content, and custom digital solutions.';
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (sendingRef.current || (!trimmed && selectedFiles.length === 0)) return;
    const navigationDestination = selectedFiles.length === 0 ? resolveAssistantDestination(trimmed) : null;
    if (navigationDestination) {
      sendingRef.current = true;
      const now = new Date().toISOString();
      const acknowledgment = getAssistantNavigationAcknowledgment(navigationDestination, language);
      setMessages((previous) => [...previous,
        { id: `user-nav-${Date.now()}`, role: 'user', text: trimmed, timestamp: now },
        { id: `assistant-nav-${Date.now()}`, role: 'assistant', text: acknowledgment, timestamp: new Date().toISOString() },
      ]);
      setInputValue('');
      navigateToAssistantDestination(navigationDestination);
      sendingRef.current = false;
      return;
    }
    sendingRef.current = true;
    setAssistantError('');
    setIsTyping(true);
    const requestId = `user-${Date.now()}`;
    try {
      const images: AssistantImage[] = await Promise.all(selectedFiles.map(async ({ file, previewUrl }) => ({
        previewUrl,
        mimeType: file.type,
        data: await readFileAsBase64(file),
      })));
      const messageText = trimmed || (language === 'uz' ? 'Iltimos, ushbu rasmni tahlil qiling.' : language === 'ru' ? 'Пожалуйста, проанализируйте это изображение.' : 'Please analyze this image.');
      const nextUserMessage: AssistantMessage = {
        id: requestId,
        role: 'user',
        text: messageText,
        attachments: images.length ? images : undefined,
        timestamp: new Date().toISOString(),
      };
      const recentMessages = messages.slice(-8);
      const lastImageHistoryId = [...recentMessages].reverse().find((message) => message.attachments?.length)?.id;
      const history = recentMessages.map((message) => ({
        role: message.role,
        text: message.text,
        attachments: message.id === lastImageHistoryId ? message.attachments?.map(({ mimeType, data }) => ({ mimeType, data })) : undefined,
      }));
      const endpoint = `${ASSISTANT_API_BASE}/api/assistant/chat`;
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 90000);
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText,
            history,
            language,
            images: images.map(({ mimeType, data }) => ({ mimeType, data })),
          }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || (language === 'uz' ? 'Yordamchi hozir javob bera olmadi.' : language === 'ru' ? 'Ассистент сейчас не может ответить.' : 'The assistant could not answer right now.'));
      }

      const answer = typeof data.response === 'string' && data.response.trim()
        ? data.response.trim()
        : (language === 'uz' ? 'ZiyoTech xizmatlari haqida yordam beraman. Nimalarni bilmoqchisiz?' : language === 'ru' ? 'Я помогу с информацией об услугах ZiyoTech. Что вас интересует?' : 'I can help with ZiyoTech’s services. What would you like to know?');

      const responseProjectIds = Array.isArray(data.portfolioProjectIds)
        ? data.portfolioProjectIds.filter((projectId: unknown): projectId is string => typeof projectId === 'string')
        : [];
      const portfolioProjectIds = getAssistantPortfolioProjects(responseProjectIds).map((project) => project.id);

      setMessages((prev) => [...prev, nextUserMessage, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: answer,
          portfolioProjectIds,
          timestamp: new Date().toISOString(),
      }]);
      setInputValue('');
      setSelectedFiles([]);
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      const fallbackMessage = timedOut
        ? (language === 'uz' ? 'Javob vaqti tugadi. Qayta urinib ko‘ring.' : language === 'ru' ? 'Время ожидания ответа истекло. Попробуйте ещё раз.' : 'The response timed out. Please try again.')
        : error instanceof Error && error.message
          ? error.message
          : (language === 'uz' ? 'Yordamchi hozir javob bera olmadi. Qayta urinib ko‘ring.' : language === 'ru' ? 'Ассистент сейчас не может ответить. Попробуйте ещё раз.' : 'The assistant could not respond. Please try again.');

      setAssistantError(fallbackMessage);
    } finally {
      sendingRef.current = false;
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const remaining = Math.max(0, 3 - selectedFiles.length);
    const accepted = files.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 2 * 1024 * 1024).slice(0, remaining);
    const previews = accepted.map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file) }));
    previewUrlsRef.current.push(...previews.map(({ previewUrl }) => previewUrl));
    setSelectedFiles((previous) => [...previous, ...previews]);
    if (accepted.length !== files.length) {
      setAssistantError(language === 'uz'
        ? 'Faqat JPEG, PNG yoki WebP rasmlari (har biri 2 MB gacha, jami 3 ta) qabul qilinadi.'
        : language === 'ru'
          ? 'Допускаются JPEG, PNG или WebP (до 2 МБ каждый, не более 3).'
          : 'Choose JPEG, PNG, or WebP images up to 2 MB each (maximum 3).');
    }
  };

  const handleMicToggle = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const speechWindow = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setMicState('unsupported');
      return;
    }
    try {
      const recognition = new Recognition();
      recognitionFailedRef.current = false;
      recognition.lang = getRecognitionLanguage(language);
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognitionBaseTextRef.current = inputValue.trim();
      recognition.onstart = () => setMicState('recording');
      recognition.onresult = (event) => {
        const finalParts: string[] = [];
        const interimParts: string[] = [];
        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result?.[0]?.transcript?.trim();
          if (!transcript) continue;
          liveLastRecognitionResultAtRef.current = performance.now();
          (result.isFinal ? finalParts : interimParts).push(transcript);
        }
        const recognizedText = [...finalParts, ...interimParts].join(' ');
        if (recognizedText) {
          const baseText = recognitionBaseTextRef.current;
          setInputValue(`${baseText}${baseText ? ' ' : ''}${recognizedText}`);
        }
      };
      recognition.onerror = (event) => {
        recognitionFailedRef.current = true;
        setMicState(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'permission' : event.error === 'network' ? 'network' : event.error === 'no-speech' ? 'no-speech' : event.error === 'language-not-supported' || event.error === 'language-unavailable' ? 'language' : 'error');
      };
      recognition.onend = () => {
        recognitionRef.current = null;
        if (!recognitionFailedRef.current) setMicState('idle');
      };
      recognitionRef.current = recognition;
      setMicState('recording');
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setMicState('error');
    }
  };

  const submitLiveTranscript = (transcript: string, source: 'final' | 'silence-timeout') => {
    const cleaned = transcript.trim();
    if (!cleaned || !liveSessionRef.current || liveMutedRef.current) return;
    if (liveFinalizeTimerRef.current !== null) {
      window.clearTimeout(liveFinalizeTimerRef.current);
      liveFinalizeTimerRef.current = null;
    }
    livePendingFinalTranscriptRef.current = '';
    livePendingInterimTranscriptRef.current = '';
    liveRecognitionRetryCountRef.current = 0;
    liveRecognitionNoSpeechCountRef.current = 0;
    liveRecognitionErrorCodeRef.current = '';
    const normalized = cleaned.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
    const previous = liveLastTranscriptRef.current.text;
    const elapsed = Date.now() - liveLastTranscriptRef.current.at;
    const sameTranscript = normalized === previous;
    const finalAfterTimeout = source === 'final' && liveLastTranscriptRef.current.source === 'silence-timeout'
      && (normalized.startsWith(`${previous} `) || previous.startsWith(`${normalized} `));
    if ((sameTranscript && elapsed < 1000) || (finalAfterTimeout && elapsed < 3000)) {
      console.debug('[Live AI Talk] Duplicate finalized transcript ignored.');
      return;
    }
    liveLastTranscriptRef.current = { text: normalized, at: Date.now(), source };
    const endpointingDelay = liveLastRecognitionResultAtRef.current === null ? null : Math.round(performance.now() - liveLastRecognitionResultAtRef.current);
    console.info(`[Live AI Talk] Transcript submitted (${cleaned.length} chars, ${source}; endpointing ${endpointingDelay ?? 'unavailable'}ms).`);
    liveTranscriptSubmittedAtRef.current = performance.now();
    setLiveTalkTranscript(cleaned);
    if (isLiveStopCommand(cleaned)) {
      console.info('[Live AI Talk] Stop command recognized.');
      liveTurnGenerationRef.current += 1;
      liveTurnAbortControllerRef.current?.abort();
      liveTurnAbortControllerRef.current = null;
      liveTurnInProgressRef.current = false;
      liveSpeechGenerationRef.current += 1;
      console.debug('[Live AI Talk] Cancelling speech synthesis for stop command.');
      window.speechSynthesis.cancel();
      liveSpeechActiveRef.current = false;
      liveAssistantSpeechTextRef.current = '';
      transitionLiveTalkStatus('listening');
      if (!liveRecognitionRef.current) beginLiveListening();
      return;
    }
    void handleLiveTurn(cleaned);
  };

  const beginLiveListening = () => {
    if (!liveSessionRef.current || liveMutedRef.current || liveRecognitionRef.current || liveRecognitionErrorRef.current) return;
    const speechWindow = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      transitionLiveTalkStatus('unsupported');
      setLiveTalkError(language === 'uz' ? 'Bu brauzer jonli nutqni taniy olmaydi.' : language === 'ru' ? 'Этот браузер не поддерживает распознавание речи.' : 'This browser does not support speech recognition.');
      return;
    }

    try {
      const recognition = new Recognition();
      let recognitionStarted = false;
      let recognitionReceivedResult = false;
      recognition.lang = getRecognitionLanguage(language);
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        recognitionStarted = true;
        if (liveRecognitionStartTimerRef.current !== null) {
          window.clearTimeout(liveRecognitionStartTimerRef.current);
          liveRecognitionStartTimerRef.current = null;
        }
        console.debug('[Live AI Talk] Recognition started.');
        if (!liveSpeechActiveRef.current && !liveTurnInProgressRef.current) transitionLiveTalkStatus('listening');
      };
      recognition.onresult = (event) => {
        if (liveMutedRef.current) return;
        const finalParts: string[] = [];
        const interimParts: string[] = [];
        const startIndex = event.resultIndex ?? 0;
        for (let index = startIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const transcript = result?.[0]?.transcript?.trim();
          if (!transcript) continue;
          liveLastRecognitionResultAtRef.current = performance.now();
          recognitionReceivedResult = true;
          console.debug('[Live AI Talk] Recognition ' + (result.isFinal ? 'final' : 'interim') + ' result (' + transcript.length + ' chars).');
          if (result.isFinal) finalParts.push(transcript);
          else interimParts.push(transcript);
        }
        if (!finalParts.length && !interimParts.length) return;

        const interimText = interimParts.join(' ').trim();
        if (liveSpeechActiveRef.current) {
          const heardText = [...finalParts, ...interimParts].join(' ').trim();
          if (isLikelyAssistantSpeechEcho(heardText, liveAssistantSpeechTextRef.current)) {
            console.debug('[Live AI Talk] Assistant speech echo ignored.');
            return;
          }
          liveSpeechGenerationRef.current += 1;
          if (liveTurnInProgressRef.current) {
            console.info('[Live AI Talk] User speech interrupted a streaming response; cancelling the stale Gemini turn.');
            liveTurnGenerationRef.current += 1;
            liveTurnAbortControllerRef.current?.abort();
            liveTurnAbortControllerRef.current = null;
            liveTurnInProgressRef.current = false;
          }
          console.debug('[Live AI Talk] Cancelling speech synthesis after recognized user speech.');
          window.speechSynthesis.cancel();
          liveSpeechActiveRef.current = false;
          liveAssistantSpeechTextRef.current = '';
          transitionLiveTalkStatus('listening');
        }

        if (finalParts.length) {
          const incomingFinal = finalParts.join(' ').trim();
          const currentFinal = livePendingFinalTranscriptRef.current;
          livePendingFinalTranscriptRef.current = currentFinal ? currentFinal + ' ' + incomingFinal : incomingFinal;
          livePendingInterimTranscriptRef.current = interimText;
          liveRecognitionRetryCountRef.current = 0;
          liveRecognitionNoSpeechCountRef.current = 0;
          liveRecognitionEmptyEndCountRef.current = 0;
          liveRecognitionErrorCodeRef.current = '';
        } else if (interimText) {
          livePendingInterimTranscriptRef.current = interimText;
        }

        const pendingTranscript = [livePendingFinalTranscriptRef.current, livePendingInterimTranscriptRef.current].filter(Boolean).join(' ').trim();
        if (pendingTranscript) setLiveTalkTranscript(pendingTranscript);
        if (interimText && liveTurnInProgressRef.current) transitionLiveTalkStatus('listening');
        if (liveFinalizeTimerRef.current !== null) window.clearTimeout(liveFinalizeTimerRef.current);
        const source: 'final' | 'silence-timeout' = interimText && !finalParts.length ? 'silence-timeout' : 'final';
        const silenceDelay = source === 'silence-timeout' ? 850 : 180;
        liveFinalizeTimerRef.current = window.setTimeout(() => {
          liveFinalizeTimerRef.current = null;
          const finalizedTranscript = [livePendingFinalTranscriptRef.current, livePendingInterimTranscriptRef.current].filter(Boolean).join(' ').trim();
          submitLiveTranscript(finalizedTranscript, source);
        }, silenceDelay);
      };
      recognition.onerror = (event) => {
        if (liveRecognitionStartTimerRef.current !== null) {
          window.clearTimeout(liveRecognitionStartTimerRef.current);
          liveRecognitionStartTimerRef.current = null;
        }
        liveRecognitionErrorCodeRef.current = event.error;
        console.info('[Live AI Talk] SpeechRecognition error code:', event.error);
        if (event.error === 'aborted') return;
        if (event.error === 'no-speech') {
          liveRecognitionNoSpeechCountRef.current += 1;
          if (liveRecognitionNoSpeechCountRef.current < 2) return;
          liveRecognitionErrorRef.current = true;
          transitionLiveTalkStatus('error');
          setLiveTalkError(language === 'uz' ? 'Ovoz aniqlanmadi. Mikrofonni tekshiring va qayta urinib ko\u02bbring.' : language === 'ru' ? '\u0420\u0435\u0447\u044c \u043d\u0435 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u043d\u0430. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d \u0438 \u043f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u0435.' : 'No speech was recognized. Check your microphone and try again.');
          return;
        }
        if (event.error === 'network' && liveRecognitionRetryCountRef.current < 2) {
          liveRecognitionRetryCountRef.current += 1;
          setLiveTalkError('');
          return;
        }

        liveRecognitionErrorRef.current = true;
        const permissionError = event.error === 'not-allowed' || event.error === 'service-not-allowed';
        const languageError = event.error === 'language-not-supported' || event.error === 'language-unavailable';
        const status = permissionError ? 'permission' : languageError ? 'language' : 'error';
        transitionLiveTalkStatus(status);
        const message = permissionError
          ? (language === 'uz' ? 'Mikrofon ruxsatini bering, so\'ng qayta urinib ko\'ring.' : language === 'ru' ? '\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u0434\u043e\u0441\u0442\u0443\u043f \u043a \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d\u0443 \u0438 \u043f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u0435.' : 'Allow microphone access, then try again.')
          : languageError
            ? (language === 'uz' ? 'Brauzer bu tilni tanimaydi. Tilni almashtiring yoki matnli chatdan foydalaning.' : language === 'ru' ? '\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043d\u0435 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u044d\u0442\u043e\u0442 \u044f\u0437\u044b\u043a. \u0421\u043c\u0435\u043d\u0438\u0442\u0435 \u044f\u0437\u044b\u043a \u0438\u043b\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0439\u0442\u0435 \u0442\u0435\u043a\u0441\u0442\u043e\u0432\u044b\u0439 \u0447\u0430\u0442.' : 'This browser does not support this language. Change the language or use text chat.')
            : event.error === 'network'
              ? (language === 'uz' ? 'Nutq xizmati ikki urinishdan keyin ham ishlamadi. Internetni tekshirib, qayta urinib ko\'ring.' : language === 'ru' ? '\u0421\u043b\u0443\u0436\u0431\u0430 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u044f \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043f\u043e\u0441\u043b\u0435 \u0434\u0432\u0443\u0445 \u043f\u043e\u0432\u0442\u043e\u0440\u043e\u0432. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442.' : 'Speech recognition is unavailable after two retries. Check your connection and try again.')
              : (language === 'uz' ? 'Nutq xizmatida muammo yuz berdi. Mikrofonni tekshiring yoki qayta urinib ko\'ring.' : language === 'ru' ? '\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u044f \u0440\u0435\u0447\u0438. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d \u0438\u043b\u0438 \u043f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u0435.' : 'Speech recognition failed. Check your microphone or try again.');
        setLiveTalkError(message + ' (' + event.error + ')');
      };
      recognition.onend = () => {
        console.debug('[Live AI Talk] Recognition ended.');
        if (liveRecognitionStartTimerRef.current !== null) {
          window.clearTimeout(liveRecognitionStartTimerRef.current);
          liveRecognitionStartTimerRef.current = null;
        }
        if (liveRecognitionRef.current === recognition) liveRecognitionRef.current = null;
        if (recognitionReceivedResult) liveRecognitionEmptyEndCountRef.current = 0;
        else liveRecognitionEmptyEndCountRef.current += 1;
        if (liveRecognitionEmptyEndCountRef.current >= 4 && liveSessionRef.current && !liveMutedRef.current) {
          liveRecognitionErrorRef.current = true;
          liveRecognitionErrorCodeRef.current = 'repeated-empty-end';
          console.info('[Live AI Talk] Recognition stopped repeatedly without results.');
          transitionLiveTalkStatus('error');
          setLiveTalkError(language === 'uz' ? 'Nutq xizmati bir necha marta natijasiz toxtadi. Mikrofonni tekshiring va qayta urinib ko\u02bbring.' : language === 'ru' ? '\u0421\u043b\u0443\u0436\u0431\u0430 \u0440\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u044f \u0440\u0435\u0447\u0438 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0440\u0430\u0437 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043b\u0430\u0441\u044c \u0431\u0435\u0437 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u0430. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d.' : 'Speech recognition ended repeatedly without results. Check the microphone and try again.');
          return;
        }
        if (liveSessionRef.current && !liveMutedRef.current && !liveRecognitionErrorRef.current && liveFinalizeTimerRef.current === null) {
          if (liveRestartTimerRef.current !== null) return;
          const retryDelay = liveRecognitionRetryCountRef.current > 0
            ? Math.min(400 * (2 ** (liveRecognitionRetryCountRef.current - 1)), 1600)
            : 350;
          liveRestartTimerRef.current = window.setTimeout(() => {
            liveRestartTimerRef.current = null;
            beginLiveListening();
          }, retryDelay);
        }
      };
      liveRecognitionRef.current = recognition;
      setLiveTalkError('');
      transitionLiveTalkStatus('listening');
      recognition.start();
      if (!recognitionStarted) {
        liveRecognitionStartTimerRef.current = window.setTimeout(() => {
          liveRecognitionStartTimerRef.current = null;
          if (liveRecognitionRef.current !== recognition || recognitionStarted) return;
          liveRecognitionErrorRef.current = true;
          liveRecognitionErrorCodeRef.current = 'start-timeout';
          console.info('[Live AI Talk] SpeechRecognition start timeout.');
          transitionLiveTalkStatus('error');
          setLiveTalkError(language === 'uz' ? 'Nutqni tanish boshlanmadi. Mikrofon ruxsatini tekshiring va qayta urinib ko\u02bbring.' : language === 'ru' ? '\u0420\u0430\u0441\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u043d\u0438\u0435 \u0440\u0435\u0447\u0438 \u043d\u0435 \u0437\u0430\u043f\u0443\u0441\u0442\u0438\u043b\u043e\u0441\u044c. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0434\u043e\u0441\u0442\u0443\u043f \u043a \u043c\u0438\u043a\u0440\u043e\u0444\u043e\u043d\u0443.' : 'Speech recognition did not start. Check microphone permission and try again.');
          recognition.stop();
        }, 5000);
      }
    } catch (error) {
      if (liveRecognitionStartTimerRef.current !== null) {
        window.clearTimeout(liveRecognitionStartTimerRef.current);
        liveRecognitionStartTimerRef.current = null;
      }
      liveRecognitionRef.current = null;
      liveRecognitionErrorRef.current = true;
      liveRecognitionErrorCodeRef.current = error instanceof Error ? error.name : 'start-failed';
      console.info('[Live AI Talk] SpeechRecognition start error code:', liveRecognitionErrorCodeRef.current);
      transitionLiveTalkStatus('error');
      const startError = language === 'uz' ? 'Mikrofonni ishga tushirib bo‘lmadi. Ruxsatlarni tekshiring yoki qayta urinib ko‘ring.' : language === 'ru' ? 'Не удалось запустить микрофон. Проверьте разрешения или повторите.' : 'Could not start speech recognition. Check site permissions or try again.';
      setLiveTalkError(startError + ' (' + liveRecognitionErrorCodeRef.current + ')');
    }
  };

  const speakLiveReply = (text: string, responseReadyAt?: number, transcriptSubmittedAt?: number) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      liveRecognitionErrorRef.current = true;
      transitionLiveTalkStatus('error');
      setLiveTalkError(language === 'uz' ? 'Bu brauzerda ovozli javob mavjud emas.' : language === 'ru' ? 'В этом браузере голосовые ответы недоступны.' : 'Spoken replies are not supported in this browser.');
      return;
    }

    const spokenText = prepareSpeechText(text);
    if (!spokenText) {
      transitionLiveTalkStatus('listening');
      beginLiveListening();
      return;
    }
    const generation = ++liveSpeechGenerationRef.current;
    liveAssistantSpeechTextRef.current = spokenText;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = getRecognitionLanguage(language);
    utterance.voice = selectSpeechVoice(speechVoicesRef.current.length ? speechVoicesRef.current : window.speechSynthesis.getVoices(), utterance.lang) || null;
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    const replyQueuedAt = performance.now();
    utterance.onstart = () => {
      console.info(`[Live AI Talk] Speech synthesis started (reply-to-synthesis ${Math.round(performance.now() - replyQueuedAt)}ms; onstart is not measured acoustic onset).`);
      if (responseReadyAt !== undefined) {
        console.info(`[Live AI Talk] Response-ready-to-speech-start ${Math.round(performance.now() - responseReadyAt)}ms; transcript-submit-to-speech-start ${Math.round(performance.now() - (transcriptSubmittedAt ?? responseReadyAt))}ms.`);
      }
      liveSpeechActiveRef.current = true;
      transitionLiveTalkStatus('speaking');
    };
    utterance.onend = () => {
      console.info('[Live AI Talk] Speech synthesis ended.');
      liveSpeechActiveRef.current = false;
      if (generation === liveSpeechGenerationRef.current) liveAssistantSpeechTextRef.current = '';
      if (generation !== liveSpeechGenerationRef.current || !liveSessionRef.current) return;
      if (liveMutedRef.current) {
        transitionLiveTalkStatus('muted');
      } else if (liveRecognitionErrorRef.current) {
        transitionLiveTalkStatus('error');
      } else {
        transitionLiveTalkStatus('listening');
        beginLiveListening();
      }
    };
    utterance.onerror = () => {
      console.info('[Live AI Talk] Speech synthesis error.');
      liveSpeechActiveRef.current = false;
      if (generation !== liveSpeechGenerationRef.current) return;
      liveAssistantSpeechTextRef.current = '';
      transitionLiveTalkStatus('error');
      setLiveTalkError(language === 'uz' ? 'Brauzer bu javobni ovozli o‘qiy olmadi.' : language === 'ru' ? 'Браузер не смог озвучить этот ответ.' : 'The browser could not speak this reply.');
    };
    window.speechSynthesis.speak(utterance);
  };

  async function handleLiveTurn(transcript: string) {
    if (!liveSessionRef.current) return;
    const generation = ++liveTurnGenerationRef.current;
    const turnStartedAt = performance.now();
    const transcriptSubmittedAt = liveTranscriptSubmittedAtRef.current;
    console.info(`[Live AI Talk] Transcript-to-turn-handler ${transcriptSubmittedAt === null ? 'unavailable' : `${Math.round(turnStartedAt - transcriptSubmittedAt)}ms`}.`);
    console.info(`[Live AI Talk] Gemini request ${generation} started (${transcript.length} chars).`);
    liveTurnAbortControllerRef.current?.abort();
    if (liveTurnAbortControllerRef.current) console.debug(`[Live AI Talk] Previous Gemini request cancelled before request ${generation}.`);
    const controller = new AbortController();
    liveTurnAbortControllerRef.current = controller;
    liveTurnInProgressRef.current = true;
    liveSpeechGenerationRef.current += 1;
    console.debug('[Live AI Talk] Cancelling queued speech for the submitted user turn.');
    window.speechSynthesis.cancel();
    liveSpeechActiveRef.current = false;
    liveAssistantSpeechTextRef.current = '';
    if (liveRecognitionRef.current) liveRecognitionRef.current.stop();
    else if (!liveMutedRef.current) beginLiveListening();
    if (!liveSpeechActiveRef.current) transitionLiveTalkStatus('thinking');
    setLiveTalkError('');
    const userMessage: AssistantMessage = {
      id: `user-live-${Date.now()}`,
      role: 'user',
      text: transcript,
      timestamp: new Date().toISOString(),
    };
    setMessages((previous) => [...previous, userMessage]);

    const navigationDestination = resolveAssistantDestination(transcript);
    if (navigationDestination) {
      const acknowledgment = getAssistantNavigationAcknowledgment(navigationDestination, language);
      liveTurnInProgressRef.current = false;
      liveTurnAbortControllerRef.current = null;
      console.info(`[Live AI Talk] Trusted navigation intent matched: ${navigationDestination.page}.`);
      setLiveTalkReply(acknowledgment);
      setLiveTalkProjectIds([]);
      setMessages((previous) => [...previous, {
        id: `assistant-live-nav-${Date.now()}`,
        role: 'assistant',
        text: acknowledgment,
        timestamp: new Date().toISOString(),
      }]);
      speakLiveReply(acknowledgment);
      navigateToAssistantDestination(navigationDestination);
      return;
    }

    const greeting = getLiveGreeting(transcript, language);
    if (greeting) {
      liveTurnInProgressRef.current = false;
      console.info(`[Live AI Talk] Exact greeting answered locally (recognition-to-reply ${Math.round(performance.now() - turnStartedAt)}ms); no user question is intercepted.`);
      setLiveTalkReply(greeting);
      setLiveTalkProjectIds([]);
      setMessages((previous) => [...previous, {
        id: `assistant-live-greeting-${Date.now()}`,
        role: 'assistant',
        text: greeting,
        timestamp: new Date().toISOString(),
      }]);
      speakLiveReply(greeting, undefined, turnStartedAt);
      return;
    }

    try {
      const recentMessages = messagesRef.current.slice(-8);
      const lastImageHistoryId = [...recentMessages].reverse().find((message) => message.attachments?.length)?.id;
      const history = recentMessages.map((message) => ({
        role: message.role,
        text: message.text,
        attachments: message.id === lastImageHistoryId ? message.attachments?.map(({ mimeType, data }) => ({ mimeType, data })) : undefined,
      }));
      const timeoutId = window.setTimeout(() => controller.abort(), 90000);
      const requestStartedAt = performance.now();
      console.info(`[Live AI Talk] Transcript-to-backend-request-start ${transcriptSubmittedAt === null ? 'unavailable' : `${Math.round(requestStartedAt - transcriptSubmittedAt)}ms`}.`);
      let response: Response;
      try {
        response = await fetch(`${ASSISTANT_API_BASE}/api/assistant/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript, history, language }),
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
      const responseHeadersAt = performance.now();
      console.info(`[Live AI Talk] Gemini request ${generation} returned HTTP ${response.status} headers after ${Math.round(responseHeadersAt - requestStartedAt)}ms.`);
      const data = await response.json().catch(() => ({}));
      const responseParsedAt = performance.now();
      console.info(`[Live AI Talk] Gemini response ${generation} parsed in ${Math.round(responseParsedAt - requestStartedAt)}ms total.`);
      if (generation !== liveTurnGenerationRef.current) return;
      if (!response.ok || typeof data.response !== 'string' || !data.response.trim()) {
        throw new Error(data.error || (language === 'uz' ? 'Yordamchi hozir javob bera olmadi.' : language === 'ru' ? '\u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043d\u0442 \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442 \u043e\u0442\u0432\u0435\u0442\u0438\u0442\u044c.' : 'The assistant could not answer right now.'));
      }
      if (!liveSessionRef.current) return;
      const answer = data.response.trim();
      const responseProjectIds = Array.isArray(data.portfolioProjectIds)
        ? data.portfolioProjectIds.filter((projectId: unknown): projectId is string => typeof projectId === 'string')
        : [];
      const orderedProjectIds = getAssistantPortfolioProjects(responseProjectIds).map((project) => project.id);
      setLiveTalkReply(answer);
      setLiveTalkProjectIds(orderedProjectIds);
      setMessages((previous) => [...previous, {
        id: `assistant-live-${Date.now()}`,
        role: 'assistant',
        text: answer,
        portfolioProjectIds: orderedProjectIds,
        timestamp: new Date().toISOString(),
      }]);
      speakLiveReply(answer, responseParsedAt, turnStartedAt);
    } catch (error) {
      if (!liveSessionRef.current || generation !== liveTurnGenerationRef.current) return;
      transitionLiveTalkStatus('error');
      const timedOut = error instanceof DOMException && error.name === 'AbortError';
      const networkFailure = error instanceof TypeError
        || (error instanceof Error && /failed to fetch|networkerror|load failed/i.test(error.message));
      if (networkFailure && error instanceof Error) {
        console.warn('[Live AI Talk] No HTTP response was received for the Gemini request.', {
          name: error.name,
          message: error.message.slice(0, 160),
        });
      }
      setLiveTalkError(timedOut
        ? (language === 'uz' ? 'Javobni kutish vaqti tugadi.' : language === 'ru' ? 'Время ожидания ответа истекло.' : 'The assistant response timed out.')
        : networkFailure
          ? (language === 'uz' ? 'Yordamchi serveriga ulanib bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.' : language === 'ru' ? 'Не удалось подключиться к серверу помощника. Проверьте интернет и повторите попытку.' : 'Could not connect to the assistant server. Check your connection and try again.')
          : error instanceof Error && error.message
          ? error.message
          : (language === 'uz' ? 'Yordamchi hozir javob bera olmadi.' : language === 'ru' ? 'Ассистент сейчас не может ответить.' : 'The assistant could not answer right now.'));
    } finally {
      if (generation === liveTurnGenerationRef.current) {
        liveTurnInProgressRef.current = false;
        liveTurnAbortControllerRef.current = null;
        if (liveSessionRef.current && !liveMutedRef.current && !liveSpeechActiveRef.current && !liveRecognitionRef.current) beginLiveListening();
      }
    }
  }

  const startLiveTalk = () => {
    const speechWindow = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
    if (!speechWindow.SpeechRecognition && !speechWindow.webkitSpeechRecognition) {
      transitionLiveTalkStatus('unsupported');
      setLiveTalkError(language === 'uz' ? 'Bu brauzerda nutqni tanish qo‘llab-quvvatlanmaydi.' : language === 'ru' ? 'Этот браузер не поддерживает распознавание речи.' : 'Speech recognition is not supported in this browser.');
      return;
    }
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      transitionLiveTalkStatus('unsupported');
      setLiveTalkError(language === 'uz' ? 'Bu brauzerda ovozli javob mavjud emas.' : language === 'ru' ? 'В этом браузере голосовые ответы недоступны.' : 'Spoken replies are not supported in this browser.');
      return;
    }
    liveSessionRef.current = true;
    liveMutedRef.current = false;
    liveRecognitionErrorRef.current = false;
    liveRecognitionRetryCountRef.current = 0;
    liveRecognitionNoSpeechCountRef.current = 0;
    liveRecognitionEmptyEndCountRef.current = 0;
    liveRecognitionErrorCodeRef.current = '';
    liveLastTranscriptRef.current = { text: '', at: 0, source: 'final' };
    livePendingFinalTranscriptRef.current = '';
    livePendingInterimTranscriptRef.current = '';
    if (liveFinalizeTimerRef.current !== null) {
      window.clearTimeout(liveFinalizeTimerRef.current);
      liveFinalizeTimerRef.current = null;
    }
    setLiveTalkError('');
    console.info('[Live AI Talk] Session started.');
    transitionLiveTalkStatus('listening');
    beginLiveListening();
  };

  const endLiveTalk = () => {
    console.info('[Live AI Talk] Session ended.');
    liveSessionRef.current = false;
    liveRecognitionErrorRef.current = false;
    liveTurnInProgressRef.current = false;
    liveTurnGenerationRef.current += 1;
    liveTurnAbortControllerRef.current?.abort();
    liveTurnAbortControllerRef.current = null;
    liveSpeechGenerationRef.current += 1;
    liveSpeechActiveRef.current = false;
    liveAssistantSpeechTextRef.current = '';
    if (liveRestartTimerRef.current !== null) {
      window.clearTimeout(liveRestartTimerRef.current);
      liveRestartTimerRef.current = null;
    }
    if (liveRecognitionStartTimerRef.current !== null) {
      window.clearTimeout(liveRecognitionStartTimerRef.current);
      liveRecognitionStartTimerRef.current = null;
    }
    liveRecognitionRef.current?.stop();
    liveRecognitionRef.current = null;
    if (liveFinalizeTimerRef.current !== null) {
      window.clearTimeout(liveFinalizeTimerRef.current);
      liveFinalizeTimerRef.current = null;
    }
    livePendingFinalTranscriptRef.current = '';
    livePendingInterimTranscriptRef.current = '';
    if ('speechSynthesis' in window) {
      console.debug('[Live AI Talk] Cancelling speech synthesis because the session ended.');
      window.speechSynthesis.cancel();
    }
    liveMutedRef.current = false;
    transitionLiveTalkStatus('idle');
    setLiveTalkOpen(false);
  };

  const toggleLiveMute = () => {
    liveMutedRef.current = !liveMutedRef.current;
    if (liveMutedRef.current) {
      liveRecognitionRef.current?.stop();
      if (liveFinalizeTimerRef.current !== null) {
        window.clearTimeout(liveFinalizeTimerRef.current);
        liveFinalizeTimerRef.current = null;
      }
      livePendingFinalTranscriptRef.current = '';
      livePendingInterimTranscriptRef.current = '';
      transitionLiveTalkStatus(liveSpeechActiveRef.current ? 'speaking' : 'muted');
      setLiveTalkError('');
      return;
    }
    liveRecognitionErrorRef.current = false;
    liveRecognitionRetryCountRef.current = 0;
    liveRecognitionEmptyEndCountRef.current = 0;
    liveRecognitionErrorCodeRef.current = '';
    if (liveSpeechActiveRef.current) {
      transitionLiveTalkStatus('speaking');
    } else {
      transitionLiveTalkStatus('listening');
      beginLiveListening();
    }
  };

  const interruptLiveSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    console.info('[Live AI Talk] Manual Interrupt requested.');
    liveSpeechGenerationRef.current += 1;
    console.debug('[Live AI Talk] Cancelling speech synthesis after manual Interrupt.');
    window.speechSynthesis.cancel();
    liveSpeechActiveRef.current = false;
    if (liveMutedRef.current) {
      transitionLiveTalkStatus('muted');
      liveAssistantSpeechTextRef.current = '';
    } else {
      if (liveTurnInProgressRef.current) {
        liveTurnGenerationRef.current += 1;
        liveTurnAbortControllerRef.current?.abort();
        liveTurnAbortControllerRef.current = null;
        liveTurnInProgressRef.current = false;
      }
      liveAssistantSpeechTextRef.current = '';
      if (liveRecognitionErrorRef.current) {
        transitionLiveTalkStatus('error');
      } else {
        transitionLiveTalkStatus('listening');
        beginLiveListening();
      }
    }
  };

  const openLiveTalk = () => {
    if (sendingRef.current || selectedFiles.length > 0) return;
    recognitionRef.current?.stop();
    setLiveTalkTranscript('');
    setLiveTalkReply('');
    setLiveTalkProjectIds([]);
    setLiveTalkError('');
    transitionLiveTalkStatus('idle');
    setLiveTalkOpen(true);
  };

  const toggleAssistant = () => {
    setAssistantOpen((prev) => {
      if (!prev) setAssistantError('');
      return !prev;
    });
  };

  const micButtonClass =
    micState === 'recording'
      ? 'flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/60 bg-rose-500/10 text-rose-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300'
        : micState !== 'idle'
        ? 'flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/60 bg-amber-500/10 text-amber-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300'
        : 'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300';

  const micStatusText = language === 'uz'
    ? ({ idle: '', recording: 'Tinglanmoqda…', unsupported: 'Bu brauzerda ovozli kiritish yo‘q', permission: 'Mikrofon ruxsati berilmadi', network: 'Ovoz xizmati bilan aloqa yo‘q', 'no-speech': 'Ovoz aniqlanmadi', language: 'Bu tilda ovozli kiritish qo‘llab-quvvatlanmaydi', error: 'Ovozli kiritishda xatolik' } as const)[micState]
    : language === 'ru'
      ? ({ idle: '', recording: 'Слушаю…', unsupported: 'Голосовой ввод не поддерживается', permission: 'Нет доступа к микрофону', network: 'Нет связи со службой распознавания', 'no-speech': 'Речь не обнаружена', language: 'Этот язык не поддерживается распознаванием речи', error: 'Ошибка голосового ввода' } as const)[micState]
      : ({ idle: '', recording: 'Listening…', unsupported: 'Voice input is not supported', permission: 'Microphone permission was denied', network: 'Speech service is unavailable', 'no-speech': 'No speech was detected', language: 'Speech recognition is unavailable for this language', error: 'Voice input failed' } as const)[micState];

  const micStatusColor =
    micState === 'recording'
      ? 'text-rose-300'
      : micState !== 'idle'
        ? 'text-amber-300'
        : 'text-slate-400';

  const assistantPlaceholder =
    language === 'uz' ? 'Savolingizni yozing...' : language === 'ru' ? 'Напишите ваш вопрос...' : 'Ask about the platform...';

  const stopRecordingLabel = micState === 'recording' ? 'Stop microphone recording' : 'Start microphone recording';
  const micTitle = micState === 'recording' ? 'Stop recording' : 'Record voice';

  const liveTalkCopy = language === 'uz'
    ? { title: 'Jonli AI suhbat', subtitle: 'Mikrofon orqali gaplashing', start: 'Suhbatni boshlash', ready: 'Boshlashga tayyor', listening: 'Sizni tinglayapman…', thinking: 'Javob tayyorlanmoqda…', speaking: 'AI gapiryapti…', muted: 'Mikrofon o‘chirilgan', unsupported: 'Ovoz funksiyasi qo‘llab-quvvatlanmaydi', permission: 'Mikrofon ruxsati kerak', language: 'Bu til brauzerda mavjud emas', error: 'Ovozli suhbatda xatolik', mute: 'Mikrofonni o‘chirish', unmute: 'Mikrofonni yoqish', interrupt: 'To‘xtatib, gapirish', end: 'Suhbatni tugatish', back: 'Matnli chatga qaytish' }
    : language === 'ru'
      ? { title: 'Живой разговор с ИИ', subtitle: 'Говорите через микрофон', start: 'Начать разговор', ready: 'Готов к началу', listening: 'Слушаю вас…', thinking: 'Готовлю ответ…', speaking: 'ИИ говорит…', muted: 'Микрофон выключен', unsupported: 'Голосовые функции не поддерживаются', permission: 'Нужен доступ к микрофону', language: 'Язык недоступен в браузере', error: 'Ошибка голосового разговора', mute: 'Выключить микрофон', unmute: 'Включить микрофон', interrupt: 'Прервать и говорить', end: 'Завершить разговор', back: 'Вернуться к чату' }
      : { title: 'Live AI Talk', subtitle: 'Talk naturally with the assistant', start: 'Start conversation', ready: 'Ready to start', listening: 'Listening to you…', thinking: 'Preparing a reply…', speaking: 'AI is speaking…', muted: 'Microphone muted', unsupported: 'Voice features are not supported', permission: 'Microphone permission is needed', language: 'This language is unavailable in the browser', error: 'Voice conversation error', mute: 'Mute microphone', unmute: 'Unmute microphone', interrupt: 'Interrupt and speak', end: 'End conversation', back: 'Return to text chat' };

  const liveTalkStatusText = ({
    idle: liveTalkCopy.ready,
    listening: liveTalkCopy.listening,
    thinking: liveTalkCopy.thinking,
    speaking: liveTalkCopy.speaking,
    muted: liveTalkCopy.muted,
    unsupported: liveTalkCopy.unsupported,
    permission: liveTalkCopy.permission,
    language: liveTalkCopy.language,
    error: liveTalkCopy.error,
  } as const)[liveTalkStatus];

  const panelContent = assistantOpen ? (
    createPortal(
      <div
        className="pointer-events-auto fixed inset-0 z-[130] flex items-center justify-center px-3 py-4 sm:block sm:p-0"
        aria-hidden={!assistantOpen}
      >
        <div
        style={viewportWidth >= 640 ? {
            position: 'fixed',
            right: chatWindowRect.right,
            bottom: chatWindowRect.bottom,
            width: chatWindowRect.width,
            height: chatWindowRect.height,
            minWidth: getChatWindowLimits().minWidth,
            minHeight: getChatWindowLimits().minHeight,
            maxWidth: getChatWindowLimits().maxWidth,
            maxHeight: getChatWindowLimits().maxHeight,
          } : { width: 'min(92vw, 420px)', height: 'min(82dvh, 680px)' }}
          className="relative flex min-w-0 items-stretch justify-center"
        >
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/90 shadow-[0_24px_70px_rgba(15,23,42,0.78)] backdrop-blur-xl sm:rounded-[32px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-3">
                <AssistantVideoAvatar active={assistantOpen} className="h-10 w-10" />
                <div>
                  <p className="text-sm font-semibold text-slate-50">ZiyoTech AI</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/80">Platform assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssistantOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-300/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                aria-label="Close chat assistant"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {liveTalkOpen ? (
              <section className="flex min-h-0 flex-1 flex-col items-center justify-between overflow-y-auto px-5 py-6 text-center sm:px-7" aria-label={liveTalkCopy.title}>
                <div className="flex w-full items-center justify-between text-left">
                  <div>
                    <p className="text-sm font-semibold text-slate-50">{liveTalkCopy.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{liveTalkCopy.subtitle}</p>
                  </div>
                  <AudioLines className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                </div>

                <div className="flex w-full flex-col items-center py-5">
                  <div className="mb-7 flex h-36 w-36 items-center justify-center rounded-full border border-cyan-300/20 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-indigo-500/20 shadow-[0_0_70px_rgba(34,211,238,0.12)]">
                    <div className="flex h-20 items-center justify-center gap-1.5" aria-hidden="true">
                      {Array.from({ length: 17 }, (_, index) => (
                        <span
                          key={index}
                          className={`w-1 rounded-full bg-gradient-to-t from-cyan-400 to-blue-300 ${['listening', 'speaking'].includes(liveTalkStatus) ? 'animate-bounce motion-reduce:animate-none' : liveTalkStatus === 'thinking' ? 'animate-pulse' : ''}`}
                          style={{ height: `${14 + Math.abs(8 - index) % 5 * 9}px`, animationDelay: `${index * 45}ms`, animationDuration: `${600 + (index % 4) * 120}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-cyan-100" aria-live="polite">{liveTalkStatusText}</p>
                  {liveTalkTranscript && (
                    <div className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-left">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">{language === 'uz' ? 'Siz aytdingiz' : language === 'ru' ? 'Вы сказали' : 'You said'}</p>
                      <p className="text-sm leading-6 text-slate-200">{liveTalkTranscript}</p>
                    </div>
                  )}
                  {liveTalkReply && (
                    <div className="mt-2 w-full rounded-2xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-3 text-left">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-cyan-300/70">ZiyoTech AI</p>
                      <p className="text-sm leading-6 text-slate-100">{liveTalkReply}</p>
                      {getAssistantPortfolioProjects(liveTalkProjectIds).length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {getAssistantPortfolioProjects(liveTalkProjectIds).map((project) => {
                            const title = project.id === 'ai-pecs' ? 'AI PECS — AI Plant Equipment Controlling System' : project.title;
                            const description = project.id === 'ai-pecs'
                              ? language === 'uz' ? 'AI Plant Equipment Controlling System — zavod uskunalarini boshqarish tizimi.' : language === 'ru' ? 'AI Plant Equipment Controlling System — система управления промышленным оборудованием.' : 'AI Plant Equipment Controlling System for plant equipment control.'
                              : project.description[language];
                            return (
                              <article key={project.id} className="min-w-0 overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-slate-900 to-slate-950 text-left shadow-lg shadow-slate-950/30">
                                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-950 sm:h-52">
                                  <img src={project.image} alt={`${title} portfolio thumbnail`} className="h-full w-full object-contain" loading="eager" decoding="async" />
                                  <span className="absolute left-2 top-2 rounded-full border border-cyan-200/20 bg-slate-950/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-100">
                                    {language === 'uz' ? 'Yakunlangan davlat loyihasi' : language === 'ru' ? 'Завершённый государственный проект' : 'Completed government project'}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <h3 className="text-sm font-semibold leading-5 text-white">{title}</h3>
                                  <p className="mt-1.5 text-xs leading-5 text-slate-300">{description}</p>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {liveTalkError && <p className="mt-3 max-w-sm text-xs leading-5 text-amber-200" role="alert">{liveTalkError}</p>}
                </div>

                <div className="w-full">
                  {liveTalkStatus === 'idle' ? (
                    <button type="button" onClick={startLiveTalk} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                      <Mic className="h-4 w-4" />{liveTalkCopy.start}
                    </button>
                  ) : liveTalkStatus === 'error' || liveTalkStatus === 'permission' || liveTalkStatus === 'language' ? (
                    <button type="button" onClick={startLiveTalk} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-semibold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                      <Mic className="h-4 w-4" />{language === 'uz' ? 'Qayta urinish' : language === 'ru' ? 'Повторить' : 'Try again'}
                    </button>
                  ) : ['listening', 'thinking', 'speaking', 'muted'].includes(liveTalkStatus) ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={toggleLiveMute} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 text-xs font-medium text-slate-100 transition hover:border-cyan-300/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                        <Mic className="h-4 w-4" />{liveMutedRef.current ? liveTalkCopy.unmute : liveTalkCopy.mute}
                      </button>
                      <button type="button" onClick={interruptLiveSpeech} disabled={liveTalkStatus !== 'speaking'} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-3 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                        <Square className="h-3.5 w-3.5 fill-current" />{liveTalkCopy.interrupt}
                      </button>
                    </div>
                  ) : null}
                  {liveSpeechActiveRef.current && ['error', 'permission', 'language'].includes(liveTalkStatus) && (
                    <button type="button" onClick={interruptLiveSpeech} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-3 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                      <Square className="h-3.5 w-3.5 fill-current" />{liveTalkCopy.interrupt}
                    </button>
                  )}
                  <button type="button" onClick={liveTalkStatus === 'idle' || liveTalkStatus === 'unsupported' ? () => setLiveTalkOpen(false) : endLiveTalk} className="mt-2 min-h-10 w-full rounded-xl px-3 text-xs text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                    {liveTalkStatus === 'idle' || liveTalkStatus === 'unsupported' ? liveTalkCopy.back : liveTalkCopy.end}
                  </button>
                </div>
              </section>
            ) : <>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-4 sm:py-4" role="log" aria-live="polite" aria-label="Conversation">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-200">
                  {language === 'uz' ? 'Yordam' : language === 'ru' ? 'Помощь' : 'Assistant'}
                </div>
              </div>

              {messages.map((message) => {
                const portfolioProjects = message.role === 'assistant'
                  ? getAssistantPortfolioProjects(message.portfolioProjectIds)
                  : [];
                const hasPortfolioCards = portfolioProjects.length > 0;
                return (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`${hasPortfolioCards ? 'w-full max-w-full' : 'max-w-[85%]'} min-w-0 rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${
                        message.role === 'user'
                          ? 'rounded-br-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'rounded-bl-md border border-white/10 bg-slate-900/80 text-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      {portfolioProjects.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {portfolioProjects.map((project) => {
                            const title = project.id === 'ai-pecs'
                              ? 'AI PECS — AI Plant Equipment Controlling System'
                              : project.id === 'learnexa'
                                ? 'Learnexa'
                                : project.title;
                            const description = project.id === 'ai-pecs'
                              ? language === 'uz'
                                ? 'AI Plant Equipment Controlling System — zavod uskunalarini boshqarish tizimi.'
                                : language === 'ru'
                                  ? 'AI Plant Equipment Controlling System — система управления промышленным оборудованием.'
                                  : 'AI Plant Equipment Controlling System for plant equipment control.'
                              : project.description[language];
                            return (
                              <article key={project.id} className="min-w-0 overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-slate-900 to-slate-950 shadow-lg shadow-slate-950/30">
                                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-950 sm:h-52">
                                  <img src={project.image} alt={`${title} portfolio thumbnail`} className="h-full w-full object-contain" loading="eager" />
                                  <span className="absolute left-2 top-2 rounded-full border border-cyan-200/20 bg-slate-950/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cyan-100">
                                    {language === 'uz' ? 'Yakunlangan davlat loyihasi' : language === 'ru' ? 'Завершённый государственный проект' : 'Completed government project'}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <h3 className="text-sm font-semibold leading-5 text-white">{title}</h3>
                                  <p className="mt-1.5 text-xs leading-5 text-slate-300">{description}</p>
                                </div>
                              </article>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              setAssistantOpen(false);
                              onNavigate('portfolio');
                            }}
                            className="col-span-full justify-self-start rounded-lg border border-cyan-300/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                          >
                            {language === 'uz' ? 'Portfolio bo‘limini ko‘rish' : language === 'ru' ? 'Открыть раздел портфолио' : 'Explore the Portfolio section'}
                          </button>
                        </div>
                      )}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 grid max-w-[220px] grid-cols-2 gap-2">
                          {message.attachments.map((image, index) => (
                            <img key={`${image.previewUrl}-${index}`} src={image.previewUrl} alt="User attached image" className="h-16 w-full rounded-xl object-cover" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start" aria-live="polite" aria-label="Assistant is typing">
                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-slate-900/80 px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" style={{ animationDelay: '0.15s' }} />
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}

              {assistantError && (
                <div className="mt-2 flex justify-start" role="alert">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm leading-5 text-amber-100">
                    {assistantError}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-slate-900/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-3">
              {selectedFiles.length > 0 && (
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {selectedFiles.map((image) => (
                    <div key={image.id} className="relative">
                      <img src={image.previewUrl} alt="Selected image preview" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                      <button
                        type="button"
                        aria-label="Remove attachment"
                        onClick={() => {
                          const next = selectedFiles.filter((item) => item.id !== image.id);
                          URL.revokeObjectURL(image.previewUrl);
                          previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== image.previewUrl);
                          setSelectedFiles(next);
                        }}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[10px] text-white ring-1 ring-white/10"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-slate-900/90 p-2 shadow-inner shadow-slate-950/40">
                <div className="flex gap-1.5">
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFilesSelected} />
                  <button
                    type="button"
                    aria-label="Add image attachment"
                    title="Add image attachment"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={stopRecordingLabel}
                    title={micTitle}
                    className={micButtonClass}
                    onClick={handleMicToggle}
                  >
                    {micState === 'recording' ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    aria-label="Start Live AI Talk"
                    title="Live AI Talk"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={openLiveTalk}
                    disabled={isTyping || selectedFiles.length > 0}
                  >
                    <AudioLines className="h-4 w-4" />
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={assistantPlaceholder}
                  rows={1}
                  className="max-h-28 min-h-[42px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Type message"
                />

                <button
                  type="button"
                  onClick={handleSend}
                  aria-label="Send message"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_8px_18px_rgba(59,130,246,0.4)] transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isTyping || (!inputValue.trim() && selectedFiles.length === 0)}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {micState !== 'idle' && (
                <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                  <span className={micStatusColor} aria-live="polite">{micStatusText}</span>
                </div>
              )}
            </div>
            </>}
          </div>
          {viewportWidth >= 640 && <>
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 'n')} className="absolute inset-x-4 top-0 z-20 h-2 cursor-ns-resize hover:bg-cyan-300/10" />
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 'e')} className="absolute inset-y-4 right-0 z-20 w-2 cursor-ew-resize hover:bg-cyan-300/10" />
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 's')} className="absolute inset-x-4 bottom-0 z-20 h-2 cursor-ns-resize hover:bg-cyan-300/10" />
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 'w')} className="absolute inset-y-4 left-0 z-20 w-2 cursor-ew-resize hover:bg-cyan-300/10" />
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 'nw')} className="absolute left-0 top-0 z-30 h-4 w-4 cursor-nwse-resize" />
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 'ne')} className="absolute right-0 top-0 z-30 h-4 w-4 cursor-nesw-resize" />
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 'sw')} className="absolute bottom-0 left-0 z-30 h-4 w-4 cursor-nesw-resize" />
            <div aria-hidden="true" onPointerDown={(event) => beginChatResize(event, 'se')} className="absolute bottom-0 right-0 z-30 h-5 w-5 cursor-nwse-resize rounded-br-[32px] border-b-2 border-r-2 border-cyan-200/50 transition-colors hover:border-cyan-100" />
          </>}
          </div>
        </div>,
      document.body
    )
  ) : null;

  return (
    <>
      {panelContent}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] sm:bottom-5 sm:right-5">
      <ProfessionalRobotButton
        onClick={toggleAssistant}
        isOpen={assistantOpen}
        assistantStatus={liveTalkOpen ? liveTalkStatus : assistantError ? 'error' : isTyping ? 'thinking' : micState === 'recording' ? 'listening' : micState === 'idle' ? 'idle' : 'error'}
        ariaLabel={`${assistantOpen ? 'Minimize' : 'Restore'} ZiyoTech AI assistant${liveTalkOpen ? `, ${liveTalkStatus}` : ''}`}
      />
      </div>
    </>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('web-dev');

  const getServiceIdFromPath = (path: string) => {
    if (path.startsWith('/services/')) {
      return path.split('/services/')[1].split('/')[0] || undefined;
    }

    if (path.startsWith('/service-detail/')) {
      return path.split('/service-detail/')[1].split('/')[0] || undefined;
    }

    return undefined;
  };

  const getServiceRoute = (serviceId?: string) => {
    if (!serviceId) return '/services';
    return `/services/${serviceId}`;
  };

  const getSelectedSalesBusiness = () => {
    if (typeof window === 'undefined') return null;

    try {
      const rawValue = localStorage.getItem('ziyo-sales-business');
      if (!rawValue) return null;
      const parsed = JSON.parse(rawValue);
      return parsed && typeof parsed.id === 'string' ? parsed : null;
    } catch (error) {
      return null;
    }
  };

  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(() => getSelectedSalesBusiness()?.id || 'demo-business');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const savedBusiness = getSelectedSalesBusiness();
    if (savedBusiness?.id) {
      setSelectedBusinessId(savedBusiness.id);
    }
  }, []);

  const persistSelectedSalesBusiness = (businessId?: string, businessName?: string) => {
    if (typeof window === 'undefined') return;

    if (!businessId) {
      localStorage.removeItem('ziyo-sales-business');
      setSelectedBusinessId('demo-business');
      return;
    }

    const nextValue = {
      id: businessId,
      name: businessName || 'Business account',
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('ziyo-sales-business', JSON.stringify(nextValue));
    setSelectedBusinessId(businessId);
  };

  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window === 'undefined') return 'home';

    const path = window.location.pathname;
    const serviceIdFromPath = getServiceIdFromPath(path);

    if (serviceIdFromPath) {
      setSelectedServiceId(serviceIdFromPath);
      return 'service-detail';
    }

    if (path === '/admin') return 'admin-login';
    if (path === '/app' || path.startsWith('/app/')) return 'platform';
    if (path === '/account') return 'account';
    if (path === '/privacy-policy') return 'privacy-policy';
    if (path === '/terms-of-service') return 'terms-of-service';
    if (path === '/products' || path === '/ai-sales-agent') return 'product-sales-agent';
    if (path === '/services' || path === '/service-detail') return 'services';
    if (path === '/ai-solutions') return 'ai-solutions';
    if (path === '/about') return 'about';
    if (path === '/portfolio') return 'portfolio';
    if (path === '/contact') return 'contact';
    if (path === '/sales-ai') return 'sales-ai';
    return 'home';
  });

  useLayoutEffect(() => {
    if (!['contact', 'privacy-policy', 'terms-of-service'].includes(currentPage)) return;

    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => window.cancelAnimationFrame(frame);
  }, [currentPage]);

  useEffect(() => {
    const syncPageFromLocation = () => {
      if (typeof window === 'undefined') return;

      const path = window.location.pathname;
      const serviceIdFromPath = getServiceIdFromPath(path);

      if (path === '/contact') {
        setCurrentPage('contact');
        window.scrollTo(0, 0);
        window.requestAnimationFrame(() => window.scrollTo(0, 0));
        return;
      }

      if (path === '/privacy-policy' || path === '/terms-of-service') {
        setCurrentPage(path === '/privacy-policy' ? 'privacy-policy' : 'terms-of-service');
        window.scrollTo(0, 0);
        window.requestAnimationFrame(() => window.scrollTo(0, 0));
        return;
      }

      if (serviceIdFromPath) {
        setSelectedServiceId(serviceIdFromPath);
        setCurrentPage('service-detail');
        return;
      }

      if (path === '/admin') {
        setCurrentPage('admin-login');
        setIsAdminAuthenticated(false);
        void hasAuthenticatedAdminSession().then((allowed) => {
          if (allowed && window.location.pathname === path) {
            setIsAdminAuthenticated(true);
            setCurrentPage('platform');
            window.history.replaceState({}, '', '/app');
          }
        });
        return;
      }

      if (path === '/app' || path.startsWith('/app/')) {
        setCurrentPage('platform');
        setIsAdminAuthenticated(false);
        void hasAuthenticatedAdminSession().then((allowed) => {
          if (!window.location.pathname.startsWith('/app')) return;
          setIsAdminAuthenticated(allowed);
          if (!allowed) {
            setCurrentPage('admin-login');
            window.history.replaceState({}, '', '/admin');
          }
        });
        return;
      }

      if (path === '/sales-ai-admin') {
        window.history.replaceState({}, '', '/admin');
        setCurrentPage('admin-login');
        setIsAdminAuthenticated(false);
        void hasAuthenticatedAdminSession().then((allowed) => {
          if (allowed && window.location.pathname === '/admin') {
            setIsAdminAuthenticated(true);
            setCurrentPage('platform');
            window.history.replaceState({}, '', '/app');
          }
        });
        return;
      }

      if (path === '/account') setCurrentPage('account');
      else if (path === '/privacy-policy') setCurrentPage('privacy-policy');
      else if (path === '/terms-of-service') setCurrentPage('terms-of-service');
      else if (path === '/products' || path === '/ai-sales-agent') setCurrentPage('product-sales-agent');
      else if (path === '/services' || path === '/service-detail') setCurrentPage('services');
      else if (path === '/ai-solutions') setCurrentPage('ai-solutions');
      else if (path === '/about') setCurrentPage('about');
      else if (path === '/portfolio') setCurrentPage('portfolio');
      else if (path === '/contact') setCurrentPage('contact');
      else if (path === '/sales-ai') setCurrentPage('sales-ai');
      else if (path === '/sales-ai-admin') setCurrentPage('sales-ai-admin');
      else if (path === '/sales-ai-operations') setCurrentPage('sales-ai-operations');
      else if (path === '/sales-ai-login') setCurrentPage('sales-ai-login');
      else if (path === '/sales-ai-onboarding') setCurrentPage('sales-ai-onboarding');
      else setCurrentPage('home');
    };

    window.addEventListener('popstate', syncPageFromLocation);
    syncPageFromLocation();

    const onAdminSessionExpired = () => {
      setIsAdminAuthenticated(false);
      setCurrentPage('admin-login');
      if (window.location.pathname !== '/admin') window.history.pushState({}, '', '/admin');
    };
    window.addEventListener('ziyotech-admin-session-expired', onAdminSessionExpired);

    return () => {
      window.removeEventListener('popstate', syncPageFromLocation);
      window.removeEventListener('ziyotech-admin-session-expired', onAdminSessionExpired);
    };
  }, []);

  const navigateTo = (url: string, nextPage: string) => {
    setCurrentPage(nextPage);
    if (nextPage === 'contact' || nextPage === 'privacy-policy' || nextPage === 'terms-of-service') window.scrollTo(0, 0);
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleNavigate = (page: string, serviceId?: string) => {
    const resolvedServiceId = serviceId || (page === 'service-detail' ? selectedServiceId : undefined);

    if (resolvedServiceId) {
      setSelectedServiceId(resolvedServiceId);
    }

    if (page === 'platform') {
      void hasAuthenticatedAdminSession().then((allowed) => {
        setIsAdminAuthenticated(allowed);
        setCurrentPage(allowed ? 'platform' : 'admin-login');
        navigateTo(allowed ? '/app' : '/admin', allowed ? 'platform' : 'admin-login');
      });
      return;
    }

    if (page === 'admin-login') {
      setCurrentPage('admin-login');
      setIsAdminAuthenticated(false);
      navigateTo('/admin', 'admin-login');
      return;
    }

    if (page === 'service-detail') {
      const targetServiceId = resolvedServiceId || selectedServiceId;
      setCurrentPage('service-detail');
      setSelectedServiceId(targetServiceId);
      navigateTo(getServiceRoute(targetServiceId), 'service-detail');
      return;
    }

    const routeMap: Record<string, string> = {
      home: '/',
      services: '/services',
      'ai-solutions': '/ai-solutions',
      'product-sales-agent': '/products',
      about: '/about',
      portfolio: '/portfolio',
      contact: '/contact',
      'sales-ai': '/sales-ai',
      'sales-ai-admin': '/sales-ai-admin',
      'sales-ai-operations': '/sales-ai-operations',
      'sales-ai-login': '/sales-ai-login',
      'sales-ai-onboarding': '/sales-ai-onboarding',
      account: '/account',
      'privacy-policy': '/privacy-policy',
      'terms-of-service': '/terms-of-service',
    };

    const nextRoute = routeMap[page] || '/';
    setCurrentPage(page);
    navigateTo(nextRoute, page);
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setCurrentPage('platform');
    window.history.pushState({}, '', '/app');
  };

  const handleAdminLogout = async (): Promise<boolean> => {
    try {
      const sessionResponse = await fetch(`${ASSISTANT_API_BASE}/api/admin/session`, { credentials: 'include' });
      if (sessionResponse.ok) {
        const session = await sessionResponse.json().catch(() => ({})) as { csrfToken?: string };
        const response = await fetch(`${ASSISTANT_API_BASE}/api/admin/logout`, {
          method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': session.csrfToken || '' },
        });
        if (!response.ok && response.status !== 401) return false;
      } else {
        const csrfCookie = document.cookie.split('; ').find((part) => /(?:^|__Host-)ziyo_csrf=/.test(part));
        const csrfToken = decodeURIComponent(csrfCookie?.slice(csrfCookie.indexOf('=') + 1) || '');
        if (csrfToken) {
          const response = await fetch(`${ASSISTANT_API_BASE}/api/auth/logout`, {
            method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': csrfToken },
          });
          if (!response.ok && response.status !== 401) return false;
        }
      }
      setIsAdminAuthenticated(false);
      setCurrentPage('admin-login');
      window.history.pushState({}, '', '/admin');
      return true;
    } catch {
      return false;
    }
  };

  const handleSalesLogin = () => {
    setIsAdminAuthenticated(true);
    const savedBusiness = getSelectedSalesBusiness();
    if (savedBusiness?.id) {
      setSelectedBusinessId(savedBusiness.id);
      setCurrentPage('sales-ai-admin');
      navigateTo('/sales-ai-admin', 'sales-ai-admin');
      return;
    }

    setCurrentPage('sales-ai-onboarding');
    navigateTo('/sales-ai-onboarding', 'sales-ai-onboarding');
  };

  const handleSalesOnboard = (businessId?: string, businessName?: string) => {
    persistSelectedSalesBusiness(businessId, businessName);
    setCurrentPage('sales-ai-admin');
    navigateTo('/sales-ai-admin', 'sales-ai-admin');
  };

  const handleBackToSite = () => {
    setCurrentPage('home');
    setIsAdminAuthenticated(false);
    window.history.pushState({}, '', '/');
  };

  const renderContent = () => {
    if (currentPage === 'admin-login') {
      return <AdminLoginView onBackToSite={() => handleNavigate('home')} onLogin={handleAdminLogin} />;
    }

    if (currentPage === 'platform' && !isAdminAuthenticated) {
      return <AdminLoginView onBackToSite={() => handleNavigate('home')} onLogin={handleAdminLogin} />;
    }

    if (currentPage === 'platform') {
      return <PlatformLayout onBackToSite={handleBackToSite} onLogout={handleAdminLogout} />;
    }

    if (['sales-ai-admin', 'sales-ai-operations'].includes(currentPage) && !isAdminAuthenticated) {
      return <AdminLoginView onBackToSite={() => handleNavigate('home')} onLogin={() => setIsAdminAuthenticated(true)} />;
    }

    switch (currentPage) {
      case 'account':
        return <UserAccountPage onClose={() => handleNavigate('home')} />;
      case 'privacy-policy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case 'terms-of-service':
        return <TermsOfServicePage onNavigate={handleNavigate} />;
      case 'product-sales-agent':
        return <ProductSalesAgentPage onNavigate={handleNavigate} />;
      case 'service-detail':
        return <ServiceDetailPage serviceId={selectedServiceId} onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesSection onNavigate={handleNavigate} />;
      case 'ai-solutions':
        return <AiSolutionsSection onNavigate={handleNavigate} />;
      case 'about':
        return <AboutSection onNavigate={handleNavigate} />;
      case 'portfolio':
        return <PortfolioSection onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactSection />;
      case 'sales-ai':
        return <SalesAiDashboard businessId={selectedBusinessId} />;
      case 'sales-ai-admin':
        return <SalesAiAdmin businessId={selectedBusinessId} />;
      case 'sales-ai-operations':
        return <SalesAiOperations businessId={selectedBusinessId} />;
      case 'sales-ai-login':
        return <SalesAiLogin onLogin={handleSalesLogin} />;
      case 'sales-ai-onboarding':
        return <SalesAiOnboarding onContinue={handleSalesOnboard} />;
      default:
        return <PublicHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark' : 'light'}>
      {!['platform', 'admin-login'].includes(currentPage) && (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      <main className={`min-h-screen bg-[#080C14] text-slate-100 ${['platform', 'admin-login'].includes(currentPage) ? '' : 'pt-20 sm:pt-24'}`}>
        {renderContent()}
      </main>

      {!['platform', 'admin-login'].includes(currentPage) && <Footer onNavigate={handleNavigate} />}

      {!['platform', 'admin-login'].includes(currentPage) && <FloatingPlatformAssistant onNavigate={handleNavigate} />}
      <VisitorAnalyticsTracker />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <PlatformProvider>
          <AppContent />
        </PlatformProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
