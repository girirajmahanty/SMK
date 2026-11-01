import { useEffect, useRef } from 'react';

// Festive "bokeh": large, soft, out-of-focus lights in marigold, vermilion and gold,
// drifting slowly and gently brightening/dimming like distant festival lamps.
// Pauses off-screen; skipped for reduced-motion users.
const COLORS = ['255, 196, 87', '255, 140, 66', '255, 98, 72', '255, 226, 160', '247, 165, 49'];

export default function HeroBokeh({ count = 26 }) {
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

    const n = w < 600 ? Math.round(count * 0.5) : count;
    const orbs = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 10 + Math.random() * 34,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.05 - Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.012,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const o of orbs) {
        o.x += o.vx; o.y += o.vy; o.phase += o.speed;
        if (o.y < -o.r * 2) { o.y = h + o.r * 2; o.x = Math.random() * w; }
        if (o.x < -o.r * 2) o.x = w + o.r; else if (o.x > w + o.r * 2) o.x = -o.r;
        const a = 0.1 + (Math.sin(o.phase) + 1) * 0.09;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `rgba(${o.color}, ${a})`);
        g.addColorStop(0.6, `rgba(${o.color}, ${a * 0.55})`);
        g.addColorStop(1, `rgba(${o.color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    window.addEventListener('resize', resize);
    return () => { stop(); io.disconnect(); window.removeEventListener('resize', resize); };
  }, [count]);

  return <canvas ref={ref} className="hero__bokeh" aria-hidden="true" />;
}
