// Phone photos are often 5–10 MB, more than the 3 MB an upload may be. Before uploading, a photo is shrunk to at most
// `maxSide` pixels and re-encoded as JPEG in the browser, so it is small, quick to send and under the server's limit.
// The server stores photos at most 1600 px on the long side anyway. GIFs are sent as they are (to keep animation).
const UPLOAD_LIMIT = 2.8 * 1024 * 1024;

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('The image could not be read.'));
  reader.readAsDataURL(file);
});

export async function shrinkImage(file, { maxSide = 1600, maxBytes = UPLOAD_LIMIT } = {}) {
  if (file.type === 'image/gif') {
    if (file.size > maxBytes) throw new Error('This GIF is larger than 3 MB.');
    return readAsDataUrl(file);
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  const source = bitmap || await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The image could not be read.'));
    img.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  bitmap?.close();
  for (const quality of [0.88, 0.8, 0.7, 0.6]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length * 0.75 < maxBytes) return dataUrl;
  }
  throw new Error('This photo is too large even after shrinking.');
}

export const isImageFile = (file) => /^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file?.type || '');
