import { htmlResponse } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleDashboard(env, user) {
  DB.setEnv(env);

  const totalProducts = (await DB.get('SELECT COUNT(*) as count FROM products'))?.count || 0;
  const totalHarinas = (await DB.get('SELECT COUNT(*) as count FROM products WHERE product_type_id = 1'))?.count || 0;
  const totalFideos = (await DB.get('SELECT COUNT(*) as count FROM products WHERE product_type_id = 2'))?.count || 0;
  const totalMessages = (await DB.get('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0'))?.count || 0;

  const recentProducts = await DB.query(`
    SELECT p.*, pt.name as type_name
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    ORDER BY p.created_at DESC LIMIT 5
  `);

  const html = await adminLayout(`
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Bienvenido, ${user.name}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${[
          { label: 'Total Productos', value: totalProducts, icon: 'box', color: 'primary' },
          { label: 'Harinas', value: totalHarinas, icon: 'flour', color: 'amber' },
          { label: 'Fideos', value: totalFideos, icon: 'pasta', color: 'green' },
          { label: 'Mensajes Nuevos', value: totalMessages, icon: 'mail', color: 'blue' },
        ].map(card => `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center">
                ${card.icon === 'box' ? '<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>' : ''}
                ${card.icon === 'flour' ? '<svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>' : ''}
                ${card.icon === 'pasta' ? '<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>' : ''}
                ${card.icon === 'mail' ? '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' : ''}
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">${card.value}</p>
            <p class="text-gray-500 text-sm">${card.label}</p>
          </div>
        `).join('')}
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">Últimos Productos</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-left">
              <tr>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${recentProducts.length > 0 ? recentProducts.map(p => `
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">${p.name}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${p.type_name}</td>
                  <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${p.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                  <td class="px-6 py-4 text-sm text-gray-500">${new Date(p.created_at).toLocaleDateString('es-AR')}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="4" class="px-6 py-8 text-center text-gray-500 text-sm">No hay productos aún</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `, user);

  return htmlResponse(html);
}

async function adminLayout(content, user) {
  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: 'home' },
    { href: '/admin/productos', label: 'Productos', icon: 'box' },
    { href: '/admin/venta-directa', label: 'Venta Directa', icon: 'users' },
    { href: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
    { href: '/admin/configuracion', label: 'Configuración', icon: 'settings' },
    { href: '/admin/mensajes', label: 'Mensajes', icon: 'mail' },
  ];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin | Molipar</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config={theme:{extend:{colors:{primary:{50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#4f46e5',600:'#0000ba',700:'#00009a',800:'#00007a',900:'#00005a',950:'#00003a'}},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <style>
    .sidebar-link { transition: all 0.2s ease; }
    .sidebar-link:hover { background: #eef2ff; color: #0000ba; }
    .sidebar-link.active { background: #eef2ff; color: #0000ba; border-right: 3px solid #0000ba; }
    .form-input { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .form-input:focus { border-color: #0000ba; box-shadow: 0 0 0 3px rgba(0, 0, 186, 0.1); }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    .admin-content { animation: slideIn 0.3s ease-out; }
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
        ${menuItems.map(item => `
          <a href="${item.href}" class="sidebar-link flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${item.icon === 'home' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' : ''}
              ${item.icon === 'box' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>' : ''}
              ${item.icon === 'users' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>' : ''}
              ${item.icon === 'settings' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>' : ''}
              ${item.icon === 'mail' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>' : ''}
            </svg>
            <span>${item.label}</span>
          </a>
        `).join('')}
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
          <div class="flex items-center space-x-3">
            <img src="/images/logo.png" alt="Molipar" class="h-8 w-auto">
            <span class="font-bold text-gray-900">Admin</span>
          </div>
          <button id="mobile-menu-btn" class="p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-6 admin-content">
        ${content}
      </main>
    </div>
  </div>
</body>
</html>`;
}
