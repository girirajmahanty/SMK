import { Fragment, useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Reveal from './Reveal.jsx';

// Splits text into words (never letters, so Bengali stays shaped) that rise in one by one.
export function Words({ text, className, start = 0 }) {
  return text.split(' ').map((w, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      <span className={`${className}-wrap`} aria-hidden="true">
        <span className={className} style={{ '--w': i + start }}>{w}</span>
      </span>
    </Fragment>
  ));
}

// Counts up from 0 when it scrolls into view.
export function CountUp({ to, lang }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let frame;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / 1400);
        setN(Math.round(to * (1 - (1 - p) ** 3)));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [to]);
  return <b ref={ref}>{new Intl.NumberFormat(lang === 'bn' ? 'bn-IN' : 'en-IN').format(n)}</b>;
}

// Section heading: eyebrow between two flickering diyas, title words rising with a gold shimmer,
// an ornament that draws itself, subtitle words floating up, optional counting stats.
export default function RichHead({ eyebrow, title, text, Icon = Sparkles, stats, light = false, align = 'center', className = '', lang }) {
  return (
    <Reveal className={`head rhead ${light ? 'rhead--light' : ''} ${align === 'left' ? 'rhead--left' : ''} ${className}`}>
      <p className="rhead__eyebrow">
        <span className="rhead__diya" aria-hidden="true" />
        <span>{eyebrow}</span>
        <span className="rhead__diya" aria-hidden="true" />
      </p>
      <h2 className="head__title rhead__title">
        <span className="sr-only">{title}</span>
        <Words text={title} className="rhead__word" />
      </h2>
      <span className="rhead__ornament" aria-hidden="true"><span /><Icon /><span /></span>
      {text && (
        <p className="head__text rhead__text">
          <span className="sr-only">{text}</span>
          <Words text={text} className="rhead__tword" start={4} />
        </p>
      )}
      {stats?.length > 0 && (
        <div className="rhead__stats">
          {stats.map(([n, label], k) => (
            <span key={label} className="rhead__stat" style={{ '--k': k }}>
              <CountUp to={n} lang={lang} /> <small>{label}</small>
            </span>
          ))}
        </div>
      )}
    </Reveal>
  );
}
