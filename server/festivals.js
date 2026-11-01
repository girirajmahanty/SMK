// Festival dates from Google's public "Holidays in India" calendar.
// Needs GOOGLE_API_KEY in .env (Google Calendar API enabled); without it the site shows months only.
const CALENDAR = 'en.indian#holiday@group.v.calendar.google.com';
const CACHE_MS = 12 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

let cache = { at: 0, data: null };

async function fetchHolidays(key) {
  const now = Date.now();
  const params = new URLSearchParams({
    key,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    // a month back (to catch a festival that is on right now) to ~14 months ahead
    timeMin: new Date(now - 31 * DAY).toISOString(),
    timeMax: new Date(now + 425 * DAY).toISOString(),
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR)}/events?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Google Calendar ${res.status}: ${body.error?.message || res.statusText}`);
  }
  const { items = [] } = await res.json();
  // All-day events: start.date is the day, end.date is the day after (exclusive).
  return items
    .filter((e) => e.start?.date)
    .map((e) => ({ name: e.summary, start: e.start.date, end: e.end?.date || e.start.date }));
}

export async function getFestivals() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return { source: 'none', events: [] };
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;
  try {
    cache = { at: Date.now(), data: { source: 'google', events: await fetchHolidays(key) } };
  } catch (err) {
    console.error('Festival dates:', err.message);
    // Keep serving the last good dates; retry in 15 minutes.
    if (cache.data) cache.at = Date.now() - CACHE_MS + 15 * 60 * 1000;
    else return { source: 'error', events: [] };
  }
  return cache.data;
}
