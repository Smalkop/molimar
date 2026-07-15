import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { seoMeta } from '../utils/seo.js';
import { normalizeWhatsApp } from '../utils/html.js';
import { ANIMATIONS_CSS, ANIMATIONS_JS } from './Assets.js';

export function Layout({ children, title, description, image, url, settings, currentPath, extraHead = '' }) {
  const siteSettings = settings || {};
  const companyName = siteSettings.company_name || 'Molipar S.A.';
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    description: siteSettings.company_description || '',
    url: 'https://molipar.com',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteSettings.phone || '',
      email: siteSettings.email || '',
      contactType: 'customer service',
    },
  };

  return `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0000ba">
  <meta name="color-scheme" content="light">
  <meta name="robots" content="index, follow">
  ${seoMeta({ title, description, image, url })}
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230000ba'/><text x='16' y='22' text-anchor='middle' font-family='Arial' font-size='16' font-weight='bold' fill='white'>M</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#4f46e5',600:'#0000ba',700:'#00009a',800:'#00007a',900:'#00005a',950:'#00003a' },
            secondary: { 50:'#f0f7f4',100:'#daede4',200:'#b6dac9',300:'#8bc0a9',400:'#5ea286',500:'#3d856b',600:'#2e6b55',700:'#275645',800:'#224539',900:'#1d3a30',950:'#0e201a' },
          },
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
        }
      }
    }
  </script>
  <style>${ANIMATIONS_CSS}</style>
  <script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>
  ${extraHead}
</head>
<body class="font-sans text-gray-800 antialiased bg-white">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg">Saltar al contenido principal</a>

  ${Header({ settings: siteSettings, currentPath })}

  <main id="main-content" class="min-h-screen">
    ${children}
  </main>

  ${Footer({ settings: siteSettings })}

  <!-- WhatsApp Floating Button -->
  <a href="https://wa.me/${normalizeWhatsApp(siteSettings.whatsapp) || '595981659994'}?text=${encodeURIComponent('Hola, quiero consultar sobre los productos de Molipar')}"
     target="_blank" rel="noopener noreferrer"
     class="whatsapp-pulse fixed bottom-6 right-6 z-30 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
     aria-label="Contactar por WhatsApp">
    <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </a>

  <script>${ANIMATIONS_JS}</script>
</body>
</html>`;
}
