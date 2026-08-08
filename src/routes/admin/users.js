import { htmlResponse, jsonResponse, sanitizeString, escapeHtml } from '../../utils/html.js';
import { adminLayout } from '../../components/adminLayout.js';
import DB from '../../services/database.js';
import AUTH from '../../services/auth.js';

export async function handleAdminUsers(env, user) {
  DB.setEnv(env);

  if (user.role !== 'admin') {
    return htmlResponse('<div class="p-6 text-center"><h1 class="text-2xl font-bold text-gray-900">Acceso denegado</h1><p class="text-gray-500 mt-2">Solo administradores pueden gestionar usuarios.</p></div>', 403);
  }

  const users = await DB.query('SELECT id, name, email, role, active, created_at FROM users ORDER BY created_at DESC');

  const content = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p class="text-gray-500 text-sm mt-1">${users.length} usuario(s)</p>
        </div>
        ${users.length >= 2 ? '<span class="text-sm text-gray-400">Límite de 2 usuarios alcanzado</span>' : '<button onclick="openUserModal()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">+ Nuevo Usuario</button>'}
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${users.map(u => `
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">${escapeHtml(u.name || '')}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(u.email || '')}</td>
                  <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${escapeHtml(u.role || '')}</span></td>
                  <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${u.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td class="px-6 py-4 flex items-center space-x-1">
                    <button onclick="editUser(this)" data-id="${u.id}" data-name="${escapeHtml(u.name || '')}" data-email="${escapeHtml(u.email || '')}" data-role="${escapeHtml(u.role || '')}" class="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-all" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="deleteUser(${u.id})" class="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-all" title="Eliminar usuario">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="user-modal" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/50" onclick="closeUserModal()"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900" id="user-modal-title">Nuevo Usuario</h2>
            <button onclick="closeUserModal()" class="p-2 hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <form id="user-form" class="p-6 space-y-4">
            <input type="hidden" id="user-id">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" id="user-name" required class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="user-email" required class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña <span class="text-gray-400 font-normal">(dejar vacío para mantener)</span></label>
              <input type="password" id="user-password" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select id="user-role" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div class="flex items-center justify-end space-x-4 pt-4">
              <button type="button" onclick="closeUserModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script>
      let editingUserId = null;
      function openUserModal() {
        editingUserId = null;
        document.getElementById('user-form').reset();
        document.getElementById('user-modal-title').textContent = 'Nuevo Usuario';
        document.getElementById('user-modal').classList.remove('hidden');
      }
      function closeUserModal() { document.getElementById('user-modal').classList.add('hidden'); }
      function editUser(el) {
        const d = el.dataset;
        editingUserId = d.id;
        document.getElementById('user-modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-id').value = d.id;
        document.getElementById('user-name').value = d.name;
        document.getElementById('user-email').value = d.email;
        document.getElementById('user-role').value = d.role;
        document.getElementById('user-password').value = '';
        document.getElementById('user-modal').classList.remove('hidden');
      }
      document.getElementById('user-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = {
          id: document.getElementById('user-id').value || null,
          name: document.getElementById('user-name').value,
          email: document.getElementById('user-email').value,
          password: document.getElementById('user-password').value,
          role: document.getElementById('user-role').value,
        };
        const method = editingUserId ? 'PUT' : 'POST';
        const res = await fetch('/admin/api/usuarios' + (editingUserId ? '/' + editingUserId : ''), {
          method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        if (res.status === 401) { window.location.href = '/admin/login'; return; }
        if (res.ok) location.reload(); else { const err = await res.json(); alert(err.error); }
      });
      async function deleteUser(id) {
        if (!confirm('¿Eliminar este usuario?')) return;
        const res = await fetch('/admin/api/usuarios/' + id, { method: 'DELETE' });
        if (res.status === 401) { window.location.href = '/admin/login'; return; }
        const data = await res.json();
        if (data.success) location.reload(); else alert(data.error);
      }
    </script>
  `;

  return htmlResponse(adminLayout({ title: 'Usuarios', active: '/admin/usuarios', content, user }));
}

export async function handleAdminUsersApi(request, env, id, user) {
  DB.setEnv(env);
  AUTH.setEnv(env);

  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Solo administradores pueden gestionar usuarios' }, 403);
  }

  if (request.method === 'POST' && !id) {
    const data = await request.json();
    if (!data.name || !data.email || !data.password) return jsonResponse({ error: 'Nombre, email y contraseña requeridos' }, 400);
    const count = await DB.get('SELECT COUNT(*) as c FROM users');
    if (count.c >= 2) return jsonResponse({ error: 'Límite alcanzado: máximo 2 usuarios permitidos' }, 400);
    const existing = await DB.get('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) return jsonResponse({ error: 'Email ya registrado' }, 400);

    const role = (data.role === 'admin' || data.role === 'editor') ? data.role : 'editor';
    const hash = await AUTH.hashPassword(data.password);
    await DB.insert('users', { name: sanitizeString(data.name), email: sanitizeString(data.email), password: hash, role });
    return jsonResponse({ success: true });
  }

  if (request.method === 'PUT' && id) {
    const numId = parseInt(id);
    if (!Number.isFinite(numId)) return jsonResponse({ error: 'ID inválido' }, 400);
    const data = await request.json();
    const updates = {};
    if (data.name) updates.name = sanitizeString(data.name);
    if (data.email) updates.email = sanitizeString(data.email);
    if (data.password) updates.password = await AUTH.hashPassword(data.password);
    if (data.role === 'admin' || data.role === 'editor') updates.role = data.role;

    if (data.password) {
      updates.force_password_change = 0;
    }

    if (user && user.id === numId && data.password) {
      updates.force_password_change = 0;
      try {
        await DB.run("INSERT INTO site_settings (setting_key, setting_value, setting_group) VALUES ('default_password_changed', 'true', 'security') ON CONFLICT(setting_key) DO UPDATE SET setting_value = 'true', updated_at = datetime('now')");
      } catch {
        await DB.run("UPDATE site_settings SET setting_value = 'true', updated_at = datetime('now') WHERE setting_key = 'default_password_changed'");
      }
    }

    await DB.update('users', updates, 'id', numId, { withTimestamp: true });

    return jsonResponse({ success: true });
  }

  if (request.method === 'DELETE' && id) {
    const numId = parseInt(id);
    if (!Number.isFinite(numId)) return jsonResponse({ error: 'ID inválido' }, 400);
    if (user && user.id === numId) return jsonResponse({ error: 'No podés eliminar tu propia cuenta' }, 400);
    if (user && user.role === 'admin') {
      const adminCount = await DB.get("SELECT COUNT(*) as c FROM users WHERE role = 'admin' AND active = 1");
      const target = await DB.get('SELECT role FROM users WHERE id = ?', [numId]);
      if (target && target.role === 'admin' && adminCount.c <= 1) {
        return jsonResponse({ error: 'No se puede eliminar al último administrador' }, 400);
      }
    }
    await DB.run('DELETE FROM users WHERE id = ?', [numId]);
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

