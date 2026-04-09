#!/usr/bin/env node
/**
 * Casa NāM Pitch Deck → PDF exporter
 * Captures each slide as a screenshot, then combines into a single PDF.
 * This avoids print-media quirks and gives pixel-perfect output.
 *
 * Usage:
 *   node export-pdf.mjs                  # serves locally & exports
 *   node export-pdf.mjs --url http://…   # use an existing server
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFile, writeFile, unlink, mkdir } from 'fs/promises';
import { resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT  = resolve(__dirname, 'Casa-NaM-Pitch-Deck.pdf');
const TMP  = resolve(__dirname, '.tmp-slides');

const SLIDE_W = 1440;
const SLIDE_H = 810;

/* ── tiny static server ── */
const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp',
  '.mp4':'video/mp4', '.woff2':'font/woff2', '.woff':'font/woff' };

function serve(root, port) {
  return new Promise((res) => {
    const srv = createServer(async (req, resp) => {
      let p = resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
      if (p.endsWith('/')) p += 'index.html';
      try {
        const buf = await readFile(p);
        resp.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
        resp.end(buf);
      } catch { resp.writeHead(404); resp.end('Not found'); }
    });
    srv.listen(port, () => { console.log(`  Serving on http://localhost:${port}`); res(srv); });
  });
}

/* ── main ── */
const args = process.argv.slice(2);
const urlIdx = args.indexOf('--url');
let baseUrl = urlIdx !== -1 ? args[urlIdx + 1] : null;
let server;

if (!baseUrl) {
  const port = 9222;
  server = await serve(ROOT, port);
  baseUrl = `http://localhost:${port}/pitch/index.html`;
}

console.log('  Launching browser…');
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

// Set viewport to exact slide dimensions
await page.setViewport({ width: SLIDE_W, height: SLIDE_H, deviceScaleFactor: 2 });
await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });

// Ensure screen media (not print)
await page.emulateMediaType('screen');

// Count slides and hide nav
const slideCount = await page.evaluate(() => {
  // Hide nav bar and other chrome
  const style = document.createElement('style');
  style.textContent = `
    .nav-bar, .progress-bar, .slide-nav-dropdown, .slide-nav-backdrop,
    .nav-hint, .cta-sticky-bar, .hero-arrow-hint, .env-badge { display: none !important; }
    .deck-wrapper { height: 100vh !important; }
    /* Force all animation-dependent elements visible */
    .fade-up { opacity: 1 !important; }
    .tl-item { opacity: 1 !important; }
    .tl::before { transform: scaleX(1) !important; }
  `;
  document.head.appendChild(style);
  return document.querySelectorAll('.slide').length;
});

console.log(`  Found ${slideCount} slides`);

// Wait for fonts and images
await new Promise(r => setTimeout(r, 2000));

// Navigate to each slide and capture a screenshot
await mkdir(TMP, { recursive: true });
const screenshotPaths = [];

for (let i = 0; i < slideCount; i++) {
  // Use the deck's own navigation to show slide i
  await page.evaluate((idx) => {
    if (typeof goToSlide === 'function') {
      goToSlide(idx);
    } else {
      // Fallback: manually set transform
      const deck = document.querySelector('.deck');
      deck.style.transition = 'none';
      deck.style.transform = `translateX(-${idx * 100}vw)`;
    }
  }, i);

  // Small wait for any transition/render
  await new Promise(r => setTimeout(r, 300));

  const path = resolve(TMP, `slide-${String(i).padStart(3, '0')}.png`);
  await page.screenshot({ path, type: 'png', clip: { x: 0, y: 0, width: SLIDE_W, height: SLIDE_H } });
  screenshotPaths.push(path);
  process.stdout.write(`  Captured slide ${i + 1}/${slideCount}\r`);
}
console.log(`  Captured all ${slideCount} slides     `);

// Now create a PDF from the screenshots
// Open a blank page, inject all images, and print to PDF
const pdfPage = await browser.newPage();
await pdfPage.setViewport({ width: SLIDE_W, height: SLIDE_H, deviceScaleFactor: 2 });

// Build an HTML page with all slide images
const imgTags = [];
for (const sp of screenshotPaths) {
  const buf = await readFile(sp);
  const b64 = buf.toString('base64');
  imgTags.push(`<div class="page"><img src="data:image/png;base64,${b64}"></div>`);
}

const html = `<!DOCTYPE html><html><head><style>
  * { margin: 0; padding: 0; }
  @page { size: ${SLIDE_W}px ${SLIDE_H}px; margin: 0; }
  .page { width: ${SLIDE_W}px; height: ${SLIDE_H}px; page-break-after: always; overflow: hidden; }
  .page:last-child { page-break-after: auto; }
  .page img { width: 100%; height: 100%; display: block; object-fit: cover; }
</style></head><body>${imgTags.join('\n')}</body></html>`;

await pdfPage.setContent(html, { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 1000));

console.log('  Generating PDF…');
await pdfPage.pdf({
  path: OUT,
  width: `${SLIDE_W}px`,
  height: `${SLIDE_H}px`,
  printBackground: true,
  preferCSSPageSize: false,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

// Cleanup temp files
for (const sp of screenshotPaths) {
  await unlink(sp).catch(() => {});
}
await unlink(TMP).catch(() => {});

console.log(`  ✓ Exported to ${OUT}`);

await browser.close();
if (server) server.close();
process.exit(0);
