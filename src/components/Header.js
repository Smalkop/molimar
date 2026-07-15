export function Header({ settings, currentPath }) {
  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/productos', label: 'Productos' },
    { href: '/sucursales', label: 'Sucursales' },
    { href: '/calidad', label: 'Calidad' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return `
    <header class="fixed top-0 left-0 right-0 z-40 bg-white/80 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <a href="/">
            <img src="/images/logo.png" alt="Molipar S.A." class="header-logo h-12 w-auto transition-all duration-300">
          </a>

          <nav class="hidden lg:flex items-center space-x-8">
            ${navLinks.map(link => `
              <a href="${link.href}"
                 class="link-underline text-sm font-medium ${currentPath === link.href ? 'text-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600'} transition-colors">
                ${link.label}
              </a>
            `).join('')}
          </nav>

          <button id="menu-toggle" class="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Abrir menú">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div id="menu-overlay" class="hidden fixed inset-0 bg-black/50 z-40 lg:hidden" aria-hidden="true"></div>

    <nav id="mobile-menu" class="hidden fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl lg:hidden flex-col" style="animation: slideInRight 0.3s ease-out">
      <div class="flex items-center justify-between p-4 border-b">
        <span class="text-lg font-bold text-primary-700">Menú</span>
        <button id="menu-close" class="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors" onclick="document.getElementById('menu-toggle').click()" aria-label="Cerrar menú">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="flex flex-col p-4 space-y-2">
        ${navLinks.map((link, i) => `
          <a href="${link.href}"
             class="px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentPath === link.href ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'}"
             style="animation: fadeInRight 0.3s ease-out ${i * 0.1}s both">
            ${link.label}
          </a>
        `).join('')}
      </div>
    </nav>
  `;
}
