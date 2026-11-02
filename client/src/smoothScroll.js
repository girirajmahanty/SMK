// Eased scrolling for menu and in-page links: starts gently, glides, then settles.
// Any wheel or touch from the visitor stops it at once.
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const NAV_OFFSET = 72;
let frame = 0;

// Sections far below the screen are drawn at an estimated height until they are reached
// (content-visibility), so after gliding we check where the target really is and settle there.
export function smoothScrollTo(target, offset = NAV_OFFSET, retries = 4) {
  const to = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY - offset;
  const from = window.scrollY;
  const dist = to - from;
  cancelAnimationFrame(frame);
  if (Math.abs(dist) < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo({ top: to, behavior: 'instant' });
    return;
  }
  const duration = Math.min(1400, Math.max(550, Math.abs(dist) * 0.3));
  const stop = () => cancelAnimationFrame(frame);
  window.addEventListener('wheel', stop, { once: true, passive: true });
  window.addEventListener('touchstart', stop, { once: true, passive: true });
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo({ top: from + dist * ease(p), behavior: 'instant' });
    if (p < 1) frame = requestAnimationFrame(step);
    else if (typeof target !== 'number' && retries > 0 && Math.abs(target.getBoundingClientRect().top - offset) > 3) {
      smoothScrollTo(target, offset, retries - 1);
    }
  };
  frame = requestAnimationFrame(step);
}
