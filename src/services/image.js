import STORAGE from './storage.js';

const MAGIC_BYTES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47],
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
  ],
  'image/avif': [
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66],
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
};

function validateMagicBytes(buffer, mimeType) {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return true;
  const bytes = new Uint8Array(buffer.slice(0, 16));
  return signatures.some(sig =>
    sig.every((b, i) => b === null || b === bytes[i])
  );
}

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

    const buffer = await file.arrayBuffer();

    if (!validateMagicBytes(buffer, file.type)) {
      throw new Error('El archivo no parece ser una imagen válida');
    }

    const uuid = crypto.randomUUID();
    const basePath = `molipa/${productId}/${uuid}`;

    const ext = IMAGE.getExtension(file.type);
    const key = basePath + ext;

    // Se guarda una sola copia del archivo en R2. Los tres campos apuntan al
    // mismo key para mantener compatibilidad con el esquema de la base de datos.
    await STORAGE.upload(key, buffer, file.type);

    return {
      original: key,
      medium: key,
      thumbnail: key,
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
      await STORAGE.deleteMultiple([...new Set(paths)]);
    }
  },

  // Subida simple a la galería suelta (sin producto asociado).
  // Devuelve el key R2 completo, que se sirve vía /media/<key>.
  async processGallery(file) {
    if (!IMAGE.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de imagen no soportado: ${file.type}`);
    }
    if (file.size > IMAGE.MAX_SIZE) {
      throw new Error('La imagen excede el tamaño máximo de 10MB');
    }
    const buffer = await file.arrayBuffer();
    if (!validateMagicBytes(buffer, file.type)) {
      throw new Error('El archivo no parece ser una imagen válida');
    }
    const uuid = crypto.randomUUID();
    const ext = IMAGE.getExtension(file.type);
    const key = `gallery/${uuid}${ext}`;
    await STORAGE.upload(key, buffer, file.type);
    return key;
  },

  // Indica si un objeto R2 listado es una imagen (por contentType).
  isImageContentType(ct) {
    return IMAGE.ALLOWED_TYPES.includes(ct);
  },
};

export default IMAGE;
