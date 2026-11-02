import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ScrollText, Wheat, Images, MapPin, Flame, LogIn, LogOut } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { useAuth } from '../auth.jsx';
import { village } from '../village.js';
import Seal from './Seal.jsx';
import AnimatedName from './AnimatedName.jsx';
import UserMenu from './UserMenu.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const links = [
  { to: '/#story', key: 'nav.story', Icon: ScrollText },
  { to: '/#life', key: 'nav.life', Icon: Wheat },
  { to: '/#gallery', key: 'nav.gallery', Icon: Images },
  { to: '/#festivals', key: 'nav.festivals', Icon: Flame },
  { to: '/#visit', key: 'nav.visit', Icon: MapPin },
];
const ids = links.map((l) => l.to.slice(2));

// The section whose top has passed 40% of the screen height (null above the first one).
function currentSection() {
  const line = window.innerHeight * 0.4;
  let found = null;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= line) found = id;
  }
  return found;
}

export default function Navbar({ theme, onToggleTheme }) {
  const { lang, setLang, t, pick } = useLang();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState(null);
  const linksRef = useRef(null);
  const [pill, setPill] = useState(null);

  // Scrollspy: follow which section is on screen.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 20);
      setSection(pathname === '/' ? currentSection() : null);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    onScroll(); // first measure on the next frame, not during startup
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [pathname]);

  // Open menu: Escape closes it, and the page behind does not scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  // Over the dark hero on the home page the bar is light-on-dark until you scroll.
  const onHero = pathname === '/' && !scrolled;
  const isActive = (to) => (to.includes('#') ? pathname === '/' && to === `/#${section}` : pathname === to);

  // The glowing pill slides under the active link (desktop bar only; hidden in the phone menu by CSS).
  useLayoutEffect(() => {
    const a = section && linksRef.current?.querySelector(`a[href="/#${section}"]`);
    setPill(a ? { left: a.offsetLeft, width: a.offsetWidth } : null);
  }, [section, lang]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${onHero ? 'nav--hero' : ''}`}>
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand__logo">
          <Seal size={44} className="brand__seal" />
        </span>
        <span>
          <span className="brand__text"><AnimatedName key={lang} text={t('siteName')} lang={lang} /></span>
          <span className="brand__sub">{pick(village.subtitle)}</span>
        </span>
      </Link>

      {open && <button className="nav__scrim" onClick={() => setOpen(false)} aria-label="Close menu" tabIndex={-1} />}
      <nav ref={linksRef} id="site-menu" className={`nav__links ${open ? 'is-open' : ''}`}>
        <span className={`nav__pill ${pill ? 'is-on' : ''}`} style={pill ? { '--pl': `${pill.left}px`, '--pw': `${pill.width}px` } : undefined} aria-hidden="true" />
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={() => `nav__link ${isActive(l.to) ? 'active' : ''}`} onClick={() => setOpen(false)}>
            <l.Icon className="nav__icon" />
            <span>{t(l.key)}</span>
          </NavLink>
        ))}
        {/* Menu-only items (phones/tablets): account and theme. */}
        <div className="nav__menu-extra">
          {user ? (
            <button className="nav__link nav__link--account" onClick={() => { logout(); setOpen(false); }}>
              <LogOut className="nav__icon" /><span>{t('nav.logout')} · {user.name}</span>
            </button>
          ) : (
            <Link to="/login" state={{ from: pathname }} className={`nav__link nav__link--account ${pathname === '/login' ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <LogIn className="nav__icon" /><span>{t('nav.login')}</span>
            </Link>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} className="nav__theme--menu" />
        </div>
      </nav>

      <div className="nav__actions">
        <div className="lang-switch" role="group" aria-label="Language" title="Language / ভাষা">
          <span className={`lang-switch__thumb ${lang === 'bn' ? 'is-right' : ''}`} />
          <button className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>EN</button>
          <button className={lang === 'bn' ? 'is-active' : ''} onClick={() => setLang('bn')}>বাং</button>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className="nav__theme--bar" />
        <div className="nav__user"><UserMenu /></div>
        <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} aria-controls="site-menu">
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
