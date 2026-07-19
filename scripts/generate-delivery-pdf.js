import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '..', 'static', 'images', 'logo.png');
const OUTPUT_PATH = path.join(__dirname, '..', 'Documento_Entrega_Molipar.pdf');

const COLOR_PRIMARY = '#0000ba';
const COLOR_DARK = '#1a1a2e';
const COLOR_ACCENT = '#f48120';
const COLOR_GRAY = '#6b7280';
const COLOR_LIGHT_BG = '#f8f9fa';
const COLOR_BORDER = '#e5e7eb';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

let logoWidth = 0, logoHeight = 0;

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const paragraphs = text.split('\n');
  let currentY = y;
  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line ? line + ' ' + word : word;
      if (doc.widthOfString(testLine) > maxWidth && line) {
        doc.text(line, x, currentY);
        currentY += lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      doc.text(line, x, currentY);
      currentY += lineHeight;
    }
    currentY += lineHeight * 0.5;
  }
  return currentY;
}

function addHeader(doc) {
  doc.rect(0, 0, PAGE_WIDTH, 4).fill(COLOR_PRIMARY);
}

function addFooter(doc, pageNum) {
  doc.fontSize(8).fillColor(COLOR_GRAY);
  doc.text(`Documento de Entrega — Molipar S.A. | Página ${pageNum}`, MARGIN, PAGE_HEIGHT - 30, { align: 'center', width: CONTENT_WIDTH });
  doc.rect(0, PAGE_HEIGHT - 38, PAGE_WIDTH, 1).fill(COLOR_BORDER);
}

function addSectionTitle(doc, text, y) {
  doc.fontSize(18).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text(text, MARGIN, y);
  doc.rect(MARGIN, y + 22, 60, 3).fill(COLOR_ACCENT);
  return y + 35;
}

function addBodyText(doc, text, y) {
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  const resultY = wrapText(doc, text, MARGIN, y, CONTENT_WIDTH, 14);
  return resultY;
}

function addBullet(doc, text, y, indent = 20) {
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.circle(MARGIN + indent - 6, y + 4, 2).fill(COLOR_ACCENT);
  wrapText(doc, text, MARGIN + indent, y, CONTENT_WIDTH - indent, 14);
  return y + 18;
}

function addLabelValue(doc, label, value, y) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text(label, MARGIN, y);
  doc.font('Helvetica').fillColor('#374151');
  doc.text(value, MARGIN + doc.widthOfString(label) + 5, y);
  return y + 16;
}

async function generatePDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: 'Documento de Entrega — Molipar S.A.',
      Author: 'Brahian González',
      Subject: 'Entrega de Proyecto Web',
    },
  });

  const stream = fs.createWriteStream(OUTPUT_PATH);
  doc.pipe(stream);

  let pageNum = 1;

  // ─── COVER PAGE ───
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_DARK);

  // Diagonal accent
  doc.save();
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.45).fill(COLOR_PRIMARY);
  doc.restore();

  // Logo
  if (fs.existsSync(LOGO_PATH)) {
    try {
      const imgData = fs.readFileSync(LOGO_PATH);
      doc.image(imgData, MARGIN, 60, { width: 180 });
    } catch (e) {
      // fallback
    }
  }

  // Title
  doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('Informe de Entrega', MARGIN, 220);
  doc.text('de Proyecto', MARGIN, 260);

  doc.fontSize(48).font('Helvetica-Bold').fillColor(COLOR_ACCENT);
  doc.text('Molipar S.A.', MARGIN, 310);

  // Separator
  doc.rect(MARGIN, 375, 80, 3).fill(COLOR_ACCENT);

  // Subtitle
  doc.fontSize(14).font('Helvetica').fillColor('#cbd5e1');
  doc.text('Sitio Web Corporativo — Catálogo de Productos', MARGIN, 400);
  doc.text('Panel de Administración — Venta Directa', MARGIN, 422);

  // Author info
  doc.fontSize(11).font('Helvetica').fillColor('#94a3b8');
  doc.text('Desarrollado por:', MARGIN, 480);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('Brahian González', MARGIN, 498);
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8');
  doc.text('Consultoría de Software & Arquitectura Serverless', MARGIN, 518);
  doc.text('https://brahian.dev', MARGIN, 536);

  // Date
  const today = new Date().toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8');
  doc.text(`Fecha de entrega: ${today}`, MARGIN, 580);

  doc.addPage();
  pageNum++;

  // ─── TABLE OF CONTENTS ───
  addHeader(doc);
  let y = addSectionTitle(doc, 'Índice', 60);
  const tocItems = [
    '1. Resumen Ejecutivo',
    '2. Alcance del Proyecto',
    '3. Arquitectura del Sistema',
    '4. Stack Tecnológico',
    '5. Estructura del Código',
    '6. Base de Datos',
    '7. Funcionalidades Implementadas',
    '8. Seguridad',
    '9. Detalles de Despliegue',
    '10. Inversión y Costos',
    '11. Instrucciones de Mantenimiento',
    '12. Conclusiones',
    '13. Firmas',
  ];
  for (const item of tocItems) {
    doc.fontSize(11).font('Helvetica').fillColor('#374151');
    doc.text(item, MARGIN + 10, y);
    y += 22;
  }
  addFooter(doc, pageNum);

  // ─── 1. RESUMEN EJECUTIVO ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '1. Resumen Ejecutivo', 60);
  y = addBodyText(doc, `Este documento describe la entrega formal del sitio web corporativo de Molipar S.A., una empresa paraguaya dedicada a la producción y comercialización de harinas y fideos. El proyecto fue desarrollado por Brahian González como consultor de software independiente.

El sitio web fue construido utilizando tecnologías modernas (Cloudflare Workers, React 19, TailwindCSS) y está desplegado en infraestructura serverless de Cloudflare, garantizando alta disponibilidad, rendimiento global y costos operativos mínimos.

El sistema incluye un sitio público de 7 páginas (Inicio, Nosotros, Productos, Sucursales, Venta Directa, Calidad, Contacto) y un panel de administración completo con 7 secciones (Dashboard, Productos, Usuarios, Configuración, Mensajes, Venta Directa, Login).`, y + 10);
  addFooter(doc, pageNum);

  // ─── 2. ALCANCE DEL PROYECTO ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '2. Alcance del Proyecto', 60);
  y = addBodyText(doc, 'El proyecto comprende el desarrollo completo de la presencia digital de Molipar S.A., incluyendo:', y + 10);
  const alcanceItems = [
    'Sitio web público responsivo con 7 secciones informativas y catálogo de productos.',
    'Panel de administración con autenticación JWT para gestión de contenido.',
    'Catálogo digital de harinas y fideos con imágenes, presentaciones y galería.',
    'Sistema de venta directa con regiones, teléfonos y localidades.',
    'Formulario de contacto con almacenamiento en base de datos.',
    'Gestión de imágenes con procesamiento automático y almacenamiento en R2.',
    'Panel de configuración del sitio (WhatsApp, teléfono, dirección, redes sociales, etc.).',
    'SEO on-page con meta tags, Open Graph, Schema.org y sitemap XML.',
  ];
  for (const item of alcanceItems) {
    y = addBullet(doc, item, y + 5);
  }
  addFooter(doc, pageNum);

  // ─── 3. ARQUITECTURA ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '3. Arquitectura del Sistema', 60);
  y = addBodyText(doc, 'El sistema utiliza una arquitectura serverless moderna basada en Cloudflare:', y + 10);

  const archItems = [
    'Cloudflare Workers: Ejecuta el servidor web en el edge de Cloudflare (300+ ubicaciones globales). Sin servidores que gestionar.',
    'Cloudflare D1: Base de datos SQLite serverless con replicación global. Almacena productos, usuarios, mensajes, configuraciones y regiones de venta.',
    'Cloudflare R2: Almacenamiento de objetos para imágenes de productos, fotos de galería, y assets estáticos (CSS, JS). Sin costos de salida.',
    'Edge Computing: Todo el renderizado HTML ocurre en el edge de Cloudflare, minimizando la latencia.',
    'React 19 + Framer Motion: La homepage utiliza React con animaciones, renderizado desde el servidor con datos inyectados.',
  ];
  for (const item of archItems) {
    y = addBullet(doc, item, y + 5);
  }
  y += 10;
  y = addBodyText(doc, 'Flujo de una solicitud típica:', y + 5);
  const flowItems = [
    'Usuario visita https://molipar.smalkop.workers.dev',
    'Cloudflare Worker recibe la solicitud en el edge más cercano.',
    'El Worker consulta D1 (o caché), construye el HTML y responde.',
    'Las imágenes se sirven desde R2 con caché en el edge de Cloudflare.',
  ];
  for (const item of flowItems) {
    y = addBullet(doc, item, y + 5);
  }
  addFooter(doc, pageNum);

  // ─── 4. STACK TECNOLÓGICO ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '4. Stack Tecnológico', 60);
  const techItems = [
    ['Runtime:', 'Cloudflare Workers (JavaScript/ESM)'],
    ['Base de datos:', 'Cloudflare D1 (SQLite serverless)'],
    ['Storage:', 'Cloudflare R2 (objetos + estáticos)'],
    ['Frontend:', 'React 19 + Framer Motion + TailwindCSS'],
    ['Backend:', 'JavaScript vanilla (sin frameworks)'],
    ['Autenticación:', 'JWT (HS256) con cookies httpOnly'],
    ['Hash de passwords:', 'PBKDF2 (100,000 iteraciones)'],
    ['Build:', 'esbuild + Tailwind CLI'],
    ['Imágenes:', 'Procesamiento automático (original + medium + thumbnail)'],
    ['SEO:', 'Meta tags, Open Graph, Schema.org JSON-LD, sitemap XML, robots.txt'],
  ];
  for (const [label, value] of techItems) {
    y = addBullet(doc, `${label} ${value}`, y + 5);
  }
  addFooter(doc, pageNum);

  // ─── 5. ESTRUCTURA DEL CÓDIGO ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '5. Estructura del Código', 60);
  y = addBodyText(doc, 'El código fuente está organizado de la siguiente manera:', y + 10);

  const codeStructure = [
    'src/index.js              → Punto de entrada del Worker (ruteo principal)',
    'src/routes/public/        → 7 páginas públicas (home, about, products, quality, contact, branches, direct-sales)',
    'src/routes/admin/         → 7 módulos de administración (dashboard, products, users, settings, messages, direct-sales, login)',
    'src/services/             → Servicios (database, auth, storage, image)',
    'src/components/           → Componentes reutilizables (Layout, Header, Footer, Assets)',
    'src/client/               → Código React (homepage.jsx → compilado a homepage.bundle.js)',
    'src/middleware/            → Middleware de autenticación (requireAdmin)',
    'src/utils/                → Utilidades (html, seo, validators)',
    'static/                   → Assets estáticos (CSS, imágenes, JS de animaciones)',
    'migrations/               → Migraciones SQL (esquema inicial, seed, fideos apetito)',
    'scripts/                  → Scripts de build y deploy',
  ];
  for (const item of codeStructure) {
    y = addBullet(doc, item, y + 5, 25);
  }
  addFooter(doc, pageNum);

  // ─── 6. BASE DE DATOS ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '6. Base de Datos', 60);
  y = addBodyText(doc, 'La base de datos utiliza Cloudflare D1 (SQLite serverless) con las siguientes tablas:', y + 10);

  const tables = [
    ['users', 'Usuarios del panel admin (id, name, email, password, role, active)'],
    ['product_types', 'Tipos de producto (Harinas, Fideos)'],
    ['categories', 'Categorías por tipo de producto'],
    ['products', 'Productos (nombre, slug, descripción, imagen, activo)'],
    ['product_presentations', 'Presentaciones por producto (nombre, peso, precio, activo)'],
    ['product_images', 'Galería de imágenes por producto (original, thumb, medium)'],
    ['site_settings', 'Configuraciones del sitio (clave/valor agrupadas por sección)'],
    ['contact_messages', 'Mensajes del formulario de contacto'],
    ['sales_regions', 'Regiones de venta directa (título, teléfono, localidades)'],
  ];

  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Tabla', MARGIN, y);
  doc.text('Descripción', MARGIN + 130, y);
  doc.rect(MARGIN, y + 15, CONTENT_WIDTH, 1).fill(COLOR_BORDER);
  y += 22;

  for (const [table, desc] of tables) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR_PRIMARY);
    doc.text(table, MARGIN, y);
    doc.font('Helvetica').fillColor('#374151');
    doc.text(desc, MARGIN + 130, y, { width: CONTENT_WIDTH - 130 });
    y += 16;
  }

  addFooter(doc, pageNum);

  // ─── 7. FUNCIONALIDADES ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '7. Funcionalidades Implementadas', 60);

  const sections = [
    {
      title: '7.1 Sitio Público',
      items: [
        'Inicio: Hero con animaciones, contador de experiencia, productos destacados con presentaciones (píldoras), tarjetas animadas con React + Framer Motion.',
        'Nosotros: Historia, misión/visión/valores, proceso de producción en 6 pasos con iconografía.',
        'Productos: Listado completo con filtro por tipo, detalle individual con imágenes, presentaciones, galería y botón de WhatsApp.',
        'Sucursales: Mapa de todas las sucursales con datos de contacto.',
        'Venta Directa: Regiones de venta con teléfonos y localidades.',
        'Calidad: Procesos de fabricación, certificaciones (ISO 22000, HACCP, Kosher, BPM), controles de calidad.',
        'Contacto: Formulario con validación, almacenamiento en DB, enlace directo a WhatsApp.',
      ],
    },
    {
      title: '7.2 Panel de Administración',
      items: [
        'Dashboard: Estadísticas generales (total productos, harinas, fideos, mensajes nuevos).',
        'Productos: CRUD completo con imágenes, presentaciones, galería, zoom de imagen principal.',
        'Usuarios: CRUD con límite de 2 usuarios, roles (admin/editor).',
        'Configuración: Edición de datos de empresa, contacto, redes sociales, hero, años de experiencia.',
        'Mensajes: Bandeja de entrada con lectura, marcado como leído, eliminación.',
        'Venta Directa: CRUD de regiones con teléfonos y localidades.',
      ],
    },
  ];

  for (const section of sections) {
    y = addSectionTitle(doc, section.title, y + 5);
    for (const item of section.items) {
      y = addBullet(doc, item, y + 5);
    }
    y += 10;
    if (y > 700) {
      addFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      addHeader(doc);
      y = 60;
    }
  }
  addFooter(doc, pageNum);

  // ─── 8. SEGURIDAD ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '8. Seguridad', 60);
  const securityItems = [
    'Autenticación JWT: Tokens firmados con HS256, expiración de 24 horas, invalidación en logout.',
    'Rate Limiting: Máximo 5 intentos de login en 15 minutos para prevenir ataques de fuerza bruta.',
    'Sanitización: Todos los inputs se sanitizan antes de almacenar (XSS prevention).',
    'Validación: Validación de tipos de archivo (imágenes), tamaño máximo 10MB, validación de magic bytes.',
    'SQL Injection: Todas las consultas usan parámetros preparados (?) en lugar de concatenación.',
    'CORS: Cabeceras CORS configuradas con origen permitido específico.',
    'CSP: Content Security Policy configurada para prevenir ataques XSS.',
    'Cookies HttpOnly: El token JWT se almacena en cookie httpOnly, no accesible desde JavaScript.',
    'Tablas sanitizadas: Validación de nombres de tabla y columna para prevenir inyección en queries dinámicas.',
  ];
  for (const item of securityItems) {
    y = addBullet(doc, item, y + 5);
  }
  addFooter(doc, pageNum);

  // ─── 9. DETALLES DE DESPLIEGUE ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '9. Detalles de Despliegue', 60);
  y = addLabelValue(doc, 'URL de producción:', 'https://molipar.smalkop.workers.dev', y + 10);
  y = addLabelValue(doc, 'Dominio personalizado:', 'https://molipar.com (configurable)', y + 5);
  y = addLabelValue(doc, 'Infraestructura:', 'Cloudflare Workers (edge computing)', y + 5);
  y = addLabelValue(doc, 'Base de datos:', 'Cloudflare D1 (SQLite serverless)', y + 5);
  y = addLabelValue(doc, 'Almacenamiento:', 'Cloudflare R2 (bucket: productos-clientes)', y + 5);
  y = addLabelValue(doc, 'Repositorio:', 'GitHub — https://github.com/Smalkop/molimar', y + 5);
  y += 10;
  y = addBodyText(doc, 'Comando para desplegar una nueva versión:', y + 5);
  doc.fontSize(9).font('Courier').fillColor(COLOR_DARK);
  doc.text('  npm run deploy', MARGIN, y, { width: CONTENT_WIDTH });
  y += 20;
  y = addBodyText(doc, 'Esto ejecuta: build de TailwindCSS → build del bundle React → upload de assets estáticos a R2 → deploy del Worker.', y);

  addFooter(doc, pageNum);

  // ─── 10. INVERSIÓN Y COSTOS ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '10. Inversión y Costos', 60);
  y += 10;

  // Pricing card background
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 220, 8).fill(COLOR_LIGHT_BG);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 220, 8).lineWidth(1).stroke(COLOR_BORDER);

  // Title inside card
  doc.fontSize(16).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Inversión Total del Proyecto', MARGIN + 20, y + 20);

  // Price
  doc.fontSize(36).font('Helvetica-Bold').fillColor(COLOR_PRIMARY);
  doc.text('Gs. 2.000.000', MARGIN + 20, y + 50);

  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('(Guaraníes — Dos Millones)', MARGIN + 20, y + 90);

  // Divider
  doc.rect(MARGIN + 20, y + 110, CONTENT_WIDTH - 40, 1).fill(COLOR_BORDER);

  // Detail
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('El presupuesto incluye:', MARGIN + 20, y + 125);
  doc.text('✓ Desarrollo completo del sitio web y panel de administración', MARGIN + 20, y + 145);
  doc.text('✓ Dominio .com por 1 año (Gs. 150.000 incluidos en el total)', MARGIN + 20, y + 165);
  doc.text('✓ Configuración de infraestructura Cloudflare', MARGIN + 20, y + 185);
  doc.text('✓ Capacitación básica para uso del panel admin', MARGIN + 20, y + 205);

  y += 240;

  // Domain renewal
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 100, 8).fill('#fffbeb');
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 100, 8).lineWidth(1).stroke('#fde68a');
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Renovación Anual de Dominio', MARGIN + 20, y + 15);
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('El dominio debe renovarse cada año.', MARGIN + 20, y + 40);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR_ACCENT);
  doc.text('Gs. 20.000 / año', MARGIN + 20, y + 60);
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('(costo de gestión incluido)', MARGIN + 20, y + 80);

  y += 120;

  // Maintenance
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 130, 8).fill('#f0fdf4');
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 130, 8).lineWidth(1).stroke('#bbf7d0');
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Mantenimiento Mensual (Opcional)', MARGIN + 20, y + 15);
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('El mantenimiento mensual no es obligatorio. ', MARGIN + 20, y + 40);
  doc.text('Incluye: actualizaciones de seguridad, contenido,', MARGIN + 20, y + 58);
  doc.text('soporte técnico, backups y monitoreo.', MARGIN + 20, y + 76);
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a');
  doc.text('Gs. 50.000 / mes', MARGIN + 20, y + 100);

  addFooter(doc, pageNum);

  // ─── 11. INSTRUCCIONES DE MANTENIMIENTO ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '11. Instrucciones de Mantenimiento', 60);

  const maintenanceItems = [
    'Agregar producto: Ir a Admin → Productos → "Nuevo Producto". Completar nombre, descripción, tipo, imagen principal. Luego agregar presentaciones (peso + precio) y opcionalmente imágenes de galería.',
    'Editar producto: En Admin → Productos, hacer clic en el lápiz del producto. Se puede cambiar imagen, descripción, presentaciones, galería.',
    'Configurar sitio: Admin → Configuración. Allí se editan datos de empresa, contacto, WhatsApp, redes sociales, hero de portada, años de experiencia.',
    'Ver mensajes: Admin → Mensajes. Los mensajes del formulario de contacto llegan aquí. Se pueden leer, marcar como leídos y eliminar.',
    'Venta Directa: Admin → Venta Directa. Allí se gestionan las regiones con sus teléfonos y localidades.',
    'Usuarios: Admin → Usuarios. Máximo 2 usuarios. Se pueden crear, editar roles y eliminar.',
    'Desplegar cambios: En la terminal, ejecutar "npm run deploy" desde la carpeta del proyecto. Esto actualiza el sitio en producción.',
  ];
  for (const item of maintenanceItems) {
    y = addBullet(doc, item, y + 5);
  }

  addFooter(doc, pageNum);

  // ─── 12. CONCLUSIONES ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '12. Conclusiones', 60);
  y = addBodyText(doc, `El sitio web de Molipar S.A. ha sido desarrollado exitosamente, cumpliendo con todos los requerimientos establecidos. La plataforma está completamente operativa y desplegada en producción.

Tecnologías modernas y arquitectura serverless garantizan:

• Rendimiento: Tiempos de carga rápidos gracias al edge computing de Cloudflare.
• Escalabilidad: La infraestructura se escala automáticamente según la demanda.
• Seguridad: Múltiples capas de seguridad implementadas (JWT, rate limiting, sanitización, CSP).
• Mantenibilidad: Código modular y bien estructurado, fácil de mantener y extender.
• Costos predecibles: Sin servidores que gestionar, costos basados en uso real.

El panel de administración permite a Molipar S.A. gestionar su contenido de forma autónoma, sin necesidad de conocimientos técnicos avanzados.

Se recomienda mantener el dominio renovado anualmente y considerar el servicio de mantenimiento mensual opcional para garantizar actualizaciones de seguridad y soporte continuo.`, y + 10);

  addFooter(doc, pageNum);

  // ─── 13. FIRMAS ───
  doc.addPage();
  pageNum++;
  addHeader(doc);
  y = addSectionTitle(doc, '13. Firmas', 60);
  y += 10;
  y = addBodyText(doc, 'Este documento certifica la entrega formal del proyecto a Molipar S.A. por parte del desarrollador.', y + 10);
  y += 20;

  // Separator line
  doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(COLOR_BORDER);
  y += 15;
  doc.fontSize(10).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('Se firma en conformidad por ambas partes:', MARGIN, y);
  y += 40;

  // Developer signature
  doc.rect(MARGIN, y, 200, 1).fill(COLOR_DARK);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Brahian González', MARGIN, y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('Desarrollador / Consultor', MARGIN, y + 26);
  doc.text('brahian.dev', MARGIN, y + 38);

  // Client signature
  doc.rect(PAGE_WIDTH - MARGIN - 200, y, 200, 1).fill(COLOR_DARK);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Molipar S.A.', PAGE_WIDTH - MARGIN - 200, y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('Representante Legal', PAGE_WIDTH - MARGIN - 200, y + 26);
  doc.text('___________________________', PAGE_WIDTH - MARGIN - 200, y + 38);

  y += 100;
  doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(COLOR_BORDER);
  y += 20;
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text(`Fecha: ${today}`, MARGIN, y);
  doc.text('Versión del documento: 1.0', MARGIN, y + 14);

  addFooter(doc, pageNum);

  // Finalize
  doc.end();
  stream.on('finish', () => {
    const stats = fs.statSync(OUTPUT_PATH);
    console.log(`PDF generado exitosamente: ${OUTPUT_PATH}`);
    console.log(`Tamaño: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`Páginas: ${pageNum}`);
  });
}

generatePDF().catch(console.error);
