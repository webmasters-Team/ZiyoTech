import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const unavailableMessage = {
  en: 'Client portal access is not available yet.',
  ru: 'Доступ к кабинету клиента пока недоступен.',
  uz: 'Mijozlar portaliga kirish hali mavjud emas.',
} as const;

const introduction = {
  en: {
    title: 'Your Project, Always Within Reach',
    body: "We've provided you with a unique access code for your ongoing project. Enter your code below and click 'Access My Project' to view your project's progress, milestones, and estimated completion date.",
  },
  ru: {
    title: 'Ваш проект всегда под рукой',
    body: 'Мы предоставили вам уникальный код доступа к текущему проекту. Введите код ниже и нажмите «Открыть мой проект», чтобы посмотреть ход работ, этапы и предполагаемую дату завершения.',
  },
  uz: {
    title: 'Loyihangiz doimo qo‘l ostingizda',
    body: 'Joriy loyihangiz uchun sizga maxsus kirish kodi berildi. Loyihangiz jarayoni, bosqichlari va taxminiy yakunlanish sanasini ko‘rish uchun kodni kiriting va “Access My Project” tugmasini bosing.',
  },
} as const;

export const CompanyProjectAccess: React.FC = () => {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const intro = introduction[language];

  const submitAccessCode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Do not read, transmit, or persist the code until secure portal authentication exists.
    event.currentTarget.reset();
    setMessage(unavailableMessage[language]);
  };

  return (
    <section id="client-project-access" className="py-10 sm:py-12 lg:py-14" aria-labelledby="client-access-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0b1420] via-[#0a111b] to-[#071522] p-6 shadow-[0_24px_70px_rgba(2,6,23,0.34)] sm:p-9 lg:p-11">
          <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.06] blur-3xl" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
            <h2 className="text-xl font-bold tracking-tight text-cyan-100 sm:text-2xl">{intro.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">{intro.body}</p>
            <h3 id="client-access-title" className="mt-6 text-2xl font-black tracking-tight text-white sm:mt-7 sm:text-3xl">Client Project Portal</h3>
            <form onSubmit={submitAccessCode} className="w-full" autoComplete="off">
              <label htmlFor="company-access-code" className="sr-only">Company Access Code</label>
              <input
                id="company-access-code"
                name="accessCode"
                type="password"
                minLength={10}
                maxLength={15}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Company Access Code"
                aria-describedby="portal-unavailable-message"
                className="mt-4 min-h-12 w-full rounded-xl border border-slate-700 bg-[#080e17] px-4 text-center text-sm tracking-[0.12em] text-white outline-none transition-colors placeholder:tracking-normal placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15 motion-reduce:transition-none"
              />
              <button
                type="submit"
                aria-describedby="portal-unavailable-message"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a111b] motion-reduce:transition-none sm:w-auto sm:min-w-56"
              >
                Access My Project<ArrowRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
            <p id="portal-unavailable-message" role="status" aria-live="polite" className="mt-3 min-h-5 text-xs text-amber-200/90">
              {message || unavailableMessage[language]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
