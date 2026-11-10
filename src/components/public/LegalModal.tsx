import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X, ShieldAlert, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const { language } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#080c1f] border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {type === 'privacy'
                  ? language === 'ru'
                    ? 'Политика Конфиденциальности (Черновик)'
                    : language === 'en'
                    ? 'Privacy Policy (Draft Notice)'
                    : 'Maxfiylik Siyosati (Qoralama)'
                  : language === 'ru'
                  ? 'Условия Использования Сервиса (Черновик)'
                  : language === 'en'
                  ? 'Terms of Service (Draft Notice)'
                  : 'Foydalanish Shartlari (Qoralama)'}
              </h3>
              <span className="text-xs font-mono text-amber-400">
                STATUS: DRAFT — REQUIRES LEGAL COUNSEL REVIEW PRIOR TO COMMERCIAL EXECUTION
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Legal Notice:</strong> This document is a structural legal placeholder prepared for ZiyoTech digital agency and AI platform operations. It is subject to statutory revision under the legislation of the Republic of Uzbekistan (Law on Personal Data) and international privacy frameworks (GDPR/Meta Platform Terms). This draft must be verified by licensed legal counsel before binding application.
          </p>
        </div>

        {/* Content */}
        {type === 'privacy' ? (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h4 className="text-base font-bold text-white">1. Data Collection & Processing Scope</h4>
            <p>
              ZiyoTech collects business inquiry information submitted voluntarily through our consultation forms, including name, corporate affiliation, contact phone or Telegram identifier, and communication preferences.
            </p>

            <h4 className="text-base font-bold text-white">2. Meta Platform & Instagram API Data Handling</h4>
            <p>
              When utilizing the ZiyoTech AI Sales Agent for Instagram Direct messaging automation, customer message tokens and conversation payloads are transmitted solely through official Meta Graph API endpoints. Message histories are used strictly for intent classification, product catalog lookup, and order drafting under enterprise encryption standards.
            </p>

            <h4 className="text-base font-bold text-white">3. Zero-Hallucination & AI Model Usage</h4>
            <p>
              Customer queries are evaluated against client-provided structured catalogs and verified documents. No customer personal identification data is used to train open public foundation models.
            </p>

            <h4 className="text-base font-bold text-white">4. Data Subject Rights</h4>
            <p>
              Users may request rectification, export, or total deletion of their contact records at any time by contacting our compliance officers.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h4 className="text-base font-bold text-white">1. Scope of Commercial Agency Services</h4>
            <p>
              ZiyoTech delivers digital agency services encompassing website development, e-commerce storefronts, artificial intelligence automation agents, media production, and marketing execution governed by individual commercial statements of work (SOW).
            </p>

            <h4 className="text-base font-bold text-white">2. Instagram Automation & Meta Compliance</h4>
            <p>
              Subscribers of the ZiyoTech AI Sales Agent platform must maintain active and verified Instagram Professional/Business accounts and adhere to Meta's developer policies, prohibited commercial practices, and standard 24-hour customer messaging windows. ZiyoTech strictly prohibits unauthorized scraping or non-compliant bulk messaging.
            </p>

            <h4 className="text-base font-bold text-white">3. Service Level Agreements & Uptime</h4>
            <p>
              Platform services aim for high availability. In the event of upstream Meta API outages or maintenance, automated fallback queues ensure message continuity without data loss.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
