import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectStore } from './store.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'Site Administrator';

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  throw new Error('Set ADMIN_EMAIL to a valid email address before provisioning an administrator.');
}
if (!password || password.length < 12 || password.length > 128) {
  throw new Error('Set ADMIN_PASSWORD to a unique password between 12 and 128 characters.');
}

try {
  const store = await connectStore(process.env.MONGO_URI);
  await store.cms.seedAdmin(email, await bcrypt.hash(password, 12), name.slice(0, 60));
  console.log(`Administrator account provisioned for ${email}.`);
} finally {
  await mongoose.disconnect();
}
