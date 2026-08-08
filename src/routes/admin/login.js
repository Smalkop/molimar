import { htmlResponse, jsonResponse } from '../../utils/html.js';
import AUTH from '../../services/auth.js';
import DB from '../../services/database.js';

const MAX_LOGIN_ATTEMPTS = 5;
const MAX_IP_ATTEMPTS = 20;
const LOCKOUT_MS = 15 * 60 * 1000;

function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

async function checkRateLimit(ip, email) {
  try {
    const now = Date.now();
    const row = await DB.get(
      'SELECT attempts, first_attempt FROM login_attempts WHERE ip = ? AND email = ?',
      [ip, email]
    );
    if (!row) return true;
    const elapsed = now - row.first_attempt;
    if (elapsed < LOCKOUT_MS && row.attempts >= MAX_LOGIN_ATTEMPTS) {
      return false;
    }
    if (elapsed >= LOCKOUT_MS) {
      await DB.run('DELETE FROM login_attempts WHERE ip = ? AND email = ?', [ip, email]);
      return true;
    }
    return true;
  } catch (e) {
    console.error('checkRateLimit:', e);
    return true;
  }
}

async function checkIPRateLimit(ip) {
  try {
    const now = Date.now();
    const rows = await DB.query(
      'SELECT attempts, first_attempt FROM login_attempts WHERE ip = ?',
      [ip]
    );
    const totalAttempts = rows.reduce((a, r) => a + (r.attempts || 0), 0);
    const minFirst = rows.length ? Math.min(...rows.map(r => r.first_attempt)) : now;
    if (rows.length && (now - minFirst) >= LOCKOUT_MS) {
      await DB.run('DELETE FROM login_attempts WHERE ip = ?', [ip]);
      return true;
    }
    return totalAttempts < MAX_IP_ATTEMPTS;
  } catch (e) {
    console.error('checkIPRateLimit:', e);
    return true;
  }
}

async function recordAttempt(ip, email) {
  try {
    const now = Date.now();
    const row = await DB.get(
      'SELECT attempts, first_attempt FROM login_attempts WHERE ip = ? AND email = ?',
      [ip, email]
    );
    if (row) {
      await DB.run(
        'UPDATE login_attempts SET attempts = attempts + 1 WHERE ip = ? AND email = ?',
        [ip, email]
      );
    } else {
      await DB.run(
        'INSERT INTO login_attempts (ip, email, attempts, first_attempt) VALUES (?, ?, 1, ?)',
        [ip, email, now]
      );
    }
  } catch (e) {
    console.error('recordAttempt:', e);
  }
}

async function clearAttempts(ip, email) {
  try {
    await DB.run('DELETE FROM login_attempts WHERE ip = ? AND email = ?', [ip, email]);
  } catch (e) {
    console.error('clearAttempts:', e);
  }
}

export async function handleLoginPage(env) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciar Sesión | Molipar Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/output.css">
  <style>
    .form-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .form-input:focus { border-color: #0000ba; box-shadow: 0 0 0 3px rgba(0, 0, 186, 0.1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .login-card { animation: fadeIn 0.5s ease-out; }
  </style>
</head>
<body class="font-sans bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
  <div class="login-card w-full max-w-md">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <img src="/images/logo.png" alt="Molipar" class="h-16 mx-auto mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p class="text-gray-500 text-sm mt-2">Ingresá tus credenciales</p>
      </div>
      <form id="login-form" class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input type="email" id="email" name="email" required
                 class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                 placeholder="admin@molipar.com">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input type="password" id="password" name="password" required
                 class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                 placeholder="••••••••">
        </div>
        <button type="submit"
                class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
          Iniciar Sesión
        </button>
      </form>
      <div id="login-error" class="mt-4 text-center text-sm text-red-600 hidden"></div>
    </div>
  </div>
  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      const errorEl = document.getElementById('login-error');
      btn.disabled = true;
      btn.textContent = 'Ingresando...';
      errorEl.classList.add('hidden');

      const res = await fetch('/admin/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e.target.email.value, password: e.target.password.value }),
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        try {
          const data = await res.json();
          errorEl.textContent = data.error || 'Credenciales inválidas';
        } catch {
          errorEl.textContent = 'Error del servidor';
        }
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesión';
      }
    });
  </script>
</body>
</html>`;

  return htmlResponse(html);
}

export async function handleLoginApi(request, env) {
  let data;
  try { data = await request.json(); } catch { return jsonResponse({ error: 'Datos inválidos' }, 400); }

  if (!data.email || !data.password) {
    return jsonResponse({ error: 'Email y contraseña requeridos' }, 400);
  }

  DB.setEnv(env);
  AUTH.setEnv(env);

  const ip = getClientIP(request);

  try {
    const allowed = await checkRateLimit(ip, data.email);
    if (!allowed) {
      return jsonResponse({ error: `Demasiados intentos para este usuario. Esperá 15 minutos.` }, 429);
    }
    const ipAllowed = await checkIPRateLimit(ip);
    if (!ipAllowed) {
      return jsonResponse({ error: 'Demasiados intentos desde esta IP. Esperá 15 minutos.' }, 429);
    }

    const result = await AUTH.authenticate(data.email, data.password);

    if (!result) {
      await recordAttempt(ip, data.email);
      return jsonResponse({ error: 'Credenciales inválidas' }, 401);
    }

    await clearAttempts(ip, data.email);

    const headers = new Headers({
      'Set-Cookie': `__Host-token=${result.token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`,
      'Content-Type': 'application/json',
    });

    return new Response(JSON.stringify({ success: true, user: result.user }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('Login error:', err);
    const isSecretError = err && String(err.message || '').includes('JWT_SECRET');
    return jsonResponse(
      { error: isSecretError ? 'Servidor sin configurar correctamente. Contactá al administrador.' : 'Error interno del servidor' },
      500
    );
  }
}

export async function handleLogout(request) {
  const cookie = request.headers.get('Cookie') || '';
  const tokenMatch = cookie.match(/__Host-token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  if (token) {
    await AUTH.invalidateToken(token);
  }

  const headers = new Headers({
    'Set-Cookie': '__Host-token=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0',
    'Location': '/admin/login',
  });

  return new Response(null, { status: 302, headers });
}
