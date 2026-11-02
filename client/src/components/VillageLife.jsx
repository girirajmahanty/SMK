import { Camera, Wheat } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';
import { pic } from '../responsive.js';

// One photo card: the description slides up on hover (always shown on touch screens).
function LifeCard({ item, index }) {
  const { pick } = useLang();

  return (
    <Reveal delay={(index % 3) * 110} className={`life2__cell life2__cell--${item.area}`}>
      <article className="life2-card" tabIndex={0}>
        {item.img
          ? <img className="life2-card__img" {...pic(item.img)} sizes="(max-width: 700px) 92vw, 45vw" alt="" loading="lazy" style={{ objectPosition: item.position || 'center' }} />
          : <span className="life2-card__img life2-card__art" aria-hidden="true"><item.Icon /></span>}
        <span className="life2-card__shade" aria-hidden="true" />
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
