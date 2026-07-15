import { htmlResponse, jsonResponse, sanitizeString } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleAdminSettings(env, user) {
  DB.setEnv(env);

  if (user.role !== 'admin') {
    return htmlResponse('<div class="p-6 text-center"><h1 class="text-2xl font-bold">Acceso denegado</h1></div>', 403);
  }

  const rows = await DB.query('SELECT * FROM site_settings ORDER BY setting_group, setting_key');
  const settings = {};
  for (const r of rows) {
    if (!settings[r.setting_group]) settings[r.setting_group] = {};
    settings[r.setting_group][r.setting_key] = r.setting_value;
  }

  const content = `
    <div class="space-y-6">
      <div><h1 class="text-2xl font-bold text-gray-900">Configuración</h1><p class="text-gray-500 text-sm mt-1">Administrá los datos del sitio web</p></div>

      <form id="settings-form" class="space-y-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Datos de la Empresa</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            ${[
              ['company_name', 'Nombre de la Empresa', 'text', settings.company?.company_name],
              ['company_slogan', 'Slogan', 'text', settings.company?.company_slogan],
              ['company_description', 'Descripción', 'textarea', settings.company?.company_description],
            ].map(([key, label, type, val]) => `
              <div class="${type === 'textarea' ? 'sm:col-span-2' : ''}">
                <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                ${type === 'textarea'
                  ? `<textarea name="${key}" rows="3" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">${val || ''}</textarea>`
                  : `<input type="text" name="${key}" value="${val || ''}" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">`}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Información Institucional</h2>
          <div class="space-y-4">
            ${[
              ['company_history', 'Historia', settings.company?.company_history],
              ['company_mission', 'Misión', settings.company?.company_mission],
              ['company_vision', 'Visión', settings.company?.company_vision],
            ].map(([key, label, val]) => `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                <textarea name="${key}" rows="4" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">${val || ''}</textarea>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Contacto</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            ${[
              ['address', 'Dirección'], ['phone', 'Teléfono'], ['whatsapp', 'WhatsApp (solo números)'],
              ['email', 'Correo Electrónico'], ['schedule', 'Horarios'],
            ].map(([key, label]) => `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                <input type="text" name="${key}" value="${settings.contact?.[key] || ''}" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Redes Sociales</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            ${['facebook', 'instagram', 'linkedin', 'youtube'].map(key => `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1 capitalize">${key}</label>
                <input type="url" name="${key}" value="${settings.social?.[key] || ''}" placeholder="https://${key}.com/..." class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Hero / Página Principal</h2>
          <div class="grid grid-cols-1 gap-6">
            ${[
              ['hero_title', 'Título del Hero'],
              ['hero_subtitle', 'Subtítulo del Hero'],
              ['hero_cta_text', 'Texto del Botón CTA'],
            ].map(([key, label]) => `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                <input type="text" name="${key}" value="${settings.home?.[key] || ''}" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
              </div>
            `).join('')}
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" class="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all">Guardar Configuración</button>
        </div>
      </form>
    </div>

    <script>
      document.getElementById('settings-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Guardando...';

        const formData = new FormData(this);
        const data = {};
        for (const [key, val] of formData) data[key] = val;

        const res = await fetch('/admin/api/configuracion', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          btn.textContent = '✓ Guardado';
          setTimeout(() => { btn.disabled = false; btn.textContent = 'Guardar Configuración'; }, 2000);
        } else {
          alert('Error al guardar');
          btn.disabled = false; btn.textContent = 'Guardar Configuración';
        }
      });
    </script>
  `;

  return htmlResponse(await adminLayout(content, user));
}

export async function handleAdminSettingsApi(request, env) {
  DB.setEnv(env);

  if (request.method === 'PUT') {
    const data = await request.json();
    for (const [key, value] of Object.entries(data)) {
      const existing = await DB.get('SELECT id FROM site_settings WHERE setting_key = ?', [key]);
      if (existing) {
        await DB.run('UPDATE site_settings SET setting_value = ?, updated_at = datetime(\'now\') WHERE setting_key = ?', [sanitizeString(String(value)), key]);
      } else {
        await DB.insert('site_settings', { setting_key: key, setting_value: sanitizeString(String(value)), setting_group: 'general' });
      }
    }
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

async function adminLayout(content, user) {
  return `<!DOCTYPE html>
<html lang="es"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configuración | Admin Molipar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{primary:{50:'#fdf6ef',100:'#f9e8d8',200:'#f2cfb0',300:'#e9ae7e',400:'#df8a4d',500:'#d4702a',600:'#c55c1f',700:'#a4471c',800:'#833a1d',900:'#6a311a',950:'#3a170c'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <style>.sidebar-link{transition:all .2s ease}.sidebar-link:hover{background:#fdf6ef;color:#c55c1f}.form-input{transition:border-color .2s ease,box-shadow .2s ease}.form-input:focus{border-color:#c55c1f;box-shadow:0 0 0 3px rgba(197,92,31,.1)}</style>
</head><body class="font-sans bg-gray-50 min-h-screen">
<div class="flex h-screen overflow-hidden">
  <aside class="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
    <div class="p-6 border-b border-gray-100"><div class="flex items-center space-x-3"><img src="/static/images/logo.png" alt="Molipar" class="h-10 w-auto"><div><p class="font-bold text-gray-900 text-sm">Molipar Admin</p><p class="text-xs text-gray-500">${user.role}</p></div></div></div>
    <nav class="flex-1 py-4 space-y-1 px-3">
      ${[['/admin','Dashboard','M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],['/admin/productos','Productos','M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'],['/admin/usuarios','Usuarios','M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'],['/admin/configuracion','Configuración','M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'],['/admin/mensajes','Mensajes','M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z']].map(([href,label,path])=>`
        <a href="${href}" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${href==='/admin/configuracion'?'text-primary-700 bg-primary-50 border-r-2 border-primary-600':'text-gray-700'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"/></svg>
          <span>${label}</span>
        </a>`).join('')}
    </nav>
    <div class="p-4 border-t border-gray-100"><a href="/admin/logout" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg><span>Cerrar Sesión</span></a></div>
  </aside>
  <div class="flex-1 flex flex-col overflow-hidden">
    <main class="flex-1 overflow-y-auto p-6">${content}</main>
  </div>
</div></body></html>`;
}
