const ALLOWED_ORIGIN = (env) => (env && env.SITE_URL) || '';

export function sanitizeString(str) {
  if (!str) return '';
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text, length = 100) {
  if (!text || text.length <= length) return text || '';
  return text.substring(0, length).trim() + '...';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function parseJsonField(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function corsHeaders(env) {
  const origin = ALLOWED_ORIGIN(env);
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };
}

export function cspDirectives() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "frame-src https://www.google.com",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export function jsonResponse(data, status = 200, env = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(env),
      ...securityHeaders(),
    },
  });
}

export function htmlResponse(html, status = 200, extraHeaders = {}) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': cspDirectives(),
      ...securityHeaders(),
      ...extraHeaders,
    },
  });
}

export function imgUrl(path) {
  if (!path) return '/images/placeholder.svg';
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) return path;
  return '/media/' + path;
}

export function normalizeWhatsApp(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('549') && digits.length > 3) {
    return '54' + digits.slice(3);
  }
  return digits;
}

export function redirectResponse(url) {
  return new Response(null, {
    status: 302,
    headers: { Location: url, ...securityHeaders() },
  });
}

export function optionsResponse(env) {
  return new Response(null, {
    headers: {
      ...corsHeaders(env),
      ...securityHeaders(),
    },
  });
}
