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

export function applyVillageContent(content) {
  for (const key of Object.keys(localizedTargets)) {
    Object.assign(localizedTargets[key](), original[key.slice('village.'.length)]);
  }
  village.story.forEach((item, index) => Object.assign(item, original.story[index]));
  Object.assign(village.storyImages.main, original.storyImages.main);
  Object.assign(village.storyImages.side, original.storyImages.side);
  village.gallery.splice(0, village.gallery.length, ...original.gallery.map((item) => ({ ...item, caption: { ...item.caption } })));
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
            src: item.src,
            cat: ['temple', 'procession', 'village'].includes(item.cat) ? item.cat : 'village',
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
}
