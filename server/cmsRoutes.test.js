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
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'cms-route-test-secret-with-at-least-32-characters';

const temporaryUploads = await fs.mkdtemp(path.join(os.tmpdir(), 'sidhagora-cms-test-'));
process.env.UPLOAD_DIR = temporaryUploads;
const { attachUser, authRoutes, memberRoutes } = await import('./auth.js');
const { cmsRoutes } = await import('./cmsRoutes.js');
const { uploadAccess } = await import('./app.js');

const users = new Map();
const admin = {
  _id: 'admin-1', name: 'Test Admin', email: 'admin@example.test',
  role: 'admin', passwordHash: await bcrypt.hash('StrongTestPassword123!', 4),
};
users.set(admin.email, admin);
const cmsData = { content: [], festivals: [], media: [], activities: [], gallery: [], initialized: false };
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
  // A copy, like the real stores, so a route can't rely on a list read before it changed.
  async festivals() { return [...cmsData.festivals]; },
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
  async galleryPhotos(status) { return cmsData.gallery.filter((item) => !status || item.status === status).map(({ data, ...item }) => item); },
  async createGalleryPhoto(value) {
    const item = { ...value, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    cmsData.gallery.push(item);
    const { data, ...rest } = item;
    return rest;
  },
  async approveGalleryPhoto(id, reviewer) {
    const item = cmsData.gallery.find((entry) => entry.id === id);
    if (!item) return null;
    Object.assign(item, { status: 'approved', reviewedBy: reviewer });
    const { data, ...rest } = item;
    return rest;
  },
  async updateGalleryPhoto(id, value) {
    const item = cmsData.gallery.find((entry) => entry.id === id);
    if (!item) return null;
    Object.assign(item, value);
    const { data, ...rest } = item;
    return rest;
  },
  async deleteGalleryPhoto(id) {
    const index = cmsData.gallery.findIndex((item) => item.id === id);
    return index < 0 ? null : cmsData.gallery.splice(index, 1)[0];
  },
  async countGalleryPhotosSince(userId, since) {
    return cmsData.gallery.filter((item) => item.userId === userId && new Date(item.createdAt) >= since).length;
  },
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

// A session cookie for a user, without the login route (limited to 10 attempts per IP).
const sessionFor = (user) => `sg_token=${jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET)}`;
const memberNamed = (name, email) => {
  const user = { _id: crypto.randomUUID(), name, email, role: 'member' };
  users.set(email, user);
  return sessionFor(user);
};

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
  assert.equal(initialized.data.festivals.length, 2, 'the reply lists the festivals just imported');
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
  // stored ready for the website: converted to WebP
  assert.equal(uploaded.data.mime, 'image/webp');
  assert.match(uploaded.data.url, /^\/uploads\/[a-f0-9-]+\.webp$/);
  const stored = await fs.readFile(path.join(temporaryUploads, uploaded.data.filename));
  assert.equal(stored.toString('ascii', 8, 12), 'WEBP');

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

test('two festival imports at the same moment import each festival once', async () => {
  cmsData.festivals.length = 0;
  cmsData.initialized = false;
  const login = await request('/api/auth/login', { method: 'POST', body: { email: admin.email, password: 'StrongTestPassword123!' } });
  const cookie = login.response.headers.get('set-cookie').split(';')[0];
  const festival = (en, bn) => ({ name: { en, bn }, date: { en: 'x', bn: 'x' }, text: { en: 'x', bn: 'x' }, details: [], icon: 'Flame', published: true });
  const body = { festivals: [festival('Durga Puja', 'দুর্গাপূজা'), festival('Kali Puja', 'কালীপূজা')] };
  const [first, second] = await Promise.all([
    request('/api/admin/festivals/initialize', { method: 'POST', cookie, body }),
    request('/api/admin/festivals/initialize', { method: 'POST', cookie, body }),
  ]);
  assert.deepEqual([first.response.status, second.response.status].sort(), [200, 201]);
  assert.equal(cmsData.festivals.length, 2);
});

test('festival photo focus points are kept only in the "X% Y%" form', async () => {
  const login = await request('/api/auth/login', { method: 'POST', body: { email: admin.email, password: 'StrongTestPassword123!' } });
  const cookie = login.response.headers.get('set-cookie').split(';')[0];
  const base = { name: { en: 'Focus Fest', bn: 'ফোকাস' }, date: { en: 'x', bn: 'x' }, text: { en: 'x', bn: 'x' }, details: [], icon: 'Flame', published: true };
  const created = await request('/api/admin/festivals', { method: 'POST', cookie, body: { ...base, position: '63% 45%' } });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.position, '63% 45%');
  const bad = await request(`/api/admin/festivals/${created.data.id}`, { method: 'PUT', cookie, body: { ...base, position: '150% 10%; color: red' } });
  assert.equal(bad.response.status, 200);
  assert.equal(bad.data.position, '');
});

test('signed-in visitors can send gallery photos; they appear only after an admin approves them', async () => {
  const photo = (await sharp({ create: { width: 1200, height: 800, channels: 3, background: { r: 120, g: 160, b: 90 } } }).jpeg().toBuffer()).toString('base64');
  const body = { data: `data:image/jpeg;base64,${photo}`, caption: 'Evening at the pond', cat: 'village' };

  const anonymous = await request('/api/gallery/photos', { method: 'POST', body });
  assert.equal(anonymous.response.status, 401);

  const signup = await request('/api/auth/register', { method: 'POST', body: { name: 'Photo Member', email: 'photos@example.test', password: 'StrongMember123!' } });
  const member = signup.response.headers.get('set-cookie').split(';')[0];
  const noCaption = await request('/api/gallery/photos', { method: 'POST', cookie: member, body: { ...body, caption: ' ' } });
  assert.equal(noCaption.response.status, 400);

  const sent = await request('/api/gallery/photos', { method: 'POST', cookie: member, body });
  assert.equal(sent.response.status, 201, sent.data.error);
  assert.equal(sent.data.status, 'pending');
  assert.equal(sent.data.by, 'Photo Member');
  assert.deepEqual([sent.data.w, sent.data.h], [1200, 800]);
  assert.match(sent.data.url, /^\/uploads\/[a-f0-9-]+\.webp$/);
  assert.equal((await request('/api/gallery/photos')).data.length, 0, 'pending photos are not public');
  assert.equal((await request('/api/gallery/photos/mine', { cookie: member })).data[0].status, 'pending');

  const forbidden = await request(`/api/admin/gallery/photos/${sent.data.id}/approve`, { method: 'POST', cookie: member });
  assert.equal(forbidden.response.status, 403);

  const login = await request('/api/auth/login', { method: 'POST', body: { email: admin.email, password: 'StrongTestPassword123!' } });
  const adminCookie = login.response.headers.get('set-cookie').split(';')[0];
  const pending = await request('/api/admin/gallery/photos', { cookie: adminCookie });
  assert.equal(pending.data.length, 1);
  const approved = await request(`/api/admin/gallery/photos/${sent.data.id}/approve`, { method: 'POST', cookie: adminCookie });
  assert.equal(approved.response.status, 200);
  const publicList = (await request('/api/gallery/photos')).data;
  assert.equal(publicList.length, 1);
  assert.equal(publicList[0].caption, 'Evening at the pond');

  const second = await request('/api/gallery/photos', { method: 'POST', cookie: member, body: { ...body, caption: 'Not for the site' } });
  const rejected = await request(`/api/admin/gallery/photos/${second.data.id}`, { method: 'DELETE', cookie: adminCookie });
  assert.equal(rejected.response.status, 200);
  assert.equal(cmsData.gallery.length, 1, 'a rejected photo is deleted');
  assert.equal((await request('/api/gallery/photos')).data.length, 1);
});

test('a visitor can send at most ten gallery photos a day', async () => {
  const photo = (await sharp({ create: { width: 40, height: 30, channels: 3, background: { r: 10, g: 20, b: 30 } } }).png().toBuffer()).toString('base64');
  const signup = await request('/api/auth/register', { method: 'POST', body: { name: 'Busy Member', email: 'busy@example.test', password: 'StrongMember123!' } });
  const member = signup.response.headers.get('set-cookie').split(';')[0];
  const user = [...users.values()].find((item) => item.email === 'busy@example.test');
  for (let i = 0; i < 10; i += 1) cmsData.gallery.push({ id: `seed-${i}`, userId: String(user._id), status: 'pending', caption: 'x', createdAt: new Date().toISOString() });
  const tooMany = await request('/api/gallery/photos', { method: 'POST', cookie: member, body: { data: `data:image/png;base64,${photo}`, caption: 'One more' } });
  assert.equal(tooMany.response.status, 429);
});

test('members can take back their own gallery photos, but not other people\'s', async () => {
  const photo = (await sharp({ create: { width: 60, height: 40, channels: 3, background: { r: 1, g: 2, b: 3 } } }).png().toBuffer()).toString('base64');
  const owner = memberNamed('Owner', 'owner@example.test');
  const other = memberNamed('Other', 'other@example.test');
  const sent = await request('/api/gallery/photos', { method: 'POST', cookie: owner, body: { data: `data:image/png;base64,${photo}`, caption: 'Mine' } });
  assert.equal(sent.response.status, 201);

  assert.equal((await request(`/api/gallery/photos/mine/${sent.data.id}`, { method: 'DELETE' })).response.status, 401);
  assert.equal((await request(`/api/gallery/photos/mine/${sent.data.id}`, { method: 'DELETE', cookie: other })).response.status, 404);
  assert.ok(cmsData.gallery.some((item) => item.id === sent.data.id), 'another member cannot delete it');
  assert.equal((await request(`/api/gallery/photos/mine/${sent.data.id}`, { method: 'DELETE', cookie: owner })).response.status, 200);
  assert.ok(!cmsData.gallery.some((item) => item.id === sent.data.id));
});

test('admins can fix a visitor photo\'s caption and category; the overview counts waiting photos', async () => {
  const photo = (await sharp({ create: { width: 60, height: 40, channels: 3, background: { r: 9, g: 8, b: 7 } } }).png().toBuffer()).toString('base64');
  const member = memberNamed('Typo Member', 'typo@example.test');
  const sent = await request('/api/gallery/photos', { method: 'POST', cookie: member, body: { data: `data:image/png;base64,${photo}`, caption: 'Templ at nite', cat: 'village' } });
  const adminCookie = sessionFor([...users.values()].find((item) => item.email === admin.email));

  const waiting = cmsData.gallery.filter((item) => item.status === 'pending').length;
  assert.equal((await request('/api/admin/overview', { cookie: adminCookie })).data.stats.photoRequests, waiting);

  assert.equal((await request(`/api/admin/gallery/photos/${sent.data.id}`, { method: 'PATCH', cookie: member, body: { caption: 'x', cat: 'temple' } })).response.status, 403);
  assert.equal((await request(`/api/admin/gallery/photos/${sent.data.id}`, { method: 'PATCH', cookie: adminCookie, body: { caption: 'Temple', cat: 'kitchen' } })).response.status, 400);
  assert.equal((await request(`/api/admin/gallery/photos/${sent.data.id}`, { method: 'PATCH', cookie: adminCookie, body: { caption: '  ', cat: 'temple' } })).response.status, 400);
  const fixed = await request(`/api/admin/gallery/photos/${sent.data.id}`, { method: 'PATCH', cookie: adminCookie, body: { caption: 'Temple at night', cat: 'temple' } });
  assert.equal(fixed.response.status, 200);
  assert.deepEqual([fixed.data.caption, fixed.data.cat, fixed.data.status], ['Temple at night', 'temple', 'pending']);
});

test('a waiting gallery photo file is private and never cached; approved ones are cached briefly', () => {
  const pending = { gallery: { status: 'pending', userId: 'u1' } };
  assert.equal(uploadAccess(pending, undefined), null);
  assert.equal(uploadAccess(pending, { id: 'u2', role: 'member' }), null);
  assert.equal(uploadAccess(pending, { id: 'u1', role: 'member' }).cacheControl, 'private, no-store');
  assert.equal(uploadAccess(pending, { id: 'admin', role: 'admin' }).cacheControl, 'private, no-store');
  assert.equal(uploadAccess({ gallery: { status: 'pending' } }, undefined), null);
  assert.match(uploadAccess({ gallery: { status: 'approved', userId: 'u1' } }, undefined).cacheControl, /max-age=3600\b/);
  assert.match(uploadAccess({}, undefined).cacheControl, /immutable/);
});

test('admins can list members, change roles and delete accounts, but never their own', async () => {
  const members = new Map();
  const memberStore = {
    ...store,
    async listUsers() { return [...users.values()].map(({ passwordHash, ...user }) => user); },
    async updateUser(id, value) { const user = [...users.values()].find((item) => item._id === id); if (!user) return null; Object.assign(user, value); return user; },
    async deleteUser(id) { const user = [...users.values()].find((item) => item._id === id); if (!user) return null; users.delete(user.email); return user; },
  };
  const memberApp = express();
  memberApp.use(express.json());
  memberApp.use(cookieParser());
  memberApp.use(attachUser(() => memberStore));
  memberApp.use('/api/auth', authRoutes(() => memberStore));
  memberApp.use('/api/admin/members', memberRoutes(() => memberStore));
  const listener = memberApp.listen(0, '127.0.0.1');
  await new Promise((resolve) => listener.once('listening', resolve));
  const base = `http://127.0.0.1:${listener.address().port}`;
  const call = async (route, { method = 'GET', body, cookie } = {}) => {
    const response = await fetch(base + route, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { response, data: await response.json() };
  };
  try {
    const adminUser = [...users.values()].find((item) => item.email === admin.email);
    const adminCookie = sessionFor(adminUser);
    const memberCookie = memberNamed('Plain Member', 'plain@example.test');
    const plain = users.get('plain@example.test');
    members.set('plain', plain);

    assert.equal((await call('/api/admin/members')).response.status, 401);
    assert.equal((await call('/api/admin/members', { cookie: memberCookie })).response.status, 403);
    const list = await call('/api/admin/members', { cookie: adminCookie });
    assert.equal(list.response.status, 200);
    assert.ok(list.data.some((item) => item.email === 'plain@example.test'));
    assert.ok(list.data.every((item) => !('passwordHash' in item)), 'password hashes are never sent');

    assert.equal((await call(`/api/admin/members/${adminUser._id}/role`, { method: 'PATCH', cookie: adminCookie, body: { role: 'member' } })).response.status, 400, 'cannot demote yourself');
    assert.equal((await call(`/api/admin/members/${adminUser._id}`, { method: 'DELETE', cookie: adminCookie })).response.status, 400, 'cannot delete yourself');
    assert.equal((await call(`/api/admin/members/${plain._id}/role`, { method: 'PATCH', cookie: adminCookie, body: { role: 'owner' } })).response.status, 400);
    const promoted = await call(`/api/admin/members/${plain._id}/role`, { method: 'PATCH', cookie: adminCookie, body: { role: 'admin' } });
    assert.equal(promoted.data.role, 'admin');
    assert.equal((await call('/api/admin/members', { cookie: memberCookie })).response.status, 200, 'the new admin has access at once');
    assert.equal((await call(`/api/admin/members/${plain._id}`, { method: 'DELETE', cookie: adminCookie })).response.status, 200);
    assert.equal((await call('/api/admin/members', { cookie: memberCookie })).response.status, 401, 'a deleted account is signed out');
  } finally {
    await new Promise((resolve) => listener.close(resolve));
  }
});

test('signed-in users can change their password only with the current one', async () => {
  const passwordStore = {
    ...store,
    async updateUser(id, value) { const user = [...users.values()].find((item) => item._id === id); Object.assign(user, value); return user; },
  };
  const passwordApp = express();
  passwordApp.use(express.json());
  passwordApp.use(cookieParser());
  passwordApp.use(attachUser(() => passwordStore));
  passwordApp.use('/api/auth', authRoutes(() => passwordStore));
  const listener = passwordApp.listen(0, '127.0.0.1');
  await new Promise((resolve) => listener.once('listening', resolve));
  const base = `http://127.0.0.1:${listener.address().port}/api/auth/password`;
  const send = (body, cookie) => fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
  try {
    const user = { _id: crypto.randomUUID(), name: 'Pw', email: 'pw@example.test', role: 'member', passwordHash: await bcrypt.hash('OldPassword1', 4) };
    users.set(user.email, user);
    const cookie = sessionFor(user);
    assert.equal((await send({ current: 'x', password: 'NewPassword2' })).status, 401);
    assert.equal((await send({ current: 'wrong', password: 'NewPassword2' }, cookie)).status, 400);
    assert.equal((await send({ current: 'OldPassword1', password: 'short' }, cookie)).status, 400);
    assert.equal((await send({ current: 'OldPassword1', password: 'NewPassword2' }, cookie)).status, 200);
    assert.ok(await bcrypt.compare('NewPassword2', user.passwordHash));
  } finally {
    await new Promise((resolve) => listener.close(resolve));
  }
});

test('changing the password signs out other logins and keeps this one signed in', async () => {
  const versionStore = {
    ...store,
    async updateUser(id, value) { const user = [...users.values()].find((item) => item._id === id); Object.assign(user, value); return user; },
  };
  const versionApp = express();
  versionApp.use(express.json());
  versionApp.use(cookieParser());
  versionApp.use(attachUser(() => versionStore));
  versionApp.use('/api/auth', authRoutes(() => versionStore));
  const listener = versionApp.listen(0, '127.0.0.1');
  await new Promise((resolve) => listener.once('listening', resolve));
  const base = `http://127.0.0.1:${listener.address().port}/api/auth`;
  const me = async (cookie) => (await (await fetch(`${base}/me`, { headers: { Cookie: cookie } })).json()).user;
  try {
    const user = { _id: crypto.randomUUID(), name: 'Two Devices', email: 'two@example.test', role: 'member', passwordHash: await bcrypt.hash('OldPassword1', 4) };
    users.set(user.email, user);
    const phone = sessionFor(user);
    const laptop = sessionFor(user);
    assert.equal((await me(phone)).email, 'two@example.test');
    const changed = await fetch(`${base}/password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: laptop }, body: JSON.stringify({ current: 'OldPassword1', password: 'NewPassword2' }) });
    assert.equal(changed.status, 200);
    const fresh = changed.headers.get('set-cookie').split(';')[0];
    assert.equal(await me(phone), null, 'the other device is signed out');
    assert.equal(await me(laptop), null, 'the old cookie no longer works');
    assert.equal((await me(fresh)).email, 'two@example.test', 'the new cookie works');
  } finally {
    await new Promise((resolve) => listener.close(resolve));
  }
});
