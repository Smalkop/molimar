import { htmlResponse, jsonResponse, sanitizeString, imgUrl } from '../../utils/html.js';
import STORAGE from '../../services/storage.js';
import IMAGE from '../../services/image.js';
import DB from '../../services/database.js';

// ===== Página /admin/galeria =====
export async function handleAdminGallery(env, user) {
  STORAGE.setR2(env.R2);
  const html = await adminLayout(`
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
        return String(s).replace(/&/g,'&').replace(/"/g,'"').replace(/'/g,'&#39;').replace(/</g,'<').replace(/>/g,'>');
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
  `, user);

  return htmlResponse(html);
}

// ===== API /admin/api/galeria =====
// GET    -> { images: [{key, size, uploaded, contentType}] }
// POST   (multipart, campo 'images') -> { uploaded: n, skipped: m }
// DELETE (?key=...)  -> { success: true }
export async function handleAdminGalleryApi(request, env, id) {
  STORAGE.setR2(env.R2);

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
      // Sólo permitimos borrar de gallery/ o molipa/ (no de static/)
      if (key.startsWith('static/')) {
        return jsonResponse({ error: 'No se pueden borrar archivos estáticos desde aquí' }, 400);
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
            <div class="relative cursor-pointer group" onclick="togglePickerImage('\${escapeJs(img.key)}', this)">
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

      function escapeJs(s) {
        return String(s).replace(/'/g, "\\\\'").replace(/"/g, '"');
      }
    </script>
  `;
}

// ===== Layout (duplicado del de products.js + entrada Galería activa) =====
async function adminLayout(content, user) {
  return adminLayoutWithContent(content, user);
}

async function adminLayoutWithContent(content, user) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galería | Admin Molipar</title>
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
        <a href="/admin/productos" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span>Productos</span>
        </a>
        <a href="/admin/galeria" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 border-r-2 border-primary-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span>Galería</span>
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
          <span class="font-bold text-gray-900">Galería</span>
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
