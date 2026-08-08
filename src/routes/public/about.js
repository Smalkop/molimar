import { Layout } from '../../components/Layout.js';
import { htmlResponse, parseJsonField, escapeHtml } from '../../utils/html.js';

export async function handleAbout(env, settings) {
  const values = parseJsonField(settings.company_values, []);

  const content = `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-primary-400 font-semibold text-sm tracking-wider uppercase animate-on-scroll">Nosotros</span>
        <h1 class="text-4xl md:text-5xl font-bold text-white mt-4 mb-6 animate-on-scroll">Nuestra Historia</h1>
        <p class="text-gray-300 text-lg max-w-3xl mx-auto animate-on-scroll">Conocé más sobre Molipar, nuestra trayectoria y el compromiso que nos impulsa a seguir creciendo.</p>
      </div>
    </section>

    <!-- Historia -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="animate-fade-left">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Nuestra Trayectoria</h2>
            <div class="prose prose-lg text-gray-600 leading-relaxed">
              <p>${escapeHtml(settings.company_history || '')}</p>
            </div>
          </div>
          <div class="animate-fade-right relative">
            <div class="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-xl">
              <img src="/images/about-trayectoria.webp" alt="Historia Molipar" class="w-full h-full object-cover card-image" loading="lazy">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Misión Visión Valores -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 animate-on-scroll">
          <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Identidad</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Nuestra Esencia</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div class="animate-scale-in card-hover bg-white p-10 rounded-2xl shadow-md border-t-4 border-primary-500">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Misión</h3>
            <p class="text-gray-600 leading-relaxed">${escapeHtml(settings.company_mission || '')}</p>
          </div>
          <div class="animate-scale-in card-hover bg-white p-10 rounded-2xl shadow-md border-t-4 border-secondary-500" style="transition-delay:0.1s">
            <div class="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Visión</h3>
            <p class="text-gray-600 leading-relaxed">${escapeHtml(settings.company_vision || '')}</p>
          </div>
          <div class="animate-scale-in card-hover bg-white p-10 rounded-2xl shadow-md border-t-4 border-amber-500" style="transition-delay:0.2s">
            <div class="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Valores</h3>
            <p class="text-gray-600 leading-relaxed">Integridad, calidad, innovación y compromiso con nuestros clientes y la comunidad.</p>
          </div>
        </div>

        <!-- Valores detallados -->
        ${values.length > 0 ? `
        <div class="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${values.map(v => `
            <div class="card-hover bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div class="text-3xl mb-3">${v.icon === 'quality' ? '🏆' : v.icon === 'innovation' ? '💡' : v.icon === 'tradition' ? '🌾' : '🤝'}</div>
              <h4 class="font-semibold text-gray-900 mb-2">${escapeHtml(v.title || '')}</h4>
              <p class="text-gray-600 text-sm">${escapeHtml(v.description || '')}</p>
            </div>
          `).join('')}
        </div>` : ''}
      </div>
    </section>

    `;

  return htmlResponse(Layout({
    children: content,
    title: 'Nosotros',
    description: 'Conocé nuestra historia, misión, visión y valores. Molipar S.A. - Tradición en harinas y fideos.',
    settings,
    currentPath: '/nosotros',
    siteUrl: env.SITE_URL || 'https://molipar.com',
  }));
}
