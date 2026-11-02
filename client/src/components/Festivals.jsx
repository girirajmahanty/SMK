import { useEffect, useRef, useState } from 'react';
import { CalendarDays, CalendarPlus, Sparkles, Sparkle, Hourglass, Moon, Flame } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import { useFestivalDates, festivalStatus, formatRange, daysUntil } from '../festivalDates.js';
import { smoothScrollTo } from '../smoothScroll.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';
import { pic } from '../responsive.js';

const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const icsText = (s) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

// Saves a small calendar file (.ics) for one festival's days; no server involved.
function addToCalendar(f, range, pick) {
  const end = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate() + 1);
  const name = `${pick(f.name)} · Sidhagora`;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sidhagora//Festivals//EN', 'BEGIN:VEVENT',
    `UID:${f.name.en.toLowerCase().replace(/\W+/g, '-')}-${ymd(range.start)}@sidhagora`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${ymd(range.start)}`, `DTEND;VALUE=DATE:${ymd(end)}`,
    `SUMMARY:${icsText(name)}`, `DESCRIPTION:${icsText(pick(f.text))}`, 'LOCATION:Sidhagora\\, Purulia',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${f.name.en.replace(/\W+/g, '-')}.ics` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Days : hours : minutes : seconds to the festival's first day, ticking only while it is on screen.
export function LiveCountdown({ start }) {
  const { t, lang } = useLang();
  const ref = useRef(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let id;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id);
      if (e.isIntersecting) id = setInterval(() => setNow(Date.now()), 1000);
    });
    io.observe(ref.current);
    return () => { io.disconnect(); clearInterval(id); };
  }, []);
  const left = Math.max(0, start - now);
  const parts = [[Math.floor(left / 864e5), 'd'], [Math.floor(left / 36e5) % 24, 'h'], [Math.floor(left / 6e4) % 60, 'm'], [Math.floor(left / 1e3) % 60, 's']];
  const fmt = (n) => new Intl.NumberFormat(lang === 'bn' ? 'bn-IN' : 'en-IN', { minimumIntegerDigits: 2 }).format(n);
  return (
    <div ref={ref} className="fest4__cd" role="timer" aria-label={t('fest.inDays').replace('{n}', parts[0][0])}>
      {parts.map(([n, k]) => (
        <span key={k} className="fest4__cd-cell"><b>{fmt(n)}</b><small>{t(`fest.cd.${k}`)}</small></span>
      ))}
    </div>
  );
}

// "In 12 days" / "Tomorrow" / "Today" under an exact date.
export function countdown(r, t, lang) {
  const n = daysUntil(r);
  if (n === 0) return t('fest.today');
  if (n === 1) return t('fest.tomorrow');
  return t('fest.inDays').replace('{n}', new Intl.NumberFormat(lang === 'bn' ? 'bn-IN' : 'en-IN').format(n));
}

// One festival as a glass card: dates, description and detail points. The photo lives in the sticky background.
function FestivalCard({ f, range, status, active, soon }) {
  const { t, pick, lang } = useLang();
  return (
    <Reveal as="li" className={`fest4__card fest3--${f.tone || 'sun'} ${f.featured ? 'is-featured' : ''} ${status ? 'is-next' : ''} ${active ? 'is-active' : ''}`}>
      <span className="fest4__card-icon" aria-hidden="true">{f.Icon ? <f.Icon /> : <Sparkles />}</span>
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
      {soon && <LiveCountdown start={range.start} />}
      {f.details?.length > 0 && (
        <ul className="fest3__details">
          {f.details.map((d, k) => <li key={k}><Sparkle /> {pick(d)}</li>)}
        </ul>
      )}
      {range && (
        <button type="button" className="fest4__cal" onClick={() => addToCalendar(f, range, pick)}>
          <CalendarPlus /> {t('fest.addCal')}
        </button>
      )}
    </Reveal>
  );
}

// Festivals through the year over a sticky background: as you scroll, the background behind the cards changes to
// the festival in the middle of the screen (its photo, or its colours and icon), with its name and Bengali date.
export default function Festivals() {
  const { t, pick, lang } = useLang();
  const list = village.festivals;
  const dates = useFestivalDates(list);
  const status = festivalStatus(list, dates);
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const indexRef = useRef(null);

  // the card crossing the middle of the screen is the active festival
  useEffect(() => {
    const cards = [...(listRef.current?.children || [])];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) setActive(cards.indexOf(e.target));
    }), { rootMargin: '-45% 0px -45% 0px' });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [list.length]);

  // keep the glowing name in view when the index is a sideways row (phones)
  useEffect(() => {
    const nav = indexRef.current, b = nav?.children[active];
    if (b && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: b.offsetLeft - (nav.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  if (!list.length) return null;
  const f = list[active];
  // the nearest festival with exact dates still to come gets the live countdown
  const now = Date.now();
  const soonIndex = dates.reduce((best, r, i) => (r && r.start > now && (best < 0 || r.start < dates[best].start) ? i : best), -1);
  // jump to a festival's card, centred on screen
  const jump = (i) => {
    const card = listRef.current?.children[i];
    if (card) smoothScrollTo(card.getBoundingClientRect().top + window.scrollY - (window.innerHeight - card.offsetHeight) / 2);
  };

  return (
    <section id="festivals" className="band band--sand fest-sec fest4-sec">
      <Wave fill="var(--ivory)" />
      <RichHead
        eyebrow={t('fest.eyebrow')} title={t('fest.title')} text={t('fest.sub')} Icon={Flame} lang={lang}
        stats={[[list.length, t('fest.stat.fests')], [12, t('fest.stat.months')], [1, t('fest.stat.village')]]}
      />
      <div className="fest4">
        {/* phones: the same index as a sticky row that the cards slide under */}
        <nav ref={indexRef} className="fest4__chips" aria-label={t('fest.index')}>
          {list.map((g, i) => (
            <button key={g.name.en} type="button" className={i === active ? 'is-active' : ''} onClick={() => jump(i)} aria-current={i === active || undefined}>
              {pick(g.name)}
            </button>
          ))}
        </nav>
        <div className="fest4__bg">
          {list.map((g, i) => (
            <div key={g.name.en} aria-hidden="true" className={`fest4__layer fest3--${g.tone || 'sun'} ${i === active ? 'is-active' : ''}`}>
              {g.img
                ? <img {...pic(g.img)} sizes="100vw" alt="" loading="lazy" style={g.position ? { objectPosition: g.position } : undefined} />
                : <span className="fest4__art">{g.Icon ? <g.Icon /> : <Sparkles />}</span>}
            </div>
          ))}
          <span className="fest4__shade" aria-hidden="true" />
          <span className="fest4__beams" aria-hidden="true" />
          <div className="fest4__now" key={active} aria-hidden="true">
            <span className="fest4__now-num">{String(active + 1).padStart(2, '0')} <small>/ {String(list.length).padStart(2, '0')}</small></span>
            <p className="fest4__now-name">{pick(f.name)}</p>
            <p className="fest4__now-date"><Moon /> {pick(f.date)}</p>
          </div>
          <span className="fest4__rail" aria-hidden="true"><span style={{ '--p': (active + 1) / list.length }} /></span>
          {/* index of every festival: the one on screen glows; pick one to go to it */}
          <nav className="fest4__index" aria-label={t('fest.index')}>
            {list.map((g, i) => (
              <button key={g.name.en} type="button" className={i === active ? 'is-active' : ''} onClick={() => jump(i)} aria-current={i === active || undefined}>
                {pick(g.name)}
              </button>
            ))}
          </nav>
        </div>
        <ol className="fest4__list" ref={listRef}>
          {list.map((g, i) => (
            <FestivalCard key={g.name.en} f={g} range={dates[i]} status={status.index === i ? status.kind : null} active={i === active} soon={i === soonIndex} />
          ))}
        </ol>
      </div>
    </section>
  );
}
