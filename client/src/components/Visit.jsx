import { useEffect, useState } from 'react';
import {
  CalendarHeart, Landmark, Languages, HeartHandshake, MapPin, Images, ArrowRight, Bus, TrainFront, Clock, Route, Copy, Check, Navigation,
  CarTaxiFront, Footprints, Maximize2, Minimize2, Share2,
} from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import Reveal from './Reveal.jsx';
import RichHead from './RichHead.jsx';
import Wave from './Wave.jsx';

// Red pin exactly on the coordinates, labelled with the place name
const mapTarget = village.coords ? `${village.coords} (${village.mapQuery})` : village.mapQuery;
const mapHref = village.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapTarget)}`;
const destination = encodeURIComponent(village.coords || village.mapQuery);
// Opens Google Maps with a route from the visitor's current location (or a given place) to the Kali Mandir.
const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
const routeHref = (from) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${destination}`;

const STEP_ICONS = { bus: Bus, train: TrainFront, toto: CarTaxiFront, walk: Footprints };

// Real Google map of the village (no API key needed), with a live pin label on top.
// The view switches between the map and the satellite picture.
function VillageMap({ label, lang, satellite }) {
  const [loaded, setLoaded] = useState(false);
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(mapTarget)}&z=16&t=${satellite ? 'k' : 'm'}&hl=${lang}&output=embed`;
  useEffect(() => setLoaded(false), [src]);
  return (
    <div className={`vmap2 ${loaded ? 'is-loaded' : ''}`}>
      <iframe
        key={src}
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

// "How to reach": a road of stops running into Sidhagora, with a light travelling along it. Pick a stop to see
// the way from there, step by step (bus, train, toto or on foot), and open that route in Google Maps.
function Routes() {
  const { t, pick } = useLang();
  const [pickIndex, setPickIndex] = useState(0);
  // Bar length on a log scale, so 12 km and 278 km both read well.
  const km = (r) => Math.max(2, parseFloat(r.distance.en) || 2);
  const max = Math.max(...village.routes.map(km));
  const r = village.routes[pickIndex];
  return (
    <Reveal className="visit4__routes">
      <div className="visit4__routes-head">
        <span className="visit3__journey-icon"><Route /></span>
        <div>
          <h3>{t('visit.how')}</h3>
          <p>{t('visit.howTap')}</p>
        </div>
      </div>
      <ol className="visit4__trip" style={{ '--n': village.routes.length + 1 }}>
        {village.routes.map((s, i) => {
          const Icon = s.by === 'bus' ? Bus : TrainFront;
          const share = Math.log(km(s)) / Math.log(max);
          return (
            <li key={i} className={`visit4__stop ${i === pickIndex ? 'is-picked' : ''}`} style={{ '--i': i, '--share': share.toFixed(3) }}>
              <button type="button" className="visit4__stop-btn" onClick={() => setPickIndex(i)} aria-pressed={i === pickIndex}>
                <span className="visit4__node"><Icon /></span>
                <strong>{pick(s.from)}</strong>
                <span className="visit4__km">{pick(s.distance)}</span>
                <span className="visit4__bar" aria-hidden="true"><span /></span>
                <span className="visit4__meta">{t(`visit.by.${s.by}`)} · <Clock /> {pick(s.time)}</span>
              </button>
            </li>
          );
        })}
        <li className="visit4__stop visit4__stop--end" style={{ '--i': village.routes.length }}>
          <span className="visit4__node visit4__node--end"><MapPin /></span>
          <strong>{t('visit.arrive')}</strong>
        </li>
      </ol>

      {r.steps?.length > 0 && (
        <div className="visit4__way" key={pickIndex}>
          <p className="visit4__way-title">{t('visit.wayFrom').replace('{place}', pick(r.from))}</p>
          <ol className="visit4__steps">
            {r.steps.map((s, k) => {
              const Icon = STEP_ICONS[s.mode] || Route;
              return (
                <li key={k} style={{ '--k': k }}>
                  <span className="visit4__step-icon"><Icon /></span>
                  <span>{pick(s)}</span>
                </li>
              );
            })}
            <li className="visit4__steps-end" style={{ '--k': r.steps.length }}>
              <span className="visit4__step-icon"><MapPin /></span>
              <span>{t('visit.arriveTemple')}</span>
            </li>
          </ol>
          {r.query && (
            <a className="visit4__way-map" href={routeHref(r.query)} target="_blank" rel="noreferrer">
              <Navigation /> {t('visit.openRoute')}
            </a>
          )}
        </div>
      )}
    </Reveal>
  );
}

export default function Visit() {
  const { t, pick, lang } = useLang();
  const [satellite, setSatellite] = useState(false);
  const [big, setBig] = useState(false);
  const [copied, setCopied] = useState(false);
  const info = [
    { Icon: CalendarHeart, label: t('visit.best'), value: t('visit.bestVal') },
    { Icon: Landmark, label: t('visit.see'), value: t('visit.seeVal') },
    { Icon: Languages, label: t('visit.speak'), value: t('visit.speakVal') },
    { Icon: HeartHandshake, label: t('visit.welcome'), value: t('visit.welcomeVal') },
  ];

  // The bigger map: the browser's full screen where it can (Escape leaves it), otherwise the map covers the page.
  const [full, setFull] = useState(false);
  const stage = () => document.querySelector('.visit4__stage');
  useEffect(() => {
    const on = () => setFull(!!document.fullscreenElement && document.fullscreenElement === stage());
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggleBig = () => {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (big) { setBig(false); return; }
    const el = stage();
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => setBig(true));
    else setBig(true);
  };
  useEffect(() => {
    document.documentElement.classList.toggle('map-big', big);
    if (!big) return;
    const onKey = (e) => e.key === 'Escape' && setBig(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [big]);

  // Invite someone: the phone's share menu, or the link copied where there is none.
  const invite = async () => {
    const url = window.location.origin;
    const text = `${t('visit.inviteText')}\n${pick(village.address)}`;
    try {
      if (navigator.share) await navigator.share({ title: t('siteName'), text, url });
      else { await navigator.clipboard.writeText(`${text}\n${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* share cancelled or blocked */ }
  };

  return (
    <section id="visit" className="band band--maroon visit-sec">
      <Wave fill="var(--ivory-2)" />
      <span className="visit-sec__contours" aria-hidden="true" />
      <span className="visit-sec__glow" aria-hidden="true" />

      <RichHead eyebrow={t('visit.eyebrow')} title={t('visit.title')} text={t('visit.text')} Icon={MapPin} light />

      <div className="visit4">
        {/* Full-width map stage: the address floats over the map on a glass panel; a gold glow pulses at the pin */}
        <Reveal className={`visit4__stage ${big ? 'is-big' : ''}`}>
          <VillageMap label={t('visit.youAreHere')} lang={lang} satellite={satellite} />
          <span className="visit4__pulse" aria-hidden="true"><span /><span /></span>
          <div className="visit4__map-tools">
            <div className="visit4__view" role="group" aria-label={t('visit.mapView')}>
              <span className={`visit4__view-thumb ${satellite ? 'is-right' : ''}`} aria-hidden="true" />
              <button type="button" className={satellite ? '' : 'is-active'} onClick={() => setSatellite(false)} aria-pressed={!satellite}>{t('visit.mapView')}</button>
              <button type="button" className={satellite ? 'is-active' : ''} onClick={() => setSatellite(true)} aria-pressed={satellite}>{t('visit.satView')}</button>
            </div>
            <button type="button" className="visit4__big" onClick={toggleBig} aria-label={t(big || full ? 'visit.closeMap' : 'visit.bigMap')} title={t(big || full ? 'visit.closeMap' : 'visit.bigMap')}>
              {big || full ? <Minimize2 /> : <Maximize2 />}
            </button>
          </div>
          <AddressPanel />
        </Reveal>

        {village.routes.length > 0 && <Routes />}

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
            <button type="button" className="cta cta--glass visit4__invite" onClick={invite}>
              <span className="cta__icon">{copied ? <Check /> : <Share2 />}</span>
              <span className="cta__label">{t(copied ? 'visit.linkCopied' : 'visit.invite')}</span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
