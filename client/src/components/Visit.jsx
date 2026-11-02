import { useState } from 'react';
import { CalendarHeart, Landmark, Languages, HeartHandshake, MapPin, Images, ArrowRight, Bus, TrainFront, Clock, Route, Copy, Check, Navigation, Compass } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';

// Red pin exactly on the coordinates, labelled with the place name
const mapTarget = village.coords ? `${village.coords} (${village.mapQuery})` : village.mapQuery;
const mapHref = village.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapTarget)}`;
// Opens Google Maps with a route from the visitor's current location to the Kali Mandir.
const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(village.coords || village.mapQuery)}`;

// Real Google map of the village (no API key needed), with a live pin label on top.
function VillageMap({ label, lang }) {
  const [loaded, setLoaded] = useState(false);
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(mapTarget)}&z=16&hl=${lang}&output=embed`;
  return (
    <div className={`vmap2 ${loaded ? 'is-loaded' : ''}`}>
      <iframe
        className="vmap2__frame"
        title={label}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
      <span className="vmap2__loader" aria-hidden="true"><MapPin /></span>
      <span className="vmap2__chip"><span className="vmap2__chip-dot" /> <MapPin /> {label}</span>
    </div>
  );
}

// Address on a glass panel, with a button that copies it.
function AddressPanel() {
  const { t, pick } = useLang();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pick(village.address));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: nothing to do */ }
  };
  return (
    <div className="visit3__address">
      <span className="visit3__address-pin" aria-hidden="true"><MapPin /></span>
      <div className="visit3__address-body">
        <p className="visit2__label">{t('visit.addressLabel')}</p>
        <p className="visit3__address-text">{pick(village.address)}</p>
      </div>
      <div className="visit3__address-actions">
        <a className="visit3__directions" href={directionsHref} target="_blank" rel="noreferrer">
          <Navigation /> <span>{t('visit.directions')}</span>
        </a>
        <button className={`visit3__copy ${copied ? 'is-done' : ''}`} onClick={copy} title={t('visit.copy')}>
          {copied ? <Check /> : <Copy />} <span>{t(copied ? 'visit.copied' : 'visit.copy')}</span>
        </button>
      </div>
    </div>
  );
}

// "How to reach": a road running down from each town to Sidhagora. A bus keeps travelling along it;
// each stop shows how far it is, with a bar that fills in proportion to the distance.
function Journey() {
  const { t, pick } = useLang();
  // Bar length on a log scale, so 12 km and 278 km both read well.
  const km = (r) => Math.max(2, parseFloat(r.distance.en) || 2);
  const max = Math.max(...village.routes.map(km));
  return (
    <Reveal className="visit3__journey">
      <div className="visit3__journey-head">
        <span className="visit3__journey-icon"><Route /></span>
        <div>
          <h3>{t('visit.how')}</h3>
          <p>{t('visit.howSub')}</p>
        </div>
      </div>
      <ol className="visit3__stops">
        <span className="visit3__road" aria-hidden="true"><span className="visit3__road-fill" /></span>
        {village.routes.map((r, i) => {
          const Icon = r.by === 'train' ? TrainFront : Bus;
          const share = Math.log(km(r)) / Math.log(max);
          return (
            <li key={i} className="visit3__stop" style={{ '--i': i, '--share': share.toFixed(3) }}>
              <span className={`visit3__stop-node visit3__stop-node--${r.by}`}><Icon /></span>
              <div className="visit3__stop-main">
                <div className="visit3__stop-top">
                  <strong>{pick(r.from)}</strong>
                  <span className="visit3__stop-km">{pick(r.distance)}</span>
                </div>
                <span className="visit3__stop-bar" aria-hidden="true"><span /></span>
                <div className="visit3__stop-meta">
                  <span>{t(`visit.by.${r.by}`)}</span>
                  <span><Clock /> {pick(r.time)}</span>
                </div>
              </div>
            </li>
          );
        })}
        <li className="visit3__stop visit3__stop--end" style={{ '--i': village.routes.length }}>
          <span className="visit3__stop-node visit3__stop-node--end"><MapPin /></span>
          <div className="visit3__stop-main"><strong>{t('visit.arrive')}</strong></div>
        </li>
      </ol>
    </Reveal>
  );
}

export default function Visit() {
  const { t, lang } = useLang();
  const info = [
    { Icon: CalendarHeart, label: t('visit.best'), value: t('visit.bestVal') },
    { Icon: Landmark, label: t('visit.see'), value: t('visit.seeVal') },
    { Icon: Languages, label: t('visit.speak'), value: t('visit.speakVal') },
    { Icon: HeartHandshake, label: t('visit.welcome'), value: t('visit.welcomeVal') },
  ];

  return (
    <section id="visit" className="band band--maroon visit-sec">
      <Wave fill="var(--ivory-2)" />
      <span className="visit-sec__contours" aria-hidden="true" />
      <span className="visit-sec__glow" aria-hidden="true" />

      <RichHead eyebrow={t('visit.eyebrow')} title={t('visit.title')} text={t('visit.text')} Icon={MapPin} light />

      <div className="visit3">
        <div className="visit3__top">
          <Reveal className="visit3__mapcard">
            <VillageMap label={t('visit.youAreHere')} lang={lang} />
            <span className="visit3__compass" aria-hidden="true"><Compass /></span>
            <AddressPanel />
          </Reveal>
          {village.routes.length > 0 && <Journey />}
        </div>

        <div className="visit3__cards">
          {info.map((c, i) => (
            <Reveal key={c.label} delay={i * 120} className="visit3__card">
              <span className="visit3__card-medal"><c.Icon /></span>
              <p className="visit2__label">{c.label}</p>
              <p className="visit3__card-value">{c.value}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="visit3__cta">
          <span className="visit3__cta-glow" aria-hidden="true" />
          <div className="visit3__cta-text">
            <Navigation className="visit3__cta-icon" />
            <div>
              <h3>{t('visit.ctaTitle')}</h3>
              <p>{t('visit.ctaText')}</p>
            </div>
          </div>
          <div className="visit3__cta-actions">
            <a className="cta cta--gold" target="_blank" rel="noreferrer" href={mapHref}>
              <span className="cta__icon"><MapPin /></span><span className="cta__label">{t('visit.map')}</span>
            </a>
            <a className="cta cta--glass" href="#gallery">
              <span className="cta__ring" aria-hidden="true" />
              <span className="cta__icon"><Images /></span><span className="cta__label">{t('visit.photos')}</span>
              <span className="cta__end"><ArrowRight /></span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
