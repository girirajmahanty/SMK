import { Link } from 'react-router-dom';
import { MapPin, Heart, Sparkles, ScrollText, Wheat, Images, Flame, ArrowRight, ArrowUp, ArrowUpRight, CalendarDays } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { site } from '../config.js';
import { village } from '../village.js';
import Seal from './Seal.jsx';
import Wave from './Wave.jsx';
import Reveal from './Reveal.jsx';
import { smoothScrollTo } from '../smoothScroll.js';
import { countdown, LiveCountdown } from './Festivals.jsx';
import { useFestivalDates, festivalStatus, formatRange } from '../festivalDates.js';

const { designer } = site;

const LINKS = [
  { to: '/#story', key: 'nav.story', Icon: ScrollText },
  { to: '/#life', key: 'nav.life', Icon: Wheat },
  { to: '/#gallery', key: 'nav.gallery', Icon: Images },
  { to: '/#festivals', key: 'nav.festivals', Icon: Flame },
  { to: '/#visit', key: 'nav.visit', Icon: MapPin },
];

export default function Footer() {
  const { t, pick, lang } = useLang();
  const dates = useFestivalDates(village.festivals);
  const status = festivalStatus(village.festivals, dates);
  const fest = status.index >= 0 ? village.festivals[status.index] : null;
  const range = status.index >= 0 ? dates[status.index] : null;
  // the nearest festival with exact dates still to come gets a live countdown on the card
  const now = Date.now();
  const soon = dates.reduce((best, r, i) => (r && r.start > now && (best < 0 || r.start < dates[best].start) ? i : best), -1);

  return (
    <footer className="footer2 footer3">
      <Wave fill="var(--band-dark-bottom)" />
      <span className="footer2__glow" aria-hidden="true" />

      {/* Crest: the seal in a turning gold ring with light rays rising behind it, then the village name */}
      <Reveal className="footer3__crest">
        <span className="footer3__rays" aria-hidden="true" />
        <span className="footer3__seal">
          <span className="footer3__ring" aria-hidden="true" />
          <Seal size={112} className="footer2__logo" shine />
        </span>
        <p className="footer3__name">{t('siteName')}</p>
        <p className="footer3__tagline">{t('tagline')}</p>
      </Reveal>

      {/* Links as a row of glowing pills */}
      <nav className="footer3__nav" aria-label={t('footer.explore')}>
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="footer3__pill">
            <l.Icon /> <span>{t(l.key)}</span>
          </Link>
        ))}
      </nav>

      <div className="footer3__row">
        <div className="footer3__card">
          <p className="footer2__heading">{t('visit.addressLabel')}</p>
          <p className="footer3__addr"><MapPin /> {pick(village.address)}</p>
        </div>

        {/* Festival happening now / next */}
        {fest && (
          <Link to="/#festivals" className={`footer3__card footer2__season fest3--${fest.tone || 'sun'}`}>
            <p className="footer2__heading">{t(status.kind === 'now' ? 'footer.season' : 'footer.next')}</p>
            <div className="footer2__season-row">
              <span className="footer2__season-icon">{fest.Icon ? <fest.Icon /> : <Sparkles />}</span>
              <div>
                <p className="footer2__season-name">{pick(fest.name)}</p>
                <p className="footer2__season-date"><CalendarDays /> {range ? formatRange(range, lang) : pick(fest.date)}</p>
                {range && <p className="footer2__season-date">{countdown(range, t, lang)}</p>}
              </div>
            </div>
            {soon >= 0 && (
              <div className="footer3__cd">
                <small>{t('footer.countdownTo').replace('{name}', pick(village.festivals[soon].name))}</small>
                <LiveCountdown start={dates[soon].start} />
              </div>
            )}
            <span className="footer2__season-more">{t('fest.title')} <ArrowRight /></span>
          </Link>
        )}

        <div className="footer3__card footer3__made">
          <p><Heart className="icon-heart" /> {t('footer.made')}</p>
          <p className="footer3__copy">© {new Date().getFullYear()} · {t('siteName')}</p>
          <button className="footer2__top" onClick={() => smoothScrollTo(0)}>
            <ArrowUp /> {t('footer.top')}
          </button>
        </div>
      </div>

      <div className="footer2__rule"><Sparkles /></div>
      {/* designer credit: fades up when it scrolls into view */}
      <Reveal as="p" className="footer2__credit">
        <span className="footer2__credit-label">{t('footer.credit')}</span>{' '}
        {designer.url
          ? (
            <a href={designer.url} target="_blank" rel="noopener" className="footer2__designer">
              <span className="footer2__designer-name">{designer.name}</span>
              <ArrowUpRight className="footer2__designer-arrow" aria-hidden="true" />
            </a>
          )
          : <strong className="footer2__designer"><span className="footer2__designer-name">{designer.name}</span></strong>}
      </Reveal>

      {/* The village drawn in gold lines along the foot: the temple in the middle, huts, palm and round trees, bamboo,
          the pond, birds and the moon. The lines draw themselves when the footer comes into view. */}
      <Reveal className="footer3__skyline">
        <svg viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path pathLength="1" d="M0 120 H1200" />
          {/* bamboo */}
          <path pathLength="1" d="M70 120 V58 M82 120 V46 M94 120 V62 M70 70 l-12 -8 M82 60 l12 -9 M94 74 l12 -7 M82 80 l-13 -6" />
          {/* round trees */}
          <path pathLength="1" d="M170 120 V92 M150 76 a20 18 0 1 0 40 0 a20 18 0 1 0 -40 0" />
          <path pathLength="1" d="M1050 120 V94 M1032 79 a18 16 0 1 0 36 0 a18 16 0 1 0 -36 0" />
          {/* palm */}
          <path pathLength="1" d="M300 120 Q295 90 302 58 M302 58 q-20 -5 -34 9 M302 58 q20 -5 34 9 M302 58 q-8 -17 -26 -19 M302 58 q8 -17 26 -19" />
          {/* huts */}
          <path pathLength="1" d="M384 120 V96 H456 V120 M374 98 L420 70 L466 98 M412 120 V106 H428 V120" />
          <path pathLength="1" d="M744 120 V98 H806 V120 M736 100 L775 76 L814 100 M768 120 V108 H782 V120" />
          {/* temple */}
          <path pathLength="1" d="M548 120 V108 H652 V120 M560 108 V74 H640 V108 M586 108 V88 a14 14 0 0 1 28 0 V108 M568 74 Q600 4 632 74 M600 20 V8 M600 8 l13 4 l-13 4" />
          {/* pond with ripples */}
          <path pathLength="1" d="M900 128 a62 7 0 1 0 124 0 a62 7 0 1 0 -124 0 M935 128 h22 M972 130 h18" />
          {/* birds and moon */}
          <path pathLength="1" d="M480 34 q7 -7 14 0 q7 -7 14 0 M520 46 q5 -5 10 0 q5 -5 10 0" />
          <path pathLength="1" d="M1118 30 a16 16 0 1 0 14 22 a12 12 0 1 1 -14 -22" />
        </svg>
      </Reveal>
    </footer>
  );
}
