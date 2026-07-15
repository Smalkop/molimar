import { Layout } from '../../components/Layout.js';
import { htmlResponse } from '../../utils/html.js';

export async function handleQuality(env, settings) {
  const content = `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-primary-400 font-semibold text-sm tracking-wider uppercase animate-on-scroll">Calidad</span>
        <h1 class="text-4xl md:text-5xl font-bold text-white mt-4 mb-6 animate-on-scroll">Compromiso con la Calidad</h1>
        <p class="text-gray-300 text-lg max-w-3xl mx-auto animate-on-scroll">Cada producto que elabora Molipar responde a los más exigentes estándares de calidad e inocuidad alimentaria.</p>
      </div>
    </section>

    <!-- Procesos -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div class="animate-fade-left">
            <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Procesos</span>
            <h2 class="text-3xl font-bold text-gray-900 mt-3 mb-6">Procesos de Fabricación</h2>
            <p class="text-gray-600 leading-relaxed mb-4">Nuestro proceso productivo integra tecnología de punta con prácticas tradicionales de molienda, garantizando la máxima calidad en cada lote.</p>
            <p class="text-gray-600 leading-relaxed">Desde la recepción del trigo hasta el empaque final, cada etapa es monitoreada y controlada para asegurar la trazabilidad y la excelencia del producto.</p>
          </div>
          <div class="animate-fade-right">
            <div class="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-xl">
              <img src="/static/images/quality-process.svg" alt="Procesos de fabricación" class="w-full h-full object-cover card-image" loading="lazy">
            </div>
          </div>
        </div>

        <div class="stagger-children grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div class="card-hover bg-gray-50 p-8 rounded-2xl">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Control de Materia Prima</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Seleccionamos y analizamos cada lote de trigo para garantizar su pureza, humedad y contenido proteico óptimo.</p>
          </div>
          <div class="card-hover bg-gray-50 p-8 rounded-2xl">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Tecnología Aplicada</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Molinos automatizados con sistemas de control digital que permiten ajustar precisamente cada parámetro de molienda.</p>
          </div>
          <div class="card-hover bg-gray-50 p-8 rounded-2xl">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Laboratorio Propio</h3>
            <p class="text-gray-600 text-sm leading-relaxed">Contamos con laboratorio equipado para realizar análisis físicos, químicos y microbiológicos de cada producción.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Certificaciones -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 animate-on-scroll">
          <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Certificaciones</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Avalan nuestra calidad</h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto">Nuestros procesos y productos están certificados por organismos nacionales e internacionales.</p>
        </div>

        <div class="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          ${[
            { title: 'ISO 22000', desc: 'Sistema de Gestión de Inocuidad Alimentaria', icon: '🌐' },
            { title: 'HACCP', desc: 'Análisis de Peligros y Puntos Críticos de Control', icon: '✅' },
            { title: 'Kosher', desc: 'Certificación Kosher para nuestros productos', icon: '✡️' },
            { title: 'BPM', desc: 'Buenas Prácticas de Manufactura', icon: '🏭' },
          ].map(cert => `
            <div class="card-hover bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div class="text-4xl mb-4">${cert.icon}</div>
              <h3 class="text-lg font-bold text-gray-900 mb-3">${cert.title}</h3>
              <p class="text-gray-600 text-sm">${cert.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Controles de Calidad -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16 animate-on-scroll">
          <span class="text-primary-600 font-semibold text-sm tracking-wider uppercase">Control</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Controles de Calidad</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          ${[
            { title: 'Análisis Físico', items: ['Granulometría', 'Humedad', 'Cenizas', 'Color', 'Gluten'] },
            { title: 'Análisis Químico', items: ['Proteína', 'Fibra', 'Carbohidratos', 'Grasas', 'Vitaminas'] },
            { title: 'Análisis Microbiológico', items: ['Recuento de bacterias', 'Hongos y levaduras', 'Salmonella', 'E. coli', 'Aflatoxinas'] },
            { title: 'Análisis Sensorial', items: ['Sabor', 'Aroma', 'Textura', 'Apariencia', 'Color'] },
          ].map(control => `
            <div class="animate-scale-in card-hover bg-gray-50 p-8 rounded-2xl">
              <h3 class="text-lg font-bold text-gray-900 mb-5">${control.title}</h3>
              <ul class="space-y-3">
                ${control.items.map(item => `
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    ${item}
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Calidad',
    description: 'Compromiso con la calidad, certificaciones y controles en la producción de harinas y fideos Molipar.',
    settings,
    currentPath: '/calidad',
  }));
}
