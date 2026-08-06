import DB from './database.js';

const VALID_TABLE_RE = /^[a-z_][a-z0-9_]*$/;

function validateTableName(name) {
  if (!VALID_TABLE_RE.test(name)) {
    throw new Error(`Nombre de tabla inválido: ${name}`);
  }
}

// Base64url seguro para UTF-8 (evita que btoa/atob rompan con chars > U+00FF,
// p. ej. acentos o emojis, y produce tokens compatibles con JWT).
function bytesToB64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecodeToStr(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function b64urlDecodeToBytes(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64urlEncode(str) {
  return bytesToB64url(new TextEncoder().encode(str));
}

function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

function hex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function parseHex(hexStr) {
  const match = hexStr.match(/.{2}/g);
  if (!match) throw new Error('Invalid hex string');
  return new Uint8Array(match.map(b => parseInt(b, 16)));
}

const PBKDF2_ITERATIONS = 100000;

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return new Uint8Array(hash);
}

const AUTH = {
  async hashPassword(password) {
    const salt = generateSalt();
    const hash = await deriveKey(password, salt);
    return hex(salt) + ':' + hex(hash);
  },

  async verifyPassword(password, stored) {
    const sep = stored.indexOf(':');
    if (sep === -1) return false;
    const saltHex = stored.slice(0, sep);
    const hashHex = stored.slice(sep + 1);
    if (!saltHex || !hashHex) return false;
    try {
      const salt = parseHex(saltHex);
      const hash = await deriveKey(password, salt);
      return hex(hash) === hashHex;
    } catch {
      return false;
    }
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
    const headerB64 = b64urlEncode(JSON.stringify(header));
    const payloadB64 = b64urlEncode(JSON.stringify(payload));
    const signatureInput = `${headerB64}.${payloadB64}`;

    const secret = AUTH.getSecret();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureInput));
    const signatureB64 = bytesToB64url(new Uint8Array(signature));

    return `${signatureInput}.${signatureB64}`;
  },

  async verifyToken(token) {
    try {
      if (AUTH.isTokenInvalidated(token)) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerB64, payloadB64, signatureB64] = parts;
      const signatureInput = `${headerB64}.${payloadB64}`;

      const encoder = new TextEncoder();
      const secret = AUTH.getSecret();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const signature = b64urlDecodeToBytes(signatureB64);
      const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(signatureInput));

      if (!valid) return null;

      const payload = JSON.parse(b64urlDecodeToStr(payloadB64));
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

  isSecretConfigured() {
    return Boolean(AUTH.env && AUTH.env.JWT_SECRET);
  },

  invalidatedTokens: new Set(),

  isTokenInvalidated(token) {
    return AUTH.invalidatedTokens.has(token);
  },

  invalidateToken(token) {
    AUTH.invalidatedTokens.add(token);
  },

  setEnv(env) {
    AUTH.env = env;
  },

  getSecret() {
    const secret = AUTH.env?.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no configurado. Ejecutá: npx wrangler secret put JWT_SECRET');
    }
    return secret;
  },
};

AUTH.env = null;

export { validateTableName };
export default AUTH;
