import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import Seal from './Seal.jsx';

const AUTO_MS = 6000;

// Full-screen welcome splash, shown once per browser session. A gold "Enter" button (a tap anywhere works too);
// its ring fills over a few seconds and the site opens by itself.
export default function Intro() {
  const { t } = useLang();
  const [state, setState] = useState(() => {
    try { return sessionStorage.getItem('vl-intro') ? 'gone' : 'open'; } catch { return 'open'; }
  });

  const enter = () => {
    try { sessionStorage.setItem('vl-intro', '1'); } catch { /* ignore */ }
    setState((s) => (s === 'open' ? 'closing' : s));
    setTimeout(() => setState('gone'), 900);
  };

  useEffect(() => {
    document.body.style.overflow = state === 'open' ? 'hidden' : '';
  }, [state]);

  useEffect(() => {
    if (state !== 'open') return;
    const id = setTimeout(enter, AUTO_MS);
    return () => clearTimeout(id);
  }, [state]);

  if (state === 'gone') return null;

  return (
    <div className={`intro ${state === 'closing' ? 'is-closing' : ''}`} onClick={enter} style={{ '--intro-ms': `${AUTO_MS}ms` }}>
      <div className="rays" aria-hidden="true" />
      <div className="intro__inner">
        <Seal size={190} className="intro__seal" shine />
        <h1 className="intro__title">{t('siteName')}</h1>
        <p className="intro__welcome">{t('intro.welcome')}</p>
        <span className="intro__line" />
        <button type="button" className="intro__enter" onClick={(e) => { e.stopPropagation(); enter(); }} autoFocus>
          <span className="intro__enter-ring" aria-hidden="true" />
          <Sparkles className="intro__enter-spark" />
          <span>{t('intro.enter')}</span>
          <ArrowRight className="intro__enter-arrow" />
        </button>
        <p className="intro__tap">{t('intro.auto')}</p>
      </div>
    </div>
  );
}
