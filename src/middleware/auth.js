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
export function checkSameOrigin(request, env) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;

  const siteUrl = (env && env.SITE_URL) || '';
  if (!siteUrl) return true;

  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const allowed = siteUrl.replace(/\/$/, '');

  if (origin) return origin.replace(/\/$/, '') === allowed;
  if (referer) {
    try {
      const u = new URL(referer);
      return `${u.protocol}//${u.host}` === allowed;
    } catch {
      return false;
    }
  }
  return false;
}
