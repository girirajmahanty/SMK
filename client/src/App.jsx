import { lazy, Suspense, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Intro from './components/Intro.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import Home from './pages/Home.jsx';
import { smoothScrollTo } from './smoothScroll.js';
import { useLang } from './i18n.jsx';

// Login and admin pages are downloaded only when someone opens them, so visitors of the home page
// don't pay for the admin dashboard (and its stylesheet).
const Login = lazy(() => import('./pages/Login.jsx'));
const AdminLogin = lazy(() => import('./pages/Admin.jsx').then((m) => ({ default: m.AdminLogin })));
const Admin = lazy(() => import('./pages/Admin.jsx').then((m) => ({
  default: () => <m.AdminGate><m.default /></m.AdminGate>,
})));

function initialTheme() {
  try {
    const saved = localStorage.getItem('vl-theme');
    if (saved) return saved;
  } catch { /* ignore */ }
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme);
  const { t } = useLang();
  const { pathname, hash } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('vl-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  // Switch theme with a circle that grows from the clicked button (View Transitions API);
  // browsers without it, or with reduced motion on, just switch instantly.
  const toggleTheme = (e) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      flushSync(() => setTheme(next));
    };
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {}); // The browser skips the effect (e.g. hidden tab, rapid clicks); the theme still changes.
    vt.finished.catch(() => {});
  };

  // Glide to a section for /#story style links, otherwise to the top.
  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) smoothScrollTo(el);
      }, 80);
      return () => clearTimeout(timer);
    }
    smoothScrollTo(0);
  }, [pathname, hash]);

  // Plain in-page links (<a href="#gallery">) glide too, instead of jumping.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const el = a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
      smoothScrollTo(el);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      {!isAdminRoute && <a className="skip-link" href="#main">{t('skip')}</a>}
      {!isAdminRoute && <Intro />}
      {!isAdminRoute && <ScrollProgress />}
      {!isAdminRoute && <Navbar theme={theme} onToggleTheme={toggleTheme} />}
      {!isAdminRoute && <Announcement />}
      {/* key: each page remounts, so it plays the page-in transition */}
      <main id="main" tabIndex={-1} key={pathname} className={`page ${pathname === '/' ? 'page--home' : ''} ${isAdminRoute ? 'admin-page' : ''}`}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function Announcement() {
  const { t } = useLang();
  const message = t('announcement.message');
  if (!message.trim()) return null;
  return <aside className="site-announcement" role="status">{message}</aside>;
}
