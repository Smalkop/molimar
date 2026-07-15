import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve } from 'path';

const MIME = {
  html: 'text/html', css: 'text/css', js: 'application/javascript',
  json: 'application/json', png: 'image/png', jpg: 'image/jpeg',
  jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml',
  ico: 'image/x-icon', webp: 'image/webp',
};

function walk(dir, prefix, files) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, prefix + entry + '/', files);
    } else {
      const ext = entry.split('.').pop().toLowerCase();
      files.push({ key: 'static/' + prefix + entry, path: full, type: MIME[ext] || 'application/octet-stream' });
    }
  }
}

const files = [];
walk(resolve('static'), '', files);

console.log(`Uploading ${files.length} static files to R2...`);
for (const f of files) {
  console.log(`  ${f.key}`);
  execSync(
    `npx wrangler r2 object put productos-clientes/${f.key} --file="${f.path}" --content-type="${f.type}"`,
    { stdio: 'inherit' }
  );
}
console.log('Done!');
