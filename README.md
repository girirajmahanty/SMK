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

## Deploy (put the website online)
The website and the API run as **one Node.js service**: the server serves the built site from `client/dist`
and the API under `/api`, with compression, security headers and long-term caching of assets.

**Works on any Node host** (Render, Railway, a VPS…). Use these settings:

| Setting | Value |
|---|---|
| Node version | 20.19 or newer |
| Build command | `npm run deploy:build` |
| Start command | `npm start` |

**Environment variables** (set them in the host's dashboard, not in a file):

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your MongoDB Atlas connection string (free M0 cluster) |
| `JWT_SECRET` | a long random string (keep it secret) |
| `SITE_URL` | the live address, e.g. `https://sidhagora.onrender.com` (for share previews) |
| `GOOGLE_API_KEY` | optional — exact festival dates (see below) |
| `UPLOAD_DIR` | optional — persistent filesystem directory used only by the JSON fallback for uploaded images |

`JWT_SECRET` must be a unique random value of at least 32 characters. To provision the administrator, run
`npm run seed:admin --prefix server` in an environment that can reach the same database, with `ADMIN_EMAIL`,
`ADMIN_PASSWORD` (12–128 characters), and optional `ADMIN_NAME` set in the process environment. Do not commit
these values or put seed credentials in the public client. The seed command creates or resets the named admin
account; no public registration flow grants admin access.

Do not set `API_PORT` on the host; it provides `PORT` itself.

**Use MongoDB Atlas in production.** Without `MONGO_URI` the server falls back to JSON files in `server/data/`,
and most hosts wipe their disk on every deploy, so accounts and the visit counter would be lost.
In Atlas → *Network Access*, allow `0.0.0.0/0` (or your host's IP).

**Check it works:** open `https://your-site/api/health` — it should show `"storage":"mongo"`.

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
- Admin accounts and CMS data use MongoDB when available, or the existing local JSON fallback when MongoDB is unavailable. Use MongoDB Atlas and persistent file storage in production.
- The dashboard supports bilingual website copy, festival management, validated image uploads, activity history, and published-content delivery to the public site. Set `UPLOAD_DIR` to persistent storage if the deployment filesystem is ephemeral.
- MongoDB stores image bytes alongside the media metadata; the local JSON fallback stores image files under `server/uploads/` (or `UPLOAD_DIR`). Keep the Mongo database on a persistent Atlas cluster in production.
- CMS data is stored in the `cmscontents`, `festivals`, `media`, and `adminactivities` MongoDB collections. Without MongoDB, the same CMS data uses JSON files under `server/data/`.
- Validation commands: `npm run build`, `node --test client/src/festivalDates.test.js server/cmsRoutes.test.js`, and `npm audit --omit=dev --prefix server`.

## Database
`server/.env` → `MONGO_URI`. Use local MongoDB or a free MongoDB Atlas URI.
If MongoDB isn't reachable, the API automatically stores words in `server/data/words.json`.

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
