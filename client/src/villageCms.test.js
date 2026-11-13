import { test } from 'node:test';
import assert from 'node:assert/strict';
import { village } from './village.js';
import { applyVillageContent } from './villageCms.js';

test('published CMS village overrides update public content and reset to source values', () => {
  const originalHero = village.heroLine.en;
  const originalGalleryLength = village.gallery.length;
  const customPhoto = {
    src: '/uploads/custom-photo.webp',
    cat: 'temple',
    w: 768,
    h: 1024,
    caption: { en: 'New temple photo', bn: 'নতুন মন্দিরের ছবি' },
  };
  applyVillageContent({
    'village.heroLine': { en: 'A new introduction', bn: 'নতুন পরিচিতি' },
    'village.story.0': { en: 'Updated story', bn: 'হালনাগাদ গল্প' },
    'village.gallery.custom.test': { en: JSON.stringify(customPhoto), bn: '' },
  });
  assert.equal(village.heroLine.en, 'A new introduction');
  assert.equal(village.story[0].bn, 'হালনাগাদ গল্প');
  assert.equal(village.gallery.length, originalGalleryLength + 1);
  assert.equal(village.gallery.at(-1).caption.bn, 'নতুন মন্দিরের ছবি');

  applyVillageContent({});
  assert.equal(village.heroLine.en, originalHero);
  assert.equal(village.gallery.length, originalGalleryLength);
});

test('the admin can hide, reorder and re-categorise gallery photos', () => {
  const first = village.gallery[0].src || village.gallery[0].video;
  const total = village.gallery.length;
  applyVillageContent({
    'village.gallery.custom.new': { en: JSON.stringify({ src: '/uploads/new.webp', cat: 'village', w: 1200, h: 800, caption: { en: 'New', bn: 'নতুন' } }), bn: '' },
    'village.gallery.layout': { en: JSON.stringify({ order: ['c:new', 'o:2'], hidden: ['o:0'] }), bn: '' },
    'village.gallery.1.cat': { en: 'temple', bn: 'temple' },
  });
  assert.equal(village.gallery.length, total, 'one added, one hidden');
  assert.equal(village.gallery[0].src, '/uploads/new.webp', 'ordered photos come first');
  assert.equal(village.gallery[1].id, 'o:2');
  assert.ok(!village.gallery.some((item) => (item.src || item.video) === first), 'hidden photo is gone');
  assert.equal(village.gallery.find((item) => item.id === 'o:1').cat, 'temple');

  applyVillageContent({ 'village.gallery.layout': { en: 'not json', bn: '' } });
  assert.equal(village.gallery.length, total, 'a broken layout is ignored');
  applyVillageContent({});
  assert.equal(village.gallery[0].id, 'o:0');
});

test('the admin can change the map and the routes; bad values are ignored', () => {
  const original = { link: village.mapLink, coords: village.coords, routes: village.routes.length };
  applyVillageContent({
    'village.mapQuery': { en: 'New Temple', bn: 'New Temple' },
    'village.coords': { en: '23.1, 86.2', bn: '' },
    'village.mapLink': { en: 'https://maps.app.goo.gl/abc123', bn: '' },
    'village.routes': { en: JSON.stringify([
      { from: { en: 'Town', bn: 'শহর' }, distance: { en: '5 km', bn: '৫ কিমি' }, time: { en: '10 min', bn: '১০ মিনিট' }, by: 'plane', steps: [{ mode: 'rocket', en: 'Walk', bn: 'হাঁটুন' }, { mode: 'bus', en: '', bn: '' }] },
      { from: { en: '', bn: '' } },
    ]), bn: '' },
  });
  assert.equal(village.mapQuery, 'New Temple');
  assert.equal(village.coords, '23.1,86.2');
  assert.equal(village.mapLink, 'https://maps.app.goo.gl/abc123');
  assert.equal(village.routes.length, 1, 'a route without a starting place is dropped');
  assert.equal(village.routes[0].by, 'bus', 'unknown travel type falls back to bus');
  assert.deepEqual(village.routes[0].steps, [{ mode: 'walk', en: 'Walk', bn: 'হাঁটুন' }], 'empty steps dropped, unknown mode is walk');
  assert.equal(village.routes[0].query, 'Town');

  applyVillageContent({ 'village.mapLink': { en: 'https://evil.example/maps', bn: '' }, 'village.coords': { en: 'here', bn: '' }, 'village.routes': { en: '{oops', bn: '' } });
  assert.equal(village.mapLink, original.link, 'only Google Maps links are used');
  assert.equal(village.coords, original.coords);
  assert.equal(village.routes.length, original.routes);
  applyVillageContent({});
});
