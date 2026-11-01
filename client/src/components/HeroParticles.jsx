import { useEffect, useRef } from 'react';

// Soft golden "fireflies" drifting upward on a canvas.
// Pauses when the hero is off-screen and is skipped for reduced-motion users.
export default function HeroParticles({ count = 70 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, running = false;

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const n = w < 600 ? Math.round(count * 0.35) : count;
    // One soft glow drawn once, then stamped for every firefly (much cheaper than a gradient per dot per frame).
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d');
    const sg = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, 'rgba(255, 236, 190, 1)');
    sg.addColorStop(1, 'rgba(227, 183, 104, 0)');
    sctx.fillStyle = sg;
    sctx.fillRect(0, 0, 64, 64);
    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 2.2,
      vy: 0.15 + Math.random() * 0.45,
      drift: Math.random() * Math.PI * 2,
      twinkle: Math.random() * Math.PI * 2,
    });
    const dots = Array.from({ length: n }, () => spawn(true));

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= d.vy;
        d.drift += 0.01;
        d.twinkle += 0.04;
        d.x += Math.sin(d.drift) * 0.3;
        if (d.y < -10) Object.assign(d, spawn(false));
        const size = d.r * 8;
        ctx.globalAlpha = 0.35 + Math.sin(d.twinkle) * 0.3;
        ctx.drawImage(sprite, d.x - size / 2, d.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    window.addEventListener('resize', resize);
    return () => { stop(); io.disconnect(); window.removeEventListener('resize', resize); };
  }, [count]);

  return <canvas ref={ref} className="hero__particles" aria-hidden="true" />;
}
