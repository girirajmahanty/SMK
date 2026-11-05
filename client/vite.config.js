import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
      if (site) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site}/</loc>\n  </url>\n</urlset>\n`,
        });
      }
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
