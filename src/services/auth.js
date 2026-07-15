import DB from './database.js';

const AUTH = {
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'MOLIPAR_SALT_2024');
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async verifyPassword(password, hash) {
    const hashed = await AUTH.hashPassword(password);
    return hashed === hash;
  },

  async generateToken(user) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: now,
      exp: now + 86400,
    };

    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(JSON.stringify(payload));
    const signatureInput = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(AUTH.getSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureInput));
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${signatureInput}.${signatureB64}`;
  },

  async verifyToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerB64, payloadB64, signatureB64] = parts;
      const signatureInput = `${headerB64}.${payloadB64}`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(AUTH.getSecret()),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
      const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(signatureInput));

      if (!valid) return null;

      const payload = JSON.parse(atob(payloadB64));
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;

      return payload;
    } catch {
      return null;
    }
  },

  async authenticate(email, password) {
    const user = await DB.get('SELECT * FROM users WHERE email = ? AND active = 1', [email]);
    if (!user) return null;

    const valid = await AUTH.verifyPassword(password, user.password);
    if (!valid) return null;

    const token = await AUTH.generateToken(user);
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  getSecret() {
    return typeof JWT_SECRET !== 'undefined' ? JWT_SECRET : 'molipar-secret-key';
  },
};

export default AUTH;
