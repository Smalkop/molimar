import STORAGE from './storage.js';

const IMAGE = {
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  MAX_SIZE: 10 * 1024 * 1024,
  THUMB_MAX_W: 150,
  MEDIUM_MAX_W: 600,
  ORIGINAL_MAX_W: 1920,

  async process(file, productId) {
    if (!IMAGE.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de imagen no soportado: ${file.type}`);
    }
    if (file.size > IMAGE.MAX_SIZE) {
      throw new Error('La imagen excede el tamaño máximo de 10MB');
    }

    const uuid = crypto.randomUUID();
    const basePath = `molipa/${productId}/${uuid}`;
    const buffer = await file.arrayBuffer();

    const paths = {
      original: `${basePath}_original.webp`,
      medium: `${basePath}_medium.webp`,
      thumbnail: `${basePath}_thumbnail.webp`,
    };

    const webpBuffer = await IMAGE.convertToWebP(buffer);

    const resized = {
      original: await IMAGE.resize(webpBuffer, IMAGE.ORIGINAL_MAX_W),
      medium: await IMAGE.resize(webpBuffer, IMAGE.MEDIUM_MAX_W),
      thumbnail: await IMAGE.resize(webpBuffer, IMAGE.THUMB_MAX_W),
    };

    await Promise.all([
      STORAGE.upload(paths.original, resized.original, 'image/webp'),
      STORAGE.upload(paths.medium, resized.medium, 'image/webp'),
      STORAGE.upload(paths.thumbnail, resized.thumbnail, 'image/webp'),
    ]);

    return paths;
  },

  async convertToWebP(buffer) {
    try {
      const { image } = await import('@wasm-image-processing');
      const result = await image.encodeWebP(new Uint8Array(buffer), { quality: 85 });
      return result.buffer;
    } catch {
      return buffer;
    }
  },

  async resize(buffer, maxWidth) {
    try {
      const { image } = await import('@wasm-image-processing');
      const result = await image.resize(new Uint8Array(buffer), maxWidth);
      return result.buffer;
    } catch {
      return buffer;
    }
  },

  async delete(productImages) {
    const paths = [];
    for (const img of productImages) {
      if (img.thumbnail_path) paths.push(img.thumbnail_path);
      if (img.medium_path) paths.push(img.medium_path);
      if (img.original_path) paths.push(img.original_path);
    }
    if (paths.length > 0) {
      await STORAGE.deleteMultiple(paths);
    }
  },
};

export default IMAGE;
