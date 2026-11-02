import { useEffect, useRef, useState } from 'react';
import { Wheat } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';
import { pic } from '../responsive.js';

const STEP_MS = 5000;

// One tall panel: narrow with its name running upward; when open it widens and tells its story.
// Panels without a photo show their icon on an alpana-like pattern, the icon moving in its own way.
function LifePanel({ item, index, open, onOpen }) {
  const { pick } = useLang();
  return (
    <article className={`life3__panel life3__panel--${item.area} ${open ? 'is-open' : ''}`} tabIndex={0} onFocus={onOpen}>
      {item.img
        ? <img className="life3__img" {...pic(item.img)} sizes="(max-width: 899px) 82vw, 50vw" alt="" loading="lazy" style={{ objectPosition: item.position || 'center' }} />
        : <span className="life3__img life3__art" aria-hidden="true"><item.Icon /></span>}
      <span className="life3__shade" aria-hidden="true" />
      <span className="life3__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <span className="life3__label" aria-hidden="true">{pick(item.title)}</span>
      <div className="life3__body">
        <span className="life3__icon"><item.Icon /></span>
        <h3>{pick(item.title)}</h3>
        <p>{pick(item.text)}</p>
      </div>
      <span className="life3__timer" aria-hidden="true" />
    </article>
  );
}

export default function VillageLife() {
  const { t, pick } = useLang();
  const items = village.life;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [slide, setSlide] = useState(0);
  const wrapRef = useRef(null);
  const row = () => wrapRef.current?.querySelector('.life3');

  // Wider screens: the next panel opens every few seconds while the row is on screen and not under the mouse.
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
  const calm = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const running = wide && !calm && onScreen && !paused;
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.4 });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % items.length), STEP_MS);
    return () => clearTimeout(id);
  }, [running, active, items.length]);

  // Phones: the panels sit in a row you swipe through; the dots follow the card in view.
  useEffect(() => {
    const el = row();
    if (!el) return;
    const on = () => {
      const card = el.firstElementChild;
      if (!card) return;
      const w = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0);
      setSlide(Math.min(items.length - 1, Math.round(el.scrollLeft / w)));
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => el.removeEventListener('scroll', on);
  }, [items.length]);
  const goTo = (i) => {
    const el = row();
    const card = el?.children[i];
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
  };

  return (
    <section id="life" className="band band--maroon life2-sec">
      <Wave fill="var(--ivory)" />
      <span className="life2-sec__glow" aria-hidden="true" />
      <RichHead eyebrow={t('life.eyebrow')} title={t('life.title')} text={t('life.text')} Icon={Wheat} light />
      <div ref={wrapRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <Reveal className={`life3 ${running ? 'is-running' : ''}`}>
          {items.map((item, i) => (
            <LifePanel key={item.area || i} item={item} index={i} open={i === active} onOpen={() => setActive(i)} />
          ))}
        </Reveal>
        <div className="life3__dots">
          {items.map((item, i) => (
            <button key={item.area || i} type="button" className={i === slide ? 'is-active' : ''} onClick={() => goTo(i)} aria-label={pick(item.title)} />
          ))}
        </div>
      </div>
    </section>
  );
}
