import React, { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useLanguage } from '../../context/LanguageContext';

interface AdminLoginViewProps {
  onBackToSite: () => void;
  onLogin: () => void;
}

const API_BASE_URL = (import.meta.env.VITE_ASSISTANT_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')).replace(/\/+$/, '');

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBackToSite, onLogin }) => {
  const { language } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const verifyExistingSession = async () => {
      try {
        const secureSession = await fetch(`${API_BASE_URL}/api/admin/session`, { credentials: 'include' });
        if (!secureSession.ok || !secureSession.headers.get('content-type')?.includes('application/json')) return;
        const session = await secureSession.json() as { authenticated?: boolean; user?: { id?: unknown; email?: unknown; name?: unknown } };
        const validIdentity = typeof session.user?.id === 'string' && typeof session.user.email === 'string' && typeof session.user.name === 'string';
        if (!cancelled && session.authenticated === true && validIdentity) onLogin();
      } catch {
        // Login remains available when no existing session can be checked.
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };
    void verifyExistingSession();
    return () => { cancelled = true; };
  }, [onLogin]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError(language === 'ru' ? 'Введите Admin ID и пароль.' : language === 'uz' ? 'Admin ID va parolni kiriting.' : 'Enter your Admin ID and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json().catch(() => ({})) as { success?: boolean; error?: string; user?: { id?: unknown; email?: unknown; name?: unknown } } : {};
      const validIdentity = typeof data.user?.id === 'string' && typeof data.user.email === 'string' && typeof data.user.name === 'string';
      if (!response.ok || data.success !== true || !validIdentity) {
        setError(data.error || (language === 'ru' ? 'Не удалось выполнить вход.' : language === 'uz' ? 'Kirish amalga oshmadi.' : 'Sign-in failed.'));
        return;
      }
      setPassword('');
      onLogin();
    } catch {
      setError(language === 'ru' ? 'Сервер входа недоступен. Проверьте подключение.' : language === 'uz' ? 'Kirish serveri bilan aloqa yo‘q. Ulanishni tekshiring.' : 'The sign-in service is unavailable. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copy = language === 'ru'
    ? { back: 'На сайт', title: 'Вход администратора', description: 'Введите Admin ID и пароль, заданные в защищённой локальной настройке.', id: 'Admin ID', password: 'Пароль', show: 'Показать пароль', hide: 'Скрыть пароль', submit: 'Войти в панель', signingIn: 'Выполняется вход…', checking: 'Проверка защищённой сессии…' }
    : language === 'uz'
      ? { back: 'Saytga qaytish', title: 'Administrator kirishi', description: 'Xavfsiz mahalliy sozlashda belgilangan Admin ID va parolni kiriting.', id: 'Admin ID', password: 'Parol', show: 'Parolni ko‘rsatish', hide: 'Parolni yashirish', submit: 'Panelga kirish', signingIn: 'Kirilmoqda…', checking: 'Xavfsiz seans tekshirilmoqda…' }
      : { back: 'Back to site', title: 'Administrator sign in', description: 'Enter the Admin ID and password configured through the secure local setup command.', id: 'Admin ID', password: 'Password', show: 'Show password', hide: 'Hide password', submit: 'Sign in to dashboard', signingIn: 'Signing in…', checking: 'Checking secure session…' };

  return (
    <div className="flex min-h-screen flex-col bg-[#080C14] font-sans text-slate-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#0A101D]/90 px-4 backdrop-blur-md sm:px-6">
        <button type="button" onClick={onBackToSite} className="flex items-center gap-2 rounded-lg p-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-blue-950/40 hover:text-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><ArrowLeft className="h-4 w-4" />{copy.back}</button>
        <div className="flex items-center gap-2"><BrandLogo size="sm" showText={false} /><span className="text-sm font-bold tracking-tight text-white">ZiyoTech Platform</span></div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.75)] sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300"><ShieldCheck className="h-7 w-7" /></div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">ZiyoTech</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">{copy.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{copy.description}</p>
          </div>
          {checkingSession ? <p className="flex items-center justify-center gap-2 py-5 text-sm text-slate-400" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />{copy.checking}</p> : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div role="alert" className="rounded-xl border border-red-800/60 bg-red-950/40 px-3 py-2.5 text-sm text-red-200">{error}</div>}
              <div className="space-y-2"><label htmlFor="admin-id" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.id}</label><input id="admin-id" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500/30" /></div>
              <div className="space-y-2"><label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.password}</label><div className="relative"><input id="admin-password" autoComplete="current-password" required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500/30" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? copy.hide : copy.show} aria-pressed={showPassword} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] transition hover:from-blue-500 hover:to-cyan-400 disabled:cursor-wait disabled:opacity-60">{isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{isSubmitting ? copy.signingIn : copy.submit}</button>
            </form>
          )}
          <p className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">Sign-in is verified by the backend. Sessions are stored in SQLite and held in an HttpOnly cookie.</p>
        </section>
      </main>
    </div>
  );
};
