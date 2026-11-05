import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import Seal from './Seal.jsx';

// How long the gold ring around "Enter" takes to fill (decoration only).
const RING_MS = 2400;

// Full-screen welcome splash on every page load, closed with a tap (on the gold "Enter" button or anywhere).
// It waits for that tap on purpose: browsers only allow sound after the visitor has tapped the page,
// so this tap is what lets the village song start by itself in the About section.
export default function Intro() {
  const { t } = useLang();
  const [state, setState] = useState('open');

  const enter = () => {
    setState((s) => (s === 'open' ? 'closing' : s));
    setTimeout(() => setState('gone'), 900);
  };

  useEffect(() => {
    document.body.style.overflow = state === 'open' ? 'hidden' : '';
  }, [state]);

  if (state === 'gone') return null;

  return (
    <div className={`intro ${state === 'closing' ? 'is-closing' : ''}`} onClick={enter} style={{ '--intro-ms': `${RING_MS}ms` }}>
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
        <p className="intro__tap">{t('intro.tap')}</p>
      </div>
    </div>
  );
}
