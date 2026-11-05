import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');

// The village photos in public/gallery (full-size JPGs), as site paths like /gallery/village/temple-front.jpg.
function galleryPhotos(dir = path.join(publicDir, 'gallery')) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return galleryPhotos(full);
    return /\.jpe?g$/i.test(entry.name) ? [`/${path.relative(publicDir, full).split(path.sep).join('/')}`] : [];
  }).sort();
}

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// sitemap.xml for Google Search Console: the home page (the whole site is one page with sections),
// the date of this build as its last change, and every village photo so they can appear in Google Images.
// Login and admin pages are left out on purpose.
function sitemapXml(site) {
  const today = new Date().toISOString().slice(0, 10);
  const images = galleryPhotos()
    .map((src) => `    <image:image>\n      <image:loc>${xmlEscape(site + src)}</image:loc>\n    </image:image>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${xmlEscape(site)}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${images}
  </url>
</urlset>
`;
}

// The live address, for share previews, the canonical link, robots.txt and the sitemap.
// SITE_URL wins (set it to your own domain); on Vercel the project's production domain is used otherwise.
function siteAddress() {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const address = process.env.SITE_URL || fromVercel;
  return address ? address.replace(/\/$/, '') : null;
}

// Fills https://SITE_URL in index.html and writes robots.txt + sitemap.xml at build time.
// Without a known address the placeholder stays, and server/index.js fills it in when it serves the page.
function siteUrl() {
  const site = siteAddress();
  return {
    name: 'site-url',
    apply: 'build',
    transformIndexHtml: (html) => (site ? html.replaceAll('https://SITE_URL', site) : html),
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /admin'];
      if (site) robots.push('', `Sitemap: ${site}/sitemap.xml`);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` });
      if (site) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(site) });
    },
  };
}

export default defineConfig({
  plugins: [react(), siteUrl()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: { '/api': 'http://localhost:5050' },
  },
});
