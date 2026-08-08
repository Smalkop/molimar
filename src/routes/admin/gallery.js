import { htmlResponse, jsonResponse } from '../../utils/html.js';
import { adminLayout } from '../../components/adminLayout.js';
import STORAGE from '../../services/storage.js';
import IMAGE from '../../services/image.js';
import DB from '../../services/database.js';

// ===== Página /admin/galeria =====
export async function handleAdminGallery(env, user) {
  STORAGE.setR2(env.R2);

  if (!user || user.role !== 'admin') {
    return htmlResponse('<div class="p-6 text-center"><h1 class="text-2xl font-bold">Acceso denegado</h1><p class="text-gray-500 mt-2">Se requiere rol de administrador.</p></div>', 403);
  }

  const html = adminLayout({ title: 'Galería', active: '/admin/galeria', header: 'toggle', user, content: `
    <div class="space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Galería de Imágenes</h1>
          <p class="text-gray-500 text-sm mt-1">Imágenes subidas disponibles para reutilizar en productos.</p>
        </div>
        <button onclick="document.getElementById('gallery-upload-input').click()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all">
          + Subir Imagen
        </button>
        <input type="file" id="gallery-upload-input" accept="image/*" multiple class="hidden">
      </div>

      <div id="gallery-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div class="col-span-full text-center py-12 text-gray-400 text-sm">Cargando imágenes…</div>
      </div>

      <div id="upload-progress" class="hidden text-sm text-primary-700"></div>
    </div>

    <!-- Lightbox -->
    <div id="lightbox-modal" class="fixed inset-0 z-[100] bg-black/90 hidden items-center justify-center" onclick="closeLightbox(event)">
      <button type="button" onclick="closeLightbox()" class="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none">&times;</button>
      <img id="lightbox-image" src="" alt="Vista ampliada" class="max-w-[90vw] max-h-[90vh] object-contain">
    </div>

    <script>
      let allImages = [];

      async function loadImages() {
        try {
          const res = await fetch('/admin/api/galeria');
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          const data = await res.json();
          allImages = data.images || [];
          renderGrid();
        } catch (e) {
          document.getElementById('gallery-grid').innerHTML = '<div class="col-span-full text-center text-red-600 text-sm py-8">Error al cargar la galería.</div>';
        }
      }

      function renderGrid() {
        const grid = document.getElementById('gallery-grid');
        if (allImages.length === 0) {
          grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400 text-sm">No hay imágenes. Subí la primera con el botón de arriba.</div>';
          return;
        }
        grid.innerHTML = allImages.map(img => \`
          <div class="relative group bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm" data-key="\${escapeAttr(img.key)}">
            <div class="aspect-square overflow-hidden cursor-pointer" onclick="openLightbox('/media/' + encodeURIComponent('\${img.key}'))">
              <img src="/media/\${encodeURIComponent(img.key)}" alt="" loading="lazy" class="w-full h-full object-cover transition-transform group-hover:scale-105">
            </div>
            \${
              img.in_use
                ? '<div class="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">En uso</div>'
                : ''
            }
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onclick="copyKey('\${img.key}')" title="Copiar URL" class="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
              <button onclick="deleteImage('\${img.key}', \${img.in_use})" title="Eliminar" class="w-8 h-8 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p class="text-white text-xs font-mono truncate">\${img.key}</p>
              <p class="text-white/60 text-xs">\${formatSize(img.size)}\${img.in_use ? ' • ' + img.used_by.length + ' producto(s)' : ''}</p>
            </div>
          </div>
        \`).join('');
      }

      function formatSize(bytes) {
        if (!bytes) return '—';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
      }

      function escapeAttr(s) {
        return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

      async function copyKey(key) {
        try {
          await navigator.clipboard.writeText('/media/' + key);
          const btn = event.currentTarget;
          const original = btn.innerHTML;
          btn.innerHTML = '<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          setTimeout(() => { btn.innerHTML = original; }, 1200);
        } catch {}
      }

      async function deleteImage(key, inUse) {
        const img = allImages.find(i => i.key === key);
        if (inUse && img && img.used_by && img.used_by.length > 0) {
          const names = img.used_by.map(p => p.name).join(', ');
          if (!confirm('Esta imagen se usa en: ' + names + '.\\n\\nSi la eliminás dejará de verse en esos productos. ¿Eliminar de todas formas?')) return;
        } else if (!confirm('¿Eliminar esta imagen de la galería?')) return;
        try {
          const res = await fetch('/admin/api/galeria?key=' + encodeURIComponent(key), { method: 'DELETE' });
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          if (res.ok) {
            allImages = allImages.filter(i => i.key !== key);
            renderGrid();
          } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Error al eliminar');
          }
        } catch {
          alert('Error de conexión');
        }
      }

      document.getElementById('gallery-upload-input')?.addEventListener('change', async function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const progress = document.getElementById('upload-progress');
        progress.classList.remove('hidden');
        progress.textContent = 'Subiendo ' + files.length + ' imagen(es)…';
        const formData = new FormData();
        for (const f of files) formData.append('images', f);
        try {
          const res = await fetch('/admin/api/galeria', { method: 'POST', body: formData });
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          if (res.ok) {
            const data = await res.json();
            progress.textContent = (data.uploaded || 0) + ' imagen(es) subida(s).';
            await loadImages();
            setTimeout(() => progress.classList.add('hidden'), 2500);
          } else {
            const err = await res.json().catch(() => ({}));
            progress.textContent = 'Error: ' + (err.error || 'desconocido');
          }
        } catch (err) {
          progress.textContent = 'Error de conexión';
        }
        e.target.value = '';
      });

      loadImages();
    </script>
  `, user});

  return htmlResponse(html);
}

// ===== API /admin/api/galeria =====
// GET    -> { images: [{key, size, uploaded, contentType}] }
// POST   (multipart, campo 'images') -> { uploaded: n, skipped: m }
// DELETE (?key=...)  -> { success: true }
export async function handleAdminGalleryApi(request, env, user) {
  STORAGE.setR2(env.R2);

  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Solo administradores pueden gestionar la galería' }, 403);
  }

  if (request.method === 'GET') {
    try {
      const all = request.url.includes('?all=1');
      let items = [];
      if (all) {
        items = await STORAGE.list({});
      } else {
        items = await STORAGE.list({ prefix: 'gallery/' });
      }

      // Consultar qué imágenes de galería están siendo usadas por productos
      DB.setEnv(env);
      const usedRows = await DB.query(`
        SELECT DISTINCT pi.original_path, p.id as product_id, p.name as product_name
        FROM product_images pi
        JOIN products p ON pi.product_id = p.id
        WHERE pi.original_path LIKE 'gallery/%'
           OR pi.medium_path LIKE 'gallery/%'
           OR pi.thumbnail_path LIKE 'gallery/%'
      `);
      const usedMap = new Map();
      for (const row of usedRows) {
        const key = row.original_path;
        if (!usedMap.has(key)) usedMap.set(key, []);
        usedMap.get(key).push({ id: row.product_id, name: row.product_name });
      }

      const images = items
        .filter(it => IMAGE.isImageContentType(it.contentType) || /\.(jpe?g|png|webp|avif|gif)$/i.test(it.key))
        .filter(it => !it.key.startsWith('static/'))
        .map(it => ({
          key: it.key,
          size: it.size,
          uploaded: it.uploaded,
          contentType: it.contentType,
          in_use: usedMap.has(it.key),
          used_by: usedMap.get(it.key) || [],
        }))
        .sort((a, b) => (b.uploaded || '').localeCompare(a.uploaded || ''));
      return jsonResponse({ images });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al listar' }, 500);
    }
  }

  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      const files = formData.getAll('images');
      const uploaded = [];
      const errors = [];
      for (const f of files) {
        if (!f || typeof f.size === 'undefined' || f.size === 0) continue;
        try {
          const key = await IMAGE.processGallery(f);
          uploaded.push(key);
        } catch (e) {
          errors.push(e.message);
        }
      }
      return jsonResponse({ uploaded: uploaded.length, keys: uploaded, errors });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al subir' }, 500);
    }
  }

  if (request.method === 'DELETE') {
    try {
      const url = new URL(request.url);
      const key = url.searchParams.get('key');
      if (!key) return jsonResponse({ error: 'Falta el parámetro key' }, 400);
      // Whitelist positiva: solo se pueden borrar claves bajo gallery/ o molipa/
      if (!key.startsWith('gallery/') && !key.startsWith('molipa/')) {
        return jsonResponse({ error: 'Solo se pueden borrar imágenes de la galería o de productos' }, 400);
      }
      // Rechazar path traversal
      if (key.includes('..')) {
        return jsonResponse({ error: 'Clave inválida' }, 400);
      }
      // No eliminar imágenes que todavía referencia algún producto
      DB.setEnv(env);
      const inUse = await DB.get(
        "SELECT pi.id FROM product_images pi WHERE pi.original_path = ? OR pi.medium_path = ? OR pi.thumbnail_path = ? LIMIT 1",
        [key, key, key]
      );
      if (inUse) {
        return jsonResponse({ error: 'Esta imagen está en uso. Quitala de los productos antes de eliminarla.' }, 400);
      }
      // Verificar que el objeto exista antes de intentar borrarlo
      if (!(await STORAGE.exists(key))) {
        return jsonResponse({ error: 'La imagen no existe en el almacenamiento' }, 404);
      }
      await STORAGE.delete(key);
      return jsonResponse({ success: true });
    } catch (e) {
      return jsonResponse({ error: e.message || 'Error al eliminar' }, 500);
    }
  }

  return jsonResponse({ error: 'Método no permitido' }, 405);
}

// ===== Página picker (se incrusta como modal dentro del form de producto) =====
// Returna el HTML del modal + script. Lo usa routes/admin/products.js.
export function galleryPickerHTML() {
  return `
    <!-- Gallery picker modal (dentro del form de producto) -->
    <div id="gallery-picker" class="fixed inset-0 z-[90] hidden">
      <div class="absolute inset-0 bg-black/50" onclick="closeGalleryPicker()"></div>
      <div class="absolute inset-0 flex items-start justify-center p-4 pt-10 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
          <div class="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Elegir imagen de la galería</h3>
              <p class="text-xs text-gray-500" id="picker-context"></p>
            </div>
            <button onclick="closeGalleryPicker()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-5 overflow-y-auto">
            <div id="picker-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div class="col-span-full text-center py-10 text-gray-400 text-sm">Cargando galería…</div>
            </div>
            <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span id="picker-count">0 seleccionada(s)</span>
              <button onclick="confirmGalleryPicker()" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50" id="picker-confirm" disabled>Seleccionar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      // ====== Galería picker (para elegir imágenes existentes en productos) ======
      let pickerMode = 'gallery'; // 'main' | 'gallery'
      let pickerSelected = new Set();
      let pickerImages = [];

      async function openGalleryPicker(mode) {
        pickerMode = mode;
        pickerSelected = new Set();
        document.getElementById('picker-context').textContent = mode === 'main'
          ? 'Elegí una imagen como principal. Reemplaza a la actual.'
          : 'Elegí una o más imágenes para agregar a la galería del producto.';
        document.getElementById('picker-count').textContent = '0 seleccionada(s)';
        document.getElementById('picker-confirm').disabled = true;
        document.getElementById('gallery-picker').classList.remove('hidden');
        try {
          const res = await fetch('/admin/api/galeria');
          if (res.status === 401) { window.location.href = '/admin/login'; return; }
          const data = await res.json();
          pickerImages = data.images || [];
          renderPicker();
        } catch (e) {
          document.getElementById('picker-grid').innerHTML = '<div class="col-span-full text-center text-red-600 text-sm py-8">Error al cargar la galería.</div>';
        }
      }

      function closeGalleryPicker() {
        document.getElementById('gallery-picker').classList.add('hidden');
      }

      function renderPicker() {
        const grid = document.getElementById('picker-grid');
        if (pickerImages.length === 0) {
          grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400 text-sm">No hay imágenes en la galería. Subí alguna desde <a href="/admin/galeria" class="text-primary-600 underline">la página Galeria</a> primero.</div>';
          return;
        }
        const single = pickerMode === 'main';
        grid.innerHTML = pickerImages.map(img => {
          const checked = pickerSelected.has(img.key);
          return \`
            <div class="relative cursor-pointer group" onclick="togglePickerImage(\${escapeJs(img.key)}, this)">
              <div class="aspect-square rounded-lg overflow-hidden border-2 transition-all \${checked ? 'border-primary-600 ring-2 ring-primary-200' : 'border-transparent hover:border-primary-300'}">
                <img src="/media/\${encodeURIComponent(img.key)}" alt="" loading="lazy" class="w-full h-full object-cover">
              </div>
              \${img.in_use ? '<div class="absolute bottom-1 left-1 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">En uso</div>' : ''}
              <div class="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all \${checked ? 'bg-primary-600 text-white' : 'bg-black/40 text-transparent group-hover:text-white/80'}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </div>
            </div>
          \`;
        }).join('');
      }

      function togglePickerImage(key, el) {
        if (pickerMode === 'main') {
          // Single selection
          pickerSelected = new Set([key]);
        } else {
          if (pickerSelected.has(key)) pickerSelected.delete(key);
          else pickerSelected.add(key);
        }
        document.getElementById('picker-count').textContent = pickerSelected.size + ' seleccionada(s)';
        document.getElementById('picker-confirm').disabled = pickerSelected.size === 0;
        renderPicker();
      }

      function confirmGalleryPicker() {
        const keys = Array.from(pickerSelected);
        if (keys.length === 0) return;
        if (pickerMode === 'main') {
          // Setear imagen principal: actualiza el preview y un hidden input
          const key = keys[0];
          setMainImageFromGallery(key);
        } else {
          // Agregar a la galería del producto (visual + hidden input)
          appendGalleryFromPicker(keys);
        }
        closeGalleryPicker();
      }

      function jsStr(s) {
        return JSON.stringify(String(s == null ? '' : s));
      }
      function escapeJs(s) { return jsStr(s); }
    </script>
  `;
}
