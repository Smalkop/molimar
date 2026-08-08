import { htmlResponse, escapeHtml } from '../../utils/html.js';
import { adminLayout } from '../../components/adminLayout.js';
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

  const defaultPwd = (await DB.get("SELECT setting_value FROM site_settings WHERE setting_key = 'default_password_changed'"))?.setting_value;
  const needsPwdChange = (user.fpc === 1) || (user.role === 'admin' && defaultPwd !== 'true');
  const passwordBanner = needsPwdChange ? `
    <div class="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-6 py-4 flex items-start justify-between gap-4">
      <div class="flex items-start space-x-3">
        <svg class="w-6 h-6 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <div>
          <p class="text-sm font-semibold">Estás usando una contraseña por defecto</p>
          <p class="text-sm text-amber-700 mt-0.5">Cambiá la contraseña de administrador para proteger el panel.</p>
        </div>
      </div>
      <a href="/admin/usuarios" class="shrink-0 px-4 py-2 text-sm font-medium text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors">Cambiar contraseña</a>
    </div>
  ` : '';

  const html = adminLayout({ title: 'Dashboard', active: '/admin', header: 'toggle', user, content: `
    <div class="space-y-8">
      ${passwordBanner}
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Bienvenido, ${escapeHtml(user.name || '')}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${[
          { label: 'Total Productos', value: totalProducts, icon: 'box', bg: 'bg-primary-100', iconColor: 'text-primary-600' },
          { label: 'Harinas', value: totalHarinas, icon: 'flour', bg: 'bg-amber-100', iconColor: 'text-amber-600' },
          { label: 'Fideos', value: totalFideos, icon: 'pasta', bg: 'bg-green-100', iconColor: 'text-green-600' },
          { label: 'Mensajes Nuevos', value: totalMessages, icon: 'mail', bg: 'bg-blue-100', iconColor: 'text-blue-600' },
        ].map(card => `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center">
                ${card.icon === 'box' ? `<svg class="w-6 h-6 ${card.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>` : ''}
                ${card.icon === 'flour' ? `<svg class="w-6 h-6 ${card.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>` : ''}
                ${card.icon === 'pasta' ? `<svg class="w-6 h-6 ${card.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>` : ''}
                ${card.icon === 'mail' ? `<svg class="w-6 h-6 ${card.iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>` : ''}
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
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">${escapeHtml(p.name || '')}</td>
                  <td class="px-6 py-4 text-sm text-gray-500">${escapeHtml(p.type_name || '')}</td>
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
  `, user});

  return htmlResponse(html);
}
