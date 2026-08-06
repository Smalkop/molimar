import { htmlResponse, jsonResponse, sanitizeString } from '../../utils/html.js';
import { adminLayout } from '../../components/adminLayout.js';
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
                    <button onclick="deleteRegion(this)" data-id="${r.id}" data-title="${r.title}" class="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-all" title="Eliminar">
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

      async function deleteRegion(el) {
        const id = el.dataset.id;
        const title = el.dataset.title;
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

  return htmlResponse(adminLayout({ title: 'Venta Directa', active: '/admin/venta-directa', content, user }));
}

export async function handleAdminDirectSalesApi(request, env, id, user) {
  DB.setEnv(env);

  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Solo administradores pueden gestionar regiones' }, 403);
  }

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
        localities: JSON.stringify((data.localities || []).map(s => sanitizeString(String(s)))),
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
      if (data.localities) updates.localities = JSON.stringify(data.localities.map(s => sanitizeString(String(s))));
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