import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const expoSource = path.join(distDir, '_expo');
const expoTarget = path.join(distDir, 'expo-static');
const indexPath = path.join(distDir, 'index.html');

function copyRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

if (!fs.existsSync(expoSource)) {
  console.error('post-web-export: dist/_expo fehlt — expo export zuerst ausführen.');
  process.exit(1);
}

if (fs.existsSync(expoTarget)) {
  fs.rmSync(expoTarget, { recursive: true, force: true });
}

copyRecursive(expoSource, expoTarget);

if (!fs.existsSync(indexPath)) {
  console.error('post-web-export: dist/index.html fehlt.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8').replaceAll('/_expo/', '/expo-static/');

// Expo export references the bundle without type="module", but Metro emits import.meta
// (e.g. from expo-asset). Classic scripts throw → blank page on web.
html = html.replace(
  /<script src="(\/expo-static\/[^"]+\.js)"(\s+defer)?><\/script>/,
  '<script type="module" src="$1"></script>'
);

html = html.replace(
  /<meta name="viewport" content="([^"]*)"\s*\/?>/i,
  (_, content) => {
    const parts = content
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.some((part) => part.startsWith('viewport-fit='))) {
      parts.push('viewport-fit=cover');
    }
    return `<meta name="viewport" content="${parts.join(', ')}" />`;
  }
);

fs.writeFileSync(indexPath, html);

console.log('post-web-export: _expo → expo-static kopiert, index.html angepasst (type=module).');
