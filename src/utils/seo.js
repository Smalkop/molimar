function escAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escText(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function seoMeta({ title, description, image, path, type = 'website', siteUrl = 'https://molipar.com' }) {
  const siteName = 'Molipar S.A.';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const desc = description || 'Producción y comercialización de harinas y fideos de la más alta calidad.';
  const baseUrl = String(siteUrl || '').replace(/\/$/, '') || 'https://molipar.com';
  const relativeImg = image || '/images/og-default.jpg';
  const img = /^https?:\/\//.test(relativeImg) ? relativeImg : `${baseUrl}${relativeImg.startsWith('/') ? '' : '/'}${relativeImg}`;
  const canonical = path ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : baseUrl;

  return `
    <title>${escText(fullTitle)}</title>
    <meta name="description" content="${escAttr(desc)}">
    <link rel="canonical" href="${escAttr(canonical)}">
    <meta property="og:type" content="${escAttr(type)}">
    <meta property="og:title" content="${escAttr(fullTitle)}">
    <meta property="og:description" content="${escAttr(desc)}">
    <meta property="og:image" content="${escAttr(img)}">
    <meta property="og:url" content="${escAttr(canonical)}">
    <meta property="og:site_name" content="${escAttr(siteName)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escAttr(fullTitle)}">
    <meta name="twitter:description" content="${escAttr(desc)}">
    <meta name="twitter:image" content="${escAttr(img)}">
  `;
}

export function schemaOrganization(data, siteUrl = 'https://molipar.com') {
  const baseUrl = String(siteUrl || '').replace(/\/$/, '') || 'https://molipar.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.company_name || 'Molipar S.A.',
    description: data.company_description || '',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
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
      data.tiktok,
    ].filter(Boolean),
  };
}
