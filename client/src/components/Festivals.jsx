import { useEffect, useRef } from 'react';
import { CalendarDays, Sparkles, Sparkle, Hourglass, Camera, Moon, Flame } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import { useFestivalDates, festivalStatus, formatRange, daysUntil } from '../festivalDates.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';
import { pic } from '../responsive.js';

// Sky lanterns that drift up behind the timeline (position, size, speed, delay, sway).
const LANTERNS = [
  [6, 14, 19, 0, 30], [14, 10, 23, 6, -20], [24, 18, 21, 11, 25], [35, 9, 26, 3, -30], [47, 12, 22, 14, 20],
  [58, 16, 24, 8, -25], [68, 10, 20, 1, 30], [77, 14, 25, 12, -20], [86, 11, 21, 5, 25], [94, 15, 23, 16, -30],
];

// "In 12 days" / "Tomorrow" / "Today" under an exact date.
export function countdown(r, t, lang) {
  const n = daysUntil(r);
  if (n === 0) return t('fest.today');
  if (n === 1) return t('fest.tomorrow');
  return t('fest.inDays').replace('{n}', new Intl.NumberFormat(lang === 'bn' ? 'bn-IN' : 'en-IN').format(n));
}

// Hover: the card tilts toward the pointer and a soft spotlight follows it.
function tilt(e) {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
  el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  el.style.setProperty('--ry', `${((x - 0.5) * 7).toFixed(2)}deg`);
  el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
}
function untilt(e) {
  const el = e.currentTarget;
  el.style.setProperty('--rx', '0deg');
  el.style.setProperty('--ry', '0deg');
}

// Rangoli mandala: rings of petals drawn as SVG.
const MANDALA_RINGS = [[8, 34, 14], [12, 58, 18], [16, 84, 22], [24, 112, 20], [32, 140, 14]];
function Mandala() {
  return (
    <svg className="fest-bg__mandala" viewBox="-160 -160 320 320" aria-hidden="true">
      {MANDALA_RINGS.map(([count, r, len], ring) => (
        <g key={ring} className={`fest-bg__ring fest-bg__ring--${ring % 2 ? 'b' : 'a'}`}>
          {Array.from({ length: count }, (_, i) => (
            <path key={i} transform={`rotate(${(360 / count) * i})`}
              d={`M0,${-r + len} C${len * 0.5},${-r + len * 0.4} ${len * 0.35},${-r - len * 0.2} 0,${-r - len * 0.35} C${-len * 0.35},${-r - len * 0.2} ${-len * 0.5},${-r + len * 0.4} 0,${-r + len} Z`} />
          ))}
          <circle r={r + len * 0.55} fill="none" />
        </g>
      ))}
      <circle className="fest-bg__core" r="16" />
    </svg>
  );
}

// Light bulbs hanging on a sagging wire across the top (wire is SVG, bulbs are round spans on the same curve).
const BULBS = 18;
function StringLights({ className }) {
  return (
    <div className={`fest-bg__lights ${className}`}>
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0,4 Q500,136 1000,4" /></svg>
      {Array.from({ length: BULBS }, (_, i) => {
        const t = (i + 0.5) / BULBS;
        const y = 4 + 2 * t * (1 - t) * 132; // same quadratic curve as the wire, 0–100
        return <span key={i} style={{ '--b': i, left: `${t * 100}%`, top: `${y}%` }} />;
      })}
    </div>
  );
}

const PETALS = Array.from({ length: 9 }, (_, i) => [((i * 37) % 100), 9 + (i % 4) * 3, 12 + (i % 5) * 3, (i * 1.7) % 14, i % 2 ? 40 : -40]);

// The section's background stage: it stays in view while you scroll through all the cards.
function FestBackdrop() {
  return (
    <div className="fest-bg" aria-hidden="true">
      <div className="fest-bg__stage">
        <span className="fest-bg__orb fest-bg__orb--1" />
        <span className="fest-bg__orb fest-bg__orb--2" />
        <span className="fest-bg__orb fest-bg__orb--3" />
        <span className="fest-bg__beam fest-bg__beam--l" />
        <span className="fest-bg__beam fest-bg__beam--r" />
        <Mandala />
        <StringLights className="fest-bg__lights--1" />
        {PETALS.map(([x, s, d, delay, sway], i) => (
          <span key={i} className="fest-bg__petal" style={{ '--x': `${x}%`, '--s': `${s}px`, '--d': `${d}s`, '--delay': `-${delay}s`, '--sway': `${sway}px` }} />
        ))}
      </div>
    </div>
  );
}

export default function Festivals() {
  const { t, pick, lang } = useLang();
  const ref = useRef(null);
  const list = village.festivals;
  const dates = useFestivalDates(list);
  const status = festivalStatus(list, dates);

  // --fp: how far the glowing line has been "drawn" (0 → 1) as you scroll through the section.
  // --cover on each card: how many cards have slid on top of it (0 → 1 as each one arrives).
  useEffect(() => {
    const el = ref.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      // --sp: 0 as the section enters at the bottom → 1 as it leaves at the top (drives the parallax).
      const s = el.getBoundingClientRect();
      el.style.setProperty('--sp', Math.max(0, Math.min(1, (vh - s.top) / (s.height + vh))).toFixed(4));


      const line = el.querySelector('.fest2');
      const r = line.getBoundingClientRect();
      const tip = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - r.top) / r.height));
      el.style.setProperty('--fp', tip.toFixed(3));
      // an icon lights up once the glowing line has reached it
      const tipY = r.top + tip * r.height;
      el.querySelectorAll('.fest2__item').forEach((item) => {
        const n = item.querySelector('.fest2__node').getBoundingClientRect();
        item.classList.toggle('is-lit', n.top + n.height / 2 <= tipY + 2);
      });

      const items = [...el.querySelectorAll('.fest2__item')];
      const arrived = items.map((item) => {
        const top = parseFloat(getComputedStyle(item).top);
        if (Number.isNaN(top)) return 0; // not pinned (short screens)
        const gap = item.getBoundingClientRect().top - top;
        return Math.max(0, Math.min(1, 1 - gap / (window.innerHeight * 0.4)));
      });
      let cover = 0;
      for (let i = items.length - 1; i >= 0; i--) {
        items[i].style.setProperty('--cover', cover.toFixed(3));
        // fully hidden under the stack: pause its animations to save work
        items[i].classList.toggle('is-covered', cover > 1.2);
        cover += arrived[i];
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  if (!list.length) return null;

  return (
    <section id="festivals" ref={ref} className="band band--sand fest-sec">
      <div className="fest-sec__sky" aria-hidden="true">
        {LANTERNS.map(([x, s, d, delay, sway], i) => (
          <span key={i} className="fest-lantern" style={{ '--x': `${x}%`, '--s': `${s}px`, '--d': `${d}s`, '--delay': `-${delay}s`, '--sway': `${sway}px` }} />
        ))}
      </div>

      <Wave fill="var(--ivory)" />
      <FestBackdrop />

      <RichHead
        eyebrow={t('fest.eyebrow')} title={t('fest.title')} text={t('fest.sub')} Icon={Flame} lang={lang}
        stats={[[list.length, t('fest.stat.fests')], [12, t('fest.stat.months')], [1, t('fest.stat.village')]]}
      />

      <div className="fest2">
        {/* connector: dotted track, a glowing fill that follows the scroll with light pulses running down it, and a comet at its tip */}
        <span className="fest2__line" aria-hidden="true">
          <span className="fest2__line-fill">
            {[0, 1, 2].map((k) => <span key={k} className="fest2__pulse" style={{ '--k': k }} />)}
          </span>
          <span className="fest2__spark">
            <span className="fest2__spark-trail" />
            <span className="fest2__spark-core" />
            <span className="fest2__spark-bit" style={{ '--k': 0 }} />
            <span className="fest2__spark-bit" style={{ '--k': 1 }} />
            <span className="fest2__spark-bit" style={{ '--k': 2 }} />
          </span>
        </span>
        <ol className="fest2__list">
        {list.map((f, i) => (
          <Reveal
            as="li"
            key={i}
            className={`fest2__item fest2--${f.tone || 'sun'} ${f.featured ? 'is-featured' : ''}`}
            style={{ '--i': i }}
          >
            <span className="fest2__node">{f.Icon ? <f.Icon /> : <Sparkles />}<span className="fest2__branch" aria-hidden="true" /></span>
            <article className="fest2__card" tabIndex={0} onPointerMove={tilt} onPointerLeave={untilt}>
              {f.img && (
                <div className="fest2__img">
                  <img {...pic(f.img)} sizes="(max-width: 760px) 90vw, 420px" alt={pick(f.name)} loading="lazy" style={f.position ? { objectPosition: f.position } : undefined} />
                  <span className="fest2__img-badge" aria-hidden="true">{f.Icon ? <f.Icon /> : <Sparkles />}</span>
                  {f.credit && (
                    <a className="fest2__credit" href={f.credit.url} target="_blank" rel="noreferrer">
                      <Camera /> {f.credit.name}
                    </a>
                  )}
                </div>
              )}
              <div className="fest2__body">
                <div className="fest2__meta">
                  <span className={`fest2__date ${dates[i] ? 'is-exact' : ''}`} key={dates[i] ? 'exact' : 'month'}>
                    <CalendarDays /> {dates[i]?.approx && `${t('fest.approx')} `}{dates[i] ? formatRange(dates[i], lang) : pick(f.date)}
                  </span>
                  {status.index === i && (
                    <span className={`fest2__status fest2__status--${status.kind}`}>
                      <span className="fest2__status-dot" /> {t(status.kind === 'now' ? 'fest.now' : 'fest.next')}
                    </span>
                  )}
                </div>
                <h3>{pick(f.name)}</h3>
                <div className="fest2__when">
                  {dates[i] && <span className="fest2__countdown"><Hourglass /> {countdown(dates[i], t, lang)}</span>}
                  {/* the Bengali-calendar date stays visible beside the exact date */}
                  {dates[i] && <span className="fest2__bdate"><Moon /> {pick(f.date)}</span>}
                </div>
                <p className="fest2__text">{pick(f.text)}</p>
                {f.details?.length > 0 && (
                  <ul className="fest2__details">
                    {f.details.map((d, k) => <li key={k} style={{ '--k': k }}><Sparkle /> {pick(d)}</li>)}
                  </ul>
                )}
              </div>
              <span className="fest2__ring" aria-hidden="true" />
              <span className="fest2__ring fest2__ring--2" aria-hidden="true" />
              <span className="fest2__spot" aria-hidden="true" />
            </article>
          </Reveal>
        ))}
        </ol>
      </div>
    </section>
  );
}
