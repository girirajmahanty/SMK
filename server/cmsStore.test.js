import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'sidhagora-cms-store-'));
const dataDirectory = path.join(temporaryDirectory, 'database');
const uploadDirectory = path.join(temporaryDirectory, 'images');
process.env.CMS_DATA_DIR = dataDirectory;
process.env.UPLOAD_DIR = uploadDirectory;
const { createCmsStore } = await import('./cmsStore.js');

after(async () => {
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
});

test('JSON CMS persists content, festivals, activity, and image replacement across store instances', async () => {
  const firstStore = createCmsStore('json-file');
  await firstStore.putContent('hero.subtitle', { en: 'Village, Purulia', bn: 'গ্রাম, পুরুলিয়া' });
  await firstStore.putContent('village.gallery.custom.photo-1', {
    en: JSON.stringify({ src: '/uploads/old.png', caption: { en: 'Old', bn: 'পুরোনো' } }),
    bn: '',
  });
  const festival = await firstStore.createFestival({
    name: { en: 'Spring Festival', bn: 'বসন্ত উৎসব' }, published: true, img: '/uploads/old.png', order: 0,
  });
  const oldBytes = Buffer.from('old-image-bytes');
  const newBytes = Buffer.from('new-image-bytes');
  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(path.join(uploadDirectory, 'old.png'), oldBytes);
  await fs.writeFile(path.join(uploadDirectory, 'new.png'), newBytes);
  const media = await firstStore.createMedia({
    filename: 'old.png', url: '/uploads/old.png', mime: 'image/png', size: oldBytes.length, caption: 'Old image',
  });
  const replaced = await firstStore.replaceMedia(media.id, {
    filename: 'new.png', url: '/uploads/new.png', mime: 'image/png', size: newBytes.length, data: newBytes,
  });
  assert.equal(replaced.media.url, '/uploads/new.png');

  const reopened = createCmsStore('json-file');
  assert.equal((await reopened.content()).find((item) => item.key === 'hero.subtitle').bn, 'গ্রাম, পুরুলিয়া');
  assert.equal((await reopened.festivals()).find((item) => item.id === festival.id).img, '/uploads/new.png');
  const galleryItem = JSON.parse((await reopened.content()).find((item) => item.key === 'village.gallery.custom.photo-1').en);
  assert.equal(galleryItem.src, '/uploads/new.png');
  assert.deepEqual((await reopened.readMedia('new.png')).data, newBytes);
  await reopened.activity('admin@example.test', 'Updated website content', 'hero.subtitle');
  assert.equal((await createCmsStore('json-file').activities())[0].action, 'Updated website content');
});
