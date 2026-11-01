import { useEffect, useState } from 'react';
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

export default function Home() {
  const { t } = useLang();
  const [visits, setVisits] = useState(null);

  // Each section's top wave rises in when the section comes into view.
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('band-in'); io.unobserve(e.target); }
    }), { threshold: 0.06 });
    document.querySelectorAll('main .band').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

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

      <VillageLife />

      {/* ---------- Gallery ---------- */}
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

      <Festivals />

      <Visit />
    </>
  );
}
