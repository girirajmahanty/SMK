import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import sharp from 'sharp';
import { requireAdmin, requireLogin } from './auth.js';
import { createRateLimit } from './rateLimit.js';

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/;
// 3 MB: as base64 JSON that is ~4 MB, under the 4.5 MB request limit of Vercel functions.
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_FESTIVALS = 100;
// Visitors' gallery photos: at most this many per account a day, plus a per-IP brake against scripted floods.
const MAX_GALLERY_PHOTOS_PER_DAY = 10;
const gallerySubmitLimit = createRateLimit({ windowMs: 60 * 60 * 1000, max: 20, error: 'Too many photos sent. Please try again later.' });
const FESTIVAL_ICONS = new Set([
  'Flame', 'Wheat', 'Landmark', 'Drum', 'Soup', 'ShoppingBasket', 'Sun',
  'Swords', 'UtensilsCrossed', 'CloudRain', 'Sprout', 'MoonStar', 'Sunrise', 'BookOpen',
]);

const text = (value, max = 5000) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const localized = (value, max = 5000) => ({
  en: text(value?.en, max),
  bn: text(value?.bn, max),
});
const validDate = (value) => {
  if (!value) return true;
  if (!DAY_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
};
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
// A photo's focus point as "X% Y%" (each 0-100), the part of the photo kept in view when it is cropped.
const POSITION_PATTERN = /^(\d{1,3}(?:\.\d{1,2})?)% (\d{1,3}(?:\.\d{1,2})?)%$/;
const focusPoint = (value) => {
  const match = POSITION_PATTERN.exec(text(value, 20));
  return match && Number(match[1]) <= 100 && Number(match[2]) <= 100 ? `${match[1]}% ${match[2]}%` : '';
};
// Uploaded photos are stored ready for the website: turned upright, at most 1600px on their longest side and saved as
// WebP (a fraction of a phone photo's size). Animated GIFs are kept as they are.
const MAX_STORED_SIDE = 1600;
async function prepareUpload(dataUrl) {
  const match = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl || '');
  if (!match) return { error: 'Choose a PNG, JPG, GIF, or WebP image.' };
  const buffer = Buffer.from(match[2], 'base64');
  const detected = imageType(buffer);
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES || buffer.toString('base64') !== match[2] || detected !== match[1]
    || !(await imageIsValid(buffer, detected))) {
    return { error: 'Image is invalid or exceeds the 3 MB limit.' };
  }
  if (detected === 'image/gif') return { buffer, mime: detected, extension: 'gif' };
  const optimized = await sharp(buffer, { limitInputPixels: 40_000_000, failOn: 'warning' })
    .rotate()
    .resize({ width: MAX_STORED_SIDE, height: MAX_STORED_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  return { buffer: optimized, mime: 'image/webp', extension: 'webp' };
}

function parseFestival(body, previous = {}) {
  const name = localized(body?.name, 120);
  if (!name.en || !name.bn) return { error: 'Festival names in English and Bengali are required.' };
  const startDate = text(body?.startDate, 10);
  const endDate = text(body?.endDate, 10);
  if (!validDate(startDate) || !validDate(endDate) || (startDate && endDate && endDate < startDate)) {
    return { error: 'Enter valid festival dates; the end date cannot be before the start date.' };
  }
  const details = Array.isArray(body?.details)
    ? body.details.slice(0, 12).map((item) => localized(item, 500)).filter((item) => item.en || item.bn)
    : [];
  return {
    value: {
      name,
      date: localized(body?.date, 200),
      text: localized(body?.text, 3000),
      details,
      tone: text(body?.tone, 30) || previous.tone || 'kali',
      icon: FESTIVAL_ICONS.has(body?.icon) ? body.icon : (previous.icon || 'Flame'),
      img: text(body?.img, 500),
      position: focusPoint(body?.position),
      featured: body?.featured === undefined ? previous.featured ?? true : body.featured === true,
      published: body?.published === undefined ? previous.published !== false : body.published === true,
      startDate,
      endDate,
      order: Number.isInteger(body?.order) && body.order >= 0 ? body.order : (previous.order || 0),
    },
  };
}

function imageType(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.toString('ascii', 0, 6))) return 'image/gif';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

async function imageIsValid(buffer, expectedType) {
  try {
    const options = { limitInputPixels: 40_000_000, failOn: 'warning' };
    const image = sharp(buffer, options);
    const metadata = await image.metadata();
    const pages = metadata.pages || 1;
    if (metadata.format !== expectedType.replace('image/', '').replace('jpeg', 'jpeg')
      || !metadata.width || !metadata.height || pages > 120
      || metadata.width * metadata.height * pages > 40_000_000) return false;
    await sharp(buffer, options).stats();
    return true;
  } catch {
    return false;
  }
}

function publicMediaName(url) {
  const match = /^\/uploads\/([a-f0-9-]+\.(?:png|jpg|gif|webp))$/i.exec(url || '');
  return match?.[1] || null;
}

export function cmsRoutes(getStore) {
  const router = express.Router();
  const admin = express.Router();
  const backend = () => getStore();
  const store = () => backend().cms;
  const isJsonStorage = () => backend().mode === 'json-file';

  router.get('/content', wrap(async (_req, res) => {
    const records = await store().content();
    res.set('Cache-Control', 'no-store').json({
      content: Object.fromEntries(records.map(({ key, en, bn }) => [key, { en, bn }])),
    });
  }));
  router.get('/cms/festivals', wrap(async (_req, res) => {
    const [festivals, initialized] = await Promise.all([store().festivals(), store().initialized()]);
    res.set('Cache-Control', 'no-store').json({
      initialized,
      festivals: festivals.filter((festival) => festival.published).sort((a, b) => a.order - b.order),
    });
  }));

  // Changes must come from this website itself (another site cannot submit them with a visitor's cookie).
  const sameOrigin = (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      if (origin) {
        let parsed;
        try { parsed = new URL(origin); } catch { return res.status(403).json({ error: 'Invalid request origin.' }); }
        const configured = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : null;
        const localDevelopment = process.env.NODE_ENV !== 'production'
          && ['localhost', '127.0.0.1'].includes(parsed.hostname);
        if (configured ? parsed.origin !== configured : !localDevelopment && parsed.host !== req.get('host')) {
          return res.status(403).json({ error: 'Request origin is not allowed.' });
        }
      }
    }
    next();
  };

  const log = (req, action, target = '') => store().activity(req.user.email, action, target);
  const GALLERY_CATS = new Set(['village', 'temple', 'procession']);
  const publicPhoto = ({ id, url, cat, w, h, caption, userName, createdAt }) => ({ id, url, cat, w, h, caption, by: userName, createdAt });

  // ---- Photos from visitors: anyone signed in can send one; it appears in the gallery once an admin approves it.
  router.get('/gallery/photos', wrap(async (_req, res) => {
    res.set('Cache-Control', 'no-store').json((await store().galleryPhotos('approved')).map(publicPhoto));
  }));
  router.get('/gallery/photos/mine', requireLogin, wrap(async (req, res) => {
    const mine = (await store().galleryPhotos()).filter((item) => item.userId === req.user.id);
    res.set('Cache-Control', 'no-store').json(mine.map((item) => ({ ...publicPhoto(item), status: item.status })));
  }));
  router.post('/gallery/photos', requireLogin, sameOrigin, gallerySubmitLimit, express.json({ limit: '4.5mb' }), wrap(async (req, res) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (req.user.role !== 'admin' && await store().countGalleryPhotosSince(req.user.id, since) >= MAX_GALLERY_PHOTOS_PER_DAY) {
      return res.status(429).json({ code: 'TOO_MANY', error: `You can send up to ${MAX_GALLERY_PHOTOS_PER_DAY} photos a day. Please try again tomorrow.` });
    }
    const caption = text(req.body?.caption, 200);
    if (!caption) return res.status(400).json({ code: 'CAPTION_REQUIRED', error: 'Please add a short caption.' });
    const upload = await prepareUpload(req.body?.data);
    if (upload.error) return res.status(400).json({ error: upload.error });
    const { width: w, height: h } = await sharp(upload.buffer, { animated: false }).metadata();
    const filename = `${crypto.randomUUID()}.${upload.extension}`;
    // an admin's own photo needs no review
    const approved = req.user.role === 'admin';
    const photo = await store().createGalleryPhoto({
      filename, url: `/uploads/${filename}`, mime: upload.mime, size: upload.buffer.length, w, h,
      caption, cat: GALLERY_CATS.has(req.body?.cat) ? req.body.cat : 'village',
      status: approved ? 'approved' : 'pending', userId: req.user.id, userName: req.user.name,
      ...(approved && { reviewedBy: req.user.email, reviewedAt: new Date().toISOString() }),
      data: upload.buffer,
    });
    res.status(201).json({ ...publicPhoto(photo), status: photo.status });
  }));
  // A member may take back their own photo, waiting or already in the gallery.
  router.delete('/gallery/photos/mine/:id', requireLogin, sameOrigin, wrap(async (req, res) => {
    const photo = (await store().galleryPhotos()).find((item) => item.id === req.params.id && item.userId === req.user.id);
    if (!photo) return res.status(404).json({ error: 'Photo was not found.' });
    await store().deleteGalleryPhoto(photo.id);
    res.json({ ok: true });
  }));

  admin.use(requireAdmin);
  admin.use(sameOrigin);
  admin.use('/media', express.json({ limit: '4.5mb' }));

  admin.get('/gallery/photos', wrap(async (req, res) => {
    const status = req.query.status === 'approved' ? 'approved' : 'pending';
    res.set('Cache-Control', 'no-store').json((await store().galleryPhotos(status)).map((item) => ({ ...publicPhoto(item), status: item.status, size: item.size })));
  }));
  admin.post('/gallery/photos/:id/approve', wrap(async (req, res) => {
    const photo = await store().approveGalleryPhoto(req.params.id, req.user.email);
    if (!photo) return res.status(404).json({ error: 'Photo was not found.' });
    await log(req, 'Approved gallery photo', `${photo.caption.slice(0, 60)} · by ${photo.userName}`);
    res.json({ ...publicPhoto(photo), status: photo.status });
  }));
  // Fix a caption or category before (or after) approving.
  admin.patch('/gallery/photos/:id', express.json({ limit: '10kb' }), wrap(async (req, res) => {
    const caption = text(req.body?.caption, 200);
    if (!caption) return res.status(400).json({ code: 'CAPTION_REQUIRED', error: 'Please add a short caption.' });
    if (!GALLERY_CATS.has(req.body?.cat)) return res.status(400).json({ error: 'Choose a category.' });
    const photo = await store().updateGalleryPhoto(req.params.id, { caption, cat: req.body.cat });
    if (!photo) return res.status(404).json({ error: 'Photo was not found.' });
    await log(req, 'Edited gallery photo', `${caption.slice(0, 60)} · by ${photo.userName}`);
    res.json({ ...publicPhoto(photo), status: photo.status });
  }));
  admin.delete('/gallery/photos/:id', wrap(async (req, res) => {
    const photo = await store().deleteGalleryPhoto(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo was not found.' });
    await log(req, photo.status === 'approved' ? 'Removed gallery photo' : 'Rejected gallery photo', `${photo.caption.slice(0, 60)} · by ${photo.userName}`);
    res.json({ ok: true });
  }));

  admin.get('/overview', wrap(async (_req, res) => {
    const [stats, activities, photoRequests] = await Promise.all([store().stats(), store().activities(), store().galleryPhotos('pending')]);
    res.json({ stats: { ...stats, photoRequests: photoRequests.length }, activities });
  }));

  admin.get('/content', wrap(async (_req, res) => res.json(await store().content())));
  admin.put('/content/:key', wrap(async (req, res) => {
    if (!KEY_PATTERN.test(req.params.key)) return res.status(400).json({ error: 'Invalid content key.' });
    const en = text(req.body?.en);
    const bn = text(req.body?.bn);
    if (typeof req.body?.en !== 'string' || typeof req.body?.bn !== 'string') {
      return res.status(400).json({ error: 'English and Bengali text are required.' });
    }
    const saved = await store().putContent(req.params.key, { en, bn });
    await log(req, 'Updated website content', req.params.key);
    res.json(saved);
  }));
  admin.delete('/content/:key', wrap(async (req, res) => {
    const removed = await store().deleteContent(req.params.key);
    if (!removed) return res.status(404).json({ error: 'Content was not found.' });
    await log(req, 'Reset website content', req.params.key);
    res.json({ ok: true });
  }));

  admin.get('/festivals', wrap(async (_req, res) => {
    const [festivals, initialized] = await Promise.all([store().festivals(), store().initialized()]);
    res.json({ festivals, initialized });
  }));
  // One import at a time: two requests arriving together (a double click, two tabs, React's development double
  // render) used to both see "not imported yet" and import every festival twice. Each import now waits for the one
  // before it, so the second finds the work done.
  let importQueue = Promise.resolve();
  const importFestivals = async (req) => {
    if (await store().initialized()) return { status: 200, body: { initialized: true, festivals: await store().festivals() } };
    const input = req.body?.festivals;
    if (!Array.isArray(input) || input.length > MAX_FESTIVALS) return { status: 400, body: { error: 'Invalid festival defaults.' } };
    const normalized = input.map((item, index) => parseFestival({ ...item, order: index }));
    const invalid = normalized.find((item) => item.error);
    if (invalid) return { status: 400, body: { error: invalid.error } };
    const festivals = await store().festivals();
    const existingNames = new Set(festivals.map((festival) => festival.name.en.toLocaleLowerCase()));
    for (const item of normalized) {
      const name = item.value.name.en.toLocaleLowerCase();
      if (existingNames.has(name)) continue;
      await store().createFestival(item.value);
      existingNames.add(name);
    }
    await store().setInitialized();
    const imported = await store().festivals();
    await log(req, 'Imported existing festivals', `${imported.length - festivals.length} festivals`);
    return { status: 201, body: { initialized: true, festivals: imported } };
  };
  admin.post('/festivals/initialize', wrap(async (req, res) => {
    const task = importQueue.then(() => importFestivals(req));
    importQueue = task.catch(() => {});
    const { status, body } = await task;
    res.status(status).json(body);
  }));
  admin.post('/festivals', wrap(async (req, res) => {
    const parsed = parseFestival(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const existing = await store().festivals();
    if (existing.some((item) => item.name.en.toLocaleLowerCase() === parsed.value.name.en.toLocaleLowerCase())) {
      return res.status(409).json({ error: 'A festival with that English name already exists.' });
    }
    parsed.value.order = existing.length;
    const created = await store().createFestival(parsed.value);
    await store().setInitialized();
    await log(req, 'Created festival', created.name.en);
    res.status(201).json(created);
  }));
  admin.put('/festivals/:id', wrap(async (req, res) => {
    const current = (await store().festivals()).find((item) => item.id === req.params.id);
    if (!current) return res.status(404).json({ error: 'Festival was not found.' });
    const parsed = parseFestival(req.body, current);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const duplicates = await store().festivals();
    if (duplicates.some((item) => item.id !== current.id && item.name.en.toLocaleLowerCase() === parsed.value.name.en.toLocaleLowerCase())) {
      return res.status(409).json({ error: 'A festival with that English name already exists.' });
    }
    const updated = await store().updateFestival(current.id, parsed.value);
    await log(req, 'Updated festival', updated.name.en);
    res.json(updated);
  }));
  admin.delete('/festivals/:id', wrap(async (req, res) => {
    const removed = await store().deleteFestival(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Festival was not found.' });
    await log(req, 'Deleted festival', removed.name.en);
    res.json({ ok: true });
  }));
  admin.put('/festivals-order', wrap(async (req, res) => {
    const ids = req.body?.ids;
    const existing = await store().festivals();
    if (!Array.isArray(ids) || ids.length !== existing.length || new Set(ids).size !== ids.length
      || ids.some((id) => !existing.some((item) => item.id === id))) {
      return res.status(400).json({ error: 'Festival order must include each festival exactly once.' });
    }
    const updated = await store().reorderFestivals(ids);
    await log(req, 'Reordered festivals');
    res.json(updated);
  }));

  admin.get('/media', wrap(async (_req, res) => res.json(await store().media())));
  admin.post('/media', wrap(async (req, res) => {
    const upload = await prepareUpload(req.body?.data);
    if (upload.error) return res.status(400).json({ error: upload.error });
    const { buffer, mime: detected, extension } = upload;
    const filename = `${crypto.randomUUID()}.${extension}`;
    if (isJsonStorage()) {
      await fs.mkdir(store().mediaDirectory, { recursive: true });
      await fs.writeFile(path.join(store().mediaDirectory, filename), buffer, { flag: 'wx', mode: 0o644 });
    }
    try {
      const media = await store().createMedia({
        filename,
        url: `/uploads/${filename}`,
        mime: detected,
        size: buffer.length,
        caption: text(req.body.caption, 300),
        data: buffer,
      });
      await log(req, 'Uploaded image', filename);
      res.status(201).json(media);
    } catch (error) {
      if (isJsonStorage()) await fs.unlink(path.join(store().mediaDirectory, filename)).catch(() => {});
      throw error;
    }
  }));
  admin.patch('/media/:id', wrap(async (req, res) => {
    if (typeof req.body?.caption !== 'string') return res.status(400).json({ error: 'A caption is required.' });
    const updated = await store().updateMedia(req.params.id, text(req.body.caption, 300));
    if (!updated) return res.status(404).json({ error: 'Image was not found.' });
    await log(req, 'Updated image caption', updated.filename);
    res.json(updated);
  }));
  admin.put('/media/:id/replace', wrap(async (req, res) => {
    const upload = await prepareUpload(req.body?.data);
    if (upload.error) return res.status(400).json({ error: upload.error });
    const { buffer, mime: detected, extension } = upload;
    const filename = `${crypto.randomUUID()}.${extension}`;
    if (isJsonStorage()) {
      await fs.mkdir(store().mediaDirectory, { recursive: true });
      await fs.writeFile(path.join(store().mediaDirectory, filename), buffer, { flag: 'wx', mode: 0o644 });
    }
    try {
      const result = await store().replaceMedia(req.params.id, { filename, url: `/uploads/${filename}`, mime: detected, size: buffer.length, data: buffer });
      if (!result) {
        if (isJsonStorage()) await fs.unlink(path.join(store().mediaDirectory, filename));
        return res.status(404).json({ error: 'Image was not found.' });
      }
      const oldFilename = publicMediaName(result.previous.url);
      if (isJsonStorage() && oldFilename) await fs.unlink(path.join(store().mediaDirectory, oldFilename)).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
      await log(req, 'Replaced image', filename);
      res.json(result.media);
    } catch (error) {
      if (isJsonStorage()) await fs.unlink(path.join(store().mediaDirectory, filename)).catch(() => {});
      throw error;
    }
  }));
  admin.delete('/media/:id', wrap(async (req, res) => {
    const media = (await store().media()).find((item) => item.id === req.params.id);
    if (!media) return res.status(404).json({ error: 'Image was not found.' });
    const [festivals, content] = await Promise.all([store().festivals(), store().content()]);
    if (festivals.some((item) => item.img === media.url) || content.some((item) => item.en.includes(media.url) || item.bn.includes(media.url))) {
      return res.status(409).json({ error: 'This image is in use. Replace its website references before deleting it.' });
    }
    const removed = await store().deleteMedia(req.params.id);
    const filename = publicMediaName(removed.url);
    if (isJsonStorage() && filename) await fs.unlink(path.join(store().mediaDirectory, filename)).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
    await log(req, 'Deleted image', removed.filename);
    res.json({ ok: true });
  }));

  router.use('/admin', admin);
  return router;
}
