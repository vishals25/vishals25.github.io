// Post-build step:
//  1. injects the server-rendered app into dist/index.html so crawlers and first
//     paint get real content without running JavaScript;
//  2. replaces the JSON-LD placeholder with structured data built from src/data;
//  3. inlines the built stylesheet (one fewer render-blocking request);
//  4. writes one HTML file per section route (dist/about/index.html, …) plus
//     dist/404.html, so /about etc. resolve on a static host like GitHub Pages;
//  5. fills the site URL / base path into robots.txt, sitemap.xml and the manifest.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = `${root}dist/`;
const ssrDir = `${root}dist-ssr`;

const { render, structuredData, SITE_URL, SECTIONS } = await import(pathToFileURL(`${ssrDir}/entry-server.js`).href);
const base = new URL(SITE_URL).pathname; // '/' or '/<repo>/'
let html = await readFile(`${dist}index.html`, 'utf8');

const marker = '<div id="root"></div>';
if (!html.includes(marker)) {
  throw new Error(`prerender: ${marker} not found in dist/index.html`);
}

// 1. App HTML
const appHtml = render();
html = html.replace(marker, `<div id="root">${appHtml}</div>`);

// 2. JSON-LD
const ldRe = /<script type="application\/ld\+json" id="ld-json">[\s\S]*?<\/script>/;
if (!ldRe.test(html)) {
  throw new Error('prerender: JSON-LD placeholder (#ld-json) not found in dist/index.html');
}
const ld = JSON.stringify(structuredData()).replaceAll('</', '<\\/');
html = html.replace(ldRe, `<script type="application/ld+json" id="ld-json">${ld}</script>`);

// 3. Inline CSS
const cssLinkRe = /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/;
const cssLink = html.match(cssLinkRe);
if (cssLink) {
  const cssPath = `${dist}${cssLink[1].replace(base, '').replace(/^\//, '')}`;
  const css = await readFile(cssPath, 'utf8');
  html = html.replace(cssLinkRe, `<style>${css}</style>`);
  await rm(cssPath, { force: true });
}

await writeFile(`${dist}index.html`, html);

// 4. Route pages: same document, section-specific <title>; canonical stays the root URL
const titleRe = /<title>([^<]*)<\/title>/;
const baseTitle = html.match(titleRe)?.[1] ?? '';
const siteName = baseTitle.split(/\s[–|-]\s/)[0] || 'Vishal S';
let routeCount = 0;
for (const { path, label } of SECTIONS) {
  if (!path) continue;
  const routeHtml = html.replace(titleRe, `<title>${label} – ${siteName}</title>`);
  await mkdir(`${dist}${path}`, { recursive: true });
  await writeFile(`${dist}${path}/index.html`, routeHtml);
  routeCount += 1;
}
// Unknown paths: GitHub Pages serves 404.html, so the site still renders there.
await writeFile(`${dist}404.html`, html);

// 5. Static files that need the deployed URL
const today = new Date().toISOString().slice(0, 10);
const fill = (text) => text.replaceAll('__SITE_URL__', SITE_URL).replaceAll('__BASE__', base).replaceAll('__LASTMOD__', today);
for (const file of ['robots.txt', 'sitemap.xml', 'site.webmanifest']) {
  const text = await readFile(`${dist}${file}`, 'utf8');
  await writeFile(`${dist}${file}`, fill(text));
}

await rm(ssrDir, { recursive: true, force: true });

console.log(
  `prerender: ${SITE_URL} (base ${base}) — injected ${(appHtml.length / 1024).toFixed(1)} kB of HTML + ${(ld.length / 1024).toFixed(1)} kB of JSON-LD, inlined CSS, wrote ${routeCount} route pages + 404.html`,
);
