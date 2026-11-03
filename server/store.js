// Data layer: uses MongoDB when available, otherwise a JSON file so the app runs out of the box.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Word from './models/Word.js';
import User from './models/User.js';
import { seedWords } from './seed.js';
import { createCmsStore } from './cmsStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data', 'words.json');
const META_FILE = path.join(__dirname, 'data', 'meta.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

const Meta = mongoose.model('Meta', new mongoose.Schema({ key: { type: String, unique: true }, value: Number }));

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mongoStore = {
  mode: 'mongodb',
  cms: createCmsStore('mongodb'),
  async init() {
    if ((await Word.countDocuments()) === 0) await Word.insertMany(seedWords);
  },
  async list({ q, category }) {
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ word: rx }, { meaning: rx }, { meaningBn: rx }];
    }
    return Word.find(filter).sort({ createdAt: -1 }).lean();
  },
  async random() {
    const [w] = await Word.aggregate([{ $sample: { size: 1 } }]);
    return w || null;
  },
  async stats() {
    const total = await Word.countDocuments();
    const phrases = await Word.countDocuments({ category: 'phrase' });
    const contributors = (await Word.distinct('contributor')).length;
    return { total, phrases, contributors };
  },
  async visit(inc) {
    const m = await Meta.findOneAndUpdate({ key: 'visits' }, { $inc: { value: inc } }, { upsert: true, new: true });
    return m.value;
  },
  create: (data) => Word.create(data),
  like: (id) => Word.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true }).lean(),
  remove: (id) => Word.findByIdAndDelete(id).lean(),

  findUserByEmail: (email) => User.findOne({ email }).lean(),
  async findUserById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return User.findById(id).lean();
  },
  async createUser(data) {
    return (await User.create({ ...data, role: 'member' })).toObject();
  },
};

const fileStore = {
  mode: 'json-file',
  cms: createCmsStore('json-file'),
  words: [],
  save() {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.words, null, 2));
  },
  async init() {
    if (fs.existsSync(DATA_FILE)) {
      this.words = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } else {
      const now = Date.now();
      this.words = seedWords.map((w, i) => ({
        _id: crypto.randomUUID(),
        ...w,
        createdAt: new Date(now - i * 1000).toISOString(),
      }));
      this.save();
    }
    if (fs.existsSync(USERS_FILE)) this.users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  },
  async list({ q, category }) {
    const needle = (q || '').toLowerCase();
    return this.words
      .filter((w) => !category || category === 'all' || w.category === category)
      .filter((w) => !needle || [w.word, w.meaning, w.meaningBn || ''].some((s) => s.toLowerCase().includes(needle)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async random() {
    return this.words[Math.floor(Math.random() * this.words.length)] || null;
  },
  async visit(inc) {
    const meta = fs.existsSync(META_FILE) ? JSON.parse(fs.readFileSync(META_FILE, 'utf8')) : {};
    meta.visits = (meta.visits || 0) + inc;
    fs.mkdirSync(path.dirname(META_FILE), { recursive: true });
    fs.writeFileSync(META_FILE, JSON.stringify(meta));
    return meta.visits;
  },
  async stats() {
    return {
      total: this.words.length,
      phrases: this.words.filter((w) => w.category === 'phrase').length,
      contributors: new Set(this.words.map((w) => w.contributor)).size,
    };
  },
  async create(data) {
    const w = {
      _id: crypto.randomUUID(),
      pronunciation: '', meaningBn: '', example: '', exampleMeaning: '', category: 'other',
      contributor: 'Village team', likes: 0,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.words.push(w);
    this.save();
    return w;
  },
  async like(id) {
    const w = this.words.find((x) => x._id === id);
    if (!w) return null;
    w.likes += 1;
    this.save();
    return w;
  },
  async remove(id) {
    const i = this.words.findIndex((x) => x._id === id);
    if (i === -1) return null;
    const [w] = this.words.splice(i, 1);
    this.save();
    return w;
  },

  users: [],
  saveUsers() {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2));
  },
  async findUserByEmail(email) {
    return this.users.find((u) => u.email === email) || null;
  },
  async findUserById(id) {
    return this.users.find((u) => u._id === id) || null;
  },
  async createUser(data) {
    const u = {
      _id: crypto.randomUUID(),
      ...data,
      role: 'member',
      createdAt: new Date().toISOString(),
    };
    this.users.push(u);
    this.saveUsers();
    return u;
  },
};

export async function connectStore(uri) {
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      await mongoStore.init();
      return mongoStore;
    } catch (err) {
      console.warn(`MongoDB not reachable (${err.message}). Using local JSON file instead.`);
    }
  }
  await fileStore.init();
  return fileStore;
}
