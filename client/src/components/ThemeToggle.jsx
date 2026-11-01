import { Sun, Moon } from 'lucide-react';
import { useLang } from '../i18n.jsx';

// Sun in light mode, moon (with twinkling stars) in dark mode; the icons spin/rise into each other.
export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const { t } = useLang();
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');
  return (
    <button className={`theme-toggle ${className}`} data-mode={theme} onClick={onToggle} aria-label={label} title={label}>
      <Sun className="theme-toggle__sun" />
      <Moon className="theme-toggle__moon" />
      <span className="theme-toggle__star" style={{ '--x': '9px', '--y': '9px', '--d': '0s' }} />
      <span className="theme-toggle__star" style={{ '--x': '28px', '--y': '11px', '--d': '0.7s' }} />
      <span className="theme-toggle__star" style={{ '--x': '26px', '--y': '28px', '--d': '1.3s' }} />
    </button>
  );
}
