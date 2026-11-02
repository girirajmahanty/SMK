import { CalendarDays, Sparkles, Sparkle, Hourglass, Moon, Flame } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import { useFestivalDates, festivalStatus, formatRange, daysUntil } from '../festivalDates.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';
import { pic } from '../responsive.js';

// "In 12 days" / "Tomorrow" / "Today" under an exact date.
export function countdown(r, t, lang) {
  const n = daysUntil(r);
  if (n === 0) return t('fest.today');
  if (n === 1) return t('fest.tomorrow');
  return t('fest.inDays').replace('{n}', new Intl.NumberFormat(lang === 'bn' ? 'bn-IN' : 'en-IN').format(n));
}

// One festival: photo (or an art panel in its colours), dates, description and detail points.
function FestivalCard({ f, range, status }) {
  const { t, pick, lang } = useLang();
  return (
    <Reveal as="li" className={`fest3__card fest3--${f.tone || 'sun'} ${f.featured ? 'is-featured' : ''} ${status ? 'is-next' : ''}`}>
      <div className="fest3__media">
        {f.img ? (
          <img {...pic(f.img)} sizes={f.featured ? '(max-width: 760px) 92vw, 560px' : '(max-width: 760px) 92vw, 520px'}
            alt={pick(f.name)} loading="lazy" style={f.position ? { objectPosition: f.position } : undefined} />
        ) : (
          // no photo yet: the festival's colours with its icon and name
          <div className="fest3__art" aria-hidden="true">
            <span className="fest3__art-icon">{f.Icon ? <f.Icon /> : <Sparkles />}</span>
            <span className="fest3__art-name">{pick(f.name)}</span>
          </div>
        )}
        <span className="fest3__icon" aria-hidden="true">{f.Icon ? <f.Icon /> : <Sparkles />}</span>
      </div>
      <div className="fest3__body">
        <div className="fest3__meta">
          <span className="fest3__date">
            <CalendarDays /> {range?.approx && `${t('fest.approx')} `}{range ? formatRange(range, lang) : pick(f.date)}
          </span>
          {status && (
            <span className={`fest3__status fest3__status--${status}`}>
              <span className="fest3__status-dot" /> {t(status === 'now' ? 'fest.now' : 'fest.next')}
            </span>
          )}
        </div>
        <h3>{pick(f.name)}</h3>
        {range && (
          <p className="fest3__when">
            <span><Hourglass /> {countdown(range, t, lang)}</span>
            {/* the Bengali-calendar date stays visible beside the exact date */}
            <span><Moon /> {pick(f.date)}</span>
          </p>
        )}
        <p className="fest3__text">{pick(f.text)}</p>
        {f.details?.length > 0 && (
          <ul className="fest3__details">
            {f.details.map((d, k) => <li key={k}><Sparkle /> {pick(d)}</li>)}
          </ul>
        )}
      </div>
    </Reveal>
  );
}

// Festivals through the year: a clean grid in calendar order, with the featured festival (Kali Puja) full width.
export default function Festivals() {
  const { t, lang } = useLang();
  const list = village.festivals;
  const dates = useFestivalDates(list);
  const status = festivalStatus(list, dates);

  if (!list.length) return null;

  return (
    <section id="festivals" className="band band--sand fest-sec">
      <Wave fill="var(--ivory)" />
      <RichHead
        eyebrow={t('fest.eyebrow')} title={t('fest.title')} text={t('fest.sub')} Icon={Flame} lang={lang}
        stats={[[list.length, t('fest.stat.fests')], [12, t('fest.stat.months')], [1, t('fest.stat.village')]]}
      />
      <ol className="fest3">
        {list.map((f, i) => (
          <FestivalCard key={f.name.en} f={f} range={dates[i]} status={status.index === i ? status.kind : null} />
        ))}
      </ol>
    </section>
  );
}
