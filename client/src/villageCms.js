import { village } from './village.js';

const original = {
  subtitle: { ...village.subtitle },
  heroLine: { ...village.heroLine },
  storyQuote: { ...village.storyQuote },
  address: { ...village.address },
  story: village.story.map((item) => ({ ...item })),
  storyImages: {
    main: { src: village.storyImages.main.src, caption: { ...village.storyImages.main.caption } },
    side: { src: village.storyImages.side.src, caption: { ...village.storyImages.side.caption } },
  },
  gallery: village.gallery.map((item) => ({ ...item, caption: { ...item.caption } })),
  life: village.life.map((item) => ({ ...item, title: { ...item.title }, text: { ...item.text } })),
  heroImage: village.heroImage,
  established: village.established,
  founded: village.founded,
  families: village.families,
  population: village.population,
};

const localizedTargets = {
  'village.subtitle': () => village.subtitle,
  'village.heroLine': () => village.heroLine,
  'village.storyQuote': () => village.storyQuote,
  'village.address': () => village.address,
};

// The village's own gallery photos as written in village.js, before any admin changes (the admin Gallery page lists them).
export const originalGallery = original.gallery;
const GALLERY_CATS = ['temple', 'procession', 'village'];

// { order: [ids], hidden: [ids] } saved by the admin Gallery page under village.gallery.layout
export function readGalleryLayout(content) {
  try {
    const value = JSON.parse(content?.['village.gallery.layout']?.en || '{}');
    const ids = (list) => (Array.isArray(list) ? list.filter((id) => typeof id === 'string').slice(0, 500) : []);
    return { order: ids(value.order), hidden: ids(value.hidden) };
  } catch {
    console.error('Invalid gallery layout');
    return { order: [], hidden: [] };
  }
}

export function applyVillageContent(content) {
  for (const key of Object.keys(localizedTargets)) {
    Object.assign(localizedTargets[key](), original[key.slice('village.'.length)]);
  }
  village.story.forEach((item, index) => Object.assign(item, original.story[index]));
  Object.assign(village.storyImages.main, original.storyImages.main);
  Object.assign(village.storyImages.side, original.storyImages.side);
  // each photo gets an id the admin Gallery page uses to hide or order it: o:<index> for the village's own, c:<id> for added ones
  village.gallery.splice(0, village.gallery.length, ...original.gallery.map((item, index) => ({ ...item, caption: { ...item.caption }, id: `o:${index}` })));
  village.life.forEach((item, index) => Object.assign(item, original.life[index]));
  village.heroImage = original.heroImage;
  village.established = original.established;
  village.founded = original.founded;
  village.families = original.families;
  village.population = original.population;

  for (const [key, value] of Object.entries(content || {})) {
    if (!value || typeof value.en !== 'string' || typeof value.bn !== 'string') continue;
    if (key.startsWith('village.gallery.custom.')) {
      try {
        const item = JSON.parse(value.en);
        if (typeof item.src === 'string' && item.src.startsWith('/')
          && item.caption && typeof item.caption.en === 'string' && typeof item.caption.bn === 'string') {
          village.gallery.push({
            id: `c:${key.slice('village.gallery.custom.'.length)}`,
            src: item.src,
            cat: GALLERY_CATS.includes(item.cat) ? item.cat : 'village',
            w: Number.isSafeInteger(item.w) ? item.w : 768,
            h: Number.isSafeInteger(item.h) ? item.h : 1024,
            caption: { en: item.caption.en.slice(0, 300), bn: item.caption.bn.slice(0, 300) },
          });
        }
      } catch {
        console.error(`Invalid published gallery item: ${key}`);
      }
      continue;
    }
    const target = localizedTargets[key]?.();
    if (target) {
      target.en = value.en;
      target.bn = value.bn;
    } else {
      const story = /^village\.story\.(\d+)$/.exec(key);
      if (story && village.story[Number(story[1])]) {
        village.story[Number(story[1])].en = value.en;
        village.story[Number(story[1])].bn = value.bn;
      } else {
        const nested = /^village\.(storyImages\.(?:main|side)\.caption|gallery\.\d+\.caption|life\.\d+\.(?:title|text))$/.exec(key);
        const path = nested?.[1].split('.') || [];
        let target = village;
        for (const part of path) target = part.match(/^\d+$/) ? target[Number(part)] : target?.[part];
        if (target && typeof target === 'object') Object.assign(target, { en: value.en, bn: value.bn });
      }
    }
  }
  const imageFields = {
    'village.heroImage': (value) => { village.heroImage = value; },
    'village.storyImages.main.src': (value) => { village.storyImages.main.src = value; },
    'village.storyImages.side.src': (value) => { village.storyImages.side.src = value; },
  };
  village.gallery.forEach((_, index) => {
    imageFields[`village.gallery.${index}.src`] = (value) => { village.gallery[index].src = value; };
  });
  village.life.forEach((_, index) => {
    imageFields[`village.life.${index}.img`] = (value) => { village.life[index].img = value; };
  });
  for (const [key, setImage] of Object.entries(imageFields)) {
    const value = content?.[key]?.en;
    if (typeof value === 'string' && value.startsWith('/')) setImage(value);
  }

  for (const key of ['established', 'founded', 'families', 'population']) {
    const value = Number(content?.[`village.${key}`]?.en);
    if (Number.isSafeInteger(value) && value > 0) village[key] = value;
  }

  // category of one of the village's own photos
  original.gallery.forEach((_, index) => {
    const cat = content?.[`village.gallery.${index}.cat`]?.en;
    if (GALLERY_CATS.includes(cat)) village.gallery[index].cat = cat;
  });
  // order and hidden photos come last, so the index-based keys above still point at the right photos
  const layout = readGalleryLayout(content);
  if (layout.hidden.length || layout.order.length) {
    const rank = new Map(layout.order.map((id, position) => [id, position]));
    // photos missing from the saved order (e.g. added later) go after the ordered ones, in their usual order
    const sorted = village.gallery.filter((item) => !layout.hidden.includes(item.id))
      .map((item, position) => ({ item, rank: rank.has(item.id) ? rank.get(item.id) : layout.order.length + position }))
      .sort((a, b) => a.rank - b.rank)
      .map(({ item }) => item);
    village.gallery.splice(0, village.gallery.length, ...sorted);
  }
}
