import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Bot,
  Users,
  Instagram,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

interface OverviewViewProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab }) => {
  const { language } = useLanguage();
  const {
    conversations,
    orders,
    products,
    instagramAccount,
    aiConfig
  } = usePlatform();

  const totalConversations = '000';
  const aiHandledCount = '000';
  const humanHandledCount = '000';
  const totalOrdersCount = '000';

  return (
    <div className="space-y-8">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-indigo-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-cyan-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Interactive Business Operations Sandbox</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Live Simulation
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Operating with verified catalog data and official Meta Graph API message handling pipeline.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('inbox')}
          className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 font-sans transition-colors"
        >
          Open Live Inbox
        </button>
      </div>

      {/* KPI Stats Grid (Matches the 3D tablet dashboard in the hero screenshot!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Conversations */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Conversations</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalConversations}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>000 baseline</span>
          </div>
        </div>

        {/* Orders Generated */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Order Requests</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalOrdersCount}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>0.0% conversion</span>
          </div>
        </div>

        {/* AI Resolution Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>AI Resolution Rate</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            0.0%
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>000 automated</span>
          </div>
        </div>

        {/* Instagram Account Connection */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Instagram AI Agent</span>
            <div className="p-1.5 rounded-lg bg-pink-950/60 text-pink-400">
              <Instagram className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active & Online</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {instagramAccount.username} · {instagramAccount.followers} followers
          </div>
        </div>
      </div>

      {/* Main Split: Trend Chart & Active Live Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Trend Graph & Resolution Breakdown (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Conversation & Inquiries Velocity</h3>
                <p className="text-xs text-slate-400">Daily message traffic over past 30 days</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                Last 30 days
              </span>
            </div>

            {/* SVG Trendline Graphic */}
            <div className="relative h-44 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d="M 0,110 Q 50,130 100,90 T 200,80 T 300,45 T 400,60 T 500,20 L 500,150 L 0,150 Z"
                  fill="url(#neonGradient)"
                />
                {/* Line stroke */}
                <path
                  d="M 0,110 Q 50,130 100,90 T 200,80 T 300,45 T 400,60 T 500,20"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="3.5"
                />
                {/* Highlight point */}
                <circle cx="300" cy="45" r="5" fill="#06B6D4" stroke="#fff" strokeWidth="2" />
                <circle cx="500" cy="20" r="5" fill="#3B82F6" stroke="#fff" strokeWidth="2" />
              </svg>

              <div className="absolute top-6 left-60 px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-800">
                +24% Surge
              </div>
            </div>

            {/* AI vs Human Distribution */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400">Autonomous AI Handled</div>
                <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
                  {aiHandledCount.toLocaleString()} (92%)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400">Human Operator Escalations</div>
                <div className="text-lg font-bold text-slate-200 mt-1 font-mono">
                  {humanHandledCount.toLocaleString()} (8%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Recent Conversations (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Live Inbound Stream</h3>
              <button
                onClick={() => onNavigateTab('inbox')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({conversations.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {conversations.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateTab('inbox')}
                  className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={c.customerAvatar}
                        alt={c.customerName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{c.customerName}</div>
                        <div className="text-[10px] text-slate-400">@{c.customerHandle}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'ai_handling'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : c.status === 'human_takeover'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {c.status === 'ai_handling' ? 'AI Active' : c.status === 'human_takeover' ? 'Operator' : 'Resolved'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1">
                    {c.lastMessage}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{c.lastTimestamp}</span>
                    <span className="uppercase">{c.language}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders Captured */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Instagram Orders Captured by AI</h3>
            <p className="text-xs text-slate-400">Real-time draft orders populated directly from customer DM negotiations</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{ord.orderNumber}</td>
                  <td className="py-3 px-4 text-white font-medium">
                    <div>{ord.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ord.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{ord.productName}</td>
                  <td className="py-3 px-4 font-mono tabular-nums text-white font-bold">
                    {ord.amount.toLocaleString()} UZS
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ord.status === 'delivered'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{ord.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
