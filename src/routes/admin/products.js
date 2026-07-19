import { htmlResponse, jsonResponse, slugify, sanitizeString, escapeHtml, imgUrl } from '../../utils/html.js';
import DB from '../../services/database.js';
import IMAGE from '../../services/image.js';

export async function handleAdminProducts(env, user) {
  DB.setEnv(env);
  const products = await DB.query(`
    SELECT p.*, pt.name as type_name
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    ORDER BY p.updated_at DESC
  `);
  const types = await DB.query('SELECT * FROM product_types ORDER BY sort_order');
  const categories = await DB.query('SELECT * FROM categories ORDER BY product_type_id, sort_order');

  const html = await adminLayout(`
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
          <p class="text-gray-500 text-sm mt-1">${products.length} producto(s) registrados</p>
        </div>
        <button onclick="openModal()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all">
          + Nuevo Producto
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${products.map(p => `
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      ${p.main_image ? `<img src="${imgUrl(p.main_image)}" alt="" class="w-10 h-10 rounded-lg object-cover">` : `<div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>`}
                      <div>
                        <p class="text-sm font-medium text-gray-900">${escapeHtml(p.name)}</p>
                        <p class="text-xs text-gray-500">${p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">${p.type_name}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${p.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">${p.sort_order}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                      <button onclick="editProduct(${p.id})" class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Editar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onclick="deleteProduct(${p.id}, '${escapeHtml(p.name)}')" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
              ${products.length === 0 ? '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">No hay productos. Creá el primero.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
    <div id="product-modal" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/50" onclick="closeModal()"></div>
      <div class="absolute inset-0 flex items-start justify-center p-4 pt-20 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 class="text-xl font-bold text-gray-900" id="modal-title">Nuevo Producto</h2>
            <button onclick="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <form id="product-form" class="p-6 space-y-6" enctype="multipart/form-data">
            <input type="hidden" id="product-id" name="id">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" id="product-name" name="name" required class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" id="product-slug" name="slug" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm text-gray-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select id="product-type" name="product_type_id" required class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
                  <option value="">Seleccionar...</option>
                  ${types.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select id="product-category" name="category_id" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
                  <option value="">Sin categoría</option>
                  ${categories.map(c => `<option value="${c.id}" data-type="${c.product_type_id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select id="product-status" name="status" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input type="number" id="product-order" name="sort_order" value="0" min="0" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Corta</label>
              <textarea id="product-short-desc" name="short_description" rows="2" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Completa</label>
              <textarea id="product-full-desc" name="full_description" rows="5" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Información Nutricional</label>
              <textarea id="product-nutrition" name="nutritional_info" rows="4" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Presentaciones (una por línea: nombre, peso, precio)</label>
              <textarea id="product-presentations" name="presentations" rows="3" placeholder="Harina 000, 1kg, 250.00&#10;Harina 0000, 500g, 180.00" class="form-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none text-sm"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
              <input type="file" id="product-main-image" name="main_image" accept="image/*" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100">
              <div id="main-image-preview" class="mt-2 hidden">
                <div class="relative inline-block cursor-crosshair group" id="focal-container">
                  <img src="" alt="Preview" id="focal-image" class="h-48 rounded-lg shadow-sm" style="object-fit: cover;">
                  <div id="focal-marker" class="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg pointer-events-none hidden" style="background: rgba(0,0,0,0.4); top:50%; left:50%;">
                    <div class="absolute inset-0 flex items-center justify-center"><div class="w-1 h-1 rounded-full bg-white"></div></div>
                  </div>
                  <button type="button" onclick="zoomMainImage()" class="absolute top-2 right-2 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" title="Ampliar imagen">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                  </button>
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                    <span class="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">Click para definir punto focal · Click en 🔍 para ampliar</span>
                  </div>
                  <input type="hidden" id="product-crop-x" name="crop_x" value="50">
                  <input type="hidden" id="product-crop-y" name="crop_y" value="50">
                </div>
              </div>
              <div class="mt-1 flex items-center space-x-2 text-xs text-gray-400">
                <span>Punto focal:</span>
                <span id="focal-coords">50%, 50%</span>
                <button type="button" onclick="resetFocal()" class="text-primary-600 hover:text-primary-700 underline ml-2">Restablecer</button>
              </div>
            </div>
            <!-- Lightbox modal -->
            <div id="lightbox-modal" class="fixed inset-0 z-[100] bg-black/90 hidden items-center justify-center" onclick="closeLightbox(event)">
              <button type="button" onclick="closeLightbox()" class="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none">&times;</button>
              <img id="lightbox-image" src="" alt="Vista ampliada" class="max-w-[90vw] max-h-[90vh] object-contain">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Galería de Imágenes</label>
              <input type="file" id="product-gallery" name="gallery" accept="image/*" multiple class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100">
              <div id="gallery-preview" class="mt-2 grid grid-cols-4 gap-2"></div>
            </div>
            <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
              <button type="button" onclick="closeModal()" class="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all">Guardar Producto</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <script>
      let editingId = null;

      function openModal() {
        editingId = null;
        document.getElementById('product-form').reset();
        document.getElementById('modal-title').textContent = 'Nuevo Producto';
        document.getElementById('main-image-preview').classList.add('hidden');
        document.getElementById('gallery-preview').innerHTML = '';
        document.getElementById('product-modal').classList.remove('hidden');
      }

      function closeModal() {
        document.getElementById('product-modal').classList.add('hidden');
      }

      document.getElementById('product-name')?.addEventListener('input', function() {
        const slug = document.getElementById('product-slug');
        if (!slug.dataset.manual) {
          slug.value = this.value.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/[\\s_]+/g, '-').replace(/^-+|-+\$/g, '');
        }
      });

      document.getElementById('product-slug')?.addEventListener('input', function() {
        this.dataset.manual = this.value.length > 0 ? 'true' : '';
      });

      document.getElementById('product-type')?.addEventListener('change', function() {
        const typeId = this.value;
        document.querySelectorAll('#product-category option').forEach(opt => {
          if (opt.dataset.type) {
            opt.style.display = opt.dataset.type === typeId || opt.value === '' ? '' : 'none';
          }
        });
      });

      document.getElementById('product-main-image')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(ev) {
            const preview = document.getElementById('main-image-preview');
            preview.classList.remove('hidden');
            const img = document.getElementById('focal-image');
            img.src = ev.target.result;
            img.onload = function() {
              resetFocal();
              document.getElementById('focal-marker').classList.remove('hidden');
            };
          };
          reader.readAsDataURL(file);
        }
      });

      function resetFocal() {
        document.getElementById('product-crop-x').value = 50;
        document.getElementById('product-crop-y').value = 50;
        document.getElementById('focal-marker').style.top = '50%';
        document.getElementById('focal-marker').style.left = '50%';
        document.getElementById('focal-coords').textContent = '50%, 50%';
      }

      function openLightbox(src) {
        document.getElementById('lightbox-image').src = src;
        document.getElementById('lightbox-modal').classList.remove('hidden');
        document.getElementById('lightbox-modal').classList.add('flex');
      }

      function closeLightbox(e) {
        if (e && e.target !== e.currentTarget) return;
        document.getElementById('lightbox-modal').classList.add('hidden');
        document.getElementById('lightbox-modal').classList.remove('flex');
      }

      document.getElementById('focal-container')?.addEventListener('click', function(e) {
        const img = document.getElementById('focal-image');
        if (!img.src) return;
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        const rect = img.getBoundingClientRect();
        const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        document.getElementById('product-crop-x').value = Math.max(0, Math.min(100, xPct));
        document.getElementById('product-crop-y').value = Math.max(0, Math.min(100, yPct));
        document.getElementById('focal-marker').style.left = xPct + '%';
        document.getElementById('focal-marker').style.top = yPct + '%';
        document.getElementById('focal-coords').textContent = xPct + '%, ' + yPct + '%';
      });

      document.getElementById('focal-image')?.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        const src = this.src;
        if (src) openLightbox(src);
      });

      function zoomMainImage() {
        const img = document.getElementById('focal-image');
        if (img && img.src) openLightbox(img.src);
      }

      async function editProduct(id) {
        editingId = id;
        try {
          const res = await fetch('/admin/api/productos/' + id);
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          const data = await res.json();
          if (!res.ok) { alert(data.error); return; }

          document.getElementById('modal-title').textContent = 'Editar Producto';
          document.getElementById('product-id').value = data.id;
          document.getElementById('product-name').value = data.name;
          document.getElementById('product-slug').value = data.slug;
          document.getElementById('product-type').value = data.product_type_id;
          document.getElementById('product-category').value = data.category_id || '';
          document.getElementById('product-status').value = data.status;
          document.getElementById('product-order').value = data.sort_order;
          document.getElementById('product-short-desc').value = data.short_description || '';
          document.getElementById('product-full-desc').value = data.full_description || '';
          document.getElementById('product-nutrition').value = data.nutritional_info || '';
          document.getElementById('product-type').dispatchEvent(new Event('change'));

          if (data.main_image) {
            const prev = document.getElementById('main-image-preview');
            prev.classList.remove('hidden');
            const img = document.getElementById('focal-image');
            img.src = data.main_image.startsWith('/') || data.main_image.startsWith('http') ? data.main_image : '/media/' + data.main_image;
            img.onload = function() {
              const cx = parseInt(data.crop_x) || 50;
              const cy = parseInt(data.crop_y) || 50;
              document.getElementById('product-crop-x').value = cx;
              document.getElementById('product-crop-y').value = cy;
              document.getElementById('focal-marker').style.left = cx + '%';
              document.getElementById('focal-marker').style.top = cy + '%';
              document.getElementById('focal-coords').textContent = cx + '%, ' + cy + '%';
              document.getElementById('focal-marker').classList.remove('hidden');
            };
          }

          if (data.presentations) {
            document.getElementById('product-presentations').value = data.presentations.map(p => p.name + ', ' + (p.weight || '') + ', ' + (p.price || '')).join('\\n');
          }

          document.getElementById('product-modal').classList.remove('hidden');
        } catch (e) {
          alert('Error al cargar producto');
        }
      }

      document.getElementById('product-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const formData = new FormData();
        formData.append('id', document.getElementById('product-id').value);
        formData.append('name', document.getElementById('product-name').value);
        formData.append('slug', document.getElementById('product-slug').value);
        formData.append('product_type_id', document.getElementById('product-type').value);
        formData.append('category_id', document.getElementById('product-category').value);
        formData.append('status', document.getElementById('product-status').value);
        formData.append('sort_order', document.getElementById('product-order').value);
        formData.append('short_description', document.getElementById('product-short-desc').value);
        formData.append('full_description', document.getElementById('product-full-desc').value);
        formData.append('nutritional_info', document.getElementById('product-nutrition').value);
        formData.append('crop_x', document.getElementById('product-crop-x').value);
        formData.append('crop_y', document.getElementById('product-crop-y').value);
        formData.append('presentations', document.getElementById('product-presentations').value);

        const mainImg = document.getElementById('product-main-image').files[0];
        if (mainImg) formData.append('main_image', mainImg);

        const gallery = document.getElementById('product-gallery').files;
        for (const f of gallery) formData.append('gallery', f);

        try {
          const method = editingId ? 'PUT' : 'POST';
          const res = await fetch('/admin/api/productos' + (editingId ? '/' + editingId : ''), {
            method,
            body: formData,
          });
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          if (res.ok) {
            location.reload();
          } else {
            const err = await res.json();
            alert(err.error || 'Error al guardar');
          }
        } catch (e) {
          alert('Error de conexión');
        }

        btn.disabled = false;
        btn.textContent = 'Guardar Producto';
      });

      async function deleteProduct(id, name) {
        if (!confirm('¿Eliminar "' + name + '"? Esta acción no se puede deshacer.')) return;
        try {
          const res = await fetch('/admin/api/productos/' + id, { method: 'DELETE' });
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          if (res.ok) location.reload();
          else alert('Error al eliminar');
        } catch {
          alert('Error de conexión');
        }
      }
    </script>
  `, user);

  return htmlResponse(html);
}

export async function handleAdminProductsApi(request, env, id) {
  DB.setEnv(env);

  if (request.method === 'GET' && id) {
    const product = await DB.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return jsonResponse({ error: 'Producto no encontrado' }, 404);

    const presentations = await DB.query('SELECT * FROM product_presentations WHERE product_id = ? ORDER BY sort_order', [id]);
    const images = await DB.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [id]);

    return jsonResponse({ ...product, presentations, images });
  }

  if (request.method === 'POST' && !id) {
    try {
      const formData = await request.formData();
      const name = formData.get('name');
      if (!name) return jsonResponse({ error: 'Nombre requerido' }, 400);

      const productData = {
        name: sanitizeString(name),
        slug: formData.get('slug') || slugify(name),
        product_type_id: parseInt(formData.get('product_type_id')),
        category_id: formData.get('category_id') ? parseInt(formData.get('category_id')) : null,
        short_description: sanitizeString(formData.get('short_description') || ''),
        full_description: sanitizeString(formData.get('full_description') || ''),
        nutritional_info: sanitizeString(formData.get('nutritional_info') || ''),
        status: formData.get('status') || 'active',
        sort_order: parseInt(formData.get('sort_order')) || 0,
        crop_x: parseInt(formData.get('crop_x')) || 50,
        crop_y: parseInt(formData.get('crop_y')) || 50,
      };

      const result = await DB.insert('products', productData);
      const productId = result.meta?.last_row_id || result.id;

      const presentationsRaw = formData.get('presentations');
      if (presentationsRaw) {
        const lines = presentationsRaw.split('\n').filter(Boolean);
        for (let i = 0; i < lines.length; i++) {
          const parts = lines[i].split(',').map(s => s.trim());
          await DB.insert('product_presentations', {
            product_id: productId,
            name: parts[0] || `Presentación ${i + 1}`,
            weight: parts[1] || null,
            price: parts[2] ? parseFloat(parts[2]) : null,
            sort_order: i,
          });
        }
      }

      const mainImage = formData.get('main_image');
      if (mainImage && mainImage.size > 0) {
        const paths = await IMAGE.process(mainImage, productId);
        await DB.update('products', { main_image: paths.medium }, 'id', productId);
        await DB.insert('product_images', {
          product_id: productId,
          image_type: 'main',
          thumbnail_path: paths.thumbnail,
          medium_path: paths.medium,
          original_path: paths.original,
          sort_order: 0,
        });
      }

      const galleryFiles = formData.getAll('gallery');
      for (let i = 0; i < galleryFiles.length; i++) {
        if (galleryFiles[i].size > 0) {
          const paths = await IMAGE.process(galleryFiles[i], productId);
          await DB.insert('product_images', {
            product_id: productId,
            image_type: 'gallery',
            thumbnail_path: paths.thumbnail,
            medium_path: paths.medium,
            original_path: paths.original,
            sort_order: i + 1,
          });
        }
      }

      return jsonResponse({ success: true, id: productId });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al crear producto' }, 500);
    }
  }

  if (request.method === 'PUT' && id) {
    try {
      const formData = await request.formData();
      const name = formData.get('name');
      if (!name) return jsonResponse({ error: 'Nombre requerido' }, 400);

      const productData = {
        name: sanitizeString(name),
        slug: formData.get('slug') || slugify(name),
        product_type_id: parseInt(formData.get('product_type_id')),
        category_id: formData.get('category_id') ? parseInt(formData.get('category_id')) : null,
        short_description: sanitizeString(formData.get('short_description') || ''),
        full_description: sanitizeString(formData.get('full_description') || ''),
        nutritional_info: sanitizeString(formData.get('nutritional_info') || ''),
        status: formData.get('status') || 'active',
        sort_order: parseInt(formData.get('sort_order')) || 0,
        crop_x: parseInt(formData.get('crop_x')) || 50,
        crop_y: parseInt(formData.get('crop_y')) || 50,
      };

      await DB.update('products', productData, 'id', parseInt(id));

      await DB.delete('product_presentations', 'product_id', parseInt(id));
      const presentationsRaw = formData.get('presentations');
      if (presentationsRaw) {
        const lines = presentationsRaw.split('\n').filter(Boolean);
        for (let i = 0; i < lines.length; i++) {
          const parts = lines[i].split(',').map(s => s.trim());
          await DB.insert('product_presentations', {
            product_id: parseInt(id),
            name: parts[0] || `Presentación ${i + 1}`,
            weight: parts[1] || null,
            price: parts[2] ? parseFloat(parts[2]) : null,
            sort_order: i,
          });
        }
      }

      const mainImage = formData.get('main_image');
      if (mainImage && mainImage.size > 0) {
        const paths = await IMAGE.process(mainImage, parseInt(id));
        await DB.update('products', { main_image: paths.medium }, 'id', parseInt(id));
        await DB.delete('product_images', 'product_id', parseInt(id));
        await DB.insert('product_images', {
          product_id: parseInt(id),
          image_type: 'main',
          thumbnail_path: paths.thumbnail,
          medium_path: paths.medium,
          original_path: paths.original,
          sort_order: 0,
        });
      }

      const galleryFiles = formData.getAll('gallery');
      if (galleryFiles.length > 0 && galleryFiles[0].size > 0) {
        const existingImages = await DB.query('SELECT * FROM product_images WHERE product_id = ? AND image_type = ?', [parseInt(id), 'gallery']);
        if (existingImages.length > 0) {
          await IMAGE.delete(existingImages);
          await DB.delete('product_images', 'product_id', parseInt(id));
        }

        for (let i = 0; i < galleryFiles.length; i++) {
          if (galleryFiles[i].size > 0) {
            const paths = await IMAGE.process(galleryFiles[i], parseInt(id));
            await DB.insert('product_images', {
              product_id: parseInt(id),
              image_type: 'gallery',
              thumbnail_path: paths.thumbnail,
              medium_path: paths.medium,
              original_path: paths.original,
              sort_order: i + 1,
            });
          }
        }
      }

      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al actualizar' }, 500);
    }
  }

  if (request.method === 'DELETE' && id) {
    try {
      const images = await DB.query('SELECT * FROM product_images WHERE product_id = ?', [parseInt(id)]);
      if (images.length > 0) await IMAGE.delete(images);
      await DB.delete('products', 'id', parseInt(id));
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: 'Error al eliminar' }, 500);
    }
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

async function adminLayout(content, user) {
  return adminLayoutWithContent(content, user);
}

async function adminLayoutWithContent(content, user) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Productos | Admin Molipar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{primary:{50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#4f46e5',600:'#0000ba',700:'#00009a',800:'#00007a',900:'#00005a',950:'#00003a'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <style>
    .sidebar-link { transition: all 0.2s ease; }
    .sidebar-link:hover { background: #eef2ff; color: #0000ba; }
    .form-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .form-input:focus { border-color: #0000ba; box-shadow: 0 0 0 3px rgba(0, 0, 186, 0.1); }
  </style>
</head>
<body class="font-sans bg-gray-50 min-h-screen">
  <div class="flex h-screen overflow-hidden">
    <aside class="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center space-x-3">
          <img src="/images/logo.png" alt="Molipar" class="h-10 w-auto">
        </div>
      </div>
      <nav class="flex-1 py-4 space-y-1 px-3">
        <a href="/admin" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>Dashboard</span>
        </a>
        <a href="/admin/productos" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 border-r-2 border-primary-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span>Productos</span>
        </a>
        <a href="/admin/venta-directa" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span>Venta Directa</span>
        </a>
        <a href="/admin/usuarios" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          <span>Usuarios</span>
        </a>
        <a href="/admin/configuracion" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span>Configuración</span>
        </a>
        <a href="/admin/mensajes" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          <span>Mensajes</span>
        </a>
      </nav>
      <div class="p-4 border-t border-gray-100">
        <a href="/admin/logout" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>Cerrar Sesión</span>
        </a>
      </div>
    </aside>
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white border-b border-gray-200 px-6 py-4 lg:hidden">
        <div class="flex items-center justify-between">
          <span class="font-bold text-gray-900">Productos</span>
          <button onclick="document.querySelector('aside').classList.toggle('hidden')" class="p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        ${content}
      </main>
    </div>
  </div>
</body>
</html>`;
}
