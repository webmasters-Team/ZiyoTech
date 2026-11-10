import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { servicesData } from '../../data/servicesData';
import { Send, CheckCircle2, AlertCircle, Sparkles, MessageCircle, Mail } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phoneOrTelegram: '',
    serviceId: 'ai-automation',
    projectDesc: '',
    preferredLang: language,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg(language === 'ru' ? 'Пожалуйста, введите ваше имя' : language === 'en' ? 'Please enter your name' : 'Iltimos, ismingizni kiriting');
      return;
    }

    if (!formData.email.trim() && !formData.phoneOrTelegram.trim()) {
      setErrorMsg(language === 'ru' ? 'Укажите email или телефон/Telegram' : language === 'en' ? 'Please provide either an email or phone/Telegram handle' : 'Iltimos, email yoki telefon/Telegram username kiriting');
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <section id="contact" className="py-14 sm:py-20 lg:py-28 bg-[#080C14]/95 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Consultation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.contact.title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t.contact.subtitle}
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center py-12 px-6 space-y-5 rounded-2xl bg-[#070E1C] border border-blue-500/40 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-blue-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {t.contact.successTitle}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                {t.contact.successDesc}
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      name: '',
                      businessName: '',
                      email: '',
                      phoneOrTelegram: '',
                      serviceId: 'ai-automation',
                      projectDesc: '',
                      preferredLang: language,
                    });
                  }}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  {t.contact.sendAnother}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.contact.nameLabel} <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t.contact.namePlaceholder}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.contact.businessLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder={t.contact.businessPlaceholder}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* Phone / Telegram */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.contact.phoneLabel} <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneOrTelegram}
                    onChange={(e) => setFormData({ ...formData, phoneOrTelegram: e.target.value })}
                    placeholder={t.contact.phonePlaceholder}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Service of Interest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t.contact.serviceLabel}
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors"
                  >
                    {servicesData.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name[language]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {language === 'ru' ? 'Предпочитаемый язык общения' : language === 'en' ? 'Preferred Language' : 'Afzal ko\'rilgan muloqot tili'}
                  </label>
                  <select
                    value={formData.preferredLang}
                    onChange={(e) => setFormData({ ...formData, preferredLang: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors"
                  >
                    <option value="uz">O'zbekcha</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  {t.contact.messageLabel}
                </label>
                <textarea
                  rows={4}
                  value={formData.projectDesc}
                  onChange={(e) => setFormData({ ...formData, projectDesc: e.target.value })}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 p-4 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400 transition-colors placeholder:text-slate-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t.contact.submitting : t.contact.submitBtn}</span>
                </button>
              </div>
            </form>
          )}

          {/* Corporate transparency note */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>Direct technical and sales desk: Tashkent, Uzbekistan & International client servicing.</span>
            <span>SLA: Response guaranteed within 24 business hours.</span>
          </div>

        </div>

      </div>
    </section>
  );
};
