import { htmlResponse, jsonResponse, escapeHtml, normalizeWhatsApp } from '../../utils/html.js';
import { adminLayout } from '../../components/adminLayout.js';
import DB from '../../services/database.js';

export async function handleAdminSettings(env, user) {
  DB.setEnv(env);

  if (user.role !== 'admin') {
    return htmlResponse('<div class="p-6 text-center"><h1 class="text-2xl font-bold">Acceso denegado</h1></div>', 403);
  }

  const rows = await DB.query('SELECT * FROM site_settings ORDER BY setting_group, setting_key');
  const settings = {};
  const s = {};
  for (const r of rows) {
    if (!settings[r.setting_group]) settings[r.setting_group] = {};
    settings[r.setting_group][r.setting_key] = r.setting_value;
    s[r.setting_key] = r.setting_value;
  }

  const content = `
    <div class="space-y-6">
      <div><h1 class="text-2xl font-bold text-gray-900">Configuración</h1><p class="text-gray-500 text-sm mt-1">Administrá los datos del sitio web</p></div>

      <form id="settings-form" class="space-y-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Datos de la Empresa</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            ${[
              ['company_name', 'Nombre de la Empresa', 'text', s.company_name],
              ['company_slogan', 'Slogan', 'text', s.company_slogan],
              ['company_description', 'Descripción', 'textarea', s.company_description],
            ].map(([key, label, type, val]) => `
              <div class="${type === 'textarea' ? 'sm:col-span-2' : ''}">
                <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                ${type === 'textarea'
                  ? `<textarea name="${key}" rows="3" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">${escapeHtml(val || '')}</textarea>`
                  : `<input type="text" name="${key}" value="${escapeHtml(val || '')}" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">`}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Información Institucional</h2>
          <div class="space-y-4">
            ${[
              ['company_history', 'Historia', s.company_history],
              ['company_mission', 'Misión', s.company_mission],
              ['company_vision', 'Visión', s.company_vision],
            ].map(([key, label, val]) => `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                <textarea name="${key}" rows="4" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">${escapeHtml(val || '')}</textarea>
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
                <input type="text" name="${key}" value="${escapeHtml(s[key] || '')}" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
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
                <input type="url" name="${key}" value="${escapeHtml(s[key] || '')}" placeholder="https://${key}.com/..." class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
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
              ['experience_years', 'Años de Experiencia (número)'],
              ['experience_label', 'Etiqueta de Experiencia'],
            ].map(([key, label]) => `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
                <input type="text" name="${key}" value="${escapeHtml(s[key] || '')}" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
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

        if (res.status === 401) { window.location.href = '/admin/login'; return; }
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

  return htmlResponse(adminLayout({ title: 'Configuración', active: '/admin/configuracion', content, user }));
}

export async function handleAdminSettingsApi(request, env, user) {
  DB.setEnv(env);

  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Solo administradores pueden modificar la configuración' }, 403);
  }

  if (request.method === 'PUT') {
    const data = await request.json();
    const groupForKey = (key) => {
      if (key.startsWith('hero_') || key.startsWith('experience_')) return 'home';
      if (key.startsWith('company_')) return 'company';
      if (['facebook', 'instagram', 'linkedin', 'youtube'].includes(key)) return 'social';
      if (['address', 'phone', 'whatsapp', 'email', 'schedule'].includes(key)) return 'contact';
      return 'general';
    };
    for (const [key, value] of Object.entries(data)) {
      // Se guarda el valor crudo (solo trim); el escape se aplica en el output
      // (escapeHtml/escAttr). Codificar entidades aca rompe URLs (ej. redes sociales).
      let val = String(value).trim();
      if (key === 'whatsapp') {
        val = normalizeWhatsApp(value);
      } else if (['facebook', 'instagram', 'linkedin', 'youtube'].includes(key) && val && !/^https?:\/\//i.test(val)) {
        return jsonResponse({ error: `La URL de ${key} debe comenzar con http:// o https://` }, 400);
      }
      const existing = await DB.get('SELECT id, setting_group FROM site_settings WHERE setting_key = ?', [key]);
      if (existing) {
        await DB.run('UPDATE site_settings SET setting_value = ?, updated_at = datetime(\'now\') WHERE setting_key = ?', [val, key]);
      } else {
        await DB.insert('site_settings', { setting_key: key, setting_value: val, setting_group: groupForKey(key) });
      }
    }
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

