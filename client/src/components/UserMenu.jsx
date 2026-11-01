import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, ChevronDown, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { useLang } from '../i18n.jsx';

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => [...w][0]).join('').toUpperCase();

// Login button when logged out; avatar + dropdown when logged in.
export default function UserMenu() {
  const { user, ready, logout } = useAuth();
  const { t } = useLang();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!ready) return <span className="user-btn user-btn--ghost" aria-hidden="true" />;

  if (!user) {
    return (
      <Link to="/login" state={{ from: pathname }} className="login-btn" title={t('nav.login')}>
        <LogIn /> <span className="login-btn__text">{t('nav.login')}</span>
      </Link>
    );
  }

  return (
    <div className="user-menu" ref={ref}>
      <button className={`user-btn ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} title={user.name}>
        <span className="avatar">{initials(user.name)}</span>
        <ChevronDown className="user-btn__chev" />
      </button>
      {open && (
        <div className="user-pop" role="menu">
          <div className="user-pop__head">
            <span className="avatar avatar--lg">{initials(user.name)}</span>
            <div>
              <p className="user-pop__label">{t('auth.loggedInAs')}</p>
              <p className="user-pop__name">{user.name}</p>
              <p className="user-pop__email">{user.email}</p>
            </div>
          </div>
          <span className={`role-badge role-badge--${user.role}`}>
            {user.role === 'admin' ? <ShieldCheck /> : <UserRound />} {t(`auth.role.${user.role}`)}
          </span>
          <button className="user-pop__item user-pop__item--danger" role="menuitem" onClick={logout}><LogOut /> {t('nav.logout')}</button>
        </div>
      )}
    </div>
  );
}
