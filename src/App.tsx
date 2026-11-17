/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PlatformProvider } from './context/PlatformContext';
import { Header } from './components/public/Header';
import { Footer } from './components/public/Footer';
import { PublicHome } from './pages/PublicHome';
import { ProductSalesAgentPage } from './pages/ProductSalesAgentPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PlatformLayout } from './components/platform/PlatformLayout';
import { ServicesSection } from './components/public/ServicesSection';
import { AiSolutionsSection } from './components/public/AiSolutionsSection';
import { AboutSection } from './components/public/AboutSection';
import { PortfolioSection } from './components/public/PortfolioSection';
import { ContactSection } from './components/public/ContactSection';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Mic, Paperclip, Send, Sparkles, X, Image as ImageIcon, Square } from 'lucide-react';
import { AdminLoginView } from './components/platform/AdminLoginView';
import SalesAiDashboard from './pages/SalesAiDashboard';
import SalesAiAdmin from './pages/SalesAiAdmin';
import SalesAiOperations from './pages/SalesAiOperations';
import SalesAiLogin from './pages/SalesAiLogin';
import SalesAiOnboarding from './pages/SalesAiOnboarding';

type AppLanguage = 'uz' | 'ru' | 'en';
type AssistantMessageRole = 'assistant' | 'user';

type AssistantMessage = {
  id: string;
  role: AssistantMessageRole;
  text: string;
  attachments?: string[];
  timestamp: string;
};

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

const ProfessionalRobotIcon = () => (
  <svg viewBox="0 0 96 96" className="h-8 w-8 drop-shadow-[0_3px_8px_rgba(96,165,250,0.35)]" aria-hidden="true">
    <defs>
      <linearGradient id="robotBodyProfessional" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="45%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#93c5fd" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="20" r="7" fill="#7dd3fc" />
    <path d="M48 7 L48 0" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 10 V 22" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
    <rect x="20" y="22" width="56" height="46" rx="16" fill="url(#robotBodyProfessional)" stroke="#f8fbff" strokeWidth="3" />
    <circle cx="38" cy="42" r="6" fill="#0f172a" />
    <circle cx="58" cy="42" r="6" fill="#0f172a" />
    <circle cx="36" cy="40" r="2" fill="#ffffff" />
    <circle cx="56" cy="40" r="2" fill="#ffffff" />
    <path d="M42 54 Q48 60 54 54" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M28 18 L38 8" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
    <path d="M68 18 L58 8" stroke="#7dd3fc" strokeWidth="4" strokeLinecap="round" />
    <path d="M32 70 L24 82" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
    <path d="M64 70 L72 82" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
    <circle cx="24" cy="84" r="5" fill="#bfdbfe" />
    <circle cx="72" cy="84" r="5" fill="#bfdbfe" />
  </svg>
);

const PremiumAiOrbIcon = () => (
  <svg viewBox="0 0 96 96" className="h-8 w-8 drop-shadow-[0_6px_14px_rgba(59,130,246,0.28)]" aria-hidden="true">
    <defs>
      <linearGradient id="premiumAiOrbGradient" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="55%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="48" r="31" fill="url(#premiumAiOrbGradient)" opacity="0.18" />
    <circle cx="48" cy="48" r="25" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
    <path d="M48 18V78M18 48H78M30 30L66 66M66 30L30 66" stroke="rgba(224,242,254,0.92)" strokeLinecap="round" strokeWidth="3.2" />
    <circle cx="48" cy="48" r="9" fill="rgba(224,242,254,0.95)" />
    <circle cx="48" cy="18" r="5" fill="#dbeafe" />
    <circle cx="48" cy="78" r="5" fill="#dbeafe" />
    <circle cx="18" cy="48" r="5" fill="#dbeafe" />
    <circle cx="78" cy="48" r="5" fill="#dbeafe" />
    <circle cx="30" cy="30" r="5" fill="#e0f2fe" />
    <circle cx="66" cy="66" r="5" fill="#e0f2fe" />
    <circle cx="66" cy="30" r="5" fill="#e0f2fe" />
    <circle cx="30" cy="66" r="5" fill="#e0f2fe" />
  </svg>
);

const ProfessionalRobotButton = ({ onClick, isOpen, ariaLabel }: { onClick: () => void; isOpen?: boolean; ariaLabel: string }) => (
  <button
    onClick={onClick}
    className={`pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 sm:h-15 sm:w-15 ${
      isOpen
        ? 'border-cyan-200/60 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_12px_28px_rgba(56,189,248,0.28)]'
        : 'border-cyan-300/40 bg-gradient-to-br from-slate-900 via-sky-600 to-blue-600 shadow-[0_12px_28px_rgba(59,130,246,0.36)]'
    } text-white hover:scale-[1.03] hover:shadow-[0_16px_30px_rgba(59,130,246,0.42)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
    aria-label={ariaLabel}
    title="Open ZiyoTech AI Platform Assistant"
    type="button"
  >
    <span className="absolute -top-1.5 right-2 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
    <ProfessionalRobotIcon />
  </button>
);

function FloatingPlatformAssistant({ onNavigate }: { onNavigate: (page: string, serviceId?: string) => void }) {
  const { language } = useLanguage();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hi! I can help you explore ZiyoTech services, website development, AI automation, and digital growth strategy.',
      timestamp: 'Now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [micState, setMicState] = useState<'idle' | 'recording' | 'unsupported' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, assistantOpen]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [inputValue, assistantOpen]);

  useEffect(() => {
    return () => {
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

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed && selectedFiles.length === 0) return;

    const nextUserMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed || 'Shared image(s)',
      attachments: selectedFiles.length ? selectedFiles : undefined,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, nextUserMessage]);
    setInputValue('');
    setSelectedFiles([]);
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: replyFromPrompt(trimmed || 'website development service'),
          timestamp: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const previews = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => URL.createObjectURL(file));

    previewUrlsRef.current = [...previewUrlsRef.current, ...previews].slice(0, 6);
    setSelectedFiles((prev) => [...prev, ...previews].slice(0, 3));
    event.target.value = '';
  };

  const clearAttachmentPreviews = () => {
    selectedFiles.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    });
    previewUrlsRef.current = previewUrlsRef.current.filter((url) => !selectedFiles.includes(url));
    setSelectedFiles([]);
  };

  const handleMicToggle = async () => {
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices?.getUserMedia) {
      setMicState('unsupported');
      return;
    }

    if (micState === 'recording') {
      setMicState('idle');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicState('recording');
    } catch (error) {
      setMicState('error');
    }
  };

  const routeVoiceQuery = (query: string) => {
    const normalized = normalizeText(query);
    if (!normalized) return;

    const routeMap = [
      { keywords: ['website', 'web', 'website development', 'landing page', 'site'], page: 'service-detail', serviceId: 'web-dev' },
      { keywords: ['e-commerce', 'shop', 'store', 'commerce'], page: 'service-detail', serviceId: 'ecommerce' },
      { keywords: ['ai agent', 'automation', 'chatbot', 'ai solutions'], page: 'service-detail', serviceId: 'ai-agents' },
      { keywords: ['social media', 'smm', 'content'], page: 'service-detail', serviceId: 'social-media' },
      { keywords: ['branding', 'design', 'creative'], page: 'service-detail', serviceId: 'branding' },
      { keywords: ['marketing', 'digital marketing'], page: 'service-detail', serviceId: 'digital-marketing' },
      { keywords: ['services', 'service', 'xizmatlar', 'xizmat', 'what do you do', 'what services', 'nima qilasiz'], page: 'services' },
    ];

    const match = routeMap.find(({ keywords }) =>
      keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
    );

    if (match) {
      onNavigate(match.page, match.serviceId);
      return;
    }

    onNavigate('services');
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    speakAssistantPrompt(language);

    if (!SpeechRecognition) {
      setMicState('unsupported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getRecognitionLanguage(language);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setAssistantOpen(true);
      setMicState('recording');
    };
    recognition.onresult = (event: any) => {
      const spokenText = event.results?.[0]?.[0]?.transcript || '';
      if (spokenText) {
        routeVoiceQuery(spokenText);
      }
    };
    recognition.onerror = () => {
      setMicState('error');
    };
    recognition.onend = () => {
      setMicState('idle');
    };

    recognition.start();
  };

  const toggleAssistant = () => {
    setAssistantOpen((prev) => !prev);
    setMicState('idle');
  };

  const micButtonClass =
    micState === 'recording'
      ? 'flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/60 bg-rose-500/10 text-rose-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300'
      : micState === 'unsupported' || micState === 'error'
        ? 'flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/60 bg-amber-500/10 text-amber-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300'
        : 'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300';

  const micStatusText =
    micState === 'recording'
      ? 'Recording'
      : micState === 'unsupported'
        ? 'Voice unavailable'
        : micState === 'error'
          ? 'Permission denied'
          : 'Voice ready';

  const micStatusColor =
    micState === 'recording'
      ? 'text-rose-300'
      : micState === 'unsupported' || micState === 'error'
        ? 'text-amber-300'
        : 'text-slate-400';

  const assistantPlaceholder =
    language === 'uz' ? 'Savolingizni yozing...' : language === 'ru' ? 'Напишите ваш вопрос...' : 'Ask about the platform...';

  const stopRecordingLabel = micState === 'recording' ? 'Stop microphone recording' : 'Start microphone recording';
  const micTitle = micState === 'recording' ? 'Stop recording' : 'Record voice';

  const panelContent = assistantOpen ? (
    createPortal(
      <div
        className="pointer-events-auto fixed inset-0 z-[130] flex items-center justify-center px-3 py-4 sm:inset-auto sm:right-5 sm:bottom-[5.5rem] sm:left-auto sm:top-auto sm:z-[130] sm:w-[min(92vw,420px)] sm:p-0"
        aria-hidden={!assistantOpen}
      >
        <div className="flex h-[min(82dvh,680px)] w-[min(92vw,420px)] max-w-[420px] items-stretch justify-center sm:h-[min(78dvh,620px)] sm:w-[min(92vw,420px)] sm:max-w-[420px]">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/90 shadow-[0_24px_70px_rgba(15,23,42,0.78)] backdrop-blur-xl sm:rounded-[32px]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 shadow-[0_12px_20px_rgba(56,189,248,0.35)]">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
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

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-4 sm:py-4" role="log" aria-live="polite" aria-label="Conversation">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-200">
                  {language === 'uz' ? 'Yordam' : language === 'ru' ? 'Помощь' : 'Assistant'}
                </div>
              </div>

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : 'rounded-bl-md border border-white/10 bg-slate-900/80 text-slate-100'
                    }`}
                  >
                    {message.text}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 grid max-w-[220px] grid-cols-2 gap-2">
                        {message.attachments.map((src, index) => (
                          <img key={`${src}-${index}`} src={src} alt="Selected preview" className="h-16 w-full rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

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

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-slate-900/80 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-3">
              {selectedFiles.length > 0 && (
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {selectedFiles.map((src, index) => (
                    <div key={`${src}-${index}`} className="relative">
                      <img src={src} alt="Selected preview" className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                      <button
                        type="button"
                        aria-label="Remove attachment"
                        onClick={() => {
                          const next = selectedFiles.filter((item) => item !== src);
                          if (src.startsWith('blob:')) URL.revokeObjectURL(src);
                          previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== src);
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
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
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
                  disabled={!inputValue.trim() && selectedFiles.length === 0}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.15em] text-slate-400">
                <span className={micStatusColor}>{micStatusText}</span>
                <span className="text-slate-500">Platform UI</span>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      {panelContent}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] sm:bottom-5 sm:right-5">
        <ProfessionalRobotButton onClick={toggleAssistant} isOpen={assistantOpen} ariaLabel={assistantOpen ? 'Close ZiyoTech AI assistant' : 'Open ZiyoTech AI Platform Assistant'} />
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

  const getAdminStatus = () => {
    if (typeof window === 'undefined') return false;

    const legacyFlag = localStorage.getItem('ziotech-admin-auth');
    const token = localStorage.getItem('ziotech-admin-token') || localStorage.getItem('ziyo-sales-admin-token');
    const user = localStorage.getItem('ziotech-admin-user') || localStorage.getItem('ziyo-sales-admin');

    return (legacyFlag === 'demo' || legacyFlag === 'firebase') || Boolean(token) || Boolean(user);
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(getAdminStatus);

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

    if (path === '/admin') return getAdminStatus() ? 'platform' : 'admin-login';
    if (path === '/app' || path.startsWith('/app/')) return 'platform';
    if (path === '/products' || path === '/ai-sales-agent') return 'product-sales-agent';
    if (path === '/services' || path === '/service-detail') return 'services';
    if (path === '/ai-solutions') return 'ai-solutions';
    if (path === '/about') return 'about';
    if (path === '/portfolio') return 'portfolio';
    if (path === '/contact') return 'contact';
    if (path === '/sales-ai') return 'sales-ai';
    return 'home';
  });

  useEffect(() => {
    const syncPageFromLocation = () => {
      if (typeof window === 'undefined') return;

      const path = window.location.pathname;
      const isAuthenticated = getAdminStatus();
      const serviceIdFromPath = getServiceIdFromPath(path);

      if (serviceIdFromPath) {
        setSelectedServiceId(serviceIdFromPath);
        setCurrentPage('service-detail');
        return;
      }

      if (path === '/admin') {
        setCurrentPage(isAuthenticated ? 'platform' : 'admin-login');
        setIsAdminAuthenticated(isAuthenticated);
        return;
      }

      if (path === '/app' || path.startsWith('/app/')) {
        setCurrentPage('platform');
        setIsAdminAuthenticated(isAuthenticated);
        return;
      }

      if (path === '/products' || path === '/ai-sales-agent') setCurrentPage('product-sales-agent');
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

    return () => window.removeEventListener('popstate', syncPageFromLocation);
  }, []);

  const navigateTo = (url: string, nextPage: string) => {
    setCurrentPage(nextPage);
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleNavigate = (page: string, serviceId?: string) => {
    const resolvedServiceId = serviceId || (page === 'service-detail' ? selectedServiceId : undefined);

    if (resolvedServiceId) {
      setSelectedServiceId(resolvedServiceId);
    }

    if (page === 'platform') {
      const authenticated = getAdminStatus();
      if (!authenticated) {
        setCurrentPage('admin-login');
        setIsAdminAuthenticated(false);
        navigateTo('/admin', 'admin-login');
        return;
      }

      setCurrentPage('platform');
      setIsAdminAuthenticated(true);
      navigateTo('/app', 'platform');
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

  const handleSalesLogin = () => {
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
    localStorage.removeItem('ziotech-admin-auth');
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
      return <PlatformLayout onBackToSite={handleBackToSite} />;
    }

    switch (currentPage) {
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

      <main className="min-h-screen bg-[#080C14] text-slate-100 pt-20 sm:pt-24">
        {renderContent()}
      </main>

      {!['platform', 'admin-login'].includes(currentPage) && <Footer onNavigate={handleNavigate} />}

      {!['platform', 'admin-login'].includes(currentPage) && <FloatingPlatformAssistant onNavigate={handleNavigate} />}
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
