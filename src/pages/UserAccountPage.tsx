import { useEffect, useRef, useState, type FormEvent } from 'react';
import { API_BASE_URL } from '../lib/api';
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  type User,
} from 'firebase/auth';
import { ArrowRight, CheckCircle2, CircleAlert, KeyRound, LoaderCircle, LockKeyhole, LogOut, Mail, ShieldCheck, UserRound, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { auth, firebaseConfigIssue, isFirebaseConfigured } from '../lib/firebase';

type AccountProfile = {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  provider: string;
  emailVerified: boolean;
  registeredAt: string;
  lastLoginAt: string | null;
};

type AccountView = 'login' | 'signup' | 'forgot' | 'reset-password';

function isSafeGooglePhotoUrl(value: string | null | undefined): value is string {
  if (!value || value.length > 1000) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && !url.username
      && !url.password
      && !url.port
      && (url.hostname === 'googleusercontent.com' || url.hostname.endsWith('.googleusercontent.com'));
  } catch {
    return false;
  }
}

const AUTH_API_BASE = API_BASE_URL;

async function authRequest(path: string, options: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetch(`${AUTH_API_BASE}/api/auth/${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    const error = new Error('Unable to reach the ZiyoTech account server.') as Error & { code: string };
    error.code = 'ACCOUNT_SERVICE_UNAVAILABLE';
    throw error;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Account service is unavailable.');
    Object.assign(error, { code: data.code, status: response.status });
    throw error;
  }
  return data;
}

function csrfCookie() {
  const cookies = document.cookie.split(';').map((value) => value.trim());
  const found = cookies.find((value) => value.startsWith('__Host-ziyo_csrf=')) || cookies.find((value) => value.startsWith('ziyo_csrf='));
  return found ? decodeURIComponent(found.slice(found.indexOf('=') + 1)) : '';
}

function firebaseErrorMessage(error: unknown, language: string) {
  const code = (error as { code?: string })?.code || '';
  const en: Record<string, string> = {
    'auth/email-already-in-use': 'An account already exists for this email. Sign in or reset its password.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/weak-password': 'Use a stronger password with at least 8 characters.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before it finished.',
    'auth/account-exists-with-different-credential': 'This email already uses another sign-in method. Sign in with that method; accounts are not merged automatically.',
    'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
    'auth/network-request-failed': 'The authentication service could not be reached. Check your connection.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled for the Firebase project.',
    'auth/configuration-not-found': 'Firebase Authentication is not configured for this project or the requested sign-in provider is unavailable. In Firebase Console, enable Authentication and the Google provider, set the project support email, and verify the Web app uses the same project.',
    'auth/invalid-api-key': 'The Firebase Web API key is invalid. Copy the Web app configuration from the same Firebase project and restart the frontend.',
    'auth/unauthorized-domain': 'This website domain is not authorized in Firebase Authentication.',
    ACCOUNT_SERVICE_UNAVAILABLE: 'The account server at localhost:4000 is unreachable. Start it with `npm run dev:server`; if it is running, check CORS and the browser network panel.',
  };
  const ru: Record<string, string> = {
    'auth/email-already-in-use': 'Для этой почты уже существует аккаунт. Войдите или сбросьте пароль.',
    'auth/invalid-credential': 'Неверная почта или пароль.',
    'auth/weak-password': 'Задайте более надёжный пароль длиной не менее 8 символов.',
    'auth/invalid-email': 'Введите корректный адрес электронной почты.',
    'auth/popup-closed-by-user': 'Вход через Google закрыт до завершения.',
    'auth/account-exists-with-different-credential': 'Эта почта уже использует другой способ входа. Войдите им; аккаунты не объединяются автоматически.',
    'auth/too-many-requests': 'Слишком много попыток. Подождите и попробуйте снова.',
    'auth/network-request-failed': 'Не удалось связаться со службой авторизации. Проверьте подключение.',
    'auth/operation-not-allowed': 'Этот способ входа не включён в Firebase.',
    'auth/configuration-not-found': 'Firebase Authentication не настроен для этого проекта или провайдер входа недоступен. В консоли Firebase включите Authentication и Google, укажите контактный email проекта и проверьте настройки Web-приложения.',
    'auth/invalid-api-key': 'API-ключ Firebase Web недействителен. Скопируйте конфигурацию Web-приложения из того же проекта и перезапустите frontend.',
    'auth/unauthorized-domain': 'Этот домен не разрешён в Firebase Authentication.',
    ACCOUNT_SERVICE_UNAVAILABLE: 'Сервер аккаунтов на localhost:4000 недоступен. Запустите его командой `npm run dev:server`; если он уже работает, проверьте CORS и сетевые ошибки браузера.',
  };
  const uz: Record<string, string> = {
    'auth/email-already-in-use': 'Bu email uchun akkaunt mavjud. Kiring yoki parolni tiklang.',
    'auth/invalid-credential': 'Email yoki parol noto‘g‘ri.',
    'auth/weak-password': 'Kamida 8 belgidan iborat kuchliroq parol kiriting.',
    'auth/invalid-email': 'To‘g‘ri email manzilini kiriting.',
    'auth/popup-closed-by-user': 'Google orqali kirish yakunlanmasdan yopildi.',
    'auth/account-exists-with-different-credential': 'Bu email boshqa kirish usuliga bog‘langan. O‘sha usuldan foydalaning; akkauntlar avtomatik birlashtirilmaydi.',
    'auth/too-many-requests': 'Urinishlar soni ko‘p. Biroz kutib qayta urinib ko‘ring.',
    'auth/network-request-failed': 'Kirish xizmatiga ulanib bo‘lmadi. Internetni tekshiring.',
    'auth/operation-not-allowed': 'Bu kirish usuli Firebase loyihasida yoqilmagan.',
    'auth/configuration-not-found': 'Bu Firebase loyihasida Authentication sozlanmagan yoki kirish provayderi mavjud emas. Firebase Console’da Authentication va Google provayderini yoqing, loyiha aloqa emailini kiriting va Web ilovasi sozlamalari shu loyihaga tegishli ekanini tekshiring.',
    'auth/invalid-api-key': 'Firebase Web API kaliti yaroqsiz. Shu loyihadan Web ilova konfiguratsiyasini ko‘chirib, frontendni qayta ishga tushiring.',
    'auth/unauthorized-domain': 'Bu sayt domeni Firebase Authentication’da ruxsat etilmagan.',
    ACCOUNT_SERVICE_UNAVAILABLE: 'localhost:4000 dagi akkaunt serveriga ulanib bo‘lmadi. `npm run dev:server` buyrug‘i bilan ishga tushiring; ishlayotgan bo‘lsa, CORS va brauzer tarmoq xatolarini tekshiring.',
  };
  return (language === 'ru' ? ru : language === 'uz' ? uz : en)[code] || (error instanceof Error ? error.message : 'Unable to complete the request.');
}

export default function UserAccountPage({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [view, setView] = useState<AccountView>('login');
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [verificationUser, setVerificationUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendWait, setResendWait] = useState(0);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [configMissing, setConfigMissing] = useState(!isFirebaseConfigured || !auth);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState('');
  const profileSaveInFlight = useRef(false);

  const text = language === 'ru' ? {
    account: 'Аккаунт ZiyoTech', login: 'Войти', signup: 'Создать аккаунт', name: 'Имя', email: 'Электронная почта', password: 'Пароль',
    continueGoogle: 'Продолжить с Google', or: 'или', forgot: 'Забыли пароль?', noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?',
    create: 'Зарегистрироваться', signIn: 'Войти', verifyTitle: 'Подтвердите почту', verifyBody: 'Проверьте почту и перейдите по ссылке подтверждения. После этого аккаунт активируется автоматически.',
    resend: 'Отправить письмо повторно', profile: 'Профиль', save: 'Сохранить', logout: 'Выйти', reset: 'Сбросить пароль', sendReset: 'Отправить ссылку для сброса',
    newPassword: 'Новый пароль', resetDone: 'Пароль обновлён. Теперь войдите с новым паролем.', loading: 'Загрузка…', verified: 'Почта подтверждена. Теперь можно войти.',
    verificationSent: 'Пожалуйста, подтвердите адрес электронной почты. Мы отправили ссылку для подтверждения.', backLogin: 'Вернуться ко входу', editName: 'Изменить имя',
    saved: 'Профиль обновлён.', resetSent: 'Если аккаунт существует, письмо для сброса пароля отправлено.', firebaseRequired: 'Для входа настройте Firebase Authentication в конфигурации проекта.',
    accountSubtitle: 'Верифицированные аккаунты активируются автоматически.', verifiedAccount: 'Почта подтверждена', verificationRequired: 'Требуется подтверждение почты', secureFooter: 'Безопасный вход · требуется подтверждённая почта', closeProfile: 'Закрыть профиль',
  } : language === 'uz' ? {
    account: 'ZiyoTech akkaunti', login: 'Kirish', signup: 'Akkaunt yaratish', name: 'Ism', email: 'Email', password: 'Parol',
    continueGoogle: 'Google orqali davom etish', or: 'yoki', forgot: 'Parol esdan chiqdimi?', noAccount: 'Akkauntingiz yo‘qmi?', haveAccount: 'Akkauntingiz bormi?',
    create: 'Ro‘yxatdan o‘tish', signIn: 'Kirish', verifyTitle: 'Emailni tasdiqlang', verifyBody: 'Pochtangizni tekshiring va tasdiqlash havolasini bosing. Shundan so‘ng akkaunt avtomatik faollashadi.',
    resend: 'Tasdiqlash xatini qayta yuborish', profile: 'Profil', save: 'Saqlash', logout: 'Chiqish', reset: 'Parolni tiklash', sendReset: 'Tiklash havolasini yuborish',
    newPassword: 'Yangi parol', resetDone: 'Parol yangilandi. Endi yangi parol bilan kiring.', loading: 'Yuklanmoqda…', verified: 'Email tasdiqlandi. Endi kirishingiz mumkin.',
    verificationSent: 'Email manzilingizni tasdiqlang. Tasdiqlash havolasi yuborildi.', backLogin: 'Kirishga qaytish', editName: 'Ismni tahrirlash',
    saved: 'Profil yangilandi.', resetSent: 'Agar akkaunt mavjud bo‘lsa, parolni tiklash xati yuborildi.', firebaseRequired: 'Kirish uchun loyiha konfiguratsiyasida Firebase Authentication’ni sozlang.',
    accountSubtitle: 'Tasdiqlangan akkauntlar avtomatik faollashadi.', verifiedAccount: 'Email tasdiqlangan', verificationRequired: 'Emailni tasdiqlash kerak', secureFooter: 'Xavfsiz kirish · tasdiqlangan email talab qilinadi', closeProfile: 'Profilni yopish',
  } : {
    account: 'ZiyoTech account', login: 'Sign in', signup: 'Create account', name: 'Name', email: 'Email address', password: 'Password',
    continueGoogle: 'Continue with Google', or: 'or', forgot: 'Forgot password?', noAccount: 'New to ZiyoTech?', haveAccount: 'Already have an account?',
    create: 'Create account', signIn: 'Sign in', verifyTitle: 'Verify your email', verifyBody: 'Check your inbox and follow the verification link. Your account activates automatically after verification.',
    resend: 'Resend verification email', profile: 'Your profile', save: 'Save changes', logout: 'Sign out', reset: 'Reset password', sendReset: 'Send reset link',
    newPassword: 'New password', resetDone: 'Your password was updated. Sign in with your new password.', loading: 'Loading…', verified: 'Email verified. You can now sign in.',
    verificationSent: "Please verify your email address. We've sent you a verification link.", backLogin: 'Back to sign in', editName: 'Edit name',
    saved: 'Profile updated', resetSent: 'If an account exists, a password reset email has been sent.', firebaseRequired: 'Configure Firebase Authentication in the project settings to enable account sign-in.',
    accountSubtitle: 'Verified accounts activate automatically.', verifiedAccount: 'Email verified', verificationRequired: 'Email verification required', secureFooter: 'Secure sign-in · verified email required', closeProfile: 'Close profile',
  };

  useEffect(() => {
    let mounted = true;
    const firebaseAuth = auth;
    setConfigMissing(!isFirebaseConfigured || !firebaseAuth);
    if (!isFirebaseConfigured || !firebaseAuth) return () => { mounted = false; };

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const actionCode = params.get('oobCode') || '';

    const initialize = async () => {
      try {
        if (mode === 'verifyEmail' && actionCode) {
          const info = await checkActionCode(firebaseAuth, actionCode);
          await applyActionCode(firebaseAuth, actionCode);
          window.history.replaceState({}, '', '/account');
          const currentUser = firebaseAuth.currentUser;
          if (currentUser && currentUser.email?.toLowerCase() === info.data.email?.toLowerCase()) {
            await currentUser.reload();
            if (currentUser.emailVerified) {
              const data = await authRequest('session', { method: 'POST', body: JSON.stringify({ idToken: await currentUser.getIdToken(true) }) });
              if (mounted) { setProfile(data.user); setName(data.user.displayName || ''); setNotice(text.verified); }
              return;
            }
          }
          if (mounted) setNotice(text.verified);
        } else if (mode === 'resetPassword' && actionCode) {
          const accountEmail = await verifyPasswordResetCode(firebaseAuth, actionCode);
          if (mounted) { setResetCode(actionCode); setResetEmail(accountEmail); setView('reset-password'); }
          return;
        }
        const data = await authRequest('me');
        if (mounted) { setProfile(data.user); setName(data.user.displayName || ''); }
      } catch (requestError) {
        if (mounted && (mode === 'verifyEmail' || mode === 'resetPassword')) {
          window.history.replaceState({}, '', '/account');
          setError(firebaseErrorMessage(requestError, language));
        }
      }
    };
    void initialize();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setFailedAvatarUrl('');
  }, [profile?.photoUrl]);

  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = window.setTimeout(() => setResendWait((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendWait]);

  const establishSession = async (user: User, endpoint = 'session') => {
    const idToken = await user.getIdToken(true);
    const data = await authRequest(endpoint, { method: 'POST', body: JSON.stringify({ idToken }) });
    setProfile(data.user);
    setName(data.user.displayName || '');
    setNotice('');
    setError('');
  };

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      setVerificationUser(credential.user);
      let syncWarning = '';
      try {
        const idToken = await credential.user.getIdToken(true);
        const registration = await authRequest('register', { method: 'POST', body: JSON.stringify({ idToken }) });
        if (registration.user?.emailVerified) setProfile(registration.user);
      }
      catch (syncError) {
        if ((syncError as { status?: number }).status === 202) {
          // Unverified registration is intentionally recorded without creating a session.
        } else {
          syncWarning = ' Your account was created, but profile synchronization will retry at sign-in.';
        }
      }
      try {
        await sendEmailVerification(credential.user, { url: `${window.location.origin}/account`, handleCodeInApp: true });
        setResendWait(60);
        setNotice(`${text.verificationSent}${syncWarning}`);
        setView('login');
      } catch (sendError) {
        setError(firebaseErrorMessage(sendError, language));
        setNotice(text.verifyBody);
      }
      setPassword('');
    } catch (signupError) {
      setError(firebaseErrorMessage(signupError, language));
    } finally { setBusy(false); }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        setVerificationUser(credential.user);
        setNotice(text.verifyBody);
        setPassword('');
        return;
      }
      await establishSession(credential.user);
    } catch (loginError) {
      setError(firebaseErrorMessage(loginError, language));
    } finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    if (!auth) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      if (!credential.user.emailVerified) throw new Error('Google did not confirm this email address as verified.');
      await establishSession(credential.user);
    } catch (googleError) {
      setError(firebaseErrorMessage(googleError, language));
    } finally { setBusy(false); }
  };

  const handleResend = async () => {
    const user = verificationUser || auth?.currentUser;
    if (!user || resendWait > 0) return;
    setBusy(true); setError('');
    try {
      await sendEmailVerification(user, { url: `${window.location.origin}/account`, handleCodeInApp: true });
      setResendWait(60);
      setNotice(text.verificationSent);
    } catch (resendError) { setError(firebaseErrorMessage(resendError, language)); }
    finally { setBusy(false); }
  };

  const handleResetRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await sendPasswordResetEmail(auth, email.trim(), { url: `${window.location.origin}/account`, handleCodeInApp: true });
      setNotice(text.resetSent);
    } catch (resetError) {
      const code = (resetError as { code?: string }).code;
      setError(code === 'auth/user-not-found' ? text.resetSent : firebaseErrorMessage(resetError, language));
      if (code === 'auth/user-not-found') setNotice(text.resetSent);
    } finally { setBusy(false); }
  };

  const handleConfirmReset = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth) return;
    setBusy(true); setError('');
    try {
      await confirmPasswordReset(auth, resetCode, resetPassword);
      window.history.replaceState({}, '', '/account');
      setView('login'); setEmail(resetEmail); setPassword(''); setResetCode(''); setNotice(text.resetDone);
    } catch (resetError) { setError(firebaseErrorMessage(resetError, language)); }
    finally { setBusy(false); }
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (profileSaveInFlight.current || !name.trim() || name.trim().length > 100) return;
    profileSaveInFlight.current = true;
    setBusy(true); setError(''); setNotice('');
    try {
      const data = await authRequest('me', {
        method: 'PATCH',
        headers: { 'X-CSRF-Token': csrfCookie() },
        body: JSON.stringify({ displayName: name }),
      });
      setProfile(data.user);
      if (auth?.currentUser) {
        try { await updateProfile(auth.currentUser, { displayName: name.trim() }); } catch { /* Server profile remains the source of truth. */ }
      }
      setNotice(text.saved);
    } catch (saveError) { setError(firebaseErrorMessage(saveError, language)); }
    finally { profileSaveInFlight.current = false; setBusy(false); }
  };

  const handleLogout = async () => {
    setBusy(true); setError('');
    try {
      await authRequest('logout', { method: 'POST', headers: { 'X-CSRF-Token': csrfCookie() }, body: '{}' });
      if (auth) await signOut(auth);
      setProfile(null); setVerificationUser(null); setView('login'); setNotice(''); setPassword('');
    } catch (logoutError) { setError(firebaseErrorMessage(logoutError, language)); }
    finally { setBusy(false); }
  };

  const dark = theme === 'dark';
  const fieldClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${dark ? 'border-white/10 bg-slate-950/70 text-white placeholder:text-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400'}`;
  const mutedClass = dark ? 'text-slate-400' : 'text-slate-600';
  const visibleAvatarUrl = isSafeGooglePhotoUrl(profile?.photoUrl) && profile.photoUrl !== failedAvatarUrl ? profile.photoUrl : null;
  const canSaveName = name.trim().length > 0 && name.trim().length <= 100;

  return (
    <section className={`min-h-[calc(100vh-5rem)] px-4 py-10 sm:py-16 ${dark ? 'bg-[#080C14] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="mx-auto w-full max-w-xl">
        <div className={`relative rounded-3xl border p-6 shadow-2xl sm:p-9 ${dark ? 'border-white/10 bg-slate-900/80 shadow-black/30' : 'border-slate-200 bg-white shadow-slate-200/70'}`}>
          <button
            type="button"
            onClick={onClose}
            aria-label={text.closeProfile}
            className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${dark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="mb-7 flex items-center gap-3 pr-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/20"><ShieldCheck className="h-6 w-6" /></div>
            <div><h1 className="text-xl font-bold">{profile ? text.profile : text.account}</h1><p className={`mt-1 text-xs ${mutedClass}`}>{text.accountSubtitle}</p></div>
          </div>

          {notice && <div role="status" className="mb-5 flex gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-500"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{notice}</span></div>}
          {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-400"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          {configMissing && <div role="alert" className="mb-5 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-200">{firebaseConfigIssue || text.firebaseRequired}</div>}

          {profile ? (
            <>
              <div className={`mb-6 flex items-center gap-4 rounded-2xl p-4 ${dark ? 'bg-white/[0.04]' : 'bg-slate-50'}`}>
                {visibleAvatarUrl ? <img key={visibleAvatarUrl} src={visibleAvatarUrl} alt={`${profile.displayName || profile.email} profile picture`} referrerPolicy="no-referrer" onError={() => setFailedAvatarUrl(visibleAvatarUrl)} className="h-14 w-14 shrink-0 rounded-full object-cover object-center" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600/15 text-blue-500"><UserRound className="h-7 w-7" aria-hidden="true" /></div>}
                <div className="min-w-0"><p className="truncate font-semibold">{profile.displayName || profile.email}</p><p className={`mt-1 truncate text-sm ${mutedClass}`}>{profile.email}</p><p className="mt-1 text-xs text-emerald-500">{profile.emailVerified ? text.verifiedAccount : text.verificationRequired}</p></div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <label className="block text-sm font-medium">{text.editName}<input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required className={`${fieldClass} mt-2`} /></label>
                <button disabled={busy || !canSaveName} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{text.save}</button>
              </form>
              <button disabled={busy} onClick={() => void handleLogout()} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${dark ? 'border-white/10 text-slate-300 hover:bg-white/[0.05]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}><LogOut className="h-4 w-4" />{text.logout}</button>
            </>
          ) : view === 'reset-password' ? (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <p className={`text-sm ${mutedClass}`}>{resetEmail}</p>
              <label className="block text-sm font-medium">{text.newPassword}<div className="relative mt-2"><LockKeyhole className={`absolute left-3 top-3.5 h-4 w-4 ${mutedClass}`} /><input type="password" autoComplete="new-password" minLength={8} required value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} className={`${fieldClass} pl-10`} /></div></label>
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{text.reset}</button>
            </form>
          ) : view === 'forgot' ? (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <label className="block text-sm font-medium">{text.email}<div className="relative mt-2"><Mail className={`absolute left-3 top-3.5 h-4 w-4 ${mutedClass}`} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClass} pl-10`} /></div></label>
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{text.sendReset}</button>
              <button type="button" onClick={() => { setView('login'); setError(''); setNotice(''); }} className={`w-full py-2 text-sm font-semibold ${mutedClass}`}>{text.backLogin}</button>
            </form>
          ) : verificationUser ? (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 text-sm ${dark ? 'bg-white/[0.04] text-slate-300' : 'bg-slate-50 text-slate-700'}`}><p className="font-semibold">{text.verifyTitle}</p><p className="mt-2">{text.verifyBody}</p><p className="mt-2 break-all text-cyan-500">{verificationUser.email}</p></div>
              <button disabled={busy || resendWait > 0} onClick={() => void handleResend()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 px-4 py-3 text-sm font-bold text-cyan-500 disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{text.resend}{resendWait > 0 ? ` (${resendWait}s)` : ''}</button>
              <button onClick={() => { setVerificationUser(null); setView('login'); setError(''); }} className={`w-full py-2 text-sm font-semibold ${mutedClass}`}>{text.backLogin}</button>
            </div>
          ) : (
            <>
              {(view === 'signup' || view === 'login') && <button disabled={busy} onClick={() => void handleGoogle()} className={`mb-4 flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${dark ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]' : 'border-slate-200 hover:bg-slate-50'}`}><span className="text-base font-black text-blue-500">G</span>{text.continueGoogle}</button>}
              {(view === 'signup' || view === 'login') && <div className={`mb-4 flex items-center gap-3 text-xs ${mutedClass}`}><span className="h-px flex-1 bg-current opacity-20" />{text.or}<span className="h-px flex-1 bg-current opacity-20" /></div>}
              <form onSubmit={view === 'signup' ? handleSignup : handleLogin} className="space-y-4">
                {view === 'signup' && <label className="block text-sm font-medium">{text.name}<div className="relative mt-2"><UserRound className={`absolute left-3 top-3.5 h-4 w-4 ${mutedClass}`} /><input autoComplete="name" maxLength={100} required value={name} onChange={(event) => setName(event.target.value)} className={`${fieldClass} pl-10`} /></div></label>}
                <label className="block text-sm font-medium">{text.email}<div className="relative mt-2"><Mail className={`absolute left-3 top-3.5 h-4 w-4 ${mutedClass}`} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClass} pl-10`} /></div></label>
                <label className="block text-sm font-medium">{text.password}<div className="relative mt-2"><KeyRound className={`absolute left-3 top-3.5 h-4 w-4 ${mutedClass}`} /><input type="password" autoComplete={view === 'signup' ? 'new-password' : 'current-password'} minLength={view === 'signup' ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} className={`${fieldClass} pl-10`} /></div></label>
                {view === 'login' && <button type="button" onClick={() => { setView('forgot'); setError(''); setNotice(''); }} className="block ml-auto text-xs font-semibold text-cyan-500 hover:text-cyan-400">{text.forgot}</button>}
                <button disabled={busy || configMissing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{view === 'signup' ? text.create : text.signIn}<ArrowRight className="h-4 w-4" /></button>
              </form>
              <div className={`mt-6 text-center text-sm ${mutedClass}`}>
                {view === 'signup' ? text.haveAccount : text.noAccount}{' '}
                <button onClick={() => { setView(view === 'signup' ? 'login' : 'signup'); setError(''); setNotice(''); }} className="font-bold text-cyan-500 hover:text-cyan-400">{view === 'signup' ? text.signIn : text.signup}</button>
              </div>
            </>
          )}
          <div className={`mt-7 flex items-center justify-center gap-2 border-t pt-5 text-[11px] ${dark ? 'border-white/10 text-slate-500' : 'border-slate-100 text-slate-500'}`}><LockKeyhole className="h-3.5 w-3.5" />{text.secureFooter}</div>
        </div>
      </div>
    </section>
  );
}
