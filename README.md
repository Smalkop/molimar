# molimar

Sitio web de Molipar S.A. (harinas y pastas) construido con Cloudflare Workers, D1, R2 y una parte de React/JSX.

## Requisitos

- Node.js 18+
- `wrangler` (Cloudflare) con acceso al account `molipar`

## Configuración de secretos

El secreto `JWT_SECRET` **no** se versiona en el repositorio. Para configurarlo en Cloudflare (producción):

```bash
npx wrangler secret put JWT_SECRET
# pegar un valor aleatorio largo, p.ej. generado con:
# node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Para desarrollo local, crear un archivo `.dev.vars` (ignorado por git) con:

```
JWT_SECRET=dev-secret-for-local-test-only
```

## Variables de entorno

Definidas en `wrangler.toml` (`[vars]`):

- `SITE_NAME`: nombre del sitio.
- `SITE_URL`: URL pública.
- `ADMIN_EMAIL`: email del administrador.
- `APP_ENV`: entorno (`production` en producción). Controla comportamientos como el atributo `Secure` de la cookie de sesión.

Default admin (creado automáticamente): el usuario inicial se crea la primera vez con `ADMIN_EMAIL` y password `admin123`. Cambiarlo desde el panel de administración lo antes posible.

## Comandos

```bash
npm run dev      # servidor local
npm run build    # procesa CSS y bundle React
npx wrangler deploy
```

## Recursos Cloudflare

- D1 (`DB`): base de datos `molipar`, id `193436ea-ed62-4c45-a465-6e73fa3a46cf`.
- R2 (`R2`): bucket `productos-clientes`.

## Migraciones de bases de datos

- `migrations/`: SQL aplicados con `npx wrangler d1 migrations apply molipar`.