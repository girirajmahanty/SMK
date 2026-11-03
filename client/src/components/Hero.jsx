import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Compass, Camera, MapPin, Sparkle, Images, ChevronDown } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import { pic } from '../responsive.js';
import Seal from './Seal.jsx';
import BgFx from './BgFx.jsx';
import RotatingWord from './RotatingWord.jsx';

function CountUp({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 1600, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{n}</>;
}

// Premium hero button: icon badge, sparkles on hover, gently follows the cursor (magnetic),
// and a ripple where you click. Renders a router Link when `to` is given, otherwise an anchor.
function HeroCta({ variant, icon: Icon, endIcon: EndIcon, to, href, children, className = '' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current, r = el.getBoundingClientRect();
    el.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
    el.style.setProperty('--ty', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
    el.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
  };
  const onLeave = () => {
    ref.current.style.setProperty('--tx', '0px');
    ref.current.style.setProperty('--ty', '0px');
  };
  const onClick = (e) => {
    const el = ref.current, r = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'cta__ripple';
    ripple.style.left = `${e.clientX - r.left}px`;
    ripple.style.top = `${e.clientY - r.top}px`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };
  const content = (
    <>
      <span className="cta__ring" aria-hidden="true" />
      <span className="cta__icon"><Icon /></span>
      <span className="cta__label">{children}</span>
      {EndIcon && <span className="cta__end"><EndIcon /></span>}
      {[0, 1, 2, 3].map((i) => <span key={i} className={`cta__sparkle cta__sparkle--${i}`} aria-hidden="true" />)}
    </>
  );
  const props = { ref, className: `cta cta--${variant} ${className}`, onMouseMove: onMove, onMouseLeave: onLeave, onClick };
  return to ? <Link to={to} {...props}>{content}</Link> : <a href={href} {...props}>{content}</a>;
}

// Description revealed word by word (split on spaces, so Bengali words stay whole); chosen words glow gold.
function RevealWords({ text, highlights = [] }) {
  const strip = (w) => w.replace(/[.,!?;:—–\-"'।]/g, '');
  return text.split(' ').map((w, i) => (
    <span key={i}>
      <span className={`hero__w ${highlights.includes(strip(w)) ? 'hero__w--hl' : ''}`} style={{ '--i': i }}>{w}</span>{' '}
    </span>
  ));
}

// Decorative mandala around the seal (like an alpana pattern): lotus petals, rotating rings,
// and sparkles orbiting at different speeds.
function EmblemRings() {
  return (
    <svg className="hero__rings" viewBox="0 0 240 240" aria-hidden="true">
      <defs>
        <linearGradient id="petal-gold" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#c6923a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff1c9" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="spark" r="50%">
          <stop offset="0%" stopColor="#fffbea" />
          <stop offset="40%" stopColor="#f0d9a8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e3b768" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="ring ring--petals">
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M120,46 Q128,34 120,22 Q112,34 120,46 Z" transform={`rotate(${i * 22.5} 120 120)`} />
        ))}
      </g>
      <g className="ring ring--a"><circle cx="120" cy="120" r="101" /></g>
      <g className="ring ring--b"><circle cx="120" cy="120" r="108" /></g>
      <g className="ring ring--c">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <rect key={i} x={120 + Math.cos(a) * 115 - 2.5} y={120 + Math.sin(a) * 115 - 2.5} width="5" height="5" transform={`rotate(45 ${120 + Math.cos(a) * 115} ${120 + Math.sin(a) * 115})`} />;
        })}
      </g>
      <g className="orbit orbit--1"><circle cx="120" cy="16" r="5" fill="url(#spark)" /></g>
      <g className="orbit orbit--2"><circle cx="120" cy="8" r="4" fill="url(#spark)" /></g>
      <g className="orbit orbit--3"><circle cx="120" cy="26" r="3.5" fill="url(#spark)" /></g>
    </svg>
  );
}

export default function Hero({ visits }) {
  const { t, pick } = useLang();

  return (
    <section className="hero">
      <div className="hero__layer hero__layer--bg" aria-hidden="true">
        {village.heroImage && <img className="hero__photo" {...pic(village.heroImage)} sizes="100vw" alt="" fetchpriority="high" decoding="async" />}
      </div>
      <div className="hero__overlay" aria-hidden="true" />
      <BgFx embers={14} className="bgfx--hero" />

      {/* Village badge: centred at the top of the hero, above everything */}
      <div className="hero-badge-wrap hero-badge-wrap--top">
        <span className="hero-badge__line hero-badge__line--l" aria-hidden="true" />
        <p className="hero-badge">
          <span className="sr-only">{t('hero.eyebrow')}</span>
          <span className="hero-badge__ping" aria-hidden="true"><MapPin /></span>
          <span className="hero-badge__text" aria-hidden="true">
            <span className="hero-badge__word hero-badge__word--name">{t('siteName')}</span>
            <span className="hero-badge__sep"><Sparkle /></span>
            <span className="hero-badge__word hero-badge__word--place">{t('hero.ourVillage')}</span>
          </span>
        </p>
        <span className="hero-badge__line hero-badge__line--r" aria-hidden="true" />
      </div>

      <div className="hero__inner">
        {/* Warm light behind the crest and name: it breathes, and a sheen crosses it once on arrival */}
        <span className="hero__light" aria-hidden="true" />
        {/* Seal sits beside the name like a crest */}
        <div className="hero__brand">
          {/* Wrapper fades in; the inner emblem moves with the mouse (both use transform). */}
          <div className="fade-up">
            <div className="hero__emblem">
              <EmblemRings />
              <Seal size={130} className="hero__seal" shine />
            </div>
          </div>
          {/* Title and its underline share one column, so the underline sits centred under the name */}
          <div className="hero__title-col">
            <h1 key={`title-${t('siteName')}`} className="hero__title" data-text={t('siteName')}>{t('siteName')}</h1>
            <svg className="hero__flourish" viewBox="0 0 320 24" aria-hidden="true">
              <path className="hero__flourish-line" d="M150,12 C120,12 100,4 70,12 C50,17 30,12 12,12" />
              <path className="hero__flourish-line" d="M170,12 C200,12 220,4 250,12 C270,17 290,12 308,12" />
              <path className="hero__flourish-gem" d="M160,4 L168,12 L160,20 L152,12 Z" />
            </svg>
          </div>
        </div>
        <p className="hero__rotate fade-up" style={{ animationDelay: '500ms' }}>
          <RotatingWord words={[t('hero.subtitle')]} />
        </p>
        <p key={`sub-${pick(village.heroLine)}`} className="hero__sub">
          <RevealWords text={pick(village.heroLine)} highlights={pick(village.heroHighlights)} />
        </p>
        <div className="hero__cta">
          <HeroCta variant="gold" icon={Compass} href="#story" className="hero__btn--1">{t('hero.explore')}</HeroCta>
          <HeroCta variant="glass" icon={Images} endIcon={ArrowRight} href="#gallery" className="hero__btn--2">{t('hero.gallery')}</HeroCta>
        </div>
      </div>

      {/* Bottom row: the live visit counter and a gold "scroll down" cue that takes you to the story */}
      <div className="hero__foot">
        {visits && (
          <p className="hero__visits">
            <span className="live-dot" aria-hidden="true" />
            <Eye /> <strong><CountUp value={visits} /></strong> {t('hero.visits')}
          </p>
        )}
        <a href="#story" className="hero__next">
          <span>{t('hero.scroll')}</span>
          <span className="hero__next-arrow" aria-hidden="true"><ChevronDown /></span>
        </a>
      </div>

      {village.heroCredit && (
        <a className="hero__credit" href={village.heroCredit.url} target="_blank" rel="noreferrer">
          <Camera /> {t('hero.photo')}: {village.heroCredit.name} · Unsplash
        </a>
      )}
      <svg className="hero__wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
        <path className="hero__wave-line" d="M0,48 C240,90 480,10 720,40 C960,70 1200,20 1440,52" />
        <path className="hero__wave-fill" d="M0,60 C240,100 480,22 720,52 C960,82 1200,32 1440,64 L1440,90 L0,90 Z" />
      </svg>
    </section>
  );
}
