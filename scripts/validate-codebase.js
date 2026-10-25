import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function walkFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = [
  ...walkFiles(path.join(ROOT_DIR, 'src')),
  ...walkFiles(path.join(ROOT_DIR, 'server')),
  ...walkFiles(path.join(ROOT_DIR, 'scripts')),
  path.join(ROOT_DIR, 'server.js'),
  path.join(ROOT_DIR, 'vite.config.js'),
].filter((f) => fs.existsSync(f));

const tsFiles = allFiles.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
if (tsFiles.length > 0) {
  console.error('[Validation Failed] Residual TypeScript files detected:');
  for (const f of tsFiles) {
    console.error(' -', path.relative(ROOT_DIR, f));
  }
  process.exit(1);
}

const jsFiles = allFiles.filter((f) => f.endsWith('.js'));
for (const jsFile of jsFiles) {
  execFileSync(process.execPath, ['--check', jsFile], { stdio: 'inherit' });
}

console.log(
  `[Validation Passed] Verified ${jsFiles.length} ES module JavaScript files and confirmed 0 TypeScript files remain.`
);
