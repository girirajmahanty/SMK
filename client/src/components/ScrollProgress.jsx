import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { smoothScrollTo } from '../smoothScroll.js';

const R = 20, C = 2 * Math.PI * R;

// Gold reading-progress bar at the top of the page + a back-to-top button with a progress ring.
export default function ScrollProgress() {
  const { t } = useLang();
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    onScroll(); // first measure on the next frame, not during startup
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <>
      <div className="scroll-bar" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
      <button
        // hidden at the very top, and at the very bottom where the footer has its own "Back to top"
        className={`to-top ${p > 0.08 && p < 0.97 ? 'is-shown' : ''}`}
        onClick={() => smoothScrollTo(0)}
        aria-label={t('footer.top')}
        title={t('footer.top')}
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle className="to-top__track" cx="24" cy="24" r={R} />
          <circle className="to-top__ring" cx="24" cy="24" r={R} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - p) }} />
        </svg>
        <ArrowUp />
      </button>
    </>
  );
}
