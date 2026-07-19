import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO = path.join(__dirname, '..', 'static', 'images', 'logo.png');
const OUT = path.join(__dirname, '..', 'Documento_Entrega_Molipar.pdf');

const M = 50, CW = 495.28;
const C_PRIMARY = '#0000ba', C_DARK = '#1a1a2e', C_ACCENT = '#f48120', C_BODY = '#374151', C_GRAY = '#6b7280';

const today = new Date().toLocaleDateString('es-PY', { year: 'numeric', month: 'long', day: 'numeric' });

function wrap(doc, text, x, y, w, lh) {
  const words = text.split(' ');
  let line = '', fy = y, first = true;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (doc.widthOfString(test) > w - (first ? 0 : x) && line) {
      doc.text(line, first ? x : x, fy); fy += lh; line = word; first = false;
    } else { line = test; }
  }
  if (line) { doc.text(line, first ? x : x, fy); fy += lh; }
  return fy;
}

let pageCount = 0;

async function main() {
  const doc = new PDFDocument({ size: 'A4', margin: M });
  const stream = fs.createWriteStream(OUT);
  doc.pipe(stream);

  // PAGE 1 — Cover
  doc.rect(0, 0, 595.28, 841.89).fill(C_DARK);
  doc.rect(0, 0, 595.28, 350).fill(C_PRIMARY);
  if (fs.existsSync(LOGO)) try { doc.image(fs.readFileSync(LOGO), M, 60, { width: 180 }); } catch (_) {}
  doc.fontSize(32).font('Helvetica-Bold').fillColor('#fff').text('Informe de Entrega', M, 210).text('de Proyecto', M, 250);
  doc.fontSize(48).font('Helvetica-Bold').fillColor(C_ACCENT).text('Molipar S.A.', M, 300);
  doc.rect(M, 365, 80, 3).fill(C_ACCENT);
  doc.fontSize(14).font('Helvetica').fillColor('#cbd5e1').text('Sitio Web Corporativo — Catálogo de Productos', M, 390).text('Panel de Administración — Venta Directa', M, 412);
  doc.fontSize(11).font('Helvetica').fillColor('#94a3b8').text('Desarrollado por:', M, 470);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#fff').text('Brahian González', M, 488);
  doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('Consultoría de Software & Arquitectura Serverless', M, 508);
  doc.text('https://brahian.dev', M, 526).text('Fecha de entrega: ' + today, M, 570);
  pageCount = 1;

  // PAGE 2 — Content
  doc.addPage();
  pageCount++;
  doc.rect(0, 0, 595.28, 4).fill(C_PRIMARY);
  let y = 60;

  function title(text) {
    doc.text('', M, y); // spacer
    y += 5;
    doc.fontSize(18).font('Helvetica-Bold').fillColor(C_DARK).text(text, M, y);
    doc.rect(M, y + 22, 60, 3).fill(C_ACCENT);
    y += 40;
  }
  function body(text) {
    y = wrap(doc, text, M, y, CW, 14) + 8;
  }
  function bullet(text) {
    y += 2;
    doc.fontSize(10).font('Helvetica').fillColor(C_BODY);
    doc.circle(M + 14, y + 3, 2).fill(C_ACCENT);
    y = wrap(doc, text, M + 20, y, CW - 20, 14) + 4;
  }
  function sub(text) {
    y += 5;
    doc.fontSize(12).font('Helvetica-Bold').fillColor(C_DARK).text(text, M, y);
    y += 24;
  }
  function footer() {
    doc.fontSize(8).fillColor(C_GRAY).text('Documento de Entrega — Molipar S.A.', M, 780, { align: 'left', width: 250 });
    doc.text('Página ' + pageCount, 495.28, 780, { width: 80, align: 'right' });
    doc.rect(M, 770, CW, 1).fill('#e5e7eb');
  }

  const breakSection = () => { footer(); doc.addPage(); pageCount++; doc.rect(0, 0, 595.28, 4).fill(C_PRIMARY); y = 60; };
  const breakIfNeeded = () => { if (y > 680) breakSection(); };

  title('1. Información del Proyecto');
  body('Se presenta la entrega formal del sitio web corporativo de Molipar S.A., empresa paraguaya dedicada a la producción y comercialización de harinas y fideos. El proyecto fue desarrollado por Brahian González.');

  title('2. Resumen del Proyecto');
  body('El sitio web de Molipar S.A. incluye:');
  bullet('Sitio web público con presencia profesional en internet: página de inicio, historia de la empresa, catálogo de productos (harinas y fideos), sucursales, venta directa por regiones, calidad y contacto.');
  bullet('Panel de administración privado donde el personal de Molipar puede gestionar productos, ver mensajes de contacto, administrar usuarios, configurar datos de la empresa y gestionar regiones de venta directa.');
  bullet('Catálogo digital completo con imágenes, presentaciones y galería de fotos para cada producto.');
  bullet('Formulario de contacto que envía los mensajes directamente al panel de administración.');
  bullet('Diseño moderno y adaptado a celulares, tablets y computadoras.');

  title('3. Funcionalidades del Sitio');
  sub('Sitio Público (visible para todos los visitantes)');
  bullet('Inicio: Portada principal con presentación de la empresa, productos destacados y enlaces a las secciones principales.');
  bullet('Nosotros: Historia de Molipar, misión, visión, valores y el proceso de producción.');
  bullet('Productos: Catálogo completo de harinas y fideos con fotos, presentaciones y galería de imágenes.');
  bullet('Sucursales: Direcciones y datos de contacto de todas las sucursales.');
  bullet('Venta Directa: Regiones habilitadas para venta directa con teléfonos de contacto.');
  bullet('Calidad: Información sobre certificaciones y controles de calidad.');
  bullet('Contacto: Formulario para que clientes envíen consultas directamente.');

  sub('Panel de Administración (acceso privado con usuario y contraseña)');
  bullet('Dashboard: Resumen general con estadísticas del sitio.');
  bullet('Productos: Agregar, editar y eliminar productos con imágenes y presentaciones.');
  bullet('Usuarios: Gestionar quién puede acceder al panel de administración.');
  bullet('Configuración: Editar datos de la empresa, contacto, WhatsApp, redes sociales y contenido de la portada.');
  bullet('Mensajes: Bandeja de entrada con los mensajes recibidos del formulario de contacto.');
  bullet('Venta Directa: Administrar las regiones de venta directa con sus teléfonos y localidades.');

  breakIfNeeded();
  title('4. Inversión y Costos');

  // Card 1
  y += 5;
  doc.roundedRect(M, y, CW, 210, 8).fill('#f8f9fa').roundedRect(M, y, CW, 210, 8).lineWidth(1).stroke('#e5e7eb');
  doc.fontSize(16).font('Helvetica-Bold').fillColor(C_DARK).text('Inversión Total del Proyecto', M + 20, y + 15);
  doc.fontSize(36).font('Helvetica-Bold').fillColor(C_PRIMARY).text('Gs. 2.000.000', M + 20, y + 45);
  doc.fontSize(9).font('Helvetica').fillColor(C_GRAY).text('(Guaraníes — Dos Millones)', M + 20, y + 85);
  doc.rect(M + 20, y + 105, CW - 40, 1).fill('#e5e7eb');
  doc.fontSize(10).font('Helvetica').fillColor(C_BODY).text('El presupuesto incluye:', M + 20, y + 118);
  doc.text('✓ Desarrollo completo del sitio web y panel de administración', M + 25, y + 138);
  doc.text('✓ Dominio .com por 1 año (Gs. 150.000 incluidos en el total)', M + 25, y + 156);
  doc.text('✓ Configuración de infraestructura y publicación en internet', M + 25, y + 174);
  doc.text('✓ Capacitación básica para uso del panel de administración', M + 25, y + 192);
  y += 225;

  // Card 2
  doc.roundedRect(M, y, CW, 85, 8).fill('#fffbeb').roundedRect(M, y, CW, 85, 8).lineWidth(1).stroke('#fde68a');
  doc.fontSize(12).font('Helvetica-Bold').fillColor(C_DARK).text('Renovación Anual de Dominio', M + 20, y + 12);
  doc.fontSize(10).font('Helvetica').fillColor(C_BODY).text('El dominio deberá renovarse cada año para mantener el sitio funcionando.', M + 20, y + 35);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(C_ACCENT).text('Gs. 20.000 / año', M + 20, y + 58);
  doc.fontSize(9).font('Helvetica').fillColor(C_GRAY).text('(costo de gestión incluido)', M + 20, y + 74);
  y += 100;

  // Card 3
  doc.roundedRect(M, y, CW, 110, 8).fill('#f0fdf4').roundedRect(M, y, CW, 110, 8).lineWidth(1).stroke('#bbf7d0');
  doc.fontSize(12).font('Helvetica-Bold').fillColor(C_DARK).text('Mantenimiento Mensual (Opcional)', M + 20, y + 12);
  doc.fontSize(10).font('Helvetica').fillColor(C_BODY).text('El mantenimiento mensual no es obligatorio.', M + 20, y + 35);
  doc.text('Incluye: soporte técnico, actualizaciones de contenido,', M + 20, y + 52);
  doc.text('backups de seguridad y monitoreo del sitio.', M + 20, y + 69);
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#16a34a').text('Gs. 50.000 / mes', M + 20, y + 90);
  y += 130;

  breakIfNeeded();
  title('5. Recomendaciones');
  bullet('Renovar el dominio cada año para evitar la pérdida del sitio web.');
  bullet('Realizar copias de seguridad periódicas de la base de datos.');
  bullet('Mantener las contraseñas del panel de administración en un lugar seguro.');
  bullet('Considerar el servicio de mantenimiento mensual para asegurar soporte continuo y actualizaciones.');

  breakIfNeeded();
  title('6. Firmas');
  body('Este documento certifica la entrega formal del proyecto web de Molipar S.A., desarrollado por Brahian González. Ambas partes firman en conformidad.');
  y += 10;

  doc.rect(M, y, CW, 1).fill('#e5e7eb');
  y += 18;
  doc.fontSize(10).font('Helvetica').fillColor(C_GRAY).text('Se firma en conformidad por ambas partes:', M, y);
  y += 40;

  doc.rect(M, y, 200, 1).fill(C_DARK);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C_DARK).text('Brahian González', M, y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(C_GRAY).text('Desarrollador / Consultor', M, y + 26);
  doc.text('brahian.dev', M, y + 38);

  doc.rect(345.28, y, 200, 1).fill(C_DARK);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C_DARK).text('Molipar S.A.', 345.28, y + 10);
  doc.fontSize(9).font('Helvetica').fillColor(C_GRAY).text('Representante Legal', 345.28, y + 26);
  doc.text('___________________________', 345.28, y + 38);

  y += 90;
  doc.rect(M, y, CW, 1).fill('#e5e7eb');
  y += 18;
  doc.fontSize(9).font('Helvetica').fillColor(C_GRAY).text('Fecha: ' + today, M, y);
  doc.text('Versión del documento: 1.0', M, y + 14);

  footer();
  doc.end();
  stream.on('finish', () => {
    console.log('PDF: ' + OUT);
    console.log('Tamaño: ' + (fs.statSync(OUT).size / 1024).toFixed(1) + ' KB');
  });
}

main().catch(console.error);
