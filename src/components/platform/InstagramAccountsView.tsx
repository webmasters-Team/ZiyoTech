import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Instagram,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  ShieldCheck,
  ExternalLink,
  Layers
} from 'lucide-react';

export const InstagramAccountsView: React.FC = () => {
  const { instagramAccount, toggleInstagramConnection } = usePlatform();

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Instagram className="w-5 h-5 text-pink-400" />
          <span>Instagram Business Account Integration (Meta API)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Official Meta Graph API Messenger interface. Connects via Facebook Login with Instagram Messaging permissions.
        </p>
      </div>

      {/* Connection Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-[#090d21] flex items-center justify-center text-white font-bold text-lg">
                <Instagram className="w-7 h-7 text-pink-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{instagramAccount.username}</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    instagramAccount.connected
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {instagramAccount.connected ? 'Connected (Meta OAuth)' : 'Disconnected'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {instagramAccount.accountType} · {instagramAccount.followers} followers
              </div>
            </div>
          </div>

          <button
            onClick={toggleInstagramConnection}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              instagramAccount.connected
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white'
            }`}
          >
            {instagramAccount.connected ? 'Disconnect Account' : 'Connect via Meta'}
          </button>
        </div>

        {/* API Permissions & Webhook Health */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 mb-1">Webhook Subscription</div>
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>messages, messaging_postbacks</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 mb-1">Meta Token Expiration</div>
            <div className="font-semibold text-white font-mono">
              {instagramAccount.tokenExpiryDays} days remaining
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 mb-1">Messaging Window Policy</div>
            <div className="font-semibold text-cyan-400 font-mono">
              24-Hour Standard Window
            </div>
          </div>
        </div>

        {/* Official Compliance Notice */}
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/60 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Meta Official Policy Compliance</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            ZiyoTech strictly interfaces through Meta's approved Graph API v21.0 webhooks. We never deploy unauthorized browser automation, private credential scraping, or spam scripts. All client tokens are encrypted with AES-256.
          </p>
        </div>
      </div>

    </div>
  );
};
