import { htmlResponse, jsonResponse } from '../../utils/html.js';
import AUTH from '../../services/auth.js';
import DB from '../../services/database.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getLoginKey(ip, email) {
  return `login:${ip}:${email}`;
}

async function checkRateLimit(ip, email) {
  try {
    const row = await DB.get(
      "SELECT setting_value FROM site_settings WHERE setting_key = ?",
      [getLoginKey(ip, email)]
    );
    if (!row) return true;
    const data = JSON.parse(row.setting_value);
    const elapsed = (Date.now() - data.first_attempt) / 1000 / 60;
    if (elapsed < LOCKOUT_MINUTES && data.attempts >= MAX_LOGIN_ATTEMPTS) {
      return false;
    }
    if (elapsed >= LOCKOUT_MINUTES) {
      await DB.run("DELETE FROM site_settings WHERE setting_key = ?", [getLoginKey(ip, email)]);
      return true;
    }
    return true;
  } catch {
    return true;
  }
}

async function recordAttempt(ip, email) {
  try {
    const key = getLoginKey(ip, email);
    const row = await DB.get("SELECT setting_value FROM site_settings WHERE setting_key = ?", [key]);
    if (row) {
      const data = JSON.parse(row.setting_value);
      data.attempts += 1;
      await DB.run("UPDATE site_settings SET setting_value = ?, updated_at = datetime('now') WHERE setting_key = ?", [JSON.stringify(data), key]);
    } else {
      const data = { attempts: 1, first_attempt: Date.now() };
      const stmt = DB.env.DB.prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group) VALUES (?, ?, 'security')");
      await stmt.bind(key, JSON.stringify(data)).run();
    }
  } catch {}
}

async function clearAttempts(ip, email) {
  try {
    await DB.run("DELETE FROM site_settings WHERE setting_key = ?", [getLoginKey(ip, email)]);
  } catch {}
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
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{primary:{50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#4f46e5',600:'#0000ba',700:'#00009a',800:'#00007a',900:'#00005a',950:'#00003a'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
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

  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const allowed = await checkRateLimit(ip, data.email);
  if (!allowed) {
    return jsonResponse({ error: `Demasiados intentos. Esperá ${LOCKOUT_MINUTES} minutos.` }, 429);
  }

  const result = await AUTH.authenticate(data.email, data.password);

  if (!result) {
    await recordAttempt(ip, data.email);
    return jsonResponse({ error: 'Credenciales inválidas' }, 401);
  }

  await clearAttempts(ip, data.email);

  const headers = new Headers({
    'Set-Cookie': `token=${result.token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    'Content-Type': 'application/json',
  });

  return new Response(JSON.stringify({ success: true, user: result.user }), {
    status: 200,
    headers,
  });
}

export async function handleLogout(request) {
  const cookie = request.headers.get('Cookie') || '';
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (tokenMatch) {
    AUTH.invalidateToken(tokenMatch[1]);
  }

  const headers = new Headers({
    'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
    'Location': '/admin/login',
  });

  return new Response(null, { status: 302, headers });
}
