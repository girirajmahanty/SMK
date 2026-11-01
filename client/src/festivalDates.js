import { useEffect, useState } from 'react';
import { api } from './api.js';

const DAY = 24 * 60 * 60 * 1000;

// 'YYYY-MM-DD' → local midnight
const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

// The next (or current) dates of a festival from Google's events: matching events
// a few days apart are joined, so Durga Puja runs from Maha Saptami to Dussehra.
function nextRange(events, match) {
  const now = today();
  const hits = events
    .filter((e) => match.test(e.name))
    .map((e) => ({ start: parseDay(e.start), end: new Date(parseDay(e.end) - DAY) }))
    .sort((a, b) => a.start - b.start);
  const first = hits.findIndex((h) => h.end >= now);
  if (first === -1) return null;
  const range = { ...hits[first] };
  for (const h of hits.slice(first + 1)) {
    if (h.start - range.end > 4 * DAY) break;
    if (h.end > range.end) range.end = h.end;
  }
  return range;
}

// Fetched once per page load and shared by every component.
let request = null;
const load = () => (request ??= api.festivals().then((r) => r.events || []).catch(() => []));

// The next of the dates written in village.js ([start] or [start, end], 'YYYY-MM-DD').
function nextWritten(dates, approx) {
  const now = today();
  for (const [s, e = s] of dates) {
    const r = { start: parseDay(s), end: parseDay(e), approx };
    if (r.end >= now) return r;
  }
  return null;
}

// Exact dates for each festival: Google's calendar first, else the dates written in village.js, else null.
export function useFestivalDates(list) {
  const [events, setEvents] = useState([]);
  useEffect(() => { let alive = true; load().then((e) => alive && setEvents(e)); return () => { alive = false; }; }, []);
  return list.map((f) =>
    (f.match && events.length ? nextRange(events, f.match) : null) || (f.dates ? nextWritten(f.dates, !!f.approx) : null));
}

// Which festival is on now, else which comes next: by exact date when known, else by month.
export function festivalStatus(list, dates = []) {
  const now = today();
  let best = -1, bestStart = Infinity;
  for (let i = 0; i < list.length; i++) {
    const r = dates[i];
    if (r) {
      if (r.start <= now && now <= r.end) return { index: i, kind: 'now' };
      if (r.start < bestStart) { bestStart = +r.start; best = i; }
      continue;
    }
    for (const m of list[i].months || []) {
      if (m === now.getMonth() + 1) return { index: i, kind: 'now' };
      const y = now.getFullYear() + (m - 1 < now.getMonth() ? 1 : 0);
      const start = +new Date(y, m - 1, 1);
      if (start < bestStart) { bestStart = start; best = i; }
    }
  }
  return { index: best, kind: 'next' };
}

// "Sun, 8 November 2026" / "5 – 10 October 2027", in the site language.
export function formatRange(r, lang) {
  const one = +r.start === +r.end;
  const fmt = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-IN' : 'en-IN',
    { ...(one && { weekday: 'short' }), day: 'numeric', month: 'long', year: 'numeric' });
  return +r.start === +r.end ? fmt.format(r.start) : fmt.formatRange(r.start, r.end);
}

// Days from today to the start (0 = today or already running).
export const daysUntil = (r) => Math.max(0, Math.round((r.start - today()) / DAY));
