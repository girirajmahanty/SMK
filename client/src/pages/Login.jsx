import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Eye, EyeOff, Loader2, LogIn, UserPlus, ShieldCheck, CircleAlert, Users, Flame, Heart,
} from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { useLang } from '../i18n.jsx';
import Seal from '../components/Seal.jsx';

// 0 = too short, then 1–4 from weak to strong.
function strength(pw) {
  if (pw.length < 8) return 0;
  let s = 1;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

function Field({ icon: Icon, label, type = 'text', value, onChange, autoComplete, children, onKeyUp }) {
  return (
    <label className="auth-field">
      <Icon className="auth-field__icon" />
      <input type={type} value={value} onChange={onChange} placeholder=" " autoComplete={autoComplete} onKeyUp={onKeyUp} required />
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function Login() {
  const { t } = useLang();
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setError(''), [mode]);

  if (user && !busy) return <Navigate to={location.state?.from || '/'} replace />;

  const isRegister = mode === 'register';
  const score = strength(password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(t(`err.${err.code}`) !== `err.${err.code}` ? t(`err.${err.code}`) : t('err.generic'));
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <div className="auth__card">
        {/* Left: heritage panel */}
        <aside className="auth__side">
          <div className="rays rays--faint" aria-hidden="true" />
          <Seal size={120} className="auth__seal" shine />
          <h2>{t('siteName')}</h2>
          <p>{t('tagline')}</p>
          <ul className="auth__perks">
            <li><Users /> {t('auth.perk1')}</li>
            <li><Flame /> {t('auth.perk2')}</li>
            <li><Heart /> {t('auth.perk3')}</li>
          </ul>
        </aside>

        {/* Right: form */}
        <div className="auth__main">
          <p className="eyebrow"><ShieldCheck /> {t('auth.eyebrow')}</p>
          <h1 key={mode} className="auth__title">{isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}</h1>
          <p className="muted auth__sub">{isRegister ? t('auth.registerSub') : t('auth.loginSub')}</p>

          <div className="auth-tabs" role="tablist">
            <span className={`auth-tabs__thumb ${isRegister ? 'is-right' : ''}`} aria-hidden="true" />
            <button type="button" role="tab" aria-selected={!isRegister} className={!isRegister ? 'is-active' : ''} onClick={() => setMode('login')}>
              <LogIn /> {t('auth.tabLogin')}
            </button>
            <button type="button" role="tab" aria-selected={isRegister} className={isRegister ? 'is-active' : ''} onClick={() => setMode('register')}>
              <UserPlus /> {t('auth.tabRegister')}
            </button>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate={false}>
            <div className={`auth-form__collapse ${isRegister ? 'is-open' : ''}`}>
              <div>
                {isRegister && (
                  <Field icon={User} label={t('auth.name')} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                )}
              </div>
            </div>
            <Field icon={Mail} type="email" label={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Field
              icon={Lock}
              type={showPw ? 'text' : 'password'}
              label={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock'))}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            >
              <button type="button" className="auth-field__eye" onClick={() => setShowPw(!showPw)} aria-label={showPw ? t('auth.hide') : t('auth.show')} title={showPw ? t('auth.hide') : t('auth.show')}>
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </Field>

            {caps && <p className="auth-note"><CircleAlert /> Caps Lock</p>}

            {isRegister && (
              <div className="pw-meter" data-score={score}>
                <div className="pw-meter__bars">{[1, 2, 3, 4].map((i) => <span key={i} className={score >= i ? 'on' : ''} />)}</div>
                <span className="pw-meter__label">{password ? t(`auth.strength.${score}`) : t('auth.pwHint')}</span>
              </div>
            )}

            {error && <p className="alert auth-error" role="alert"><CircleAlert /> {error}</p>}

            <button className="btn btn--primary btn--block auth-submit" disabled={busy}>
              {busy ? <><Loader2 className="spin" /> {t('auth.wait')}</> : isRegister ? <><UserPlus /> {t('auth.submitRegister')}</> : <><LogIn /> {t('auth.submitLogin')}</>}
            </button>
          </form>

          <p className="auth__switch muted">
            {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
            <button type="button" className="hover-underline" onClick={() => setMode(isRegister ? 'login' : 'register')}>
              {isRegister ? t('auth.tabLogin') : t('auth.tabRegister')}
            </button>
          </p>
          <p className="auth__secure"><ShieldCheck /> {t('auth.secure')}</p>
        </div>
      </div>
    </section>
  );
}
