import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Maximize2, X, ChevronLeft, ChevronRight, Play, Pause, Share2, Landmark, Flame, Trees, LayoutGrid, ChevronDown } from 'lucide-react';
import { useLang } from '../i18n.jsx';
import { pic, small } from '../responsive.js';

const FILTERS = [
  { id: 'all', Icon: LayoutGrid },
  { id: 'procession', Icon: Flame },
  { id: 'temple', Icon: Landmark },
  { id: 'village', Icon: Trees },
];
const FIRST = 9; // shown before "Show all"

// Lets the navbar open the gallery on one category (kept until the gallery is built, if it is not yet).
let pendingFilter = null;
export function showGalleryCategory(id) {
  pendingFilter = id;
  window.dispatchEvent(new CustomEvent('gallery:filter', { detail: id }));
}

// Video tile: plays silently while on screen, pauses when scrolled away.
function GridVideo({ item }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={item.video} muted loop playsInline preload="metadata" />;
}

// Bento size from the photo's shape: the first tile is big, landscapes go wide, every third portrait goes tall.
function sizeOf(item, i) {
  if (i === 0) return 'big';
  if (item.w > item.h * 1.15) return 'wide';
  return i % 3 === 1 ? 'tall' : 'normal';
}

const SPANS = { big: [2, 2], wide: [2, 1], tall: [1, 2], normal: [1, 1] };

// Places tiles on a grid of `cols` columns (first free spot, in order), then grows a neighbouring
// tile into every leftover gap, so the grid always ends as a clean rectangle.
function packBento(list, cols) {
  const grid = [];
  const free = (r, c, w, h) => {
    if (c + w > cols) return false;
    for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (grid[y]?.[x] !== undefined) return false;
    return true;
  };
  const mark = (t, k) => { for (let y = t.r; y < t.r + t.h; y++) for (let x = t.c; x < t.c + t.w; x++) (grid[y] ||= [])[x] = k; };
  const tiles = list.map((item, i) => {
    let [w, h] = SPANS[sizeOf(item, i)];
    w = Math.min(w, cols);
    for (let r = 0; ; r++) for (let c = 0; c < cols; c++) {
      if (free(r, c, w, h)) { const t = { c, r, w, h }; mark(t, i); return t; }
    }
  });
  const rows = grid.length;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r]?.[c] !== undefined) continue;
    const above = grid[r - 1]?.[c], left = grid[r]?.[c - 1], right = grid[r]?.[c + 1];
    let t;
    // a neighbour may grow into the gap if the whole strip it would take is empty
    const rowEmpty = (x, w) => { for (let i = x; i < x + w; i++) if (grid[r]?.[i] !== undefined) return false; return true; };
    const colEmpty = (x, y, h) => { for (let i = y; i < y + h; i++) if (grid[i]?.[x] !== undefined) return false; return true; };
    if (above !== undefined && (t = tiles[above]).r + t.h === r && rowEmpty(t.c, t.w)) t.h++;
    else if (left !== undefined && (t = tiles[left]).c + t.w === c && colEmpty(c, t.r, t.h)) t.w++;
    else if (right !== undefined && (t = tiles[right]).c === c + 1 && colEmpty(c, t.r, t.h)) { t.c--; t.w++; }
    else continue;
    mark(t, tiles.indexOf(t));
  }
  return tiles;
}

// 2 columns on phones, 4 elsewhere (matches the CSS grid).
function useCols() {
  const query = '(max-width: 600px)';
  const [cols, setCols] = useState(() => (window.matchMedia(query).matches ? 2 : 4));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setCols(mq.matches ? 2 : 4);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return cols;
}

// 3D carousel: the centre photo is large and lit by a gold light running round its border; the photos either side
// turn away and fall back. Arrows, swipe, arrow keys or a click on a side photo turn it; it advances every few
// seconds, pausing on hover or off screen. Clicking the centre photo opens the viewer.
const SLIDE_MS = 5000;
function Carousel({ slides, onOpen }) {
  const { t, pick } = useLang();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const ref = useRef(null);
  const touchX = useRef(null);
  const n = slides.length;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const running = onScreen && !paused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setI((k) => (k + 1) % n), SLIDE_MS);
    return () => clearTimeout(id);
  }, [i, running, n]);

  const go = (d) => setI((k) => (k + d + n) % n);
  // shortest signed distance from the centre, so the ring wraps round
  const offsetOf = (k) => { let d = k - i; if (d > n / 2) d -= n; if (d < -n / 2) d += n; return d; };
  const s = slides[i];
  return (
    <div ref={ref} className={`gal-3d ${running ? 'is-running' : ''}`} style={{ '--slide-ms': `${SLIDE_MS}ms` }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}>
      <div className="gal-3d__stage">
        {slides.map((g, k) => {
          const d = offsetOf(k), ad = Math.abs(d);
          return (
            <button key={g.src} className={`gal-3d__card ${d === 0 ? 'is-active' : ''}`} data-ad={Math.min(ad, 4)}
              style={{ '--d': d, '--ad': ad }} tabIndex={d === 0 ? 0 : -1} aria-hidden={d !== 0}
              aria-label={d === 0 ? `${t('gallery.view')}: ${pick(g.caption)}` : undefined}
              onClick={() => (d === 0 ? onOpen(g) : go(d))}>
              <img {...pic(g.src)} sizes="(max-width: 760px) 72vw, 520px" alt="" loading={ad <= 1 ? 'eager' : 'lazy'} />
              <span className="gal-3d__shine" aria-hidden="true" />
              {d === 0 && <span className="gal-3d__zoom" aria-hidden="true"><Maximize2 /></span>}
            </button>
          );
        })}
      </div>
      <button className="gal-3d__nav gal-3d__nav--prev" onClick={() => go(-1)} aria-label="Previous"><ChevronLeft /></button>
      <button className="gal-3d__nav gal-3d__nav--next" onClick={() => go(1)} aria-label="Next"><ChevronRight /></button>

      <div className="gal-3d__caption" key={i}>
        <span className="gal-item__cat">{t(`gallery.${s.cat}`)}</span>
        <p>{pick(s.caption)}</p>
        <span className="gal-3d__count">{String(i + 1).padStart(2, '0')} <small>/ {String(n).padStart(2, '0')}</small></span>
        <span className="gal-3d__progress" aria-hidden="true" />
      </div>
      <div className="gal-3d__dots">
        {slides.map((g, k) => (
          <button key={g.src} className={k === i ? 'is-active' : ''} onClick={() => setI(k)} aria-label={pick(g.caption)} />
        ))}
      </div>
    </div>
  );
}

// One tile: lifts slightly and a shine sweeps across on hover.
function Tile({ item, index, place, onOpen }) {
  const { t, pick } = useLang();

  return (
    <div
      className={`gal-item gal-item--${sizeOf(item, index)} ${item.video ? 'gal-item--video' : ''}`}
      style={{ '--i': index, gridColumn: `${place.c + 1} / span ${place.w}`, gridRow: `${place.r + 1} / span ${place.h}` }}
      onClick={onOpen}
      tabIndex={0}
      role="button"
      aria-label={pick(item.caption)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
    >
      <div className="gal-item__media">
        {item.video ? <GridVideo item={item} /> : <img {...pic(item.src)} sizes="(max-width: 600px) 50vw, (max-width: 1200px) 30vw, 400px" alt={pick(item.caption)} loading="lazy" width={item.w} height={item.h} />}
      </div>
      <span className="gal-item__shine" aria-hidden="true" />
      <span className="gal-item__ring" aria-hidden="true" />
      {item.video && (
        <>
          <span className="gal-item__badge"><Play /> {t('gallery.video')}</span>
          <span className="gal-item__play" aria-hidden="true"><Play /></span>
        </>
      )}
      {!item.video && <span className="gal-item__zoom" aria-hidden="true"><Maximize2 /></span>}
      <div className="gal-item__caption">
        <span className="gal-item__cat">{t(`gallery.${item.cat}`)}</span>
        {pick(item.caption)}
      </div>
    </div>
  );
}

// Masonry photo/video gallery with category tabs, "show all", and a full-screen viewer.
export default function Gallery({ items }) {
  const { t, pick } = useLang();
  const [filter, setFilter] = useState(() => pendingFilter || 'all');
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(null);
  const [seen, setSeen] = useState(false);
  const gridRef = useRef(null);
  const tabsRef = useRef(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0 });
  // viewer: zoom (double click / double tap, then move to look around), slideshow, and share
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const touch = useRef({ x: 0, t: 0, lastTap: 0 });

  // A category picked from the navbar's Gallery menu.
  useEffect(() => {
    pendingFilter = null;
    const on = (e) => { setFilter(e.detail); setExpanded(false); pendingFilter = null; };
    window.addEventListener('gallery:filter', on);
    return () => window.removeEventListener('gallery:filter', on);
  }, []);

  // Start the tile entrance animation the first time the gallery scrolls into view.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.08 });
    io.observe(gridRef.current);
    return () => io.disconnect();
  }, []);

  // Glowing pill that slides under the active tab.
  useLayoutEffect(() => {
    const place = () => {
      const el = tabsRef.current?.querySelector('.gal-tab.is-active');
      if (el) setIndicator({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [filter, t]);

  const filtered = filter === 'all' ? items : items.filter((g) => g.cat === filter);
  const shown = filter === 'all' && !expanded ? filtered.slice(0, FIRST) : filtered;
  const count = (id) => (id === 'all' ? items.length : items.filter((g) => g.cat === id).length);
  const cols = useCols();
  // `shown` is rebuilt every render, so the layout is keyed on what it is made from.
  const places = useMemo(() => packBento(shown, cols), [items, filter, expanded, cols]);

  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % filtered.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + filtered.length) % filtered.length);
      // keep Tab inside the viewer
      if (e.key === 'Tab') {
        const box = document.querySelector('.lightbox');
        const focusable = [...box.querySelectorAll('button, a[href], video')];
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    // focus moves into the viewer, and back to the photo you opened when it closes
    const opener = document.activeElement;
    requestAnimationFrame(() => document.querySelector('.lightbox__close')?.focus());
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); opener?.focus?.({ preventScroll: true }); };
  }, [isOpen, filtered.length]);

  // keep the active thumbnail in view
  useEffect(() => {
    if (open === null) return;
    document.querySelector('.lightbox__thumb.is-active')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [open]);

  const current = open !== null ? filtered[open] : null;
  const move = (d) => setOpen((i) => (i + d + filtered.length) % filtered.length);
  const step = (d) => (e) => { e.stopPropagation(); move(d); };
  const choose = (id) => { setFilter(id); setExpanded(false); };
  const poster = (g) => g.src || null;

  // a new photo starts unzoomed; closing the viewer stops the slideshow
  useEffect(() => setZoom((z) => ({ ...z, on: false })), [open]);
  useEffect(() => { if (!isOpen) setPlaying(false); }, [isOpen]);
  useEffect(() => {
    if (!playing || open === null || zoom.on) return;
    const id = setTimeout(() => move(1), 4000);
    return () => clearTimeout(id);
  }, [playing, open, zoom.on, filtered.length]);

  const zoomAt = (clientX, clientY, el) => {
    const r = el.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  };
  const toggleZoom = (e) => {
    if (!current?.src) return;
    const img = e.currentTarget.querySelector('img');
    setZoom((z) => ({ on: !z.on, ...zoomAt(e.clientX, e.clientY, img) }));
  };
  const pan = (e) => { if (zoom.on) setZoom({ on: true, ...zoomAt(e.clientX, e.clientY, e.currentTarget.querySelector('img')) }); };
  const onTouchStart = (e) => { touch.current.x = e.touches[0].clientX; touch.current.t = Date.now(); };
  const onTouchEnd = (e) => {
    const p = e.changedTouches[0], now = Date.now();
    if (current?.src && now - touch.current.lastTap < 300) {
      touch.current.lastTap = 0;
      const img = e.currentTarget.querySelector('img');
      setZoom((z) => ({ on: !z.on, ...zoomAt(p.clientX, p.clientY, img) }));
      return;
    }
    touch.current.lastTap = now;
    const dx = p.clientX - touch.current.x;
    if (!zoom.on && Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
  };
  const share = async (e) => {
    e.stopPropagation();
    const url = new URL(current.src || current.video, window.location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: t('siteName'), text: pick(current.caption), url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* share cancelled or blocked */ }
  };

  // The tabs choose what both the carousel and the grid show (the carousel needs at least three photos).
  const slides = filtered.filter((g) => g.src).slice(0, 9);
  const openShowcase = (g) => setOpen(filtered.indexOf(g));

  return (
    <>
      <div className="gal-tabs" role="tablist" ref={tabsRef}>
        <span className="gal-tabs__indicator" aria-hidden="true"
          style={{ transform: `translate(${indicator.x}px, ${indicator.y || 0}px)`, width: indicator.w, height: indicator.h }} />
        {FILTERS.filter((f) => count(f.id) > 0).map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} className={`gal-tab ${filter === f.id ? 'is-active' : ''}`} onClick={() => choose(f.id)}>
            <f.Icon /> {t(`gallery.${f.id}`)} <span className="gal-tab__count">{count(f.id)}</span>
          </button>
        ))}
      </div>

      {slides.length > 2 && <Carousel key={`carousel-${filter}`} slides={slides} onOpen={openShowcase} />}

      <div key={`grid-${filter}`} ref={gridRef} className={`gal-grid ${seen ? 'is-seen' : ''}`}>
        {shown.map((g, i) => (
          <Tile key={g.src || g.video} item={g} index={i} place={places[i]} onOpen={() => setOpen(filtered.indexOf(g))} />
        ))}
      </div>

      {filter === 'all' && filtered.length > FIRST && (
        <div className="gal-more">
          <button className="gal-more__btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? t('gallery.showLess') : <>{t('gallery.showAll')} · {filtered.length} {t('gallery.photos')}</>}
            <ChevronDown className={expanded ? 'is-up' : ''} />
          </button>
        </div>
      )}

      {/* Rendered at the end of <body> so it sits above the navbar (the section's light effects form their own layer). */}
      {current && createPortal(
        <div className="lightbox lightbox--rich" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={pick(current.caption)}>
          {/* the current photo, blurred and glowing, fills the background */}
          {poster(current) && <span key={`bg-${current.src}`} className="lightbox__bg" style={{ backgroundImage: `url(${small(current.src)})` }} aria-hidden="true" />}
          <button className="lightbox__close" aria-label="Close"><X /></button>
          <div className="lightbox__tools" onClick={(e) => e.stopPropagation()}>
            <button className={`lightbox__tool ${playing ? 'is-on' : ''}`} onClick={() => setPlaying(!playing)} aria-label={t(playing ? 'gallery.pause' : 'gallery.play')} title={t(playing ? 'gallery.pause' : 'gallery.play')}>
              {playing ? <Pause /> : <Play />}
            </button>
            <button className="lightbox__tool" onClick={share} aria-label={t('gallery.share')} title={t('gallery.share')}><Share2 /></button>
          </div>
          {playing && <span key={`p-${open}`} className="lightbox__progress" aria-hidden="true" />}
          {copied && <span className="lightbox__toast" role="status">{t('gallery.copied')}</span>}
          <button className="lightbox__nav lightbox__nav--prev" onClick={step(-1)} aria-label="Previous"><ChevronLeft /></button>
          <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
            <div className={`lightbox__frame ${zoom.on ? 'is-zoomed' : ''}`} onDoubleClick={toggleZoom} onPointerMove={pan}
              onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} title={current.src ? t('gallery.zoomHint') : undefined}>
              {current.video
                ? <video key={current.video} src={current.video} controls autoPlay playsInline className="lightbox__media" />
                : <img key={current.src} {...pic(current.src)} sizes="90vw" alt={pick(current.caption)} className="lightbox__media" draggable="false"
                  style={zoom.on ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />}
            </div>
            <figcaption>
              <span className="lightbox__cat">{t(`gallery.${current.cat}`)}</span>
              <span>{pick(current.caption)}</span>
              {current.credit && (
                <a href={current.credit.url} target="_blank" rel="noreferrer"><Camera /> {current.credit.name} · Unsplash</a>
              )}
              <span className="lightbox__count">{open + 1} / {filtered.length}</span>
            </figcaption>
            <div className="lightbox__thumbs">
              {filtered.map((g, i) => (
                <button key={g.src || g.video} className={`lightbox__thumb ${i === open ? 'is-active' : ''}`} onClick={() => setOpen(i)} aria-label={pick(g.caption)}>
                  {g.video ? <span className="lightbox__thumb-video"><Play /></span> : <img src={small(g.src)} alt="" loading="lazy" />}
                </button>
              ))}
            </div>
          </figure>
          <button className="lightbox__nav lightbox__nav--next" onClick={step(1)} aria-label="Next"><ChevronRight /></button>
        </div>,
        document.body,
      )}
    </>
  );
}
