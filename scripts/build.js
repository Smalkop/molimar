import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

console.log('Building project...');

// Minify CSS
try {
  execSync('tailwindcss -i ./static/css/tailwind.css -o ./static/css/output.css --minify', { stdio: 'inherit' });
  console.log('  ✓ CSS built');
} catch {
  console.log('  ! Tailwind not installed, creating placeholder CSS');
  const css = readFileSync('./static/css/animations.css', 'utf-8');
  const placeholder = `/* Tailwind placeholder - run 'npm install && npm run build:css' */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Inter, system-ui, sans-serif; }
${css}`;
  writeFileSync('./static/css/output.css', placeholder);
}

// Build React client bundle
try {
  execSync('npx esbuild src/client/homepage.jsx --bundle --outfile=static/js/homepage.bundle.js --format=iife --global-name=HomepageApp --loader:.jsx=jsx --jsx-factory=React.createElement --jsx-fragment=React.Fragment --define:process.env.NODE_ENV=\\"production\\" --minify --target=es2020', { stdio: 'inherit' });
  console.log('  ✓ React bundle built (static/js/homepage.bundle.js)');
} catch (e) {
  console.log('  ✗ React bundle failed:', e.message);
  process.exit(1);
}

// Verify structure
const required = [
  'src/index.js',
  'migrations/001_initial.sql',
  'migrations/002_seed.sql',
  'static/css/animations.css',
  'static/js/animations.js',
  'static/js/homepage.bundle.js',
];

let allOk = true;
for (const file of required) {
  if (!existsSync(file)) {
    console.log(`  ✗ Missing: ${file}`);
    allOk = false;
  }
}

if (allOk) {
  console.log('  ✓ All required files present');
}

console.log('Build complete!');
console.log('Run: wrangler dev --remote   (to test locally with remote resources)');
console.log('Run: npm run deploy          (to deploy to Cloudflare Workers)');
