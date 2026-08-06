import { htmlResponse, jsonResponse, slugify, sanitizeString, escapeHtml, imgUrl } from '../../utils/html.js';
import { adminLayout } from '../../components/adminLayout.js';
import DB from '../../services/database.js';
import IMAGE from '../../services/image.js';
import { galleryPickerHTML } from './gallery.js';

export async function handleAdminProducts(env, user) {
  DB.setEnv(env);
  const harinas = await DB.query(`
    SELECT p.*, pt.name as type_name
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    WHERE p.product_type_id = 1
    ORDER BY p.sort_order, p.name
  `);
  const fideos = await DB.query(`
    SELECT p.*, pt.name as type_name
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    WHERE p.product_type_id = 2
    ORDER BY p.sort_order, p.name
  `);
  const types = await DB.query('SELECT * FROM product_types ORDER BY sort_order');
  const categories = await DB.query('SELECT * FROM categories ORDER BY product_type_id, sort_order');

  const html = adminLayout({ title: 'Productos', active: '/admin/productos', header: 'toggle', user, content: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
          <p class="text-gray-500 text-sm mt-1">${harinas.length} harina(s) · ${fideos.length} fideo(s)</p>
        </div>
        <button onclick="openModal()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all">
          + Nuevo Producto
        </button>
      </div>

      ${renderProductTable('Harinas', 'harinas', harinas)}
      ${renderProductTable('Fideos', 'fideos', fideos)}
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
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <input type="file" id="product-main-image" name="main_image" accept="image/*" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100">
                <button type="button" onclick="openGalleryPicker('main')" class="text-sm px-3 py-2 border border-primary-200 text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  De la Galería
                </button>
              </div>
              <input type="hidden" id="main-image-gallery" name="main_image_gallery" value="">
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
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <input type="file" id="product-gallery" name="gallery" accept="image/*" multiple class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100">
                <button type="button" onclick="openGalleryPicker('gallery')" class="text-sm px-3 py-2 border border-primary-200 text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  De la Galería
                </button>
              </div>
              <input type="hidden" id="gallery-selected-input" name="gallery_selected" value="">
              <div id="gallery-preview" class="mt-2 grid grid-cols-4 gap-2"></div>
              <p class="mt-1 text-xs text-gray-400">Las imágenes elegidas de la galería se suman a las que subas desde tu equipo.</p>
            </div>
            <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
              <button type="button" onclick="closeModal()" class="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all">Guardar Producto</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    ${galleryPickerHTML()}

    <script>
      let editingId = null;
      let selectedGalleryKeys = [];

      setupDragDrop('harinas');
      setupDragDrop('fideos');

      function openModal() {
        editingId = null;
        selectedGalleryKeys = [];
        existingGallery = [];
        pendingGalleryKeys = [];
        removedExistingIds = [];
        document.getElementById('gallery-selected-input').value = '';
        document.getElementById('main-image-gallery').value = '';
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
        existingGallery = [];
        pendingGalleryKeys = [];
        removedExistingIds = [];
        document.getElementById('gallery-selected-input').value = '';
        document.getElementById('main-image-gallery').value = '';
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

          existingGallery = (data.images || [])
            .filter(i => i.image_type === 'main' || i.image_type === 'gallery')
            .map(i => ({
              id: i.id,
              type: i.image_type,
              key: i.original_path || i.medium_path || i.thumbnail_path || '',
            }));
          renderGalleryPreview();

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

        if (removedExistingIds.length > 0) {
          formData.append('remove_gallery_ids', removedExistingIds.join(','));
        }

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

      async function deleteProduct(el) {
        const id = el.dataset.id;
        const name = el.dataset.name;
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

      // === Callbacks del gallery picker ===
      function setMainImageFromGallery(key) {
        // Marca el key seleccionado y muestra preview. El handler del servidor
        // si viene main_image_gallery lo usa como main_image directly (paths.medium = key).
        document.getElementById('main-image-gallery').value = key;
        // Limpiar el input file para evitar conflicto
        document.getElementById('product-main-image').value = '';
        const prev = document.getElementById('main-image-preview');
        prev.classList.remove('hidden');
        const img = document.getElementById('focal-image');
        img.src = '/media/' + encodeURIComponent(key);
        img.onload = function() {
          resetFocal();
          document.getElementById('focal-marker').classList.remove('hidden');
        };
      }

      let existingGallery = [];
      let pendingGalleryKeys = [];
      let removedExistingIds = [];
      function appendGalleryFromPicker(keys) {
        for (const k of keys) {
          if (!pendingGalleryKeys.includes(k)) pendingGalleryKeys.push(k);
        }
        renderGalleryPreview();
        // Sincronizar hidden input
        document.getElementById('gallery-selected-input').value = pendingGalleryKeys.join(',');
      }

      function renderGalleryPreview() {
        const preview = document.getElementById('gallery-preview');
        const items = [];

        existingGallery.forEach((img, i) => {
          items.push({
            token: 'E' + i,
            url: img.key.startsWith('http') || img.key.startsWith('/') || img.key.startsWith('data:')
              ? img.key
              : '/media/' + encodeURIComponent(img.key),
            label: img.type === 'main' ? 'Principal' : 'Existente',
            removable: img.type === 'gallery',
          });
        });

        pendingGalleryKeys.forEach((k, i) => {
          items.push({
            token: 'P' + i,
            url: '/media/' + encodeURIComponent(k),
            label: 'Galería',
          });
        });

        if (items.length === 0) {
          preview.innerHTML = '';
          return;
        }

        preview.innerHTML = items.map(item => \`
          <div class="relative group">
            <img src="\${item.url}" alt="" class="w-full h-20 object-cover rounded-lg border border-gray-200">
            \${item.removable ? \`<button type="button" onclick="removeGalleryItem('\${item.token}')" class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">×</button>\` : ''}
            <span class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate rounded-b-lg">\${item.label}</span>
          </div>
        \`).join('');
      }

      function removeGalleryItem(token) {
        if (token.charAt(0) === 'E') {
          const i = parseInt(token.slice(1), 10);
          const img = existingGallery[i];
          if (!img) return;
          if (img.id) removedExistingIds.push(img.id);
          existingGallery.splice(i, 1);
        } else {
          const i = parseInt(token.slice(1), 10);
          pendingGalleryKeys.splice(i, 1);
        }
        document.getElementById('gallery-selected-input').value = pendingGalleryKeys.join(',');
        renderGalleryPreview();
      }

      // === Drag & drop reordering ===
      function setupDragDrop(typeId) {
        const tbody = document.getElementById(typeId + '-tbody');
        if (!tbody) return;
        let draggedRow = null;

        tbody.addEventListener('dragstart', function(e) {
          const row = e.target.closest('tr');
          if (!row) return;
          draggedRow = row;
          row.classList.add('opacity-40');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', row.dataset.id);
        });

        tbody.addEventListener('dragend', function(e) {
          const row = e.target.closest('tr') || draggedRow;
          if (row) row.classList.remove('opacity-40');
          tbody.querySelectorAll('.drop-target').forEach(function(el) {
            el.classList.remove('drop-target', 'border-t-2', 'border-primary-500');
          });
          draggedRow = null;
        });

        tbody.addEventListener('dragover', function(e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const target = e.target.closest('tr');
          if (!target || target === draggedRow) return;
          tbody.querySelectorAll('.drop-target').forEach(function(el) {
            el.classList.remove('drop-target', 'border-t-2', 'border-primary-500');
          });
          target.classList.add('drop-target', 'border-t-2', 'border-primary-500');
        });

        tbody.addEventListener('drop', async function(e) {
          e.preventDefault();
          const target = e.target.closest('tr');
          if (!target || !draggedRow || target === draggedRow) return;

          tbody.insertBefore(draggedRow, target.nextSibling);

          tbody.querySelectorAll('.drop-target').forEach(function(el) {
            el.classList.remove('drop-target', 'border-t-2', 'border-primary-500');
          });

          const ids = [];
          tbody.querySelectorAll('tr[data-id]').forEach(function(row) {
            ids.push(parseInt(row.dataset.id));
          });

          try {
            const res = await fetch('/admin/api/productos/reorder', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ordered_ids: ids }),
            });
            if (res.status === 401) { window.location.href = '/admin/login'; return; }
            if (res.ok) {
              const orderCells = tbody.querySelectorAll('tr[data-id] td:nth-child(4)');
              orderCells.forEach(function(cell, i) { cell.textContent = i; });
            } else {
              location.reload();
            }
          } catch {
            location.reload();
          }
        });
      }
    </script>
  `, user});

  return htmlResponse(html);
}

function parsePresentations(raw, productId) {
  if (!raw) return [];
  const lines = String(raw).split('\n').map(s => s.trim()).filter(Boolean);
  return lines.map((line, i) => {
    const parts = line.split(',').map(s => s.trim());
    let price = null;
    if (parts[2]) {
      const n = parseFloat(parts[2]);
      price = Number.isFinite(n) ? n : null;
    }
    return {
      product_id: productId,
      name: parts[0] || `Presentación ${i + 1}`,
      weight: parts[1] || null,
      price,
      sort_order: i,
    };
  });
}

export async function handleAdminProductsApi(request, env, id) {
  DB.setEnv(env);

  if (request.method === 'PUT' && id === 'reorder') {
    try {
      const { ordered_ids } = await request.json();
      if (!Array.isArray(ordered_ids)) return jsonResponse({ error: 'ordered_ids requerido' }, 400);
      for (let i = 0; i < ordered_ids.length; i++) {
        await DB.update('products', { sort_order: i }, 'id', ordered_ids[i]);
      }
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al reordenar' }, 500);
    }
  }

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

      let slug = formData.get('slug') || slugify(name);
      let uniqueSlug = slug;
      let counter = 1;

      while (true) {
        const existing = await DB.get('SELECT id FROM products WHERE slug = ?', [uniqueSlug]);
        if (!existing) break;
        uniqueSlug = `${slug}-${counter++}`;
      }
      productData.slug = uniqueSlug;

      const result = await DB.insert('products', productData);
      const productId = result.meta?.last_row_id || result.id;

      const presentationsRaw = formData.get('presentations');
      if (presentationsRaw) {
        const presentations = parsePresentations(presentationsRaw, productId);
        for (const p of presentations) {
          await DB.insert('product_presentations', p);
        }
      }

      // === Imagen principal ===
      // Prioridad: archivo subido > imagen elegida de la galería.
      const mainImage = formData.get('main_image');
      const mainGalleryKey = formData.get('main_image_gallery');
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
      } else if (mainGalleryKey && typeof mainGalleryKey === 'string' && mainGalleryKey.length > 0) {
        await DB.update('products', { main_image: mainGalleryKey }, 'id', productId);
        await DB.insert('product_images', {
          product_id: productId,
          image_type: 'main',
          thumbnail_path: mainGalleryKey,
          medium_path: mainGalleryKey,
          original_path: mainGalleryKey,
          sort_order: 0,
        });
      }

      // === Galería del producto ===
      // Combination: archivos subidos (procesados) + keys seleccionadas de la galería.
      let gallerySort = 1;
      const galleryFiles = formData.getAll('gallery');
      for (const f of galleryFiles) {
        if (f.size > 0) {
          const paths = await IMAGE.process(f, productId);
          await DB.insert('product_images', {
            product_id: productId,
            image_type: 'gallery',
            thumbnail_path: paths.thumbnail,
            medium_path: paths.medium,
            original_path: paths.original,
            sort_order: gallerySort++,
          });
        }
      }
      const gallerySelectedRaw = formData.get('gallery_selected');
      if (gallerySelectedRaw && typeof gallerySelectedRaw === 'string') {
        const keys = gallerySelectedRaw.split(',').map(s => s.trim()).filter(Boolean);
        for (const k of keys) {
          await DB.insert('product_images', {
            product_id: productId,
            image_type: 'gallery',
            thumbnail_path: k,
            medium_path: k,
            original_path: k,
            sort_order: gallerySort++,
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

      let slug = formData.get('slug') || slugify(name);
      let uniqueSlug = slug;
      let counter = 1;

      while (true) {
        const existing = await DB.get('SELECT id FROM products WHERE slug = ? AND id != ?', [uniqueSlug, parseInt(id)]);
        if (!existing) break;
        uniqueSlug = `${slug}-${counter++}`;
      }
      productData.slug = uniqueSlug;

      await DB.update('products', productData, 'id', parseInt(id));

      await DB.delete('product_presentations', 'product_id', parseInt(id));
      const presentationsRaw = formData.get('presentations');
      if (presentationsRaw) {
        const presentations = parsePresentations(presentationsRaw, parseInt(id));
        for (const p of presentations) {
          await DB.insert('product_presentations', p);
        }
      }

      // === Imagen principal (PUT) ===
      // Prioridad: archivo subido > imagen de galería seleccionada.
      const mainImage = formData.get('main_image');
      const mainGalleryKey = formData.get('main_image_gallery');
      if (mainImage && mainImage.size > 0) {
        const paths = await IMAGE.process(mainImage, parseInt(id));
        await DB.update('products', { main_image: paths.medium }, 'id', parseInt(id));
        // Remover la imagen principal anterior sin tocar la galería
        const prevMain = await DB.query('SELECT * FROM product_images WHERE product_id = ? AND image_type = ?', [parseInt(id), 'main']);
        if (prevMain.length > 0) {
          // Solo borrar de R2 las generadas vía IMAGE.process (que arrancan con molipa/).
          // Las elegidas de galería (gallery/) no se borran de R2 al seguir usándose ahí.
          const toDelete = prevMain.filter(i => (i.original_path || '').startsWith('molipa/'));
          if (toDelete.length > 0) await IMAGE.delete(toDelete);
          for (const i of prevMain) await DB.delete('product_images', 'id', i.id);
        }
        await DB.insert('product_images', {
          product_id: parseInt(id),
          image_type: 'main',
          thumbnail_path: paths.thumbnail,
          medium_path: paths.medium,
          original_path: paths.original,
          sort_order: 0,
        });
      } else if (mainGalleryKey && typeof mainGalleryKey === 'string' && mainGalleryKey.length > 0) {
        await DB.update('products', { main_image: mainGalleryKey }, 'id', parseInt(id));
        const prevMain = await DB.query('SELECT * FROM product_images WHERE product_id = ? AND image_type = ?', [parseInt(id), 'main']);
        // Si la imagen principal anterior fue procesada (molipa/) y ya no se usa,
        // se elimina de R2; las de galería (gallery/) son reutilizables.
        const toDelete = prevMain.filter(i => (i.original_path || '').startsWith('molipa/'));
        if (toDelete.length > 0) await IMAGE.delete(toDelete);
        for (const i of prevMain) await DB.delete('product_images', 'id', i.id);
        await DB.insert('product_images', {
          product_id: parseInt(id),
          image_type: 'main',
          thumbnail_path: mainGalleryKey,
          medium_path: mainGalleryKey,
          original_path: mainGalleryKey,
          sort_order: 0,
        });
      }

      // === Galería del producto (PUT) ===
      // Solo se reemplaza la galería si el usuario subió archivos nuevos O eligió
      // imágenes de la galería. Si no, se conserva la existente (evita borrar al
      // editar otros campos del producto).
      const galleryFiles = formData.getAll('gallery');
      const gallerySelectedRaw = formData.get('gallery_selected');
      const gallerySelectedKeys = (gallerySelectedRaw && typeof gallerySelectedRaw === 'string'
        ? gallerySelectedRaw.split(',').map(s => s.trim()).filter(Boolean)
        : []);

      const hasNewFiles = galleryFiles.length > 0 && galleryFiles[0].size > 0;
      const hasGallerySelection = gallerySelectedKeys.length > 0;

      if (hasNewFiles || hasGallerySelection) {
        const existingImages = await DB.query(
          'SELECT * FROM product_images WHERE product_id = ? AND image_type = ?',
          [parseInt(id), 'gallery'],
        );
        if (existingImages.length > 0) {
          // Solo borrar de R2 las que fueron procesadas (molipa/). Las elegidas
          // de la galería (gallery/) siguen siendo reutilizables.
          const toDelete = existingImages.filter(i => (i.original_path || '').startsWith('molipa/'));
          if (toDelete.length > 0) await IMAGE.delete(toDelete);
          // Solo borramos las filas de galería; conservamos la 'main' para no
          // perder la imagen principal ni generar fugas en R2 al final.
          await DB.run('DELETE FROM product_images WHERE product_id = ? AND image_type = ?', [parseInt(id), 'gallery']);
        }
        let gallerySort = 1;
        for (const f of galleryFiles) {
          if (f.size > 0) {
            const paths = await IMAGE.process(f, parseInt(id));
            await DB.insert('product_images', {
              product_id: parseInt(id),
              image_type: 'gallery',
              thumbnail_path: paths.thumbnail,
              medium_path: paths.medium,
              original_path: paths.original,
              sort_order: gallerySort++,
            });
          }
        }
        for (const k of gallerySelectedKeys) {
          await DB.insert('product_images', {
            product_id: parseInt(id),
            image_type: 'gallery',
            thumbnail_path: k,
            medium_path: k,
            original_path: k,
            sort_order: gallerySort++,
          });
        }
      }

      // === Quitar imágenes existentes de la galería (sin reemplazo total) ===
      // Solo si el usuario NO subió archivos nuevos ni eligió de la galería;
      // si hubo reemplazo, las filas/galleries anteriores ya se eliminaron arriba.
      const removeGalleryRaw = formData.get('remove_gallery_ids');
      if (removeGalleryRaw && !hasNewFiles && !hasGallerySelection) {
        const removeIds = removeGalleryRaw.split(',').map(s => s.trim()).filter(Boolean).map(Number);
        for (const rid of removeIds) {
          if (!rid) continue;
          const imgs = await DB.query(
            'SELECT * FROM product_images WHERE id = ? AND product_id = ?',
            [rid, parseInt(id)],
          );
          if (imgs.length === 0) continue;
          const img = imgs[0];
          if ((img.original_path || '').startsWith('molipa/')) await IMAGE.delete([img]);
          await DB.delete('product_images', 'id', rid);
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
      // Solo se borran de R2 las imágenes que pertenecen exclusivamente a este
      // producto (procesadas vía molipa/). Las elegidas de la galería (gallery/)
      // pueden estar compartidas con otros productos y no deben eliminarse aquí.
      const owned = images.filter(i => (i.original_path || '').startsWith('molipa/'));
      if (owned.length > 0) await IMAGE.delete(owned);
      // Limpiar referencias en DB para este producto (incluye las de galería)
      await DB.delete('product_images', 'product_id', parseInt(id));
      await DB.delete('products', 'id', parseInt(id));
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: 'Error al eliminar' }, 500);
    }
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

function renderProductTable(label, id, products) {
  const rows = products.map(p => `
    <tr draggable="true" data-id="${p.id}" class="hover:bg-gray-50 transition-colors">
      <td class="px-4 py-4 w-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600" draggable="true">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM8 22a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center space-x-3">
          ${p.main_image ? `<img src="${imgUrl(p.main_image)}" alt="" class="w-10 h-10 rounded-lg object-cover">` : `<div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>`}
          <div>
            <p class="text-sm font-medium text-gray-900">${escapeHtml(p.name)}</p>
            <p class="text-xs text-gray-500">${p.slug}</p>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <span class="px-2 py-1 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${p.status === 'active' ? 'Activo' : 'Inactivo'}</span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-500 font-mono">${p.sort_order}</td>
      <td class="px-6 py-4">
        <div class="flex items-center space-x-2">
          <button onclick="editProduct(${p.id})" class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Editar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="deleteProduct(this)" data-id="${p.id}" data-name="${p.name}" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const emptyRow = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500 text-sm">No hay productos. Creá el primero.</td></tr>';

  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">${label}</h2>
        <span class="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">${products.length} producto(s)</span>
      </div>
      <div class="overflow-x-auto">
        <table id="${id}-table" class="w-full">
          <thead class="bg-gray-50 text-left">
            <tr>
              <th class="px-4 py-3 w-10"></th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
              <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody id="${id}-tbody" class="divide-y divide-gray-100">
            ${products.length > 0 ? rows : emptyRow}
          </tbody>
        </table>
      </div>
    </div>`;
}

