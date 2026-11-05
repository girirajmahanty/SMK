// Runs the site as one long-lived Node server: the API (server/app.js) plus the built website.
// Used for local development and `npm start`. On Vercel, api/index.js runs the API instead
// and Vercel serves the website itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import api, { getStoreReady, isProd } from './app.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');
const site = express();
if (isProd) site.set('trust proxy', 1);
site.disable('x-powered-by');
site.use(api);

// The built website (npm run build). Hashed files in /assets never change, so browsers may cache them for a year.
if (fs.existsSync(dist)) {
  site.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
  site.use(express.static(dist, { index: false, maxAge: '7d' }));
  // Every other page gets the app. https://SITE_URL in index.html becomes the real address for share previews
  // (when the build didn't already fill it in).
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  site.get('*', (req, res) => {
    const address = (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    res.set('Cache-Control', 'no-cache').type('html').send(html.replaceAll('https://SITE_URL', address));
  });
}

// A long-running server should fail loudly when storage can't start (e.g. MongoDB down in production),
// so the host shows the failure and restarts it.
getStoreReady()
  .then((s) => console.log(`Storage: ${s.mode}`))
  .catch((err) => {
    console.error(`Storage failed to start: ${err.message}`);
    process.exit(1);
  });

// API_PORT first, so a PORT meant for the frontend dev server doesn't hijack the API locally;
// hosting services set PORT.
const PORT = process.env.API_PORT || process.env.PORT || 5050;
site.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
