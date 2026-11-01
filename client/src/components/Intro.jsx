import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import Seal from './Seal.jsx';

// Full-screen welcome splash, shown once per browser session.
export default function Intro() {
  const { t } = useLang();
  const [state, setState] = useState(() => {
    try { return sessionStorage.getItem('vl-intro') ? 'gone' : 'open'; } catch { return 'open'; }
  });

  useEffect(() => {
    document.body.style.overflow = state === 'open' ? 'hidden' : '';
  }, [state]);

  if (state === 'gone') return null;

  const enter = () => {
    try { sessionStorage.setItem('vl-intro', '1'); } catch { /* ignore */ }
    setState('closing');
    setTimeout(() => setState('gone'), 900);
  };

  return (
    <div className={`intro ${state === 'closing' ? 'is-closing' : ''}`} onClick={enter} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && enter()}>
      <div className="rays" aria-hidden="true" />
      <div className="intro__inner">
        <Seal size={190} className="intro__seal" shine />
        <h1 className="intro__title">{t('siteName')}</h1>
        <p className="intro__welcome">{t('intro.welcome')}</p>
        <span className="intro__line" />
        <p className="intro__tap">{t('intro.tap')}</p>
      </div>
    </div>
  );
}
