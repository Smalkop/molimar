import { Layout } from '../../components/Layout.js';
import { htmlResponse, imgUrl, normalizeWhatsApp } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleHome(env, settings) {
  DB.setEnv(env);

  const allProducts = await DB.query(`
    SELECT p.*, pt.name as type_name, pt.slug as type_slug
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    WHERE p.status = 'active'
    ORDER BY p.sort_order, p.name
  `);

  const harinas = allProducts.filter(p => p.type_slug === 'harinas');
  const fideos = allProducts.filter(p => p.type_slug === 'fideos');

  function productCards(list) {
    return list.length > 0 ? list.map((product, i) => `
      <div class="product-card bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 card-hover" style="will-change: transform, opacity; transition-delay: ${i * 0.05}s">
        <div class="relative h-64 overflow-hidden">
          <img src="${imgUrl(product.main_image)}" alt="${product.name}" class="card-image w-full h-full object-cover" loading="lazy">
          <span class="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">${product.type_name}</span>
        </div>
        <div class="p-6">
          <h3 class="font-semibold text-gray-900 text-xl mb-2">${product.name}</h3>
          <p class="text-gray-600 text-sm leading-relaxed mb-5">${product.short_description || ''}</p>
          <div class="flex items-center justify-between">
            <a href="/productos/${product.slug}" class="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">Ver más</a>
            <a href="https://wa.me/${normalizeWhatsApp(settings.whatsapp) || '595986288006'}?text=${encodeURIComponent('Hola, quiero información sobre ' + product.name)}" target="_blank"
               class="text-green-600 hover:text-green-700 transition-colors" aria-label="WhatsApp">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </div>
    `).join('') : `
      <div class="col-span-full text-center py-12 text-gray-500">
        <p>Próximamente nuevos productos</p>
      </div>
    `;
  }

  function grid(type, list, extraClass) {
    return `
      <div class="product-grid ${extraClass || ''} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10" data-type="${type}" style="will-change: transform, opacity;">
        ${productCards(list)}
      </div>
    `;
  }

  const content = `
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900">
      <div class="absolute inset-0">
        <div class="hero-zoom absolute inset-0 bg-[url('/images/hero-bg.webp')] bg-cover bg-center"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div class="max-w-3xl">
          <h1 class="hero-title text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            ${settings.hero_title || 'La calidad del trigo,<br>el sabor de siempre'}
          </h1>
          <p class="hero-subtitle text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
            ${settings.hero_subtitle || 'Producimos harinas y fideos con los más altos estándares de calidad.'}
          </p>
          <div class="hero-cta flex flex-col sm:flex-row gap-4">
            <a href="/productos" class="btn-primary inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg">
              ${settings.hero_cta_text || 'Conocé nuestros productos'}
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            <a href="/contacto" class="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 hover:border-white/50 text-white font-semibold rounded-lg transition-all hover:bg-white/10">
              Contactanos
            </a>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>

    <!-- Presentación -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="animate-on-scroll">
            <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Sobre Nosotros</span>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">Tradición que se transforma en calidad</h2>
            <p class="text-gray-600 leading-relaxed mb-6">${settings.company_description || ''}</p>
            <p class="text-gray-600 leading-relaxed mb-8">${settings.company_history ? settings.company_history.substring(0, 300) + '...' : ''}</p>
            <a href="/nosotros" class="btn-primary inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group">
              Conocé más
              <svg class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>
          <div class="animate-scale-in relative">
            <div class="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden shadow-2xl">
              <img src="/images/about-preview.webp" alt="Molipar S.A." class="w-full h-full object-cover card-image" loading="lazy">
            </div>
            <div class="absolute -bottom-6 -left-6 bg-primary-600 text-white p-8 rounded-2xl shadow-xl hidden lg:block">
              <p class="text-4xl font-bold">+50</p>
              <p class="text-sm opacity-90">Años de experiencia</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Productos Destacados / Catálogo Interactivo -->
    <style>
      .product-grid { transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s cubic-bezier(0.25, 1, 0.5, 1); will-change: transform, opacity; }
      .product-grid.exit-left { transform: translateX(-100%); opacity: 0; }
      .product-grid.enter-right { transform: translateX(100%); opacity: 0; }
      .product-grid.active { transform: translateX(0); opacity: 1; }
      .product-card { will-change: transform, opacity; }
      .tab-indicator { transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
      .tab-btn { transition: color 0.3s ease; }
    </style>

    <section id="productos-catalogo" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 animate-on-scroll">
          <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Productos</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Nuestros Productos</h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto">Descubrí nuestra línea completa de harinas y fideos elaborados con los más altos estándares de calidad.</p>
        </div>

        <div class="flex justify-center mb-12">
          <div class="relative inline-flex bg-gray-200 rounded-xl p-1">
            <div class="tab-indicator absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary-600 rounded-lg"></div>
            <button class="tab-btn relative z-10 px-8 py-3 text-sm font-semibold rounded-lg text-white" data-tab="harinas">Harinas</button>
            <button class="tab-btn relative z-10 px-8 py-3 text-sm font-semibold rounded-lg text-gray-600" data-tab="fideos">Fideos</button>
          </div>
        </div>

        <div class="product-catalog-container relative overflow-hidden" style="min-height: 420px;">
          <div class="product-grid active" data-type="harinas">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              ${productCards(harinas)}
            </div>
          </div>

          <div class="product-grid enter-right absolute inset-0" data-type="fideos" style="pointer-events: none;">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              ${productCards(fideos)}
            </div>
          </div>

          <div class="product-grid hidden" data-type="harinas-secondary">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              ${productCards(harinas)}
            </div>
          </div>

          <div class="product-grid hidden" data-type="fideos-secondary">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              ${productCards(fideos)}
            </div>
          </div>
        </div>

        <div class="text-center mt-12 animate-on-scroll">
          <a href="/productos" class="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-all">
            Ver todos los productos
            <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </div>
    </section>

    <script>
    (function(){
      const section = document.getElementById('productos-catalogo');
      if (!section) return;
      const tabs = section.querySelectorAll('.tab-btn');
      const indicator = section.querySelector('.tab-indicator');
      const grids = {
        primary: section.querySelector('.product-grid[data-type="harinas"]'),
        secondary: section.querySelector('.product-grid[data-type="fideos"]'),
        primaryExtra: section.querySelector('.product-grid[data-type="harinas-secondary"]'),
        secondaryExtra: section.querySelector('.product-grid[data-type="fideos-secondary"]'),
      };
      const container = section.querySelector('.product-catalog-container');
      let activeTab = 'harinas';

      function moveIndicator(btn) {
        const parent = btn.parentElement;
        const pRect = parent.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        const offset = bRect.left - pRect.left;
        indicator.style.transform = 'translateX(' + offset + 'px)';
        indicator.style.width = bRect.width + 'px';
      }

      function setActiveTab(tab) {
        if (tab === activeTab) return;
        const isHarinas = tab === 'harinas';

        const outGrid = isHarinas ? grids.secondary : grids.primary;
        const inGrid = isHarinas ? grids.primary : grids.secondary;
        const outSecondary = isHarinas ? grids.secondaryExtra : grids.primaryExtra;
        const inSecondary = isHarinas ? grids.primaryExtra : grids.secondaryExtra;

        const prevTab = activeTab;
        activeTab = tab;

        [outGrid, outSecondary].forEach(g => {
          if (g) { g.classList.remove('active', 'enter-right'); g.classList.add('exit-left');
            setTimeout(() => { g.style.display = 'none'; g.classList.remove('exit-left'); }, 400); }
        });

        [inGrid, inSecondary].forEach((g, i) => {
          if (!g) return;
          g.style.display = '';
          g.classList.remove('active', 'exit-left');
          g.classList.add('enter-right');
          g.style.pointerEvents = 'none';
          setTimeout(() => {
            g.classList.remove('enter-right');
            g.classList.add('active');
            g.style.pointerEvents = '';
            if (i === 1) {
              setTimeout(() => {
                g.style.position = '';
                g.style.inset = '';
              }, 100);
            }
          }, 50);
        });

        tabs.forEach(btn => {
          const isActive = btn.dataset.tab === tab;
          btn.classList.toggle('text-white', isActive);
          btn.classList.toggle('text-gray-600', !isActive);
        });

        const activeBtn = section.querySelector('.tab-btn[data-tab="' + tab + '"]');
        if (activeBtn) moveIndicator(activeBtn);

        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      tabs.forEach(btn => {
        btn.addEventListener('click', function() {
          setActiveTab(this.dataset.tab);
        });
      });

      const firstTab = section.querySelector('.tab-btn[data-tab="harinas"]');
      if (firstTab) {
        setTimeout(function() {
          moveIndicator(firstTab);
          firstTab.classList.add('text-white');
          section.querySelector('.tab-btn[data-tab="fideos"]').classList.add('text-gray-600');
        }, 100);
      }

      [grids.primaryExtra, grids.secondaryExtra].forEach(g => {
        if (g) g.style.display = 'none';
      });
    })();
    </script>

    <!-- Beneficios -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 animate-on-scroll">
          <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Beneficios</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">¿Por qué elegir Molipar?</h2>
        </div>

        <div class="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${[
            { icon: 'award', title: 'Calidad Superior', desc: 'Controles rigurosos en cada etapa del proceso productivo.' },
            { icon: 'truck', title: 'Distribución Eficiente', desc: 'Logística propia que garantiza entregas puntuales en todo el país.' },
            { icon: 'star', title: 'Materia Prima Seleccionada', desc: 'Solo los mejores granos de trigo de la región.' },
            { icon: 'shield', title: 'Certificaciones', desc: 'Procesos certificados que avalan nuestra calidad e inocuidad.' },
          ].map(benefit => `
            <div class="card-hover text-center p-8 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100">
              <div class="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-2xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                ${benefit.icon === 'award' ? '<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' : ''}
                ${benefit.icon === 'truck' ? '<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m12 0V6a1 1 0 00-1-1h-2.161M21 14v3a1 1 0 01-1 1h-3m-6 0h6m-6 0a2 2 0 11-4 0m4 0a2 2 0 104 0"/></svg>' : ''}
                ${benefit.icon === 'star' ? '<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>' : ''}
                ${benefit.icon === 'shield' ? '<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>' : ''}
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">${benefit.title}</h3>
              <p class="text-gray-600 text-sm leading-relaxed">${benefit.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-gradient-to-r from-primary-800 to-primary-700 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="animate-on-scroll">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para trabajar con nosotros?</h2>
          <p class="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">Contactanos para conocer más sobre nuestros productos y cómo podemos ayudarte a hacer crecer tu negocio.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contacto" class="btn-primary inline-flex items-center px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 font-semibold rounded-lg shadow-lg">
              Contactanos
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            <a href="https://wa.me/${normalizeWhatsApp(settings.whatsapp) || '595986288006'}" target="_blank"
               class="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Inicio',
    description: settings.company_description || '',
    settings,
    currentPath: '/',
  }));
}
