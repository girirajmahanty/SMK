import { Link } from 'react-router-dom';
import { MapPin, Heart, Sparkles, ScrollText, Wheat, Images, Flame, ArrowRight, ArrowUp, ArrowUpRight, CalendarDays } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { site } from '../config.js';
import { village } from '../village.js';
import Seal from './Seal.jsx';
import Wave from './Wave.jsx';
import { smoothScrollTo } from '../smoothScroll.js';
import { countdown } from './Festivals.jsx';
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

  return (
    <footer className="footer2">
      <Wave fill="var(--band-dark-bottom)" />
      <span className="footer2__beam" aria-hidden="true" />
      <span className="footer2__glow" aria-hidden="true" />

      <div className="footer2__grid">
        {/* Brand */}
        <div className="footer2__brand">
          <Seal size={78} className="footer2__logo" shine />
          <div>
            <p className="footer2__name">{t('siteName')}</p>
            <p className="footer2__tagline">{t('tagline')}</p>
            <p className="footer2__addr"><MapPin /> {pick(village.address)}</p>
          </div>
        </div>

        {/* Links */}
        <nav className="footer2__nav" aria-label={t('footer.explore')}>
          <p className="footer2__heading">{t('footer.explore')}</p>
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="footer2__link">
              <l.Icon /> <span>{t(l.key)}</span> <ArrowRight className="footer2__link-arrow" />
            </Link>
          ))}
        </nav>

        {/* Festival happening now / next */}
        {fest && (
          <Link to="/#festivals" className={`footer2__season fest3--${fest.tone || 'sun'}`}>
            <p className="footer2__heading">{t(status.kind === 'now' ? 'footer.season' : 'footer.next')}</p>
            <div className="footer2__season-row">
              <span className="footer2__season-icon">{fest.Icon ? <fest.Icon /> : <Sparkles />}</span>
              <div>
                <p className="footer2__season-name">{pick(fest.name)}</p>
                <p className="footer2__season-date"><CalendarDays /> {range ? formatRange(range, lang) : pick(fest.date)}</p>
                {range && <p className="footer2__season-date">{countdown(range, t, lang)}</p>}
              </div>
            </div>
            <span className="footer2__season-more">{t('fest.title')} <ArrowRight /></span>
          </Link>
        )}
      </div>

      <div className="footer2__rule"><Sparkles /></div>
      <div className="footer2__bottom">
        <p><Heart className="icon-heart" /> {t('footer.made')} · © {new Date().getFullYear()}</p>
        <button className="footer2__top" onClick={() => smoothScrollTo(0)}>
          <ArrowUp /> {t('footer.top')}
        </button>
      </div>
      {/* designer credit */}
      <p className="footer2__credit">
        {t('footer.creditBefore')} <Heart className="icon-heart" /> {t('footer.creditAfter')}{' '}
        {designer.url
          ? <a href={designer.url} target="_blank" rel="noopener" className="footer2__designer">{designer.name} <ArrowUpRight /></a>
          : <strong className="footer2__designer">{designer.name}</strong>}
      </p>
    </footer>
  );
}
