import { cp, mkdir, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const path of ['index.html', 'styles.css', 'src', 'favicon.svg', 'manifest.webmanifest', 'icons', 'images', '.nojekyll']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
const assets = (await readdir('dist', { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name !== '.nojekyll')
  .map(entry => './' + `${entry.parentPath}/${entry.name}`.replace(/^dist\//, '')).sort();
const worker = await readFile('sw.js', 'utf8');
const hash = createHash('sha256').update(worker);
for (const asset of assets) hash.update(asset).update(await readFile(`dist/${asset}`));
await writeFile('dist/sw.js', worker
  .replace("const VERSION = 'development';", `const VERSION = '${hash.digest('hex').slice(0, 20)}';`)
  .replace(/^const ASSETS = .*;$/m, `const ASSETS = ${JSON.stringify(assets)};`));
console.log('Statische PWA in dist/ erstellt.');
