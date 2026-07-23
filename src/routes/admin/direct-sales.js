import { htmlResponse, jsonResponse, sanitizeString } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleAdminDirectSales(env, user) {
  DB.setEnv(env);

  const regions = await DB.query('SELECT * FROM sales_regions ORDER BY sort_order');

  const content = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Venta Directa</h1>
          <p class="text-gray-500 text-sm mt-1">${regions.length} región(es)</p>
        </div>
        <button onclick="openRegionModal()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">+ Nueva Región</button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Orden</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Localidades</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${regions.map(r => {
                const locs = JSON.parse(r.localities || '[]');
                return `
                <tr class="hover:bg-gray-50 transition-colors" data-id="${r.id}">
                  <td class="px-6 py-4 text-sm text-gray-500">${r.sort_order}</td>
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">${r.title}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">${r.phone}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${locs.length} localidad(es)</td>
                  <td class="px-6 py-4">
                    <button onclick="editRegion(${r.id})" class="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-all" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onclick="deleteRegion(${r.id}, '${r.title.replace(/'/g, "\\'")}')" class="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-all" title="Eliminar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </td>
                </tr>
              `}).join('')}
              ${regions.length === 0 ? '<tr><td colspan="5" class="px-6 py-12 text-center text-sm text-gray-400">No hay regiones registradas</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="region-modal" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/50" onclick="closeRegionModal()"></div>
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900" id="region-modal-title">Nueva Región</h2>
            <button onclick="closeRegionModal()" class="p-2 hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <form id="region-form" class="p-6 space-y-4">
            <input type="hidden" id="region-id">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input type="text" id="region-title" required class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm" placeholder="Ej: Gran Asunción y Central">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
              <input type="text" id="region-phone" required class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm" placeholder="Ej: +595 981 044447">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Localidades <span class="text-gray-400 font-normal">(una por línea)</span></label>
              <textarea id="region-localities" rows="5" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm" placeholder="San Lorenzo, Ñemby, San Antonio&#10;Capiatá, Ypané, J. Augusto Saldívar&#10;Itauguá, Ypacaraí, Nueva Italia"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" id="region-order" min="0" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm" placeholder="1">
            </div>
            <div class="flex items-center justify-end space-x-4 pt-4">
              <button type="button" onclick="closeRegionModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script>
      let editingRegionId = null;
      function openRegionModal() {
        editingRegionId = null;
        document.getElementById('region-form').reset();
        document.getElementById('region-modal-title').textContent = 'Nueva Región';
        document.getElementById('region-modal').classList.remove('hidden');
      }
      function closeRegionModal() { document.getElementById('region-modal').classList.add('hidden'); }

      async function editRegion(id) {
        editingRegionId = id;
        try {
          const res = await fetch('/admin/api/venta-directa/' + id);
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          const data = await res.json();
          document.getElementById('region-modal-title').textContent = 'Editar Región';
          document.getElementById('region-id').value = data.id;
          document.getElementById('region-title').value = data.title;
          document.getElementById('region-phone').value = data.phone;
          const locs = JSON.parse(data.localities || '[]');
          document.getElementById('region-localities').value = locs.join('\\n');
          document.getElementById('region-order').value = data.sort_order;
          document.getElementById('region-modal').classList.remove('hidden');
        } catch (e) {
          alert('Error al cargar región');
        }
      }

      async function deleteRegion(id, title) {
        if (!confirm('¿Eliminar la región "' + title + '"? Esta acción no se puede deshacer.')) return;
        try {
          const res = await fetch('/admin/api/venta-directa/' + id, { method: 'DELETE' });
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          if (res.ok) location.reload();
          else alert('Error al eliminar');
        } catch { alert('Error de conexión'); }
      }

      document.getElementById('region-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const body = {
          title: document.getElementById('region-title').value,
          phone: document.getElementById('region-phone').value,
          localities: document.getElementById('region-localities').value.split('\\n').filter(Boolean),
          sort_order: parseInt(document.getElementById('region-order').value) || 0,
        };

        try {
          const method = editingRegionId ? 'PUT' : 'POST';
          const res = await fetch('/admin/api/venta-directa' + (editingRegionId ? '/' + editingRegionId : ''), {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          if (res.ok) { location.reload(); }
          else { const err = await res.json(); alert(err.error || 'Error al guardar'); }
        } catch { alert('Error de conexión'); }

        btn.disabled = false;
        btn.textContent = 'Guardar';
      });
    </script>
  `;

  return htmlResponse(await adminLayout(content, user));
}

export async function handleAdminDirectSalesApi(request, env, id) {
  DB.setEnv(env);

  if (request.method === 'GET' && id) {
    try {
      const region = await DB.get('SELECT * FROM sales_regions WHERE id = ?', [parseInt(id)]);
      if (!region) return jsonResponse({ error: 'Región no encontrada' }, 404);
      return jsonResponse(region);
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al obtener región' }, 500);
    }
  }

  if (request.method === 'POST' && !id) {
    try {
      const data = await request.json();
      if (!data.title || !data.phone) return jsonResponse({ error: 'Título y teléfono requeridos' }, 400);
      await DB.insert('sales_regions', {
        title: sanitizeString(data.title),
        phone: sanitizeString(data.phone),
        localities: JSON.stringify(data.localities || []),
        sort_order: parseInt(data.sort_order) || 0,
      });
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al crear' }, 500);
    }
  }

  if (request.method === 'PUT' && id) {
    try {
      const data = await request.json();
      const updates = {};
      if (data.title) updates.title = sanitizeString(data.title);
      if (data.phone) updates.phone = sanitizeString(data.phone);
      if (data.localities) updates.localities = JSON.stringify(data.localities);
      if (data.sort_order !== undefined) updates.sort_order = parseInt(data.sort_order) || 0;
      await DB.update('sales_regions', updates, 'id', parseInt(id));
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al actualizar' }, 500);
    }
  }

  if (request.method === 'DELETE' && id) {
    try {
      await DB.delete('sales_regions', 'id', parseInt(id));
      return jsonResponse({ success: true });
    } catch {
      return jsonResponse({ error: 'Error al eliminar' }, 500);
    }
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

async function adminLayout(content, user) {
  return `<!DOCTYPE html>
<html lang="es"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Venta Directa | Admin Molipar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{primary:{50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#4f46e5',600:'#0000ba',700:'#00009a',800:'#00007a',900:'#00005a',950:'#00003a'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <style>.sidebar-link{transition:all .2s ease}.sidebar-link:hover{background:#eef2ff;color:#0000ba}.form-input{transition:border-color .2s ease,box-shadow .2s ease}.form-input:focus{border-color:#0000ba;box-shadow:0 0 0 3px rgba(0,0,186,.1)}</style>
</head><body class="font-sans bg-gray-50 min-h-screen">
<div class="flex h-screen overflow-hidden">
  <aside class="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
    <div class="p-6 border-b border-gray-100"><div class="flex items-center"><img src="/images/logo.png" alt="Molipar" class="h-10 w-auto"></div></div>
    <nav class="flex-1 py-4 space-y-1 px-3">
      ${[['/admin','Dashboard','M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],['/admin/productos','Productos','M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'],['/admin/galeria','Galería','M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'],['/admin/venta-directa','Venta Directa','M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'],['/admin/usuarios','Usuarios','M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'],['/admin/configuracion','Configuración','M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'],['/admin/mensajes','Mensajes','M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z']].map(([href,label,path])=>`
        <a href="${href}" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${href==='/admin/venta-directa'?'text-primary-700 bg-primary-50 border-r-2 border-primary-600':'text-gray-700'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"/></svg>
          <span>${label}</span>
        </a>`).join('')}
    </nav>
    <div class="p-4 border-t border-gray-100"><a href="/admin/logout" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg><span>Cerrar Sesión</span></a></div>
  </aside>
  <div class="flex-1 flex flex-col overflow-hidden">
    <header class="bg-white border-b border-gray-200 px-6 py-4 lg:hidden"><div class="flex items-center justify-between"><span class="font-bold text-gray-900">Venta Directa</span></div></header>
    <main class="flex-1 overflow-y-auto p-6">${content}</main>
  </div>
</div></body></html>`;
}