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
