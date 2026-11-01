import images from './images.json';

// Optimised WebP versions of a local photo (made by `npm run images`).
// Returns props for <img>: the largest WebP as src plus a srcSet, so the browser picks the size it needs.
// Photos without WebP versions (e.g. Unsplash links) are returned unchanged.
export function pic(src) {
  const set = images[src];
  if (!set) return { src };
  return { src: set[set.length - 1][1], srcSet: set.map(([w, p]) => `${p} ${w}w`).join(', ') };
}

// The smallest version, for blurred backgrounds and thumbnails.
export const small = (src) => images[src]?.[0]?.[1] || src;
