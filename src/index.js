import DB from './services/database.js';
import STORAGE from './services/storage.js';
import AUTH from './services/auth.js';

import { handleHome } from './routes/public/home.js';
import { handleAbout } from './routes/public/about.js';
import { handleProducts, handleProductDetail } from './routes/public/products.js';
import { handleQuality } from './routes/public/quality.js';
import { handleContact, handleContactSubmit } from './routes/public/contact.js';
import { handleBranches } from './routes/public/branches.js';
import { handleDirectSales } from './routes/public/direct-sales.js';

import { handleLoginPage, handleLoginApi, handleLogout } from './routes/admin/login.js';
import { handleDashboard } from './routes/admin/dashboard.js';
import { handleAdminProducts, handleAdminProductsApi } from './routes/admin/products.js';
import { handleAdminUsers, handleAdminUsersApi } from './routes/admin/users.js';
import { handleAdminSettings, handleAdminSettingsApi } from './routes/admin/settings.js';
import { handleAdminMessages, handleAdminMessagesApi, handleAdminMessagesRead } from './routes/admin/messages.js';

import { htmlResponse, jsonResponse, redirectResponse } from './utils/html.js';
import { requireAdmin } from './middleware/auth.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'editor' CHECK(role IN ('admin', 'editor')), active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE TABLE IF NOT EXISTS product_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT, icon TEXT, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, product_type_id INTEGER NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(product_type_id);
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, product_type_id INTEGER NOT NULL, category_id INTEGER, short_description TEXT, full_description TEXT, nutritional_info TEXT, status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')), sort_order INTEGER NOT NULL DEFAULT 0, main_image TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE CASCADE, FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE TABLE IF NOT EXISTS product_presentations (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, name TEXT NOT NULL, weight TEXT, price REAL, is_primary INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS idx_presentations_product ON product_presentations(product_id);
CREATE TABLE IF NOT EXISTS product_images (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL, image_type TEXT NOT NULL DEFAULT 'gallery' CHECK(image_type IN ('main', 'gallery')), thumbnail_path TEXT, medium_path TEXT, original_path TEXT, alt_text TEXT, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
CREATE TABLE IF NOT EXISTS site_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, setting_key TEXT NOT NULL UNIQUE, setting_value TEXT, setting_group TEXT NOT NULL DEFAULT 'general', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_settings_key ON site_settings(setting_key);
CREATE TABLE IF NOT EXISTS contact_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, subject TEXT, message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_messages_read ON contact_messages(is_read);
`;

const SEED_SQL = `
INSERT OR IGNORE INTO product_types (id, name, slug, description, icon, sort_order) VALUES (1, 'Harinas', 'harinas', 'Harinas de trigo de alta calidad para panificación, repostería y uso industrial', 'flour', 1);
INSERT OR IGNORE INTO product_types (id, name, slug, description, icon, sort_order) VALUES (2, 'Fideos', 'fideos', 'Pastas y fideos elaborados con harinas seleccionadas', 'pasta', 2);
INSERT OR IGNORE INTO categories (id, product_type_id, name, slug, description, sort_order) VALUES (1, 1, 'Harinas Panaderas', 'harinas-panaderas', 'Harinas especiales para panificación artesanal e industrial', 1);
INSERT OR IGNORE INTO categories (id, product_type_id, name, slug, description, sort_order) VALUES (2, 1, 'Harinas Reposteras', 'harinas-reposteras', 'Harinas finas para repostería y pastelería', 2);
INSERT OR IGNORE INTO categories (id, product_type_id, name, slug, description, sort_order) VALUES (3, 1, 'Harinas Industriales', 'harinas-industriales', 'Harinas para uso industrial y procesos productivos', 3);
INSERT OR IGNORE INTO categories (id, product_type_id, name, slug, description, sort_order) VALUES (4, 2, 'Fideos Cortos', 'fideos-cortos', 'Pastas cortas como coditos, mostacholes, tirabuzones', 1);
INSERT OR IGNORE INTO categories (id, product_type_id, name, slug, description, sort_order) VALUES (5, 2, 'Fideos Largos', 'fideos-largos', 'Pastas largas como espaguetis, tallarines, fetuccinis', 2);
INSERT OR IGNORE INTO categories (id, product_type_id, name, slug, description, sort_order) VALUES (6, 2, 'Fideos Especiales', 'fideos-especiales', 'Pastas especiales con huevo, vegetales o sémola', 3);
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('company_name', 'Molipar S.A.', 'company');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('company_slogan', 'Calidad desde el origen', 'company');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('company_description', 'Empresa dedicada a la producción y comercialización de harinas y fideos de la más alta calidad.', 'company');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('company_history', 'Molipar S.A. nace de la pasión por la molienda y la tradición panadera. Desde nuestros inicios, nos hemos comprometido con la excelencia en cada etapa del proceso productivo, seleccionando los mejores granos de trigo y aplicando tecnología de vanguardia para ofrecer harinas y fideos que superan las expectativas de nuestros clientes.', 'company');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('company_mission', 'Producir harinas y fideos de la más alta calidad, satisfaciendo las necesidades de nuestros clientes con productos confiables, innovadores y nutritivos, contribuyendo al desarrollo de la industria alimentaria.', 'company');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('company_vision', 'Ser líderes en el mercado nacional de harinas y pastas, reconocidos por nuestra calidad, innovación y compromiso con el cliente, expandiendo nuestra presencia a mercados internacionales.', 'company');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('company_values', '[{"title":"Calidad","description":"Compromiso absoluto con la excelencia en cada producto que elaboramos.","icon":"quality"},{"title":"Innovación","description":"Mejora continua e incorporación de tecnología de vanguardia en nuestros procesos.","icon":"innovation"},{"title":"Tradición","description":"Respeto por la herencia molinera y el saber hacer transmitido por generaciones.","icon":"tradition"},{"title":"Responsabilidad","description":"Compromiso con el medio ambiente, nuestros colaboradores y la comunidad.","icon":"responsibility"}]', 'company');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('address', 'Ruta PY02 Km 211,5 - J.E. Estigarribia (Campo 9), Paraguay', 'contact');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('phone', '+595 986 288 006', 'contact');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('whatsapp', '595981659994', 'contact');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('email', 'info@molipar.com', 'contact');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('facebook', 'https://facebook.com/molipar', 'social');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('instagram', 'https://instagram.com/molipar', 'social');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('linkedin', 'https://linkedin.com/company/molipar', 'social');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('youtube', 'https://youtube.com/@molipar', 'social');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('schedule', 'Lunes a Viernes: 8:00 - 18:00 hs | Sábados: 8:00 - 13:00 hs', 'contact');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('hero_title', 'La calidad del trigo, el sabor de siempre', 'home');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('hero_subtitle', 'Producimos harinas y fideos con los más altos estándares de calidad, llevando tradición y sabor a tu mesa.', 'home');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value, setting_group) VALUES ('hero_cta_text', 'Conocé nuestros productos', 'home');

INSERT OR IGNORE INTO products (id, name, slug, product_type_id, category_id, short_description, full_description, nutritional_info, status, sort_order, main_image) VALUES (1, 'Harina de Trigo Tipo 000', 'harina-trigo-000', 1, 1, 'Harina de trigo enriquecida con hierro y vitaminas, ideal para panificación artesanal e industrial.', 'Harina de trigo tipo 000 enriquecida con hierro y vitaminas. Perfecta para la elaboración de panes, facturas y masas fermentadas. Su granulometría media permite una óptima absorción de agua y un desarrollo de gluten equilibrado, garantizando productos de excelente volumen y textura.', '<strong>Información Nutricional (por 50g / media taza)</strong><br>Valor Energético: 170 kcal<br>Carbohidratos: 35g<br>Proteínas: 5g<br>Grasas Totales: 0.5g<br>Hierro: 2.5mg<br>Vitaminas del complejo B: B1 (0.3mg), B2 (0.2mg), B3 (3mg)', 'active', 1, '/images/harina-000-25kg.jpg');
INSERT OR IGNORE INTO products (id, name, slug, product_type_id, category_id, short_description, full_description, nutritional_info, status, sort_order, main_image) VALUES (2, 'Harina de Trigo Tipo 0000', 'harina-trigo-0000', 1, 2, 'Harina de trigo extra fina enriquecida con hierro y vitaminas, especial para repostería y pastelería.', 'Harina de trigo tipo 0000 enriquecida con hierro y vitaminas. De granulometría extra fina, ideal para repostería fina, pastelería, galletitas y masas de hojaldre. Su textura suave y sedosa garantiza una incorporación homogénea con grasas y líquidos, logrando preparaciones delicadas y de gran fineza.', '<strong>Información Nutricional (por 50g / media taza)</strong><br>Valor Energético: 170 kcal<br>Carbohidratos: 35g<br>Proteínas: 4.5g<br>Grasas Totales: 0.5g<br>Hierro: 2.5mg<br>Vitaminas del complejo B: B1 (0.3mg), B2 (0.2mg), B3 (3mg)', 'active', 2, '/images/harina-0000.jpg');

INSERT OR IGNORE INTO product_presentations (product_id, name, weight, price, is_primary, sort_order) VALUES (1, 'Bolsa de 5kg', '5 kg', NULL, 0, 1);
INSERT OR IGNORE INTO product_presentations (product_id, name, weight, price, is_primary, sort_order) VALUES (1, 'Bolsa de 25kg', '25 kg', NULL, 1, 2);
INSERT OR IGNORE INTO product_presentations (product_id, name, weight, price, is_primary, sort_order) VALUES (1, 'Bolsa de 50kg', '50 kg', NULL, 0, 3);
INSERT OR IGNORE INTO product_presentations (product_id, name, weight, price, is_primary, sort_order) VALUES (2, 'Bolsa de 25kg', '25 kg', NULL, 1, 1);
INSERT OR IGNORE INTO product_presentations (product_id, name, weight, price, is_primary, sort_order) VALUES (2, 'Bolsa de 50kg', '50 kg', NULL, 0, 2);

INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (1, 'main', '/images/harina-000-25kg.jpg', 'Harina de Trigo Tipo 000 Molipar', 1);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (1, 'gallery', '/images/harina-000-5kg.jpg', 'Harina de Trigo Tipo 000 - Presentación 5kg', 2);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (1, 'gallery', '/images/harina-000-50kg.jpg', 'Harina de Trigo Tipo 000 - Presentación 50kg', 3);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (2, 'main', '/images/harina-0000.jpg', 'Harina de Trigo Tipo 0000 Molipar', 1);
INSERT OR IGNORE INTO product_images (product_id, image_type, original_path, alt_text, sort_order) VALUES (2, 'gallery', '/images/harina-0000-label.jpg', 'Harina de Trigo Tipo 0000 - Información nutricional', 2);
`;

let DB_INITIALIZED = false;

async function ensureDatabase(env) {
  if (DB_INITIALIZED) return;
  DB.setEnv(env);

  try {
    await env.DB.prepare('SELECT COUNT(*) as count FROM site_settings').all();
    DB_INITIALIZED = true;
    return;
  } catch {}

  const schemaStmts = SCHEMA_SQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of schemaStmts) {
    try {
      await env.DB.prepare(stmt).all();
    } catch {}
  }

  const seedStmts = SEED_SQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of seedStmts) {
    try {
      await env.DB.prepare(stmt).all();
    } catch {}
  }

  try {
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind('admin@molipar.com').first();
    if (!existing) {
      const encoder = new TextEncoder();
      const pwdData = encoder.encode('admin123' + 'MOLIPAR_SALT_2024');
      const pwdHash = await crypto.subtle.digest('SHA-256', pwdData);
      const hashHex = Array.from(new Uint8Array(pwdHash)).map(b => b.toString(16).padStart(2, '0')).join('');
      await env.DB.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').bind('Administrador', 'admin@molipar.com', hashHex, 'admin').all();
    }
  } catch {}

  DB_INITIALIZED = true;
}

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
    await ensureDatabase(env);

    // Static files from R2
    if (pathname.startsWith('/images/') || pathname.startsWith('/css/') || pathname.startsWith('/js/')) {
      return serveStatic(pathname.slice(1), env);
    }

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

    // Media files from R2
    if (pathname.startsWith('/media/')) {
      return serveMedia(pathname.replace('/media/', ''), env);
    }

    // Favicon
    if (pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
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

    if (pathname === '/sucursales' && method === 'GET') return handleBranches(env, settings);

    if (pathname === '/venta-directa' && method === 'GET') return handleDirectSales(env, settings);

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
    { loc: baseUrl + '/sucursales', priority: 0.7, changefreq: 'monthly' },
    { loc: baseUrl + '/venta-directa', priority: 0.7, changefreq: 'monthly' },
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

async function serveStatic(key, env) {
  try {
    const object = await env.R2.get('static/' + key);
    if (!object) {
      return new Response(null, { status: 404 });
    }
    const headers = {
      'Cache-Control': 'public, max-age=86400',
      'ETag': object.httpEtag || '',
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
    };
    return new Response(object.body, { headers });
  } catch {
    return new Response(null, { status: 404 });
  }
}

async function serveMedia(key, env) {
  try {
    const object = await env.R2.get(key);
    if (!object) {
      return new Response(null, { status: 404 });
    }
    const headers = {
      'Cache-Control': 'public, max-age=86400',
      'ETag': object.httpEtag || '',
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
    };
    return new Response(object.body, { headers });
  } catch {
    return new Response(null, { status: 404 });
  }
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
