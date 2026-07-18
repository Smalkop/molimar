import { Layout } from '../../components/Layout.js';
import { htmlResponse } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleDirectSales(env, settings) {
  DB.setEnv(env);

  const salesRegions = await DB.query('SELECT * FROM sales_regions ORDER BY sort_order');
  const content = `
    <section class="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-primary-400 font-semibold text-sm tracking-wider uppercase animate-on-scroll">Venta Directa</span>
        <h1 class="text-4xl md:text-5xl font-bold text-white mt-4 mb-6 animate-on-scroll">Venta Directa</h1>
        <p class="text-gray-300 text-lg max-w-3xl mx-auto animate-on-scroll">Contactá directamente con nuestro equipo de ventas según tu zona. Te asesoramos y coordinamos la entrega sin intermediarios.</p>
      </div>
    </section>

    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 animate-on-scroll">
          <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Zonas</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Regiones de Cobertura</h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto">Seleccioná tu zona y contactá con el vendedor asignado para atención personalizada.</p>
        </div>

        <div class="stagger-children grid grid-cols-1 lg:grid-cols-2 gap-8">
          ${salesRegions.map(r => { const locs = JSON.parse(r.localities || '[]'); return `
            <div class="card-hover bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div class="bg-primary-600 p-5">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold text-white">${r.title}</h3>
                  <svg class="w-6 h-6 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center space-x-3 mb-5 p-3 bg-green-50 rounded-xl">
                  <svg class="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Vendedor:</span>
                  <a href="https://wa.me/${r.phone.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer"
                     class="text-green-700 hover:text-green-800 font-semibold text-sm ml-auto transition-colors">
                    ${r.phone}
                  </a>
                </div>
                <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Localidades</h4>
                <ul class="space-y-2">
                  ${locs.map(l => `
                    <li class="flex items-start text-sm text-gray-600">
                      <svg class="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      ${l}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    </section>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Venta Directa',
    description: 'Venta directa de harinas Molipar. Contactá con nuestro equipo de ventas por zona para atención personalizada en todo Paraguay.',
    settings,
    currentPath: '/venta-directa',
  }));
}
