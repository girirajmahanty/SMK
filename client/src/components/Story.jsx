import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Quote, Landmark, Hourglass, Eye, Users, House, ScrollText } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import { pic } from '../responsive.js';
import Seal from './Seal.jsx';

// Counts up from `from` to `value` the first time it scrolls into view.
function CountOnView({ value, from = 0, suffix = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(from);
  useEffect(() => {
    let frame;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1600, 1);
        setN(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value, from]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// "SINCE 1901 · SMK ·" written around a circle that slowly turns.
function SinceRing({ year, label }) {
  const text = `${label} ${year} • SMK • ${label} ${year} • SMK • `;
  return (
    <svg className="story2__ring" viewBox="0 0 200 200" aria-hidden="true">
      <defs><path id="since-ring" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" /></defs>
      <text><textPath href="#since-ring" textLength="508">{text}</textPath></text>
    </svg>
  );
}

export default function Story({ visits = null }) {
  const { t, pick } = useLang();

  const est = village.established;
  const stats = [
    est && { Icon: Landmark, value: est, from: est - 120, label: t('story.established') },
    est && { Icon: Hourglass, value: new Date().getFullYear() - est, suffix: '+', label: t('story.years') },
    village.families && { Icon: House, value: village.families, label: t('stat.families') },
    village.population && { Icon: Users, value: village.population, label: t('stat.population') },
    visits && { Icon: Eye, value: visits, label: t('story.visits') },
  ].filter(Boolean).slice(0, 3);
  const { main, side } = village.storyImages;

  return (
    <section id="story" className="band band--ivory story-sec">
      <div className="story2">
        {/* Photo collage */}
        <div className="story2__media">
          <span className="story2__pattern" aria-hidden="true" />
          <Reveal className="story2__frame story2__frame--main">
            <figure>
              <img {...pic(main.src)} sizes="(max-width: 900px) 80vw, 480px" alt={pick(main.caption)} loading="lazy" style={{ objectPosition: main.position }} />
              <figcaption>{pick(main.caption)}</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={250} className="story2__frame story2__frame--side">
            <figure>
              <img {...pic(side.src)} sizes="(max-width: 900px) 45vw, 300px" alt={pick(side.caption)} loading="lazy" style={{ objectPosition: side.position }} />
              <figcaption>{pick(side.caption)}</figcaption>
            </figure>
          </Reveal>
          {est && (
            <Reveal delay={450} className="story2__medallion">
              <SinceRing year={est} label={t('story.since')} />
              <Seal size={86} className="story2__logo" shine />
            </Reveal>
          )}
        </div>

        {/* Text */}
        <div className="story2__content">
          <RichHead eyebrow={t('story.eyebrow')} title={t('story.title')} Icon={ScrollText} align="left" className="story2__head" />

          {village.story.map((p, i) => (
            <Reveal key={i} delay={i * 110} as="p" className={`story2__p ${i === 0 ? 'dropcap' : ''}`}>{pick(p)}</Reveal>
          ))}

          {village.storyQuote && (
            <Reveal as="blockquote" className="story2__quote">
              <Quote className="story2__quote-icon" />
              <p>{pick(village.storyQuote)}</p>
            </Reveal>
          )}

          <div className="story2__stats">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 120} className="story2__stat">
                <span className="story2__stat-icon"><s.Icon /></span>
                <strong><CountOnView value={s.value} from={s.from} suffix={s.suffix} /></strong>
                <span className="story2__stat-label">{s.label}</span>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <a href="#life" className="story2__cta">{t('story.cta')} <ArrowRight /></a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
