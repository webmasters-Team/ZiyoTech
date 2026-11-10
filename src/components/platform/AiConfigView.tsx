import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bot,
  Save,
  ShieldCheck,
  Globe,
  Sliders,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle
} from 'lucide-react';

export const AiConfigView: React.FC = () => {
  const { aiConfig, updateAiConfig } = usePlatform();
  const { language } = useLanguage();

  const [localConfig, setLocalConfig] = useState(aiConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiConfig(localConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <span>ZiyoTech AI Assistant Engine Configuration</span>
        </h2>
        <p className="text-xs text-slate-400">
          Tune conversational behavior, bilingual routing, and autonomous human escalation parameters.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>AI configuration saved and propagated across active Instagram webhooks!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Main Master Switch */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Autonomous AI Inbound Answering</div>
            <div className="text-xs text-slate-400">
              When disabled, all incoming Instagram direct messages will route strictly to human staff.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLocalConfig({ ...localConfig, isEnabled: !localConfig.isEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              localConfig.isEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                localConfig.isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Behavioral Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Language & Persona Routing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Primary Language */}
            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block">Primary Language Mode</label>
              <select
                value={localConfig.primaryLanguage}
                onChange={(e) => setLocalConfig({ ...localConfig, primaryLanguage: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="both">Bilingual Auto-Detect (Uzbek & Russian)</option>
                <option value="uz">Strictly Uzbek (Latin Script)</option>
                <option value="ru">Strictly Russian</option>
              </select>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block">Assistant Tone & Register</label>
              <select
                value={localConfig.tone}
                onChange={(e) => setLocalConfig({ ...localConfig, tone: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="professional">Professional & Courteous (Recommended)</option>
                <option value="friendly">Warm & Retail Friendly</option>
                <option value="casual">Casual & Modern Social Media</option>
              </select>
            </div>
          </div>
        </div>

        {/* Human Handover Protocol */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Human Escalation & Safety Bounds</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Auto Human Handover Trigger</div>
                <div className="text-slate-400">Escalate immediately when customer requests a human or expresses distress</div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoHumanHandover}
                onChange={(e) => setLocalConfig({ ...localConfig, autoHumanHandover: e.target.checked })}
                className="w-4 h-4 rounded accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300 font-medium">
                <span>Confidence Threshold for Auto-Answer</span>
                <span className="font-mono text-cyan-400 font-bold">{localConfig.handoverThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                value={localConfig.handoverThreshold}
                onChange={(e) => setLocalConfig({ ...localConfig, handoverThreshold: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>50% (More permissive)</span>
                <span>80% (Recommended)</span>
                <span>95% (Strict safety)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Facts Integration */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Business Rules Prompt Grounding</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Business Public Name</label>
              <input
                type="text"
                value={localConfig.businessName}
                onChange={(e) => setLocalConfig({ ...localConfig, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Working & Delivery Hours</label>
              <input
                type="text"
                value={localConfig.workingHours}
                onChange={(e) => setLocalConfig({ ...localConfig, workingHours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-300 font-semibold block mb-1">Delivery Policy Summary</label>
            <textarea
              rows={2}
              value={localConfig.deliveryPolicy}
              onChange={(e) => setLocalConfig({ ...localConfig, deliveryPolicy: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply AI Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
