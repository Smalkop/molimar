import STORAGE from './storage.js';

const IMAGE = {
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
  MAX_SIZE: 10 * 1024 * 1024,

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
      original: `${basePath}_original`,
      medium: `${basePath}_medium`,
      thumbnail: `${basePath}_thumbnail`,
    };

    const ext = IMAGE.getExtension(file.type);

    await Promise.all([
      STORAGE.upload(paths.original + ext, buffer, file.type),
      STORAGE.upload(paths.medium + ext, buffer, file.type),
      STORAGE.upload(paths.thumbnail + ext, buffer, file.type),
    ]);

    return {
      original: paths.original + ext,
      medium: paths.medium + ext,
      thumbnail: paths.thumbnail + ext,
    };
  },

  getExtension(mimeType) {
    const map = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/avif': '.avif',
      'image/gif': '.gif',
    };
    return map[mimeType] || '.jpg';
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
