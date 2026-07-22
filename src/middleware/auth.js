import AUTH from '../services/auth.js';
import { jsonResponse } from '../utils/html.js';

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

// P0-3: las APIs de admin que mutan configuración/usuarios sólo deben poder
// ejecutarse con role='admin'. requireAdmin solo valida autenticación.
// Uso: desde el enrutador, si requireAdminRole devuelve non-null, retórnalo.
export function requireAdminRole(auth) {
  if (!auth?.authenticated || auth.user?.role !== 'admin') {
    return jsonResponse(
      { error: 'Acceso denegado: se requiere rol administrador' },
      403
    );
  }
  return null;
}

