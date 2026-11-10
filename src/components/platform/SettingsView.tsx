import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Settings,
  Building,
  Key,
  Shield,
  Bell,
  CheckCircle2,
  Save,
  Globe
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [businessName, setBusinessName] = useState('Milano Style Retail LLC');
  const [timezone, setTimezone] = useState('Asia/Tashkent (UTC+5)');
  const [webhookUrl, setWebhookUrl] = useState('https://api.ziyotech.uz/v1/webhooks/instagram/tenant-882');
  const [verifyToken, setVerifyToken] = useState('ziyotech_sec_token_9824204918234');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Organization Settings & API Configuration</span>
        </h2>
        <p className="text-xs text-slate-400">
          Manage tenant identity, Meta webhook endpoints, and notification protocols.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Organization settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Business Profile */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>Business Entity Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Company / Store Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Primary Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Webhook Endpoints */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Meta Webhook Integration Credentials</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Webhook Callback URL</label>
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-400 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Verify Token (Secret)</label>
              <input
                type="password"
                readOnly
                value={verifyToken}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-400 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
