import AUTH from '../services/auth.js';

export async function requireAdmin(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const tokenMatch = cookie.match(/__Host-token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    return { authenticated: false, redirect: '/admin/login' };
  }

  AUTH.setEnv(env);
  const payload = await AUTH.verifyToken(token);
  if (!payload) {
    return { authenticated: false, redirect: '/admin/login' };
  }

  return { authenticated: true, user: payload };
}

// CSRF defense: validate Origin/Referer matches the site origin.
// Returns true if the request is safe; false if it should be rejected.
// Se acepta tanto el origen configurado (SITE_URL) como el origen real desde
// el que se sirve la request (request.url), para que funcione en local y en
// cualquier dominio (dominio propio, preview, www, etc.) sin debilitar la
// protección: el navegador no permite forjar el Origin de una request cross-site.
export function checkSameOrigin(request, env) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;

  const allowed = new Set();

  try {
    const reqUrl = new URL(request.url);
    allowed.add(`${reqUrl.protocol}//${reqUrl.host}`.replace(/\/$/, ''));
  } catch {}

  if (env && env.SITE_URL) {
    allowed.add(env.SITE_URL.replace(/\/$/, ''));
  }

  if (allowed.size === 0) return true;

  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';

  if (origin) return allowed.has(origin.replace(/\/$/, ''));
  if (referer) {
    try {
      const u = new URL(referer);
      return allowed.has(`${u.protocol}//${u.host}`);
    } catch {
      return false;
    }
  }
  return false;
}
