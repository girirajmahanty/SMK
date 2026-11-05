# 🌾 Sidhagora — MERN website

The website of Sidhagora village (SMK, est. 1901), in **English and Bengali (বাংলা)**.
**MongoDB · Express · React (Vite) · Node.js**

## Features
- 🏛️ **Home page** — hero with the village photo, Our Story, Village Life photo grid, gallery, festivals, visit
- 🔐 **Login & admin CMS** — member accounts and securely provisioned administrators
- 🇮🇳 **EN / বাং switch** — whole site in English or Bengali
- 🌗 Dark / light theme, scroll animations, mobile menu
- ✨ Smooth gliding scroll, animated wave dividers, navbar that follows your scroll, animated headings,
  running light borders, festival timeline that lights up as you scroll

## Run
```bash
npm run install:all   # first time only
npm run dev           # API on :5050, website on http://localhost:5180
```

## Deploy on Vercel
Vercel serves the built website (`client/dist`) from its CDN, and the API runs as one serverless function
(`api/index.js`, which uses the same Express app as `server/app.js`). `vercel.json` holds the build settings,
the `/api/*` and `/uploads/*` routes, the single-page-app fallback, security headers and caching.

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → import the repository**. Leave *Root Directory* as the repository root;
   the build settings come from `vercel.json`.
3. Before the first deploy, add these **Environment Variables** (Production, and Preview if you use previews):

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your MongoDB Atlas connection string (free M0 cluster) — **required** |
| `JWT_SECRET` | a unique random string of at least 32 characters (keep it secret) |
| `SITE_URL` | your own domain, e.g. `https://sidhagora.in` — optional; without it the Vercel production domain is used |
| `GOOGLE_API_KEY` | optional — exact festival dates (see below) |

4. Deploy, then open `https://your-site/api/health` — it should show `"storage":"mongodb"`.

Notes:
- **MongoDB is required.** In production the API refuses to use the local JSON files, because Vercel has no
  lasting disk. In Atlas → *Network Access*, allow `0.0.0.0/0` (Vercel has no fixed IP).
- The function runs in Mumbai (`bom1` in `vercel.json`). Put your Atlas cluster in a nearby region
  (e.g. Mumbai), or change `regions` to match it, so database calls stay fast.
- Admin image uploads are limited to **3 MB**, because Vercel functions accept at most 4.5 MB per request.
- `SITE_URL` is used at build time (share previews, `robots.txt`, `sitemap.xml`) and for the admin origin
  check: when it is set, use the admin panel on that domain. Redeploy after changing it.
- Rate limits are counted per running function instance, so on Vercel they slow abuse down rather than set an exact cap.

**Provision the administrator:** run `npm run seed:admin --prefix server` on your computer with `MONGO_URI`
pointing at the same Atlas database and `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12–128 characters) and optional
`ADMIN_NAME` set in the process environment. Do not commit these values or put seed credentials in the public
client. The seed command creates or resets the named admin account; no public registration flow grants admin access.

**Other Node hosts** still work: build with `npm run deploy:build`, start with `npm start` (`server/index.js`
serves the API and the built website together). Do not set `API_PORT` on the host; it provides `PORT` itself.

**Test production locally** (PowerShell):
```powershell
npm run deploy:build
$env:NODE_ENV="production"; $env:PORT="8080"; npm start   # then open http://localhost:8080
```

## Login, accounts & admin CMS
- Visitors can create a member account at `/login`; public registration can never grant administrator access.
- Admins sign in at `/admin/login`. Passwords are hashed with bcrypt; member sessions expire after 7 days and admin sessions after 8 hours, in an httpOnly, same-site cookie.
- Provision the administrator through environment variables, never through public registration:

  ```powershell
  $env:ADMIN_EMAIL="admin@example.com"
  $env:ADMIN_PASSWORD="a-unique-password-of-at-least-12-characters"
  $env:ADMIN_NAME="Site Administrator" # optional
  npm run seed:admin --prefix server
  ```

- Configure a unique `JWT_SECRET` of at least 32 characters. In production the server refuses to start without it. Changing it logs everyone out.
- Admin accounts and CMS data use MongoDB. In local development only, when MongoDB is unavailable, they fall back to JSON files.
- The dashboard supports bilingual website copy, festival management, validated image uploads, activity history, and published-content delivery to the public site.
- MongoDB stores image bytes alongside the media metadata; the local JSON fallback stores image files under `server/uploads/` (or `UPLOAD_DIR`).
- CMS data is stored in the `cmscontents`, `festivals`, `media`, and `adminactivities` MongoDB collections. Without MongoDB, the same CMS data uses JSON files under `server/data/`.
- Validation commands: `npm run build`, `node --test` inside `server/`, `node --test src/` inside `client/`, and `npm audit --omit=dev --prefix server`.

## Database
`server/.env` → `MONGO_URI`. Use local MongoDB or a free MongoDB Atlas URI.
In local development, if MongoDB isn't reachable, the API stores data in `server/data/` instead.
In production it refuses to start without MongoDB.

## Festival dates (automatic)
The festival cards show exact dates and a countdown, read from Google's official
"Holidays in India" calendar and refreshed every 12 hours, so they update by themselves every year.
Without a key the cards just show the month.

To turn it on (free):
1. Open https://console.cloud.google.com/ and sign in with your Google account.
2. Create a project (any name, e.g. "Sidhagora website").
3. Go to **APIs & Services → Library**, search **Google Calendar API** and click **Enable**.
4. Go to **APIs & Services → Credentials → Create credentials → API key** and copy the key.
5. (Recommended) Click the key → **API restrictions → Restrict key → Google Calendar API** → Save.
6. Paste it into `server/.env`: `GOOGLE_API_KEY=your-key-here`, then restart the server.

Check it at http://localhost:5050/api/festivals — `"source": "google"` means it works.
Which Google holidays belong to which card is set by `match` on each festival in `client/src/village.js`.

## Customise
- **Village details (hero, story, life, festivals, photos, address, routes): `client/src/village.js`** — published CMS overrides are managed in `/admin`.
- Logo: `client/public/logo/` (round SMK logo in 64/192/512 px)
- Photos: village photos and the procession video are in `client/public/gallery/village/`.
  **After adding or changing a photo, run `npm run images --prefix client`** — it makes small WebP copies
  (in `client/public/opt/`) so pages load fast on phones. Commit those files too.
  Add a new one by putting the file there and adding an item to `gallery` in `village.js`
  (`src` or `video`, `cat`: temple / procession / village, `w`/`h` size, and an English + Bengali `caption`).
- Site name (English + Bengali): `client/src/config.js`
- All English/Bengali text on the site: `client/src/i18n.jsx`
- Starter words: `server/seed.js` (sample words — replace with real ones)
- Colours: top of `client/src/styles.css` (`--marigold`, `--terracotta`, `--leaf`, `--plum`)
