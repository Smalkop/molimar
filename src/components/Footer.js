export function Footer({ settings }) {
  const socialLinks = [
    { key: 'facebook', label: 'Facebook', icon: 'facebook' },
    { key: 'instagram', label: 'Instagram', icon: 'instagram' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    { key: 'youtube', label: 'YouTube', icon: 'youtube' },
  ];

  const socialIcons = {
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    youtube: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>',
  };

  return `
    <footer class="bg-gray-900 text-gray-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div class="animate-on-scroll">
            <div class="mb-6">
              <img src="/images/logo.png" alt="Molipar S.A." class="h-10 w-auto">
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">${settings.company_description || 'Producción y comercialización de harinas y fideos de la más alta calidad.'}</p>
          </div>

          <div class="animate-on-scroll">
            <h3 class="text-white font-semibold text-lg mb-4">Enlaces</h3>
            <ul class="space-y-3">
              <li><a href="/" class="text-gray-400 hover:text-white text-sm transition-colors">Inicio</a></li>
              <li><a href="/nosotros" class="text-gray-400 hover:text-white text-sm transition-colors">Nosotros</a></li>
              <li><a href="/productos" class="text-gray-400 hover:text-white text-sm transition-colors">Productos</a></li>
              <li><a href="/sucursales" class="text-gray-400 hover:text-white text-sm transition-colors">Sucursales</a></li>
              <li><a href="/venta-directa" class="text-gray-400 hover:text-white text-sm transition-colors">Venta Directa</a></li>
              <li><a href="/calidad" class="text-gray-400 hover:text-white text-sm transition-colors">Calidad</a></li>
              <li><a href="/contacto" class="text-gray-400 hover:text-white text-sm transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div class="animate-on-scroll">
            <h3 class="text-white font-semibold text-lg mb-4">Contacto</h3>
            <ul class="space-y-3 text-sm">
              ${settings.address ? `<li class="flex items-start space-x-3"><svg class="w-5 h-5 text-primary-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>${settings.address}</span></li>` : ''}
              ${settings.phone ? `<li class="flex items-center space-x-3"><svg class="w-5 h-5 text-primary-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><a href="tel:${settings.phone}" class="hover:text-white transition-colors">${settings.phone}</a></li>` : ''}
              ${settings.email ? `<li class="flex items-center space-x-3"><svg class="w-5 h-5 text-primary-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><a href="mailto:${settings.email}" class="hover:text-white transition-colors">${settings.email}</a></li>` : ''}
            </ul>
          </div>

          <div class="animate-on-scroll">
            <h3 class="text-white font-semibold text-lg mb-4">Síguenos</h3>
            <div class="flex space-x-4">
              ${socialLinks.map(social => {
                if (!settings[social.key]) return '';
                return `
                  <a href="${settings[social.key]}" target="_blank" rel="noopener noreferrer"
                     class="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-all hover:scale-110" aria-label="${social.label}">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">${socialIcons[social.icon]}</svg>
                  </a>
                `;
              }).join('')}
            </div>
            ${settings.schedule ? `<p class="text-xs text-gray-500 mt-6 leading-relaxed">${settings.schedule}</p>` : ''}
          </div>
        </div>
      </div>

      <div class="border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p class="text-sm text-gray-500">&copy; ${new Date().getFullYear()} Molipar S.A. Todos los derechos reservados.</p>
            <p class="text-sm text-gray-500">
              Desarrollado por
              <a href="https://brahian.dev" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:text-primary-300 font-medium transition-colors">Brahian González</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  `;
}
