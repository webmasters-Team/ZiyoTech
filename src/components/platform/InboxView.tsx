import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  Bot,
  User,
  Send,
  UserCheck,
  Instagram,
  Phone,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const InboxView: React.FC = () => {
  const { language } = useLanguage();
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    toggleHumanTakeover
  } = usePlatform();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ai_handling' | 'human_takeover'>('all');
  const [replyText, setReplyText] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    sendMessage(activeConv.id, replyText.trim(), 'human');
    setReplyText('');
  };

  const handleSimulateCustomerInquiry = () => {
    if (!activeConv) return;
    const sampleInquiries = [
      'Toshkent shahriga yetkazib berish necha pul?',
      'Bu sumkaning qora rangi ham bormi?',
      'Payme orqali to\'lasa bo\'ladimi?',
      'Здравствуйте, когда можно забрать самовывозом?',
    ];
    const randomInquiry = sampleInquiries[Math.floor(Math.random() * sampleInquiries.length)];
    sendMessage(activeConv.id, randomInquiry, 'customer' as any);

    // If AI is handling, automatically answer after 600ms
    if (activeConv.status === 'ai_handling') {
      setTimeout(() => {
        let aiAnswer = "Albatta! Toshkent bo'yicha 300 000 so'mdan yuqori buyurtmalar bepul yetkaziladi. Payme va Click qabul qilinadi!";
        if (randomInquiry.includes('qora')) {
          aiAnswer = "Ha, qora rangdagi modeli hozirda omborda 8 dona mavjud. Narxi o'zgarmagan — 499 000 so'm.";
        } else if (randomInquiry.includes('Здравствуйте')) {
          aiAnswer = 'Здравствуйте! Наш шоурум на Амире Темуре 45 работает сегодня до 21:00 без выходных. Ждем вас!';
        }
        sendMessage(activeConv.id, aiAnswer, 'ai');
      }, 700);
    }
  };

  return (
    <div className="h-[680px] sm:h-[750px] rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      
      {/* Top Bar of Inbox */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-950/60 text-pink-400 border border-pink-800/60">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Unified Instagram & Omnichannel Inbox</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Live customer messaging with autonomous AI co-pilot and human takeover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateCustomerInquiry}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Simulate incoming DM event"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Simulate Customer DM</span>
            <span className="sm:hidden">Simulate</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Conversation List | Active Chat | Customer Profile */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden relative">
        
        {/* Left Column: Conversation List */}
        <div className={`col-span-12 md:col-span-4 lg:col-span-3 border-r border-slate-800 flex flex-col bg-slate-950/40 ${
          mobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Search & Filter */}
          <div className="p-3 space-y-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inquiries..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-1 text-[11px]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-1 py-1 rounded text-center font-medium ${
                  filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('ai_handling')}
                className={`flex-1 py-1 rounded text-center font-medium ${
                  filterStatus === 'ai_handling' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Handled
              </button>
              <button
                onClick={() => setFilterStatus('human_takeover')}
                className={`flex-1 py-1 rounded text-center font-medium ${
                  filterStatus === 'human_takeover' ? 'bg-amber-950 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Human
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConversationId(c.id);
                  setMobileChatOpen(true);
                }}
                className={`p-3.5 cursor-pointer transition-colors ${
                  activeConversationId === c.id
                    ? 'bg-slate-850 border-l-2 border-cyan-400'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={c.customerAvatar}
                      alt={c.customerName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                      {c.customerName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{c.lastTimestamp}</span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-1 mb-1.5">{c.lastMessage}</p>

                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`px-1.5 py-0.2 rounded font-medium ${
                      c.status === 'ai_handling'
                        ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-900'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-900'
                    }`}
                  >
                    {c.status === 'ai_handling' ? '🤖 AI Auto' : '👤 Operator'}
                  </span>
                  <span className="text-slate-400 uppercase font-mono">{c.language}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Active Chat Thread */}
        <div className={`col-span-12 md:col-span-8 lg:col-span-6 flex flex-col bg-slate-900/40 ${
          !mobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Chat Header */}
          {activeConv && (
            <div className="px-4 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setMobileChatOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <img
                  src={activeConv.customerAvatar}
                  alt={activeConv.customerName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 sm:gap-2">
                    <span className="truncate max-w-[120px] sm:max-w-none">{activeConv.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">@{activeConv.customerHandle}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Instagram Direct Message</span>
                  </div>
                </div>
              </div>

              {/* Takeover Button */}
              <button
                onClick={() => toggleHumanTakeover(activeConv.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeConv.status === 'ai_handling'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-600/50 hover:bg-amber-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-600/50 hover:bg-cyan-500/30'
                }`}
              >
                {activeConv.status === 'ai_handling' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Take Over as Human</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>Hand Back to AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {activeConv?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'customer'
                    ? 'items-start'
                    : 'items-end'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                  {msg.sender === 'customer' ? (
                    <span>Customer ({activeConv.customerName})</span>
                  ) : msg.sender === 'ai' ? (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      ZiyoTech AI Agent
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Human Operator
                    </span>
                  )}
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'customer'
                      ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                      : msg.sender === 'ai'
                      ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 text-white rounded-tr-none border border-indigo-700/60 shadow-lg'
                      : 'bg-emerald-900/70 text-white rounded-tr-none border border-emerald-700/60'
                  }`}
                >
                  {msg.productCard && (
                    <div className="mb-2 p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
                      <img
                        src={msg.productCard.image}
                        alt="Product"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-[11px] font-semibold text-white">{msg.productCard.name}</div>
                        <div className="text-[11px] font-mono text-cyan-400 font-bold">{msg.productCard.price}</div>
                      </div>
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                activeConv?.status === 'human_takeover'
                  ? 'Type response as human operator...'
                  : 'Send operator override note or reply...'
              }
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Customer Dossier & Context (3 / 12) */}
        <div className="hidden lg:flex col-span-3 border-l border-slate-800 flex-col p-4 bg-slate-950/60 space-y-5 overflow-y-auto">
          {activeConv && (
            <>
              <div className="text-center pb-4 border-b border-slate-800">
                <img
                  src={activeConv.customerAvatar}
                  alt={activeConv.customerName}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-slate-700"
                />
                <h3 className="text-sm font-bold text-white">{activeConv.customerName}</h3>
                <div className="text-xs text-slate-400 font-mono">@{activeConv.customerHandle}</div>
              </div>

              {/* Customer attributes */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Channel</div>
                  <div className="text-slate-200 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instagram Direct Message</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Status</div>
                  <div className="text-slate-200 font-mono text-[11px] capitalize">
                    {activeConv.status.replace('_', ' ')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {activeConv.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-cyan-400" />
                    <span>Mijoz Eslatmasi (Customer Note)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    {activeConv.customerNotes || "Eslatmalar mavjud emas. Yangi buyurtma yoki murojaat kelganda avtomatik to'ldiriladi."}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => alert(`Creating draft order for customer ${activeConv.customerName}...`)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  + Create Order Draft
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
