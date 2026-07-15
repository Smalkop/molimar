import { htmlResponse, jsonResponse, sanitizeString } from '../../utils/html.js';
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
        <button onclick="openUserModal()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">+ Nuevo Usuario</button>
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
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">${u.name}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${u.email}</td>
                  <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${u.role}</span></td>
                  <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${u.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td class="px-6 py-4">
                    <button onclick="editUser(${u.id}, '${u.name}', '${u.email}', '${u.role}')" class="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-all" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
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
      function editUser(id, name, email, role) {
        editingUserId = id;
        document.getElementById('user-modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-id').value = id;
        document.getElementById('user-name').value = name;
        document.getElementById('user-email').value = email;
        document.getElementById('user-role').value = role;
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
        if (res.ok) location.reload(); else { const err = await res.json(); alert(err.error); }
      });
    </script>
  `;

  return htmlResponse(await adminLayout(content, user));
}

export async function handleAdminUsersApi(request, env, id) {
  DB.setEnv(env);
  AUTH.setEnv(env);

  if (request.method === 'POST' && !id) {
    const data = await request.json();
    if (!data.name || !data.email || !data.password) return jsonResponse({ error: 'Nombre, email y contraseña requeridos' }, 400);
    const existing = await DB.get('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existing) return jsonResponse({ error: 'Email ya registrado' }, 400);

    const hash = await AUTH.hashPassword(data.password);
    await DB.insert('users', { name: sanitizeString(data.name), email: sanitizeString(data.email), password: hash, role: data.role || 'editor' });
    return jsonResponse({ success: true });
  }

  if (request.method === 'PUT' && id) {
    const data = await request.json();
    const updates = {};
    if (data.name) updates.name = sanitizeString(data.name);
    if (data.email) updates.email = sanitizeString(data.email);
    if (data.password) updates.password = await AUTH.hashPassword(data.password);
    if (data.role) updates.role = data.role;
    await DB.update('users', updates, 'id', parseInt(id));
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

async function adminLayout(content, user) {
  return `<!DOCTYPE html>
<html lang="es"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usuarios | Admin Molipar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{primary:{50:'#fdf6ef',100:'#f9e8d8',200:'#f2cfb0',300:'#e9ae7e',400:'#df8a4d',500:'#d4702a',600:'#c55c1f',700:'#a4471c',800:'#833a1d',900:'#6a311a',950:'#3a170c'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <style>.sidebar-link{transition:all .2s ease}.sidebar-link:hover{background:#fdf6ef;color:#c55c1f}.form-input{transition:border-color .2s ease,box-shadow .2s ease}.form-input:focus{border-color:#c55c1f;box-shadow:0 0 0 3px rgba(197,92,31,.1)}</style>
</head><body class="font-sans bg-gray-50 min-h-screen">
<div class="flex h-screen overflow-hidden">
  <aside class="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
    <div class="p-6 border-b border-gray-100"><div class="flex items-center space-x-3"><img src="/images/logo.png" alt="Molipar" class="h-10 w-auto"><div><p class="font-bold text-gray-900 text-sm">Molipar Admin</p><p class="text-xs text-gray-500">${user.role}</p></div></div></div>
    <nav class="flex-1 py-4 space-y-1 px-3">
      ${[['/admin','Dashboard','M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],['/admin/productos','Productos','M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'],['/admin/usuarios','Usuarios','M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'],['/admin/configuracion','Configuración','M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'],['/admin/mensajes','Mensajes','M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z']].map(([href,label,path])=>`
        <a href="${href}" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${href==='/admin/usuarios'?'text-primary-700 bg-primary-50 border-r-2 border-primary-600':'text-gray-700'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"/></svg>
          <span>${label}</span>
        </a>`).join('')}
    </nav>
    <div class="p-4 border-t border-gray-100"><a href="/admin/logout" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg><span>Cerrar Sesión</span></a></div>
  </aside>
  <div class="flex-1 flex flex-col overflow-hidden">
    <header class="bg-white border-b border-gray-200 px-6 py-4 lg:hidden"><div class="flex items-center justify-between"><span class="font-bold text-gray-900">Usuarios</span></div></header>
    <main class="flex-1 overflow-y-auto p-6">${content}</main>
  </div>
</div></body></html>`;
}
