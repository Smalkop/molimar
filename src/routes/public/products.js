import { Layout } from '../../components/Layout.js';
import { htmlResponse, escapeHtml, imgUrl, normalizeWhatsApp } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleProducts(env, settings) {
  DB.setEnv(env);

  const productTypes = await DB.query('SELECT * FROM product_types ORDER BY sort_order');
  const categories = await DB.query('SELECT * FROM categories ORDER BY sort_order');
  const products = await DB.query(`
    SELECT p.*, pt.name as type_name, pt.slug as type_slug,
           c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active'
    ORDER BY p.product_type_id, p.sort_order, p.name
  `);

  const types = await DB.query(`
    SELECT pt.*, COUNT(p.id) as product_count
    FROM product_types pt
    LEFT JOIN products p ON p.product_type_id = pt.id AND p.status = 'active'
    GROUP BY pt.id
    ORDER BY pt.sort_order
  `);

  const groupByType = {};
  for (const pt of types) {
    groupByType[pt.id] = { ...pt, products: [] };
  }
  for (const p of products) {
    if (groupByType[p.product_type_id]) {
      groupByType[p.product_type_id].products.push(p);
    }
  }

  const content = `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-primary-400 font-semibold text-sm tracking-wider uppercase animate-on-scroll">Productos</span>
        <h1 class="text-4xl md:text-5xl font-bold text-white mt-4 mb-6 animate-on-scroll">Nuestros Productos</h1>
        <p class="text-gray-300 text-lg max-w-3xl mx-auto animate-on-scroll">Harinas y fideos de la más alta calidad para profesionales y hogares.</p>
      </div>
    </section>

    <!-- Productos por tipo -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${Object.values(groupByType).map(type => `
          <div class="mb-20 last:mb-0">
            <div class="flex items-center justify-between mb-10 animate-on-scroll">
              <div>
                <h2 class="text-3xl font-bold text-gray-900">${escapeHtml(type.name)}</h2>
                <p class="text-gray-600 mt-2">${escapeHtml(type.description || '')}</p>
              </div>
              <span class="hidden sm:block px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">${type.product_count} productos</span>
            </div>

            <div class="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              ${type.products.length > 0 ? type.products.map(product => `
                <div class="card-hover bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 group">
                  <div class="relative h-56 overflow-hidden bg-gray-100">
                    <img src="${imgUrl(product.main_image)}" alt="${escapeHtml(product.name)}" class="card-image w-full h-full object-cover" style="object-position:${product.crop_x || 50}% ${product.crop_y || 50}%" loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <a href="https://wa.me/${normalizeWhatsApp(settings.whatsapp) || '595986288006'}?text=${encodeURIComponent('Hola, quiero información sobre ' + product.name)}"
                         target="_blank"
                         class="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg shadow-lg transition-all">
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Consultar
                      </a>
                    </div>
                  </div>
                  <div class="p-6">
                    <div class="flex items-start justify-between mb-3">
                      <h3 class="font-semibold text-gray-900 text-lg">${escapeHtml(product.name)}</h3>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed mb-4">${escapeHtml(product.short_description || '')}</p>
                    <a href="/productos/${product.slug}" class="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors group/link">
                      Ver detalle
                      <svg class="ml-1 w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </a>
                  </div>
                </div>
              `).join('') : `
                <div class="col-span-full text-center py-16 bg-gray-50 rounded-2xl">
                  <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <p class="text-gray-500 text-lg font-medium">Próximamente nuevos productos</p>
                  <p class="text-gray-400 text-sm mt-2">Estamos trabajando para ofrecerte lo mejor.</p>
                </div>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Productos',
    description: 'Harinas y fideos de la más alta calidad. Conocé nuestra línea completa de productos Molipar.',
    settings,
    currentPath: '/productos',
  }));
}

export async function handleProductDetail(env, settings, slug) {
  DB.setEnv(env);

  const product = await DB.get(`
    SELECT p.*, pt.name as type_name, pt.slug as type_slug
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    WHERE p.slug = ? AND p.status = 'active'
  `, [slug]);

  if (!product) {
    return htmlResponse(Layout({
      children: '<div class="pt-32 pb-20 text-center"><h1 class="text-4xl font-bold text-gray-900 mb-4">Producto no encontrado</h1><a href="/productos" class="text-primary-600 hover:text-primary-700">Volver a productos</a></div>',
      title: 'Producto no encontrado',
      settings,
      currentPath: '/productos',
    }), 404);
  }

  const images = await DB.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
    [product.id]
  );

  const presentations = await DB.query(
    'SELECT * FROM product_presentations WHERE product_id = ? ORDER BY sort_order',
    [product.id]
  );

  const groupedImages = { main: images.filter(i => i.image_type === 'main'), gallery: images.filter(i => i.image_type === 'gallery') };

  const content = `
    <!-- Hero Producto -->
    <section class="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="text-sm text-gray-400 mb-8 animate-on-scroll">
          <a href="/" class="hover:text-white transition-colors">Inicio</a>
          <span class="mx-2">/</span>
          <a href="/productos" class="hover:text-white transition-colors">Productos</a>
          <span class="mx-2">/</span>
          <span class="text-white">${product.name}</span>
        </nav>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="animate-fade-left">
            <span class="text-primary-400 font-semibold text-sm tracking-wider uppercase">${product.type_name}</span>
            <h1 class="text-4xl md:text-5xl font-bold text-white mt-3 mb-6">${product.name}</h1>
            <p class="text-gray-300 text-lg leading-relaxed mb-8">${product.short_description || ''}</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="https://wa.me/${normalizeWhatsApp(settings.whatsapp) || '595986288006'}?text=${encodeURIComponent('Hola, quiero información sobre ' + product.name + ' de Molipar')}"
                 target="_blank"
                 class="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Consultar por WhatsApp
              </a>
              <a href="/productos" class="inline-flex items-center justify-center px-6 py-3 border-2 border-white/30 hover:border-white/50 text-white font-semibold rounded-lg transition-all hover:bg-white/10">
                Ver más productos
              </a>
            </div>
          </div>
          <div class="animate-fade-right">
            <div class="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
              <img src="${imgUrl(product.main_image)}" alt="${product.name}" class="w-full h-full object-cover card-image" style="object-position:${product.crop_x || 50}% ${product.crop_y || 50}%" data-lightbox="${imgUrl(product.main_image)}">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detalle -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div class="lg:col-span-2 animate-on-scroll">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Descripción</h2>
            <div class="prose prose-lg text-gray-600 leading-relaxed max-w-none">
              ${product.full_description || product.short_description || ''}
            </div>

            ${images.length > 1 ? `
            <div class="mt-12">
              <h3 class="text-xl font-bold text-gray-900 mb-6">Galería</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                ${images.filter(i => i.image_type === 'gallery').map(img => `
                  <div class="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden cursor-pointer card-hover">
                    <img src="${imgUrl(img.medium_path || img.original_path)}" alt="${img.alt_text || product.name}"
                         class="w-full h-full object-cover" loading="lazy" data-lightbox="${imgUrl(img.original_path || img.medium_path)}">
                  </div>
                `).join('')}
              </div>
            </div>` : ''}
          </div>

          <div class="animate-fade-right">
            ${presentations.length > 0 ? `
            <div class="bg-gray-50 rounded-2xl p-8 mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-6">Presentaciones</h3>
              <div class="space-y-4">
                ${presentations.map(p => `
                  <div class="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div>
                      <p class="font-medium text-gray-900">${p.name}</p>
                      ${p.weight ? `<p class="text-sm text-gray-500">${p.weight}</p>` : ''}
                    </div>
                    ${p.price ? `<p class="text-lg font-bold text-primary-600">$${p.price.toFixed(2)}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>` : ''}

            ${product.nutritional_info ? `
            <div class="bg-gray-50 rounded-2xl p-8">
              <h3 class="text-xl font-bold text-gray-900 mb-6">Información Nutricional</h3>
              <div class="prose prose-sm text-gray-600">${product.nutritional_info}</div>
            </div>` : ''}

            <div class="mt-8">
              <a href="https://wa.me/${normalizeWhatsApp(settings.whatsapp) || '595986288006'}?text=${encodeURIComponent('Hola, quiero información sobre ' + product.name + ' de Molipar')}"
                 target="_blank"
                 class="flex items-center justify-center w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02]">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Solicitar este producto
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  return htmlResponse(Layout({
    children: content,
    title: product.name,
    description: product.short_description || '',
    image: imgUrl(product.main_image) || undefined,
    settings,
    currentPath: '/productos',
  }));
}
