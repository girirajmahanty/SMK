// The API as an Express app, without app.listen():
// server/index.js runs it as a normal Node server, api/index.js runs it as a Vercel function.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { connectStore } from './store.js';
import { authRoutes, attachUser, requireAdmin, requireLogin } from './auth.js';
import { getFestivals } from './festivals.js';
import { cmsRoutes } from './cmsRoutes.js';
import { createRateLimit } from './rateLimit.js';

const CATEGORIES = ['greeting', 'family', 'food', 'nature', 'daily', 'phrase', 'number', 'other'];
const clean = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Connects once and reuses the connection (a warm Vercel function keeps it between requests).
// A failed attempt is forgotten, so the next request tries again instead of failing forever.
let storePromise = null;
export function getStoreReady() {
  storePromise ??= connectStore(process.env.MONGO_URI).catch((err) => {
    storePromise = null;
    throw err;
  });
  return storePromise;
}
let store;

// Public write endpoints, limited per IP so a script can't flood them.
// On Vercel each running instance keeps its own count, so this is a brake, not a hard cap.
const wordLimit = createRateLimit({ windowMs: 60 * 60 * 1000, max: 20 });
const likeLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
// Visits beyond this are still answered with the count, just not added to it.
const visitLimit = createRateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

export const isProd = process.env.NODE_ENV === 'production';
const app = express();

// Behind a hosting proxy, so secure cookies and the visitor's IP (rate limits) work.
if (isProd) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(compression());
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  if (isProd) res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});
// In production the website and the API share one address, so cross-origin access is only needed in development.
if (!isProd) app.use(cors());
app.use(express.json({
  limit: '50kb',
  type: (req) => req.is('application/json') && !req.path.startsWith('/api/admin/media'),
}));
app.use(cookieParser());
app.use(async (req, res, next) => {
  try {
    store = await getStoreReady();
  } catch (err) {
    console.error(`Storage unavailable: ${err.message}`);
    return res.status(503).json({ error: 'The site is temporarily unavailable. Please try again soon.' });
  }
  next();
});

app.use(attachUser(() => store));
app.use('/api/auth', authRoutes(() => store));
app.use('/api', cmsRoutes(() => store));

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

app.get('/api/health', (req, res) => res.json({ ok: true, storage: store.mode }));

app.get('/api/words', wrap(async (req, res) => {
  res.json(await store.list({ q: clean(req.query.q, 100), category: clean(req.query.category, 20) }));
}));

app.get('/api/words/random', wrap(async (req, res) => res.json(await store.random())));

app.get('/api/stats', wrap(async (req, res) => res.json(await store.stats())));

app.get('/api/visits', wrap(async (req, res) => res.json({ visits: await store.visit(0) })));
app.post('/api/visits', wrap(async (req, res) => res.json({ visits: await store.visit(visitLimit.allow(req.ip) ? 1 : 0) })));

app.get('/api/festivals', wrap(async (req, res) => res.json(await getFestivals())));

// Only logged-in members can add words, so every entry has a real account behind it.
app.post('/api/words', requireLogin, wordLimit, wrap(async (req, res) => {
  const b = req.body || {};
  const data = {
    word: clean(b.word, 100),
    meaning: clean(b.meaning, 200),
    meaningBn: clean(b.meaningBn, 200),
    pronunciation: clean(b.pronunciation, 100),
    category: CATEGORIES.includes(b.category) ? b.category : 'other',
    example: clean(b.example),
    exampleMeaning: clean(b.exampleMeaning),
    // Credited by their account name.
    contributor: req.user.name,
  };
  if (!data.word || !data.meaning) return res.status(400).json({ error: 'Word and meaning are required.' });
  res.status(201).json(await store.create(data));
}));

app.post('/api/words/:id/like', likeLimit, wrap(async (req, res) => {
  const w = await store.like(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not found' });
  res.json(w);
}));

app.delete('/api/words/:id', requireAdmin, wrap(async (req, res) => {
  const w = await store.remove(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.get('/uploads/:filename', wrap(async (req, res) => {
  if (!/^[a-f0-9-]+\.(?:png|jpg|gif|webp)$/i.test(req.params.filename)) return res.status(404).json({ error: 'Image not found.' });
  const image = await store.cms.readMedia(req.params.filename);
  if (!image) return res.status(404).json({ error: 'Image not found.' });
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'X-Content-Type-Options': 'nosniff',
  }).type(image.mime).send(image.data);
}));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = status === 413 ? 'Request too large.' : status < 500 ? 'Invalid request.' : 'Server error';
  res.status(status).json({ error: message });
});

export default app;
