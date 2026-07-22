// Crea o resetea el usuario admin inicial en D1 (local o remoto).
// Uso:
//   INITIAL_ADMIN_PASSWORD='v6V$FXcQ!9' ADMIN_EMAIL=admin@molipar.com node scripts/seed-admin.mjs
//
// El password se toma SIEMPRE de una variable de entorno para que nunca
// termine commiteado en el repositorio (P0-2). Si no se provee, se genera
// uno aleatorio y se imprime una sola vez.
//
// Requiere `npm run migrate:local` (o `migrate` para remote) ejecutado
// previamente, ya que usa la conexión D1 que wrangler expone por CLI.
//
// Para apuntar a remoto, exporta REMOTE=1 (usa `wrangler d1 execute molipar --remote`).
// Por defecto apunta a local.

import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const PASSWORD = process.env.INITIAL_ADMIN_PASSWORD;
const EMAIL = process.env.ADMIN_EMAIL || 'admin@molipar.com';
const NAME = process.env.ADMIN_NAME || 'Administrador';
const REMOTE = process.env.REMOTE === '1';

if (!PASSWORD) {
  const generated = randomBytes(18).toString('base64').replace(/[+/=]/g, '').slice(0, 20);
  console.error('\n[seed-admin] No se proveyó INITIAL_ADMIN_PASSWORD.');
  console.error('Generado para esta ejecución (copia y guarda en secretos ahora):');
  console.error(`  ${generated}\n`);
  console.error('Re-ejecutá con:');
  console.error(`  INITIAL_ADMIN_PASSWORD='${generated}' node scripts/seed-admin.mjs\n`);
  process.exit(1);
}

// Helper para emitir un script SQL reversible a través de `wrangler d1 execute`.
// Hacemos el hash con la misma PBKDF2 (100k, SHA-256, salt aleatorio 16 bytes).
async function pbkdf2Hex(password, saltHex) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = Uint8Array.from(saltHex.match(/.{2}/g).map((b) => parseInt(b, 16)));
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const saltBytes = new Uint8Array(16);
crypto.getRandomValues(saltBytes);
const saltHex = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
const hashHex = await pbkdf2Hex(PASSWORD, saltHex);
const hashed = `${saltHex}:${hashHex}`;

const flag = REMOTE ? '--remote' : '--local';
const sql = `INSERT INTO users (name, email, password, role, active)
VALUES ('${NAME.replace(/'/g, "''")}', '${EMAIL.replace(/'/g, "''")}', '${hashed}', 'admin', 1)
ON CONFLICT(email) DO UPDATE SET password = excluded.password, active = 1, role = 'admin', updated_at = datetime('now');`;

const { execFileSync } = await import('node:child_process');
const args = ['wrangler', 'd1', 'execute', 'molipar', flag, '--command', sql];
console.log(`[seed-admin] Aplicando en modo ${REMOTE ? 'REMOTO' : 'local'}...`);
try {
  execFileSync('npx', args, { stdio: 'inherit' });
  console.log(`[seed-admin] OK. Admin listo: ${EMAIL}`);
} catch (e) {
  console.error('[seed-admin] Falló la ejecución. ¿Corriste la migration previamente?');
  process.exit(1);
}
