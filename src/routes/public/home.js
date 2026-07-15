import { Layout } from '../../components/Layout.js';
import { htmlResponse, normalizeWhatsApp } from '../../utils/html.js';
import DB from '../../services/database.js';

export async function handleHome(env, settings) {
  DB.setEnv(env);

  const allProducts = await DB.query(`
    SELECT p.*, pt.name as type_name, pt.slug as type_slug
    FROM products p
    JOIN product_types pt ON p.product_type_id = pt.id
    WHERE p.status = 'active'
    ORDER BY p.sort_order, p.name
  `);

  const harinas = allProducts.filter(p => p.type_slug === 'harinas');
  const fideos = allProducts.filter(p => p.type_slug === 'fideos');

  const settingsData = {
    hero_title: settings.hero_title,
    hero_subtitle: settings.hero_subtitle,
    hero_cta_text: settings.hero_cta_text,
    company_description: settings.company_description,
    company_history: settings.company_history,
  };

  const extraHead = `
<style>
  .card-hover { transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease; }
  .card-image { transition: transform 0.5s ease; }
  .card-hover:hover .card-image { transform: scale(1.04); }
</style>`;

  const content = `
    <div id="homepage-root"></div>
    <script>
      window.__SETTINGS__ = ${JSON.stringify(settingsData)};
      window.__HARINAS__ = ${JSON.stringify(harinas)};
      window.__FIDEOS__ = ${JSON.stringify(fideos)};
      window.__WHATSAPP__ = ${JSON.stringify(normalizeWhatsApp(settings.whatsapp) || '595986288006')};
    </script>
    <script src="/js/homepage.bundle.js" defer></script>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Inicio',
    description: settings.company_description || '',
    settings,
    currentPath: '/',
    extraHead,
  }));
}