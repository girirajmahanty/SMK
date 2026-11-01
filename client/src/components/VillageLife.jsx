import { useRef } from 'react';
import { Camera, Wheat } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';
import { pic } from '../responsive.js';

// One photo card: tilts toward the cursor, a soft light follows it, and the description slides up on hover.
function LifeCard({ item, index }) {
  const { pick } = useLang();
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
    el.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
    el.style.setProperty('--lx', `${x * 100}%`);
    el.style.setProperty('--ly', `${y * 100}%`);
  };
  const onLeave = () => {
    ref.current.style.setProperty('--rx', '0deg');
    ref.current.style.setProperty('--ry', '0deg');
  };

  return (
    <Reveal delay={(index % 3) * 110} className={`life2__cell life2__cell--${item.area}`}>
      <article ref={ref} className="life2-card" onMouseMove={onMove} onMouseLeave={onLeave} tabIndex={0}>
        <img className="life2-card__img" {...pic(item.img)} sizes="(max-width: 700px) 92vw, 45vw" alt="" loading="lazy" style={{ objectPosition: item.position || 'center' }} />
        <span className="life2-card__shade" aria-hidden="true" />
        <span className="life2-card__light" aria-hidden="true" />
        <span className="light-ring" aria-hidden="true" style={{ '--ring-delay': `${index * -0.6}s` }} />
        <span className="life2-card__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        {item.credit && (
          <a className="life2-card__credit" href={item.credit.url} target="_blank" rel="noreferrer" tabIndex={-1}>
            <Camera /> {item.credit.name}
          </a>
        )}
        <div className="life2-card__body">
          <span className="life2-card__icon"><item.Icon /></span>
          <h3>{pick(item.title)}</h3>
          <div className="life2-card__more"><p>{pick(item.text)}</p></div>
        </div>
      </article>
    </Reveal>
  );
}

export default function VillageLife() {
  const { t } = useLang();
  return (
    <section id="life" className="band band--maroon life2-sec">
      <Wave fill="var(--ivory)" />
      <span className="life2-sec__glow" aria-hidden="true" />
      <RichHead eyebrow={t('life.eyebrow')} title={t('life.title')} text={t('life.text')} Icon={Wheat} light />
      <div className="life2">
        {village.life.map((item, i) => <LifeCard key={item.area || i} item={item} index={i} />)}
      </div>
    </section>
  );
}
