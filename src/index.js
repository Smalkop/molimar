import DB from './services/database.js';
import STORAGE from './services/storage.js';
import AUTH from './services/auth.js';

import { handleHome } from './routes/public/home.js';
import { handleAbout } from './routes/public/about.js';
import { handleProducts, handleProductDetail } from './routes/public/products.js';
import { handleQuality } from './routes/public/quality.js';
import { handleContact, handleContactSubmit } from './routes/public/contact.js';

import { handleLoginPage, handleLoginApi, handleLogout } from './routes/admin/login.js';
import { handleDashboard } from './routes/admin/dashboard.js';
import { handleAdminProducts, handleAdminProductsApi } from './routes/admin/products.js';
import { handleAdminUsers, handleAdminUsersApi } from './routes/admin/users.js';
import { handleAdminSettings, handleAdminSettingsApi } from './routes/admin/settings.js';
import { handleAdminMessages, handleAdminMessagesApi, handleAdminMessagesRead } from './routes/admin/messages.js';

import { htmlResponse, jsonResponse, redirectResponse } from './utils/html.js';
import { requireAdmin } from './middleware/auth.js';

async function loadSettings(env) {
  DB.setEnv(env);
  const rows = await DB.query('SELECT setting_key, setting_value FROM site_settings');
  const settings = {};
  for (const r of rows) {
    settings[r.setting_key] = r.setting_value;
  }
  return settings;
}



export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    STORAGE.setR2(env.R2);
    DB.setEnv(env);

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Load settings for all pages
    const settings = await loadSettings(env);

    // ===== PUBLIC ROUTES =====
    if (pathname === '/' && method === 'GET') return handleHome(env, settings);

    if (pathname === '/nosotros' && method === 'GET') return handleAbout(env, settings);

    if (pathname === '/productos' && method === 'GET') return handleProducts(env, settings);

    if (pathname.startsWith('/productos/') && method === 'GET') {
      const slug = pathname.replace('/productos/', '');
      if (slug) return handleProductDetail(env, settings, slug);
    }

    if (pathname === '/calidad' && method === 'GET') return handleQuality(env, settings);

    if (pathname === '/contacto' && method === 'GET') return handleContact(env, settings);

    if (pathname === '/api/contacto' && method === 'POST') return handleContactSubmit(request, env);

    // ===== SEO =====
    if (pathname === '/sitemap.xml') return generateSitemap(env, settings);
    if (pathname === '/robots.txt') return generateRobotsTxt(env);

    // ===== ADMIN ROUTES =====
    if (pathname === '/admin/login' && method === 'GET') return handleLoginPage(env);
    if (pathname === '/admin/api/login' && method === 'POST') return handleLoginApi(request, env);
    if (pathname === '/admin/logout') return handleLogout();

    // Protected admin routes
    const auth = await requireAdmin(request, env);
    if (!auth.authenticated && pathname.startsWith('/admin')) {
      if (pathname.startsWith('/admin/api/')) {
        return jsonResponse({ error: 'No autenticado' }, 401);
      }
      return redirectResponse('/admin/login');
    }

    if (pathname === '/admin' && method === 'GET') return handleDashboard(env, auth.user);

    if (pathname === '/admin/productos' && method === 'GET') return handleAdminProducts(env, auth.user);

    if (pathname.startsWith('/admin/api/productos')) {
      const id = pathname.replace('/admin/api/productos', '').replace(/^\//, '') || null;
      return handleAdminProductsApi(request, env, id);
    }

    if (pathname === '/admin/usuarios' && method === 'GET') return handleAdminUsers(env, auth.user);

    if (pathname.startsWith('/admin/api/usuarios')) {
      const id = pathname.replace('/admin/api/usuarios', '').replace(/^\//, '') || null;
      return handleAdminUsersApi(request, env, id);
    }

    if (pathname === '/admin/configuracion' && method === 'GET') return handleAdminSettings(env, auth.user);
    if (pathname === '/admin/api/configuracion' && method === 'PUT') return handleAdminSettingsApi(request, env);

    if (pathname === '/admin/mensajes' && method === 'GET') return handleAdminMessages(env, auth.user);

    if (pathname.startsWith('/admin/api/mensajes/') && pathname.endsWith('/read') && method === 'POST') {
      const id = pathname.replace('/admin/api/mensajes/', '').replace('/read', '');
      return handleAdminMessagesRead(env, id);
    }

    if (pathname.startsWith('/admin/api/mensajes') && method === 'GET') {
      const id = pathname.replace('/admin/api/mensajes', '').replace(/^\//, '') || null;
      return handleAdminMessagesApi(env, id);
    }

    // ===== 404 =====
    return htmlResponse(`
      <!DOCTYPE html>
      <html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Molipar</title><script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>body{font-family:'Inter',sans-serif;}</style></head>
      <body class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <h1 class="text-8xl font-bold text-primary-600 mb-4">404</h1>
          <p class="text-xl text-gray-600 mb-8">Página no encontrada</p>
          <a href="/" class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">Volver al inicio</a>
        </div>
      </body></html>
    `, 404);
  },
};

async function generateSitemap(env, settings) {
  DB.setEnv(env);
  const baseUrl = env.SITE_URL || 'https://molipar.com';

  const products = await DB.query("SELECT slug, updated_at FROM products WHERE status = 'active'");

  const urls = [
    { loc: baseUrl + '/', priority: 1.0, changefreq: 'weekly' },
    { loc: baseUrl + '/nosotros', priority: 0.8, changefreq: 'monthly' },
    { loc: baseUrl + '/productos', priority: 0.9, changefreq: 'weekly' },
    { loc: baseUrl + '/calidad', priority: 0.7, changefreq: 'monthly' },
    { loc: baseUrl + '/contacto', priority: 0.6, changefreq: 'monthly' },
    ...products.map(p => ({
      loc: `${baseUrl}/productos/${p.slug}`,
      priority: 0.7,
      changefreq: 'monthly',
      lastmod: p.updated_at,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <priority>${u.priority}</priority>
    <changefreq>${u.changefreq}</changefreq>
    ${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}

function generateRobotsTxt(env) {
  const baseUrl = env.SITE_URL || 'https://molipar.com';
  const txt = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

# Admin
Disallow: /admin/
`;

  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
