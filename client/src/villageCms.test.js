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
