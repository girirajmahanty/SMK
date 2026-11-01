// Village logo (SMK, Est. 1901), used in the navbar, footer, hero, welcome screen and login page.
// Round PNGs with transparent corners live in client/public/logo/ (64, 192 and 512 px).
// `shine` adds a light sheen that sweeps across the logo (used on the big hero/intro/login logos).
export default function Seal({ size = 180, className = '', shine = false }) {
  const src = size <= 32 ? '/logo/smk-logo-64.webp' : size <= 96 ? '/logo/smk-logo-192.webp' : '/logo/smk-logo-512.webp';
  return (
    <span className={`seal seal--img ${className}`} style={{ '--seal-size': `${size}px` }}>
      <img src={src} srcSet="/logo/smk-logo-192.webp 192w, /logo/smk-logo-512.webp 512w" sizes={`${size}px`} alt="SMK — Sidhagora" draggable="false" />
      {shine && <span className="seal__sheen" aria-hidden="true" />}
    </span>
  );
}
