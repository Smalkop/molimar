import { Layout } from '../../components/Layout.js';
import { htmlResponse } from '../../utils/html.js';

const branches = [
  {
    name: 'Planta Central',
    location: 'Dr. Juan Eulogio Estigarribia',
    address: 'Ruta Py 02 Km 213, Campo 9',
    phone: '+595 986 288006',
    map: 'https://maps.app.goo.gl/ncibsNiTsyne2TpP6',
    isMain: true,
  },
  {
    name: 'Fernando de la Mora',
    location: 'Fernando de la Mora',
    address: 'Bernardino Caballero, Calle Fortín Toledo',
    phone: '+595 986 206 138',
    map: 'https://maps.app.goo.gl/Ee8is8UwrSc7JuCY9',
  },
  {
    name: 'Santa Rosa del Aguaray',
    location: 'Santa Rosa del Aguaray',
    address: 'Ruta Py 11 Stela Maris',
    phone: '+595 986 552 999',
    map: 'https://maps.app.goo.gl/8Jw5t2ZYvFEo3VzL9',
  },
  {
    name: 'Concepción',
    location: 'Concepción',
    address: 'Ruta Py 22 Barrio Oga Renda',
    phone: '+595 981 699 947',
    map: 'https://maps.app.goo.gl/BVHJPuhTDEBpknok8',
  },
  {
    name: 'Pedro Juan Caballero',
    location: 'Pedro Juan Caballero',
    address: 'Gral. Diaz Calle Elisa Alicia Lynch',
    phone: '+595 985 470 060 / +595 972 413 939',
    map: 'https://maps.app.goo.gl/1doApqDaZkmQnQhNA',
  },
];

function phoneLink(phone) {
  const digits = phone.replace(/\D/g, '');
  return `tel:+${digits}`;
}

function phoneWhatsApp(phone) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

export async function handleBranches(env, settings) {
  const content = `
    <section class="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-primary-400 font-semibold text-sm tracking-wider uppercase animate-on-scroll">Sucursales</span>
        <h1 class="text-4xl md:text-5xl font-bold text-white mt-4 mb-6 animate-on-scroll">Nuestras Sucursales</h1>
        <p class="text-gray-300 text-lg max-w-3xl mx-auto animate-on-scroll">Estamos presentes en los principales puntos del Paraguay para brindarte atención cercana y distribución eficiente.</p>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="stagger-children grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${branches.map(b => `
            <div class="card-hover bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden ${b.isMain ? 'lg:col-span-2 lg:row-span-1' : ''}">
              ${b.isMain ? `
              <div class="bg-primary-600 text-white text-center text-xs font-semibold uppercase tracking-wider py-2">Planta Central</div>
              ` : ''}
              <div class="p-6">
                <div class="flex items-start space-x-4 mb-4">
                  <div class="w-12 h-12 ${b.isMain ? 'bg-primary-100' : 'bg-gray-100'} rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6 ${b.isMain ? 'text-primary-600' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">${b.name}</h3>
                    <p class="text-sm text-gray-500">${b.location}</p>
                  </div>
                </div>

                <p class="text-gray-600 text-sm mb-4 pl-16">${b.address}</p>

                <div class="flex flex-wrap gap-3 pl-16">
                  <a href="${b.map}" target="_blank" rel="noopener noreferrer"
                     class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Cómo llegar
                  </a>
                  <a href="${phoneLink(b.phone)}"
                     class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Llamar
                  </a>
                  <a href="${phoneWhatsApp(b.phone)}" target="_blank" rel="noopener noreferrer"
                     class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Sucursales',
    description: 'Conocé todas las sucursales de Molipar en Paraguay. Planta Central y puntos de venta con atención personalizada.',
    settings,
    currentPath: '/sucursales',
  }));
}
