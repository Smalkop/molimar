import { htmlResponse, jsonResponse, escapeHtml, formatDate } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleAdminMessages(env, user) {
  DB.setEnv(env);
  const messages = await DB.query('SELECT * FROM contact_messages ORDER BY created_at DESC');

  const content = `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mensajes de Contacto</h1>
        <p class="text-gray-500 text-sm mt-1">${messages.length} mensaje(s)</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Asunto</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${messages.map(m => `
                <tr class="hover:bg-gray-50 transition-colors ${!m.is_read ? 'bg-blue-50/50 font-medium' : ''}">
                  <td class="px-6 py-4 text-sm text-gray-900">${escapeHtml(m.name)}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(m.email)}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(m.subject || '—')}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${new Date(m.created_at).toLocaleDateString('es-AR')}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${m.is_read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}">${m.is_read ? 'Leído' : 'Nuevo'}</span>
                  </td>
                  <td class="px-6 py-4">
                    <button onclick="viewMessage(${m.id})" class="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-all" title="Ver mensaje">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
              ${messages.length === 0 ? '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500 text-sm">No hay mensajes</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div id="message-modal" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/50" onclick="closeMessageModal()"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Mensaje</h2>
            <button onclick="closeMessageModal()" class="p-2 hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div id="message-content" class="p-6 space-y-4 text-sm"></div>
        </div>
      </div>
    </div>

    <script>
      async function viewMessage(id) {
        const res = await fetch('/admin/api/mensajes/' + id);
        if (res.status === 401) { window.location.href = '/admin/login'; return; }
        const m = await res.json();
        if (!res.ok) return;
        document.getElementById('message-content').innerHTML = \`
          <div class="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
            <div><p class="text-gray-500 text-xs">Nombre</p><p class="font-medium text-gray-900">\${m.name}</p></div>
            <div><p class="text-gray-500 text-xs">Email</p><p class="font-medium text-gray-900">\${m.email}</p></div>
            \${m.phone ? '<div><p class="text-gray-500 text-xs">Teléfono</p><p class="font-medium text-gray-900">' + m.phone + '</p></div>' : ''}
            \${m.subject ? '<div><p class="text-gray-500 text-xs">Asunto</p><p class="font-medium text-gray-900">' + m.subject + '</p></div>' : ''}
            <div><p class="text-gray-500 text-xs">Fecha</p><p class="font-medium text-gray-900">' + new Date(m.created_at).toLocaleString('es-AR') + '</p></div>
          </div>
          <div><p class="text-gray-500 text-xs mb-2">Mensaje</p><p class="text-gray-900 leading-relaxed">\${m.message}</p></div>
        \`;
        document.getElementById('message-modal').classList.remove('hidden');

        if (!m.is_read) {
          await fetch('/admin/api/mensajes/' + id + '/read', { method: 'POST' });
        }
      }
      function closeMessageModal() { document.getElementById('message-modal').classList.add('hidden'); }
    </script>
  `;

  return htmlResponse(await adminLayout(content, user));
}

export async function handleAdminMessagesApi(env, id) {
  DB.setEnv(env);

  if (id) {
    const message = await DB.get('SELECT * FROM contact_messages WHERE id = ?', [parseInt(id)]);
    if (!message) return jsonResponse({ error: 'No encontrado' }, 404);
    return jsonResponse(message);
  }

  const messages = await DB.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
  return jsonResponse(messages);
}

export async function handleAdminMessagesRead(env, id) {
  DB.setEnv(env);
  await DB.run('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [parseInt(id)]);
  return jsonResponse({ success: true });
}

async function adminLayout(content, user) {
  return `<!DOCTYPE html>
<html lang="es"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mensajes | Admin Molipar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{primary:{50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#4f46e5',600:'#0000ba',700:'#00009a',800:'#00007a',900:'#00005a',950:'#00003a'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <style>.sidebar-link{transition:all .2s ease}.sidebar-link:hover{background:#eef2ff;color:#0000ba}</style>
</head><body class="font-sans bg-gray-50 min-h-screen">
<div class="flex h-screen overflow-hidden">
  <aside class="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
    <div class="p-6 border-b border-gray-100"><div class="flex items-center"><img src="/images/logo.png" alt="Molipar" class="h-10 w-auto"></div></div>
    <nav class="flex-1 py-4 space-y-1 px-3">
      ${[['/admin','Dashboard','M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],['/admin/productos','Productos','M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'],['/admin/venta-directa','Venta Directa','M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'],['/admin/usuarios','Usuarios','M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'],['/admin/configuracion','Configuración','M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'],['/admin/mensajes','Mensajes','M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z']].map(([href,label,path])=>`
        <a href="${href}" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${href==='/admin/mensajes'?'text-primary-700 bg-primary-50 border-r-2 border-primary-600':'text-gray-700'}">
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
