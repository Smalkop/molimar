import AUTH from '../services/auth.js';

export async function requireAdmin(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const tokenMatch = cookie.match(/token=([^;]+)/);
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
