import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Images } from 'lucide-react';
import { api } from '../api.js';
import { useLang } from '../i18n.jsx';
import { village } from '../village.js';
import RichHead from '../components/RichHead.jsx';
import Wave from '../components/Wave.jsx';
import Gallery from '../components/Gallery.jsx';
import Hero from '../components/Hero.jsx';
import Story from '../components/Story.jsx';
import VillageLife from '../components/VillageLife.jsx';
import Festivals from '../components/Festivals.jsx';
import Visit from '../components/Visit.jsx';

// Sections below Story, in page order. They are built one at a time after the first paint,
// so a phone never has to build the whole page in one long freeze.
const LATER = 4;

export default function Home() {
  const { t } = useLang();
  const { hash } = useLocation();
  const [visits, setVisits] = useState(null);
  const [built, setBuilt] = useState(() => (window.location.hash ? LATER : 0));

  // Build the next section when the browser is idle (or at once if a link points into the page).
  useEffect(() => {
    if (hash) { setBuilt(LATER); return; }
    if (built >= LATER) return;
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = idle(() => setBuilt((n) => n + 1), { timeout: 400 });
    return () => cancel(id);
  }, [built, hash]);

  // Each section's top wave rises in when the section comes into view;
  // sections off screen pause all their animations (lights, borders, shimmers),
  // so the phone only animates what you can see. They resume a little before scrolling into view.
  useEffect(() => {
    const rise = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('band-in'); rise.unobserve(e.target); }
    }), { threshold: 0.06 });
    const pause = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)),
      { rootMargin: '200px 0px' });
    document.querySelectorAll('main .band:not(.band-in)').forEach((s) => rise.observe(s));
    document.querySelectorAll('.hero, main .band, footer.footer2').forEach((s) => pause.observe(s));
    return () => { rise.disconnect(); pause.disconnect(); };
  }, [built]);

  useEffect(() => {
    // Count one visit per browser session.
    let counted = false;
    try { counted = !!sessionStorage.getItem('vl-visit'); sessionStorage.setItem('vl-visit', '1'); } catch { /* ignore */ }
    api.visit(!counted).then((r) => setVisits(r.visits)).catch(() => {});
  }, []);

  return (
    <>
      <Hero visits={visits} />

      <Story visits={visits} />

      {built >= 1 && <VillageLife />}

      {/* ---------- Gallery ---------- */}
      {built >= 2 && (
        <section id="gallery" className="band band--ivory gal-sec">
          <Wave fill="var(--band-dark-bottom)" />
          {/* Soft drifting lights behind the gallery */}
          <span className="gal-sec__light gal-sec__light--a" aria-hidden="true" />
          <span className="gal-sec__light gal-sec__light--b" aria-hidden="true" />
          <span className="gal-sec__light gal-sec__light--c" aria-hidden="true" />
          <span className="gal-sec__dust" aria-hidden="true" />
          <span className="gal-sec__spot gal-sec__spot--l" aria-hidden="true" />
          <span className="gal-sec__spot gal-sec__spot--r" aria-hidden="true" />
          <RichHead eyebrow={t('gallery.eyebrow')} title={t('gallery.title')} text={t('gallery.text')} Icon={Images} />
          <Gallery items={village.gallery} />
        </section>
      )}

      {built >= 3 && <Festivals />}

      {built >= 4 && <Visit />}
    </>
  );
}
