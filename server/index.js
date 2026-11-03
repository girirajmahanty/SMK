import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { connectStore } from './store.js';
import { authRoutes, attachUser, requireAdmin } from './auth.js';
import { getFestivals } from './festivals.js';
import { cmsRoutes } from './cmsRoutes.js';

const CATEGORIES = ['greeting', 'family', 'food', 'nature', 'daily', 'phrase', 'number', 'other'];
const clean = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Start listening right away; requests wait until the database is ready.
const storeReady = connectStore(process.env.MONGO_URI);
let store;
const app = express();
const isProd = process.env.NODE_ENV === 'production';
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');

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
  store = await storeReady;
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
app.post('/api/visits', wrap(async (req, res) => res.json({ visits: await store.visit(1) })));

app.get('/api/festivals', wrap(async (req, res) => res.json(await getFestivals())));

app.post('/api/words', wrap(async (req, res) => {
  const b = req.body || {};
  const data = {
    word: clean(b.word, 100),
    meaning: clean(b.meaning, 200),
    meaningBn: clean(b.meaningBn, 200),
    pronunciation: clean(b.pronunciation, 100),
    category: CATEGORIES.includes(b.category) ? b.category : 'other',
    example: clean(b.example),
    exampleMeaning: clean(b.exampleMeaning),
    // Logged-in members are credited by their account name.
    contributor: req.user?.name || clean(b.contributor, 60) || 'Anonymous',
  };
  if (!data.word || !data.meaning) return res.status(400).json({ error: 'Word and meaning are required.' });
  res.status(201).json(await store.create(data));
}));

app.post('/api/words/:id/like', wrap(async (req, res) => {
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

// The built website (npm run build). Hashed files in /assets never change, so browsers may cache them for a year.
if (fs.existsSync(dist)) {
  app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(dist, { index: false, maxAge: '7d' }));
  // Every other page gets the app. https://SITE_URL in index.html becomes the real address for share previews.
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  app.get('*', (req, res) => {
    const site = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    res.set('Cache-Control', 'no-cache').type('html').send(html.replaceAll('https://SITE_URL', site));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = status === 413 ? 'Request too large.' : status < 500 ? 'Invalid request.' : 'Server error';
  res.status(status).json({ error: message });
});

// API_PORT first, so a PORT meant for the frontend dev server doesn't hijack the API locally;
// hosting services set PORT.
const PORT = process.env.API_PORT || process.env.PORT || 5050;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
storeReady.then((s) => console.log(`Storage: ${s.mode}`));
