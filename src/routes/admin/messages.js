import { htmlResponse, jsonResponse, escapeHtml, formatDate } from '../../utils/html.js';
import { adminLayout } from '../../components/adminLayout.js';
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
                  <td class="px-6 py-4 flex items-center space-x-1">
                    <button onclick="viewMessage(${m.id})" class="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-all" title="Ver mensaje">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <button onclick="deleteMessage(${m.id})" class="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-all" title="Eliminar mensaje">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
            <div><p class="text-gray-500 text-xs">Fecha</p><p class="font-medium text-gray-900">\${new Date(m.created_at).toLocaleString('es-AR')}</p></div>
          </div>
          <div><p class="text-gray-500 text-xs mb-2">Mensaje</p><p class="text-gray-900 leading-relaxed">\${m.message}</p></div>
        \`;
        document.getElementById('message-modal').classList.remove('hidden');

        if (!m.is_read) {
          await fetch('/admin/api/mensajes/' + id + '/read', { method: 'POST' });
        }
      }
      function closeMessageModal() { document.getElementById('message-modal').classList.add('hidden'); }
      async function deleteMessage(id) {
        if (!confirm('¿Eliminar este mensaje?')) return;
        const res = await fetch('/admin/api/mensajes/' + id + '/delete', { method: 'POST' });
        if (res.status === 401) { window.location.href = '/admin/login'; return; }
        const data = await res.json();
        if (data.success) location.reload();
      }
    </script>
  `;

  return htmlResponse(adminLayout({ title: 'Mensajes', active: '/admin/mensajes', content, user }));
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

export async function handleAdminMessagesDelete(env, id) {
  DB.setEnv(env);
  await DB.run('DELETE FROM contact_messages WHERE id = ?', [parseInt(id)]);
  return jsonResponse({ success: true });
}
