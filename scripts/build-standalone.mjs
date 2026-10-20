// Genera dist/dashboard-standalone.html: un unico file HTML con CSS, Chart.js e codice applicativo
// incorporati, apribile con doppio clic e utilizzabile offline.
// Uso: npm run build:standalone

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('..', import.meta.url);
const fromRoot = path => new URL(path, root);

const CHART_CDN_TAG = /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js@[^"]+"[^>]*><\/script>/;
const STYLESHEET_TAG = /<link rel="stylesheet" href="assets\/css\/app\.css">/;
const APP_MODULE_TAG = /<script type="module" src="src\/main\.js"><\/script>/;

// Evita che una sequenza "</script" nel codice incorporato chiuda il tag anticipatamente.
const inlineScript = code => `<script>${code.replace(/<\/script/gi, '<\\/script')}</script>`;

function replaceOnce(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`Elemento non trovato in index.html: ${pattern}`);
  return html.replace(pattern, () => replacement);
}

const [html, css, chartJs, bundle] = await Promise.all([
  readFile(fromRoot('index.html'), 'utf8'),
  readFile(fromRoot('assets/css/app.css'), 'utf8'),
  readFile(fromRoot('node_modules/chart.js/dist/chart.umd.min.js'), 'utf8'),
  build({
    entryPoints: [fileURLToPath(fromRoot('src/main.js'))],
    bundle: true,
    format: 'iife',
    minify: true,
    target: 'es2020',
    write: false
  }).then(result => result.outputFiles[0].text)
]);

let output = replaceOnce(html, STYLESHEET_TAG, `<style>${css}</style>`);
output = replaceOnce(output, CHART_CDN_TAG, inlineScript(chartJs));
output = replaceOnce(output, APP_MODULE_TAG, inlineScript(bundle));

await mkdir(fromRoot('dist/'), { recursive: true });
await writeFile(fromRoot('dist/dashboard-standalone.html'), output);
console.log(`Creato dist/dashboard-standalone.html (${Math.round(output.length / 1024)} kB)`);
