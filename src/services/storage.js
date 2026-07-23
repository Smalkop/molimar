const STORAGE = {
  async upload(key, file, contentType) {
    const env = STORAGE.getEnv();
    await env.R2.put(key, file, {
      httpMetadata: { contentType },
      customMetadata: { uploadedAt: new Date().toISOString() },
    });
    return key;
  },

  async delete(key) {
    const env = STORAGE.getEnv();
    await env.R2.delete(key);
    return true;
  },

  async deleteMultiple(keys) {
    const env = STORAGE.getEnv();
    for (const key of keys) {
      await env.R2.delete(key);
    }
    return true;
  },

  // Lista objetos de R2. Opcionalmente con un prefijo.
  // R2.list devuelve como máximo 1000 objetos por llamada; paginamos con cursor.
  async list({ prefix, limit = 1000 } = {}) {
    const env = STORAGE.getEnv();
    const items = [];
    let cursor;
    do {
      const page = await env.R2.list({ cursor, prefix, limit: 1000 });
      for (const obj of page.objects) {
        items.push({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded?.toISOString?.() || obj.uploaded,
          contentType: obj.httpMetadata?.contentType || 'application/octet-stream',
        });
      }
      cursor = page.truncated ? page.cursor : null;
      if (items.length >= limit) break;
    } while (cursor);
    return items;
  },

  async getPublicUrl(key) {
    const env = STORAGE.getEnv();
    const object = await env.R2.get(key);
    if (!object) return null;
    return object;
  },

  getEnv() {
    return { R2: STORAGE._r2 };
  },

  setR2(r2) {
    STORAGE._r2 = r2;
  },
};

STORAGE._r2 = null;

export default STORAGE;
