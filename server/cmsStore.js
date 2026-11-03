import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import CmsContent from './models/CmsContent.js';
import Festival from './models/Festival.js';
import Media from './models/Media.js';
import AdminActivity from './models/AdminActivity.js';
import User from './models/User.js';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(process.env.CMS_DATA_DIR || path.join(serverDirectory, 'data'));
const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || path.join(serverDirectory, 'uploads'));
const jsonFile = (name) => path.join(directory, name);
const now = () => new Date().toISOString();
const clone = (value) => structuredClone(value);

async function readJson(name, fallback) {
  try {
    return JSON.parse(await fs.readFile(jsonFile(name), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return clone(fallback);
  }
}

async function writeJson(name, value) {
  await fs.mkdir(directory, { recursive: true });
  const file = jsonFile(name);
  const temporary = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
  await fs.rename(temporary, file);
}

const plain = (doc) => {
  const value = doc?.toObject ? doc.toObject() : doc;
  if (!value) return null;
  const { _id, __v, data, ...rest } = value;
  return { ...rest, id: String(_id || value.id) };
};

function mongoCms() {
  return {
    async content() {
      return (await CmsContent.find().sort({ key: 1 }).lean()).map(plain);
    },
    async putContent(key, value) {
      return plain(await CmsContent.findOneAndUpdate({ key }, { $set: value }, { upsert: true, new: true, runValidators: true }));
    },
    async deleteContent(key) {
      return CmsContent.findOneAndDelete({ key }).lean();
    },
    async festivals() {
      return (await Festival.find().sort({ order: 1, createdAt: 1 }).lean()).map(plain);
    },
    async createFestival(value) {
      return plain(await Festival.create(value));
    },
    async updateFestival(id, value) {
      if (!mongoose.isValidObjectId(id)) return null;
      return plain(await Festival.findByIdAndUpdate(id, { $set: value }, { new: true, runValidators: true }));
    },
    async deleteFestival(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return plain(await Festival.findByIdAndDelete(id).lean());
    },
    async reorderFestivals(ids) {
      await Promise.all(ids.map((id, order) => Festival.findByIdAndUpdate(id, { $set: { order } })));
      return this.festivals();
    },
    async initialized() {
      const meta = await mongoose.connection.collection('cmsmeta').findOne({ _id: 'festivals-initialized' });
      return !!meta;
    },
    async setInitialized() {
      await mongoose.connection.collection('cmsmeta').updateOne({ _id: 'festivals-initialized' }, { $set: { at: new Date() } }, { upsert: true });
    },
    async media() {
      return (await Media.find().sort({ createdAt: -1 }).lean()).map(plain);
    },
    async createMedia(value) {
      return plain(await Media.create(value));
    },
    async readMedia(filename) {
      const media = await Media.findOne({ filename }).select('+data').lean();
      return media?.data ? { data: media.data, mime: media.mime } : null;
    },
    async updateMedia(id, caption) {
      if (!mongoose.isValidObjectId(id)) return null;
      return plain(await Media.findByIdAndUpdate(id, { $set: { caption } }, { new: true, runValidators: true }));
    },
    async replaceMedia(id, value) {
      if (!mongoose.isValidObjectId(id)) return null;
      const current = await Media.findById(id).lean();
      if (!current) return null;
      const galleryRecords = await CmsContent.find({ key: /^village\.gallery\.custom\./ }).lean();
      const galleryUpdates = galleryRecords.flatMap((record) => {
        try {
          const item = JSON.parse(record.en);
          if (item.src !== current.url) return [];
          item.src = value.url;
          return [CmsContent.updateOne({ _id: record._id }, { $set: { en: JSON.stringify(item) } })];
        } catch {
          return [];
        }
      });
      await Promise.all([
        CmsContent.updateMany({ en: current.url }, { $set: { en: value.url } }),
        CmsContent.updateMany({ bn: current.url }, { $set: { bn: value.url } }),
        Festival.updateMany({ img: current.url }, { $set: { img: value.url } }),
        ...galleryUpdates,
      ]);
      const updated = await Media.findByIdAndUpdate(id, { $set: value }, { new: true, runValidators: true });
      return { media: plain(updated), previous: current };
    },
    async deleteMedia(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      return plain(await Media.findByIdAndDelete(id).lean());
    },
    async activity(actor, action, target = '') {
      await AdminActivity.create({ actor, action, target });
      const expired = await AdminActivity.find().sort({ createdAt: -1 }).skip(200).select('_id').lean();
      if (expired.length) await AdminActivity.deleteMany({ _id: { $in: expired.map((item) => item._id) } });
    },
    async activities() {
      return (await AdminActivity.find().sort({ createdAt: -1 }).limit(50).lean()).map(plain);
    },
    async stats() {
      const [festivals, content, media] = await Promise.all([
        Festival.countDocuments(),
        CmsContent.countDocuments(),
        Media.countDocuments(),
      ]);
      const latest = await Promise.all([
        Festival.findOne().sort({ updatedAt: -1 }).select('name updatedAt').lean(),
        CmsContent.findOne().sort({ updatedAt: -1 }).select('key updatedAt').lean(),
      ]);
      return { festivals, content, media, recent: latest.filter(Boolean).map(plain) };
    },
    async seedAdmin(email, passwordHash, name) {
      const user = await User.findOneAndUpdate(
        { email },
        { $set: { name, email, passwordHash, role: 'admin' } },
        { upsert: true, new: true, runValidators: true },
      );
      return user;
    },
    mediaDirectory: uploadDirectory,
  };
}

function fileCms() {
  async function get(name, fallback) { return readJson(name, fallback); }
  async function set(name, value) { await writeJson(name, value); }
  return {
    async content() { return Object.values(await get('cms-content.json', {})); },
    async putContent(key, value) {
      const items = await get('cms-content.json', {});
      items[key] = { key, ...value, id: key, updatedAt: now() };
      await set('cms-content.json', items);
      return items[key];
    },
    async deleteContent(key) {
      const items = await get('cms-content.json', {});
      const previous = items[key] || null;
      delete items[key];
      await set('cms-content.json', items);
      return previous;
    },
    async festivals() { return get('cms-festivals.json', []); },
    async createFestival(value) {
      const items = await this.festivals();
      const item = { ...value, id: crypto.randomUUID(), createdAt: now(), updatedAt: now() };
      items.push(item);
      await set('cms-festivals.json', items);
      return item;
    },
    async updateFestival(id, value) {
      const items = await this.festivals();
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return null;
      items[index] = { ...items[index], ...value, updatedAt: now() };
      await set('cms-festivals.json', items);
      return items[index];
    },
    async deleteFestival(id) {
      const items = await this.festivals();
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return null;
      const [item] = items.splice(index, 1);
      await set('cms-festivals.json', items);
      return item;
    },
    async reorderFestivals(ids) {
      const items = await this.festivals();
      const order = new Map(ids.map((id, index) => [id, index]));
      items.forEach((item) => { if (order.has(item.id)) { item.order = order.get(item.id); item.updatedAt = now(); } });
      await set('cms-festivals.json', items);
      return items.sort((a, b) => a.order - b.order);
    },
    async initialized() { return (await get('cms-meta.json', {})).festivalsInitialized === true; },
    async setInitialized() {
      const meta = await get('cms-meta.json', {});
      meta.festivalsInitialized = true;
      await set('cms-meta.json', meta);
    },
    async media() { return get('cms-media.json', []); },
    async createMedia(value) {
      const items = await this.media();
      const { data, ...metadata } = value;
      const item = { ...metadata, id: crypto.randomUUID(), createdAt: now(), updatedAt: now() };
      items.push(item);
      await set('cms-media.json', items);
      return item;
    },
    async readMedia(filename) {
      const item = (await this.media()).find((entry) => entry.filename === filename);
      if (!item) return null;
      try {
        return { data: await fs.readFile(path.join(uploadDirectory, filename)), mime: item.mime };
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
    },
    async updateMedia(id, caption) {
      const items = await this.media();
      const item = items.find((entry) => entry.id === id);
      if (!item) return null;
      item.caption = caption;
      item.updatedAt = now();
      await set('cms-media.json', items);
      return item;
    },
    async replaceMedia(id, value) {
      const items = await this.media();
      const item = items.find((entry) => entry.id === id);
      if (!item) return null;
      const previous = clone(item);
      const oldUrl = item.url;
      const { data, ...metadata } = value;
      Object.assign(item, metadata, { updatedAt: now() });
      const contents = await get('cms-content.json', {});
      for (const [key, record] of Object.entries(contents)) {
        if (record.en === oldUrl) record.en = value.url;
        if (record.bn === oldUrl) record.bn = value.url;
        if (key.startsWith('village.gallery.custom.')) {
          try {
            const galleryItem = JSON.parse(record.en);
            if (galleryItem.src === oldUrl) {
              galleryItem.src = value.url;
              record.en = JSON.stringify(galleryItem);
            }
          } catch {
            continue;
          }
        }
      }
      const festivals = await this.festivals();
      festivals.forEach((festival) => { if (festival.img === oldUrl) festival.img = value.url; });
      await Promise.all([
        set('cms-media.json', items),
        set('cms-content.json', contents),
        set('cms-festivals.json', festivals),
      ]);
      return { media: item, previous };
    },
    async deleteMedia(id) {
      const items = await this.media();
      const index = items.findIndex((entry) => entry.id === id);
      if (index < 0) return null;
      const [item] = items.splice(index, 1);
      await set('cms-media.json', items);
      return item;
    },
    async activity(actor, action, target = '') {
      const items = await get('cms-activity.json', []);
      items.unshift({ id: crypto.randomUUID(), actor, action, target, createdAt: now() });
      await set('cms-activity.json', items.slice(0, 200));
    },
    async activities() { return (await get('cms-activity.json', [])).slice(0, 50); },
    async stats() {
      const [festivals, content, media] = await Promise.all([this.festivals(), this.content(), this.media()]);
      const recent = [...festivals.map((item) => ({ name: item.name, updatedAt: item.updatedAt })), ...content.map((item) => ({ key: item.key, updatedAt: item.updatedAt }))]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
      return { festivals: festivals.length, content: content.length, media: media.length, recent };
    },
    async seedAdmin(email, passwordHash, name) {
      const users = await readJson('users.json', []);
      let user = users.find((item) => item.email === email);
      if (!user) {
        user = { _id: crypto.randomUUID(), createdAt: now() };
        users.push(user);
      }
      Object.assign(user, { name, email, passwordHash, role: 'admin', updatedAt: now() });
      await writeJson('users.json', users);
      return user;
    },
    mediaDirectory: uploadDirectory,
  };
}

export function createCmsStore(mode) {
  return mode === 'mongodb' ? mongoCms() : fileCms();
}

export { uploadDirectory };
