import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { BrandLogo } from '../common/BrandLogo';
import { firebaseApp } from '../../lib/firebase';

interface AdminLoginViewProps {
  onBackToSite: () => void;
  onLogin: () => void;
}

const DEMO_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@ziyotech.com';
const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBackToSite, onLogin }) => {
  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    const auth = firebaseApp ? getAuth(firebaseApp) : null;

    if (email.trim().toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      localStorage.setItem('ziotech-admin-auth', 'demo');
      onLogin();
      return;
    }

    if (!auth) {
      setError('Demo access is available using the configured admin account.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      localStorage.setItem('ziotech-admin-auth', 'firebase');
      onLogin();
    } catch (loginError) {
      setError('Invalid email or password. Use a valid admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      <header className="h-16 border-b border-slate-800 bg-[#0A101D]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-blue-950/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to site</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showText={false} />
            <span className="text-sm font-bold text-white tracking-tight">ZiyoTech Platform</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 shadow-[0_24px_80px_rgba(15,23,42,0.75)] p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-300">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Admin access</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Sign in</h1>
            <p className="mt-2 text-sm text-slate-400">Access the client request dashboard and lead management tools.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-800/60 bg-red-950/40 px-3 py-2.5 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
                placeholder=""
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-cyan-500"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] transition hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Enter platform'}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-[11px] text-slate-400">
            Secure admin access only.
          </div>
        </div>
      </div>
    </div>
  );
};
