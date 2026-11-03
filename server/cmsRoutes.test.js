import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import express from 'express';
import cookieParser from 'cookie-parser';
import sharp from 'sharp';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'cms-route-test-secret-with-at-least-32-characters';

const temporaryUploads = await fs.mkdtemp(path.join(os.tmpdir(), 'sidhagora-cms-test-'));
process.env.UPLOAD_DIR = temporaryUploads;
const { attachUser, authRoutes } = await import('./auth.js');
const { cmsRoutes } = await import('./cmsRoutes.js');

const users = new Map();
const admin = {
  _id: 'admin-1', name: 'Test Admin', email: 'admin@example.test',
  role: 'admin', passwordHash: await bcrypt.hash('StrongTestPassword123!', 4),
};
users.set(admin.email, admin);
const cmsData = { content: [], festivals: [], media: [], activities: [], initialized: false };
const cms = {
  async content() { return cmsData.content; },
  async putContent(key, value) {
    let record = cmsData.content.find((item) => item.key === key);
    if (!record) { record = { key, id: key }; cmsData.content.push(record); }
    Object.assign(record, value, { updatedAt: new Date().toISOString() });
    return record;
  },
  async deleteContent(key) {
    const index = cmsData.content.findIndex((item) => item.key === key);
    return index < 0 ? null : cmsData.content.splice(index, 1)[0];
  },
  async festivals() { return cmsData.festivals; },
  async createFestival(value) {
    const item = { ...value, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    cmsData.festivals.push(item);
    return item;
  },
  async updateFestival(id, value) {
    const item = cmsData.festivals.find((entry) => entry.id === id);
    if (!item) return null;
    Object.assign(item, value, { updatedAt: new Date().toISOString() });
    return item;
  },
  async deleteFestival(id) {
    const index = cmsData.festivals.findIndex((item) => item.id === id);
    return index < 0 ? null : cmsData.festivals.splice(index, 1)[0];
  },
  async reorderFestivals(ids) {
    cmsData.festivals.forEach((item) => { item.order = ids.indexOf(item.id); });
    return cmsData.festivals;
  },
  async initialized() { return cmsData.initialized; },
  async setInitialized() { cmsData.initialized = true; },
  async media() { return cmsData.media; },
  async createMedia(value) {
    const item = { ...value, id: crypto.randomUUID() };
    cmsData.media.push(item);
    return item;
  },
  async updateMedia(id, caption) {
    const item = cmsData.media.find((entry) => entry.id === id);
    if (item) item.caption = caption;
    return item || null;
  },
  async replaceMedia(id, value) {
    const item = cmsData.media.find((entry) => entry.id === id);
    if (!item) return null;
    const previous = { ...item };
    Object.assign(item, value);
    return { media: item, previous };
  },
  async deleteMedia(id) {
    const index = cmsData.media.findIndex((item) => item.id === id);
    return index < 0 ? null : cmsData.media.splice(index, 1)[0];
  },
  async stats() { return { festivals: cmsData.festivals.length, content: cmsData.content.length, media: cmsData.media.length }; },
  async activity(actor, action, target = '') { cmsData.activities.unshift({ id: crypto.randomUUID(), actor, action, target }); },
  async activities() { return cmsData.activities; },
  mediaDirectory: temporaryUploads,
};
const store = {
  mode: 'json-file',
  cms,
  async findUserByEmail(email) { return users.get(email) || null; },
  async findUserById(id) { return [...users.values()].find((item) => item._id === id) || null; },
  async createUser(value) {
    const user = { _id: crypto.randomUUID(), ...value, role: 'member' };
    users.set(user.email, user);
    return user;
  },
};

const app = express();
app.use(express.json({ limit: '7mb' }));
app.use(cookieParser());
app.use(attachUser(() => store));
app.use('/api/auth', authRoutes(() => store));
app.use('/api', cmsRoutes(() => store));
let server;
let origin;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await fs.rm(temporaryUploads, { recursive: true, force: true });
});

async function request(route, { method = 'GET', body, cookie } = {}) {
  const response = await fetch(`${origin}${route}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, data: await response.json() };
}

test('administrator routes reject anonymous and public member accounts', async () => {
  const anonymous = await request('/api/admin/overview');
  assert.equal(anonymous.response.status, 401);

  const signup = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'First User', email: 'first@example.test', password: 'StrongMember123!' },
  });
  assert.equal(signup.response.status, 201);
  assert.equal(signup.data.user.role, 'member');
  const memberCookie = signup.response.headers.get('set-cookie').split(';')[0];
  const forbidden = await request('/api/admin/overview', { cookie: memberCookie });
  assert.equal(forbidden.response.status, 403);
});

test('admin can persist bilingual copy and festival CRUD; drafts stay private', async () => {
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email: admin.email, password: 'StrongTestPassword123!' },
  });
  assert.equal(login.response.status, 200);
  const cookie = login.response.headers.get('set-cookie').split(';')[0];

  const savedContent = await request('/api/admin/content/hero.subtitle', {
    method: 'PUT', cookie, body: { en: 'A new village story', bn: 'নতুন গ্রামের গল্প' },
  });
  assert.equal(savedContent.response.status, 200);
  const publicContent = await request('/api/content');
  assert.deepEqual(publicContent.data.content['hero.subtitle'], { en: 'A new village story', bn: 'নতুন গ্রামের গল্প' });

  const template = {
    name: { en: 'River Festival', bn: 'নদী উৎসব' },
    date: { en: 'Spring', bn: 'বসন্ত' },
    text: { en: 'A village celebration.', bn: 'গ্রামের উৎসব।' },
    details: [], tone: 'kali', icon: 'Flame', img: '', position: '', featured: true, published: true,
    startDate: '2027-03-04', endDate: '2027-03-05', order: 0,
  };
  const initialized = await request('/api/admin/festivals/initialize', {
    method: 'POST', cookie, body: { festivals: [template, { ...template, name: { en: 'Private Festival', bn: 'ব্যক্তিগত উৎসব' }, published: false, order: 1 }] },
  });
  assert.equal(initialized.response.status, 201);
  const retriedInitialization = await request('/api/admin/festivals/initialize', {
    method: 'POST', cookie, body: { festivals: [template] },
  });
  assert.equal(retriedInitialization.response.status, 200);
  assert.equal(retriedInitialization.data.festivals.length, 2);
  const publicFestivals = await request('/api/cms/festivals');
  assert.equal(publicFestivals.data.festivals.length, 1);
  assert.equal(publicFestivals.data.festivals[0].name.bn, 'নদী উৎসব');
  assert.equal(publicFestivals.data.festivals[0].icon, 'Flame');

  const created = await request('/api/admin/festivals', { method: 'POST', cookie, body: { ...template, name: { en: 'Harvest Festival', bn: 'ফসল উৎসব' } } });
  assert.equal(created.response.status, 201);
  const updated = await request(`/api/admin/festivals/${created.data.id}`, {
    method: 'PUT', cookie, body: { ...template, name: { en: 'Harvest Celebration', bn: 'ফসল উদ্‌যাপন' } },
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.data.name.bn, 'ফসল উদ্‌যাপন');
  const removed = await request(`/api/admin/festivals/${created.data.id}`, { method: 'DELETE', cookie });
  assert.equal(removed.response.status, 200);
  assert.equal((await request('/api/admin/overview', { cookie })).data.stats.festivals, 2);
});

test('image uploads validate decoded image content and expose only safe formats', async () => {
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { email: admin.email, password: 'StrongTestPassword123!' },
  });
  const cookie = login.response.headers.get('set-cookie').split(';')[0];
  const rejected = await request('/api/admin/media', {
    method: 'POST', cookie, body: { data: 'data:image/png;base64,PHNjcmlwdD4=', caption: 'unsafe' },
  });
  assert.equal(rejected.response.status, 400);

  const png = (await sharp({
    create: { width: 1, height: 1, channels: 3, background: { r: 210, g: 140, b: 60 } },
  }).png().toBuffer()).toString('base64');
  const uploaded = await request('/api/admin/media', {
    method: 'POST', cookie, body: { data: `data:image/png;base64,${png}`, caption: 'Village temple' },
  });
  assert.equal(uploaded.response.status, 201, uploaded.data.error);
  assert.equal(uploaded.data.mime, 'image/png');
  assert.match(uploaded.data.url, /^\/uploads\/[a-f0-9-]+\.png$/);

  const replacement = await request(`/api/admin/media/${uploaded.data.id}/replace`, {
    method: 'PUT', cookie, body: { data: `data:image/png;base64,${png}` },
  });
  assert.equal(replacement.response.status, 200);
  assert.notEqual(replacement.data.url, uploaded.data.url);
  assert.equal((await fs.stat(path.join(temporaryUploads, replacement.data.filename))).isFile(), true);

  const removed = await request(`/api/admin/media/${replacement.data.id}`, { method: 'DELETE', cookie });
  assert.equal(removed.response.status, 200);
  await assert.rejects(fs.access(path.join(temporaryUploads, replacement.data.filename)));

  const loggedOut = await request('/api/auth/logout', { method: 'POST', cookie });
  assert.equal(loggedOut.response.status, 200);
  assert.match(loggedOut.response.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
  assert.equal((await request('/api/admin/overview')).response.status, 401);
});
