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

let pageNum = 1;

function checkPageOverflow(doc, y, needed) {
  if (y + needed > PAGE_HEIGHT - 50) {
    addFooter(doc, pageNum);
    doc.addPage();
    pageNum++;
    addHeader(doc);
    return 60;
  }
  return y;
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const paragraphs = text.split('\n');
  let currentY = y;
  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line ? line + ' ' + word : word;
      if (doc.widthOfString(testLine) > maxWidth && line) {
        currentY = checkPageOverflow(doc, currentY, lineHeight);
        doc.text(line, x, currentY);
        currentY += lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      currentY = checkPageOverflow(doc, currentY, lineHeight);
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
  y = checkPageOverflow(doc, y, 40);
  doc.fontSize(18).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text(text, MARGIN, y);
  doc.rect(MARGIN, y + 22, 60, 3).fill(COLOR_ACCENT);
  return y + 35;
}

function addBodyText(doc, text, y) {
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  return wrapText(doc, text, MARGIN, y, CONTENT_WIDTH, 14);
}

function addBullet(doc, text, y, indent = 20) {
  y = checkPageOverflow(doc, y, 16);
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.circle(MARGIN + indent - 6, y + 4, 2).fill(COLOR_ACCENT);
  wrapText(doc, text, MARGIN + indent, y, CONTENT_WIDTH - indent, 14);
  return y + 18;
}

function addCheckItem(doc, text, y) {
  y = checkPageOverflow(doc, y, 18);
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('✓', MARGIN + 5, y);
  wrapText(doc, text, MARGIN + 20, y, CONTENT_WIDTH - 20, 14);
  return y + 18;
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

  pageNum = 1;

  // ─── COVER PAGE ───
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_DARK);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT * 0.42).fill(COLOR_PRIMARY);

  if (fs.existsSync(LOGO_PATH)) {
    try {
      doc.image(fs.readFileSync(LOGO_PATH), MARGIN, 60, { width: 180 });
    } catch (_) {}
  }

  doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('Informe de Entrega', MARGIN, 210);
  doc.text('de Proyecto', MARGIN, 250);

  doc.fontSize(48).font('Helvetica-Bold').fillColor(COLOR_ACCENT);
  doc.text('Molipar S.A.', MARGIN, 300);

  doc.rect(MARGIN, 365, 80, 3).fill(COLOR_ACCENT);

  doc.fontSize(14).font('Helvetica').fillColor('#cbd5e1');
  doc.text('Sitio Web Corporativo — Catálogo de Productos', MARGIN, 390);
  doc.text('Panel de Administración — Venta Directa', MARGIN, 412);

  doc.fontSize(11).font('Helvetica').fillColor('#94a3b8');
  doc.text('Desarrollado por:', MARGIN, 470);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff');
  doc.text('Brahian González', MARGIN, 488);
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8');
  doc.text('Consultoría de Software & Arquitectura Serverless', MARGIN, 508);
  doc.text('https://brahian.dev', MARGIN, 526);

  const today = new Date().toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8');
  doc.text(`Fecha de entrega: ${today}`, MARGIN, 570);

  doc.addPage();
  pageNum++;
  addHeader(doc);
  let y;

  // ─── 1. INFORMACIÓN DEL PROYECTO ───
  y = addSectionTitle(doc, '1. Información del Proyecto', 60);
  y = addBodyText(doc, `Se presenta la entrega formal del sitio web corporativo de Molipar S.A., empresa paraguaya dedicada a la producción y comercialización de harinas y fideos. El proyecto fue desarrollado por Brahian González.`, y + 10);

  y += 10;
  y = addSectionTitle(doc, '2. Resumen del Proyecto', y + 5);
  y = addBodyText(doc, 'El sitio web de Molipar S.A. incluye:', y + 10);

  const summaryItems = [
    'Sitio web público con presencia profesional en internet: página de inicio, historia de la empresa, catálogo de productos (harinas y fideos), sucursales, venta directa por regiones, calidad y contacto.',
    'Panel de administración privado donde el personal de Molipar puede gestionar productos, ver mensajes de contacto, administrar usuarios, configurar datos de la empresa y gestionar regiones de venta directa.',
    'Catálogo digital completo con imágenes, presentaciones y galería de fotos para cada producto.',
    'Formulario de contacto que envía los mensajes directamente al panel de administración.',
    'Diseño moderno y adaptado a celulares, tablets y computadoras.',
  ];
  for (const item of summaryItems) {
    y = addBullet(doc, item, y + 5);
  }

  // ─── 3. FUNCIONALIDADES ───
  y += 10;
  y = addSectionTitle(doc, '3. Funcionalidades del Sitio', y + 5);
  y += 5;

  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLOR_DARK);
  y = checkPageOverflow(doc, y, 20);
  doc.text('Sitio Público (visible para todos los visitantes)', MARGIN, y);
  y += 22;

  const publicFeatures = [
    'Inicio: Portada principal con presentación de la empresa, productos destacados y enlaces a las secciones principales.',
    'Nosotros: Historia de Molipar, misión, visión, valores y el proceso de producción.',
    'Productos: Catálogo completo de harinas y fideos con fotos, presentaciones y galería de imágenes.',
    'Sucursales: Direcciones y datos de contacto de todas las sucursales.',
    'Venta Directa: Regiones habilitadas para venta directa con teléfonos de contacto.',
    'Calidad: Información sobre certificaciones y controles de calidad.',
    'Contacto: Formulario para que clientes envíen consultas directamente.',
  ];
  for (const item of publicFeatures) {
    y = addBullet(doc, item, y + 3);
  }

  y += 8;
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLOR_DARK);
  y = checkPageOverflow(doc, y, 20);
  doc.text('Panel de Administración (acceso privado con usuario y contraseña)', MARGIN, y);
  y += 22;

  const adminFeatures = [
    'Dashboard: Resumen general con estadísticas del sitio.',
    'Productos: Agregar, editar y eliminar productos con imágenes y presentaciones.',
    'Usuarios: Gestionar quién puede acceder al panel de administración.',
    'Configuración: Editar datos de la empresa, contacto, WhatsApp, redes sociales y contenido de la portada.',
    'Mensajes: Bandeja de entrada con los mensajes recibidos del formulario de contacto.',
    'Venta Directa: Administrar las regiones de venta directa con sus teléfonos y localidades.',
  ];
  for (const item of adminFeatures) {
    y = addBullet(doc, item, y + 3);
  }

  // ─── 4. INVERSIÓN Y COSTOS ───
  y += 15;
  y = addSectionTitle(doc, '4. Inversión y Costos', y + 5);
  y += 8;

  // Main pricing card
  y = checkPageOverflow(doc, y, 230);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 225, 8).fill(COLOR_LIGHT_BG);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 225, 8).lineWidth(1).stroke(COLOR_BORDER);

  doc.fontSize(16).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Inversión Total del Proyecto', MARGIN + 20, y + 20);

  doc.fontSize(36).font('Helvetica-Bold').fillColor(COLOR_PRIMARY);
  doc.text('Gs. 2.000.000', MARGIN + 20, y + 50);

  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('(Guaraníes — Dos Millones)', MARGIN + 20, y + 90);

  doc.rect(MARGIN + 20, y + 110, CONTENT_WIDTH - 40, 1).fill(COLOR_BORDER);

  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('El presupuesto incluye:', MARGIN + 20, y + 125);

  const includes = [
    'Desarrollo completo del sitio web y panel de administración',
    'Dominio .com por 1 año (Gs. 150.000 incluidos en el total)',
    'Configuración de infraestructura y publicación en internet',
    'Capacitación básica para uso del panel de administración',
  ];
  let iy = y + 148;
  for (const item of includes) {
    iy = addCheckItem(doc, item, iy);
  }

  y = iy + 25;

  // Domain renewal card
  y = checkPageOverflow(doc, y, 100);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 95, 8).fill('#fffbeb');
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 95, 8).lineWidth(1).stroke('#fde68a');
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Renovación Anual de Dominio', MARGIN + 20, y + 15);
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('El dominio deberá renovarse cada año para mantener el sitio funcionando.', MARGIN + 20, y + 40);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR_ACCENT);
  doc.text('Gs. 20.000 / año', MARGIN + 20, y + 63);
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('(costo de gestión incluido)', MARGIN + 20, y + 82);

  y += 115;

  // Maintenance card
  y = checkPageOverflow(doc, y, 125);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 120, 8).fill('#f0fdf4');
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 120, 8).lineWidth(1).stroke('#bbf7d0');
  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Mantenimiento Mensual (Opcional)', MARGIN + 20, y + 15);
  doc.fontSize(10).font('Helvetica').fillColor('#374151');
  doc.text('El mantenimiento mensual no es obligatorio. ', MARGIN + 20, y + 40);
  doc.text('Incluye: soporte técnico, actualizaciones de contenido,', MARGIN + 20, y + 58);
  doc.text('backups de seguridad y monitoreo del sitio.', MARGIN + 20, y + 76);
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a');
  doc.text('Gs. 50.000 / mes', MARGIN + 20, y + 98);

  // ─── 5. RECOMENDACIONES ───
  y += 145;
  y = addSectionTitle(doc, '5. Recomendaciones', y + 5);
  y += 5;

  const recs = [
    'Renovar el dominio cada año para evitar la pérdida del sitio web.',
    'Realizar copias de seguridad periódicas de la base de datos.',
    'Mantener las contraseñas del panel de administración en un lugar seguro.',
    'Considerar el servicio de mantenimiento mensual para asegurar soporte continuo y actualizaciones.',
  ];
  for (const item of recs) {
    y = addBullet(doc, item, y + 3);
  }

  // ─── 6. FIRMAS ───
  y += 20;
  y = addSectionTitle(doc, '6. Firmas', y + 5);
  y += 5;
  y = addBodyText(doc, 'Este documento certifica la entrega formal del proyecto web de Molipar S.A., desarrollado por Brahian González. Ambas partes firman en conformidad.', y + 8);
  y += 25;

  y = checkPageOverflow(doc, y, 100);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(COLOR_BORDER);
  y += 15;
  doc.fontSize(10).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('Se firma en conformidad por ambas partes:', MARGIN, y);
  y += 40;

  y = checkPageOverflow(doc, y, 60);
  doc.rect(MARGIN, y, 200, 1).fill(COLOR_DARK);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Brahian González', MARGIN, y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('Desarrollador / Consultor', MARGIN, y + 26);
  doc.text('brahian.dev', MARGIN, y + 38);

  doc.rect(PAGE_WIDTH - MARGIN - 200, y, 200, 1).fill(COLOR_DARK);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR_DARK);
  doc.text('Molipar S.A.', PAGE_WIDTH - MARGIN - 200, y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text('Representante Legal', PAGE_WIDTH - MARGIN - 200, y + 26);
  doc.text('___________________________', PAGE_WIDTH - MARGIN - 200, y + 38);

  y += 100;
  doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(COLOR_BORDER);
  y += 18;
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_GRAY);
  doc.text(`Fecha: ${today}`, MARGIN, y);
  doc.text('Versión del documento: 1.0', MARGIN, y + 14);

  addFooter(doc, pageNum);

  doc.end();
  stream.on('finish', () => {
    const stats = fs.statSync(OUTPUT_PATH);
    console.log(`PDF generado exitosamente: ${OUTPUT_PATH}`);
    console.log(`Tamaño: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`Páginas: ${pageNum}`);
  });
}

generatePDF().catch(console.error);
