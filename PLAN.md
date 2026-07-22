# Plan de Remediación — Molipar

Documento de seguimiento de los issues detectados en el análisis del código de /molimar.

Severidad: **P0** (crítico, ejecutar ya) · **P1** (alto) · **P2** (medio) · **P3** (bajo / técnico-deuda).
Esfuerzo: S (≤1h) · M (1–4h) · L (4h–1d) · XL (>1d).

Orden de ejecución recomendado: primero bloque P0 completo (puede hacerse en un solo PR), luego P1, después P2/P3.

---

## P0 — Críticos de seguridad

| # | Issue | Lugar | Esfuerzo | Acción |
|---|-------|-------|----------|--------|
| P0-1 | `JWT_SECRET` en texto plano en `wrangler.toml` (committed en git) | `wrangler.toml:22` | S | Mover a Wrangler secret: `npx wrangler secret put JWT_SECRET`, quitar de `[vars]` y de git (rotar el valor + `git filter-repo` si el repo ya está publicado). |
| P0-2 | Admin por defecto `admin@molipar.com / admin123` creado en cada cold start si no existe; flag `default_password_changed` seteado pero nunca verificado | `src/index.js:187,195` | S | Eliminar la creación automática del admin en `ensureDatabase`. Forzar setup inicial vía script de seed/local con password aleatoria o figura en variable de entorno `INITIAL_ADMIN_PASSWORD` (también como secret). Bloquear login mientras `default_password_changed = 0`. |
| P0-3 | Escalada de privilegios: `requireAdmin` solo valida autenticación; `users.js` y `settings.js` aplican `user.role === 'admin'` solo en el handler HTML, no en la API. Un editor puede `PUT /admin/api/configuracion`, `POST /admin/api/usuarios`, `DELETE /admin/api/usuarios/:id`, etc. | `src/middleware/auth.js`, `src/routes/admin/users.js`, `src/routes/admin/settings.js` | M | Mover el check `user.role === 'admin'` a cada `*Api` de usuarios, settings (y revisar mensajes, productos, direct-sales). Mejor: crear `requireAdminRole(request, env)` que devuelva 403 si `user.role !== 'admin'` y aplicarlo a las rutas sensibles. |
| P0-4 | Flag `Secure` de la cookie nunca se setea: la condición usa `env.NODE_ENV === 'production'` pero `NODE_ENV` no existe en `vars` (Workers no lo expone). Cookie viaja sin `Secure` incluso en HTTPS. | `src/routes/admin/login.js:167` | S | Reemplazar la condición por verificación de host o por una var fija `COOKIE_SECURE=true` en `[vars]`; lo más simple: setear siempre `; Secure` (el sitio es HTTPS-only) y validar en dev local con `wrangler dev --local` (que sirve HTTP). |
| P0-5 | Invalidación de tokens en memoria (`invalidatedTokens = new Set()`). Se pierde en cada cold start y entre isolates; logout es cosmético. | `src/services/auth.js:136-144` | M | Persistir invalidaciones en D1 (tabla `revoked_tokens(jti TEXT PK, expires_at TEXT)`) o en KV. Limpiar tokens expirados con un TTL. Verificar `jti` en cada request. |
| P0-6 | `ensureDatabase` corre destructivamente en cada cold start: `DELETE + re-INSERT` de imágenes de galería harina (`:244-254`). Concurrencia de isolates puede corromper datos. | `src/index.js:244-254` (y `:160-258` completo) | M | Eliminar el bloque destructivo. Mover toda la inicialización/migración a un script de deploy one-shot (`npm run migrate`) y quitar `ensureDatabase` del request path. Dejar solo un `DB_READY` sanity check. |

**Criterio de salida P0:** no hay secretos en git, no hay admin por defecto expuesto, no hay privilegios escalados, no hay cookies sin Secure, logout realmente revoca, cold start no modifica datos.

---

## P1 — Altos

| # | Issue | Lugar | Esfuerzo | Acción |
|---|-------|-------|----------|--------|
| P1-1 | `sales_regions` no tiene migration file: solo se crea por `ALTER`/`CREATE TABLE IF NOT EXISTS` en runtime. Restaurar desde migrations 001-003 fallaría. | `src/index.js:243` | S | Crear `migrations/004_sales_regions.sql` con `CREATE TABLE IF NOT EXISTS` + seed de las 5 regiones. Eliminar la creación runtime. |
| P1-2 | `crop_x`/`crop_y` columnas no están en migration 001; se agregan vía `ALTER TABLE` con try/catch silencioso en runtime. | `src/index.js:208-209`, `migrations/001_initial.sql` | S | Incluir las columnas en `migrations/005_products_crop.sql` (o en 001 si todavía no se deployó) y quitar el `ALTER` runtime. |
| P1-3 | `bcryptjs` está en `package.json` pero no se usa (auth es PBKDF2). \`framer-motion ^12.42.2\` pesado solo para animaciones del hero. | `package.json:24-26` | S | Quitar `bcryptjs`. Evaluar reemplazar framer-motion por CSS animations + IntersectionObserver (ya existe en `ANIMATIONS_JS`) y quitar el runtime de React. |
| P1-4 | Homepage 100% client-rendered: `<div id="homepage-root">` vacío + bundle React. SEO y FCP pobres; sin JS no hay contenido. framer-motion descarga pesado. | `src/client/homepage.jsx:339`, `src/routes/public/home.js:49` | L | SSR del HTML inicial de la home en el Worker (igual que otras páginas) y dejar React solo para animaciones discretas o hidratar el HTML existente con `hydrateRoot` en vez de `createRoot`. |
| P1-5 | Tailwind cargado dos veces: CDN `cdn.tailwindcss.com` (runtime JIT, anti-patrón en producción) en cada página; y `static/css/output.css` compilado y subido a R2 pero nunca referenciado. | `src/components/Layout.js:37`, `scripts/build.js:5` | S | Eliminar el CDN y enlazar `<link rel="stylesheet" href="/css/output.css">` con `nonce` en el CSP. Borrar el build fallback que mascara errores. |
| P1-6 | `image.js` guarda 3 variantes (original, medium, thumbnail) pero son **el mismo buffer** sin resizing. Clientes descargan full-size para thumbs. Prefijo R2 `molipa/` (typo, debería ser `molipar`). | `src/services/image.js:35-71` | L | Implementar resizing real (Cloudflare Image Resizing o un worker de transformación con `@cloudflare/images`/WASM sharp). Corregir prefijo a `molipar/`. Migrar objetos existentes. |
| P1-7 | No hay transacciones en operaciones multi-statement (alta/edición de producto: products + presentations + images; actualización que borra + reinserta imágenes). Fallo parcial deja DB inconsistente. | `src/routes/admin/products.js:540-576` y otros | M | Usar `env.DB.batch([...])` (D1 soporta transacciones vía batch) o `transaction()`. Envolver uploads R2 con compensación: si falla después de un R2 put, eliminar lo subido. |
| P1-8 | Sin global error handler en `fetch`: cualquier throw produce un 500 opaco de Cloudflare. | `src/index.js:270-401` | S | Envolver el cuerpo del `fetch` en `try/catch` que devuelva `htmlResponse('500', 500)` con `console.error` + (opcional) reporte a(env.LOGS). |
| P1-9 | `requireAdmin` y los handlers HTML parsean la cookie con regex `/token=([^;]+)/` en dos sitios separados. Duplicación + deriva. | `src/middleware/auth.js:5`, `src/routes/admin/login.js:179` | S | Extraer `parseCookie(request)` a `utils/cookies.js` (o usar `request.headers` + un helper) y reusar en ambos. |
| P1-10 | Sin CSRF token en POST/PUT/DELETE. SameSite=Strict mitiga, pero los endpoints `multipart/form-data` (productos) son sensibles a CSRF. | todas las `*Api` admin | M | Implementar token CSRF en sesión (hash del jti emitido) y header `X-CSRF-Token`. El admin JS debe leerlo de un meta tag o cookie no-HttpOnly y mandarlo en cada fetch. |
| P1-11 | `bcryptjs` removido en P1-3 — confirmar que no se referencia en ningún lado que el análisis saltó. | grep global | S | `rg bcrypt` antes de tocar `package.json`. |

**Criterio de salida P1:** schema solo vía migrations, deps limpios, homepage SSR, Tailwind en build real, imágenes con resizing, DB consistente, errores visibles, CSRF cubierto.

---

## P2 — Medios / deuda técnica

| # | Issue | Lugar | Esfuerzo | Acción |
|---|-------|-------|----------|--------|
| P2-1 | `adminLayout` definido 6 veces separado (dashboard, products, users, settings, messages, direct-sales) — ~140 líneas duplicadas cada uno. | rutas admin | M | Extraer `src/components/admin/Layout.js` exportando `adminLayout(content, user, {active})`. Reemplazar las 6 copias. |
| P2-2 | `sanitizeString` definido dos veces (idéntico: `utils/html.js` y `utils/Validators.js`). | `utils/html.js:3`, `utils/Validators.js:23` | S | Borrar el de `Validators.js` e importar el de `html.js`. |
| P2-3 | Schema/seed duplicados en 3 sitios: `migrations/001_initial.sql`, `migrations/002_seed.sql`, `migrations/003_fideos_apetito.sql` Y strings `SCHEMA_SQL`/`SEED_SQL`/`MIGRATE_003_SQL` en `src/index.js:24-150`. | `src/index.js` | M | Una vez cerrado P0-6, eliminar los strings JS del esquema y semilla; cargar solo desde `migrations/` vía el script de deploy. |
| P2-4 | JSON-LD `schemaOrganization` definido en `seo.js:25-50` y redefinido inline en `Layout.js:10-22`. | `src/components/Layout.js`, `src/utils/seo.js` | S | Usar la función exportada y borrar el inline. |
| P2-5 | SVG de WhatsApp inline repetido 5+ veces. | products público, contact, direct-sales, footer, layout, login | S | Convertir a `static/images/whatsapp.svg` y referenciar con `<img>`. |
| P2-6 | Sin router lib: gran cadena `if (pathname === ...)` en `index.js:302-383`. Parseo de IDs con `.replace()` frágil, sin validar que sea numérico. | `src/index.js` | M | Migrar a `itty-router` o `Hono` (ligeros). Validar IDs numéricos con `^\d+$` antes de `parseInt`. |
| P2-7 | `messages.js` delete usa `POST /:id/delete`, read usa `POST /:id/read` en vez de `DELETE`/`PATCH`. Inconsistencia con products que usa REST correcto. | `src/routes/admin/messages.js` | S | Cambiar a `DELETE /admin/api/mensajes/:id` y `PATCH /admin/api/mensajes/:id` con `{is_read: 1}`. Actualizar admin JS. |
| P2-8 | `JSON.parse(r.localities || '[]')` sin try/catch: corrupción de dato rompe la página `/venta-directa`. | `src/routes/public/direct-sales.js:27` | S | Envolver en try/catch + log de advertencia. Idealmente guardar `localities` como JSON en otra tabla normalizada. |
| P2-9 | `branches` hardcoded en `branches.js:4` compite con datos de `site_settings` (address, phone). Inconsistencia fuente-de-verdad. | `src/routes/public/branches.js` | M | Crear tabla `branches` (o usar `site_settings` con grupo `branch:<id>`) y CRUD admin. |
| P2-10 | `validateProduct` (`utils/Validators.js:34`) nunca se invoca; el handler hace su propia validación parcial. Otros validadores sí se usan. | `src/routes/admin/products.js:409`, `utils/Validators.js` | S | Conectar `validateProduct` en la API o borrar el helper no usado. |
| P2-11 | Pagina 404 inlinea `<script src="https://cdn.tailwindcss.com">` y no aplica CSP/securityHeaders. | `src/index.js:386-399` | S | Renderizar la 404 con `Layout` (o un `htmlResponse` con `securityHeaders`). |
| P2-12 | `tailwind.config.js` define palette naranja "primary" (#d4702a) pero la UI usa azul #0000ba inline en cada `adminLayout` y `Layout.js`. Config inutilizado. | `tailwind.config.js`, layouts | M | Migrar la paleta real a `tailwind.config.js` y referenciarla; borrar repeticiones inline. |
| P2-13 | `normalizeWhatsApp` convierte prefijo AR `549`→`54` aunque el negocio es Paraguay (prefijo `595`). Dato placeholder `+54 11 4567-8901` en `contact.js` tampoco corresponde a PY. | `src/utils/html.js`, `src/routes/public/contact.js` | S | Correcto `595` para PY. Quitar placeholders AR. |
| P2-14 | `price REAL` definido y siempre NULL. Feature muerta. | migrations, admin products | S | O borrar la columna (con migration 006) o implementar el manejo de precio en el admin + front. |
| P2-15 | Sin rate-limiting en endpoints mutativos admin ni en página 404 (solo existe login). | middleware | M | Rate-limit básico en D1 o KV por IP+path para `/admin/api/*` y `/api/contacto`. |

---

## P3 — Bajos / detalles

| # | Issue | Lugar | Esfuerzo | Acción |
|---|-------|-------|----------|--------|
| P3-1 | `framer-motion ^12.42.2` y `react ^19.2.7` son versiones avanzadas — verificar que el bundle no incluya polyfills innecesarios. | `package.json` | S | Argumento `--target=es2020` alto impacto; también `--mangle-props` cuidado. Revisar tamaño del bundle real. |
| P3-2 | `formatDate` exportado en `html.js` y `messages.js` formatea fechas inline con `toLocaleDateString` sin usarlo. | `src/utils/html.js:37`, `src/routes/admin/messages.js` | S | Usar `formatDate` o eliminarlo. |
| P3-3 | `scripts/generate-delivery-pdf.js` usa `pdfkit` que no está en `package.json`. Script aislado. | `scripts/` | S | Documentar en README que requiere `npm i pdfkit` manual, o separar el script a su propio `package.json`. |
| P3-4 | `README.md` solo tiene `# molimar`. Sin docs de setup, deploy, scripts, estructura. | raíz | M | Documentar setup/dev/deploy/migrate/seed, lista de scripts npm, estructura de carpetas, vinculación D1/R2. |
| P3-5 | `scripts/build.js` valida archivos requeridos pero falla en silencio con placeholder si `tailwindcss` no compila. | `scripts/build.js:5-15` | S | Que el build falle ruidosamente si `output.css` no se genera. |
| P3-6 | `static/css/output.css` gitignored — el deploy depende del builder local correcto. | `.gitignore:5`, `scripts/upload-static.mjs` | S | Asegurar que `npm run build` se ejecute antes de cada deploy vía el script `deploy` (ya lo hace) y/o CI que verifique el hash de output.css. |
| P3-7 | `compatibility_date = "2024-12-01"` pero se usan React 19 y `nodejs_compat`. | `wrangler.toml:3` | S | Actualizar a fecha actual; revisar si `nodejs_compat` es suficiente o si falta `nodejs_compat_v2`. |
| P3-8 | `getPublicUrl` en `storage.js` devuelve el objeto R2, no una URL. Nombre engañoso. | `src/services/storage.js` | S | Renombrar a `get` o devolver realmente una URL pública (con dominio R2 público o vía worker route). |
| P3-9 | `serveMedia` expone `/media/<key>` sin auth ni rate-limit ni listado. Cualquiera con la key descarga. | `src/index.js:290-292` | M | Aceptar (son imágenes públicas de productos) pero documentar; considerar signed URLs si se suben archivos privados. |
| P3-10 | `documento_Entrega_Molipar.pdf` commited en raíz. Archivo grande binario en git. | raíz | S | Mover a `recursos/` o borrar del repo y usar releases/CI para distribuirlo. |

---

## Resumen ejecutivo

- **Total issues:** 38 (6 P0 · 11 P1 · 15 P2 · 10 P3) — estimación nominal: ~3–4 días de trabajo concentrado para P0+P1.
- **Bloque P0** (1 día, un solo PR): secretos, admin por defecto, escalada de privilegios, cookie Secure, revocación durable, eliminar bootstrap destructivo en cold start.
- **Bloque P1** (2–3 días): migrations one-shot, limpiar deps, SSR home, Tailwind real, resizing real de imágenes, transacciones D1, error handler global, CSRF.
- **Bloque P2/P3** se puede agendar por sprints de deuda técnica.

## Notas de ejecución

- Cada bloque se entrega como un PR separado y autónomo (no mezclar P0 con P2).
- Antes de tocar código: respaldar D1 (`wrangler d1 export molipar --remote --output=backup-$(date +%F).sql`) y R2 (`scripts/backup-r2.mjs` pendiente de crear o usando `wrangler r2 object get` script ad-hoc).
- Después de cada bloque: ejecutar `npm run build` y verificar lint/typecheck si se agregan (ver siguiente nota).
- Verdeado faltante: no hay `lint`, `typecheck` ni `test` en `package.json`. Sugerencia: agregar `eslint` mínimo + un smoke test de rutas con Vitest y wrangler local antes del PR final de cada bloque.

---

_Última actualización: $(date). Este documento debe vivir en el repo y actualizarse conforme se cierren issues (marcar `[x]` en la fila correspondiente)._
