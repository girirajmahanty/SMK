// Login / register with bcrypt-hashed passwords and a JWT stored in an httpOnly cookie
// (JavaScript in the page can't read it, which protects it from XSS theft).
import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createRateLimit } from './rateLimit.js';

const COOKIE = 'sg_token';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let secret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32 || secret === 'change-me-to-a-long-random-string')) {
  throw new Error('Set JWT_SECRET to a unique random value of at least 32 characters in production.');
}
if (!secret) {
  secret = crypto.randomBytes(48).toString('hex');
  console.warn('JWT_SECRET is not set: using a temporary one. Everyone is logged out when the server restarts.');
}

// Compared against when an email doesn't exist, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role });

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

// At most 10 login/register attempts per IP every 15 minutes.
const rateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  error: 'Too many attempts. Please try again in a few minutes.',
});

// Adds req.user when a valid login cookie is present.
export function attachUser(getStore) {
  return async (req, res, next) => {
    const token = req.cookies?.[COOKIE];
    if (token) {
      try {
        const { sub } = jwt.verify(token, secret);
        const user = await getStore().findUserById(sub);
        if (user) req.user = publicUser(user);
      } catch {
        res.clearCookie(COOKIE, { path: '/' });
      }
    }
    next();
  };
}

export function requireLogin(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ code: 'LOGIN_REQUIRED', error: 'Please log in first.' });
}

export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  res.status(req.user ? 403 : 401).json({ code: 'FORBIDDEN', error: 'Only an admin can do this.' });
}

export function authRoutes(getStore) {
  const router = express.Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

  const signIn = (res, user) => {
    const lifetime = user.role === 'admin' ? 8 * 60 * 60 * 1000 : WEEK_MS;
    res.cookie(COOKIE, jwt.sign({ sub: String(user._id) }, secret, { expiresIn: Math.floor(lifetime / 1000) }), { ...cookieOptions, maxAge: lifetime });
    return res.json({ user: publicUser(user) });
  };

  router.post('/register', rateLimit, wrap(async (req, res) => {
    const name = String(req.body?.name || '').trim().slice(0, 60);
    const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 120);
    const password = String(req.body?.password || '');

    if (name.length < 2) return res.status(400).json({ code: 'NAME_INVALID', error: 'Please enter your name.' });
    if (!EMAIL_RX.test(email)) return res.status(400).json({ code: 'EMAIL_INVALID', error: 'Please enter a valid email.' });
    if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ code: 'PASSWORD_WEAK', error: 'Password needs at least 8 characters, with letters and numbers.' });
    }
    const store = getStore();
    if (await store.findUserByEmail(email)) {
      return res.status(409).json({ code: 'EMAIL_TAKEN', error: 'An account with this email already exists.' });
    }
    const user = await store.createUser({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201);
    signIn(res, user);
  }));

  router.post('/login', rateLimit, wrap(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = await getStore().findUserByEmail(email);
    const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
    if (!user || !ok) {
      return res.status(401).json({ code: 'INVALID_CREDENTIALS', error: 'Wrong email or password.' });
    }
    signIn(res, user);
  }));

  router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  // Returns { user: null } instead of 401 so a logged-out visitor doesn't produce console errors.
  router.get('/me', (req, res) => res.json({ user: req.user || null }));

  return router;
}
