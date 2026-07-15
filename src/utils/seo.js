export function seoMeta({ title, description, image, url, type = 'website' }) {
  const siteName = 'Molipar S.A.';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const desc = description || 'Producción y comercialización de harinas y fideos de la más alta calidad.';
  const img = image || '/static/images/og-default.jpg';
  const canonical = url || 'https://molipar.com';

  return `
    <title>${fullTitle}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="${type}">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${img}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="${siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${img}">
  `;
}

export function schemaOrganization(data) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.company_name || 'Molipar S.A.',
    description: data.company_description || '',
    url: 'https://molipar.com',
    logo: 'https://molipar.com/static/images/logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address || '',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: data.phone || '',
      email: data.email || '',
      contactType: 'customer service',
    },
    sameAs: [
      data.facebook,
      data.instagram,
      data.linkedin,
      data.youtube,
    ].filter(Boolean),
  };
}

export function schemaProduct(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || '',
    image: product.main_image || '',
  };
}

export function schemaBreadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
