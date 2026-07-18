import { Layout } from '../../components/Layout.js';
import { htmlResponse, parseJsonField } from '../../utils/html.js';

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
              <p>${settings.company_history || ''}</p>
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
            <p class="text-gray-600 leading-relaxed">${settings.company_mission || ''}</p>
          </div>
          <div class="animate-scale-in card-hover bg-white p-10 rounded-2xl shadow-md border-t-4 border-secondary-500" style="transition-delay:0.1s">
            <div class="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Visión</h3>
            <p class="text-gray-600 leading-relaxed">${settings.company_vision || ''}</p>
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
              <h4 class="font-semibold text-gray-900 mb-2">${v.title}</h4>
              <p class="text-gray-600 text-sm">${v.description}</p>
            </div>
          `).join('')}
        </div>` : ''}
      </div>
    </section>

    <!-- Proceso de Producción -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 animate-on-scroll">
          <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Proceso</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Proceso de Producción</h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto">Cada paso es cuidadosamente controlado para garantizar la mejor calidad.</p>
        </div>

        <div class="relative">
          <div class="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 -translate-x-1/2"></div>
          ${[
            { step: '01', title: 'Selección del Trigo', desc: 'Seleccionamos los mejores granos de trigo de productores locales certificados.', icon: '🌾' },
            { step: '02', title: 'Limpieza y Acondicionamiento', desc: 'El trigo pasa por procesos de limpieza y acondicionamiento para eliminar impurezas.', icon: '🧹' },
            { step: '03', title: 'Molienda', desc: 'Utilizamos molinos de última generación que preservan las propiedades del grano.', icon: '⚙️' },
            { step: '04', title: 'Tamizado y Clasificación', desc: 'La harina se tamiza y clasifica según su granulometría y calidad.', icon: '🔬' },
            { step: '05', title: 'Control de Calidad', desc: 'Cada lote es analizado en nuestro laboratorio para garantizar su pureza y calidad.', icon: '✅' },
            { step: '06', title: 'Empaque y Distribución', desc: 'Empacado en condiciones óptimas y distribuido a todo el país.', icon: '📦' },
          ].map((item, i) => `
            <div class="relative flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center mb-12 lg:mb-16 animate-on-scroll">
              <div class="flex-1 ${i % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'}">
                <span class="text-primary-600 font-bold text-sm">Paso ${item.step}</span>
                <h3 class="text-xl font-bold text-gray-900 mt-1 mb-3">${item.title}</h3>
                <p class="text-gray-600 leading-relaxed">${item.desc}</p>
              </div>
              <div class="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl shadow-lg my-4 lg:my-0 shrink-0">
                ${item.icon}
              </div>
              <div class="flex-1 ${i % 2 === 0 ? 'lg:pl-12' : 'lg:pr-12'} hidden lg:block"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Nosotros',
    description: 'Conocé nuestra historia, misión, visión y valores. Molipar S.A. - Tradición en harinas y fideos.',
    settings,
    currentPath: '/nosotros',
  }));
}
