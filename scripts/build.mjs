// Build: site.config.mjs + src/ → dist/ (statyczny HTML, gotowy dla Netlify)
// Uruchomienie: npm run build

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import config from '../site.config.mjs';
import { renderIndex } from '../src/templates/index.mjs';
import { renderThanks, renderNotFound, renderPrivacy } from '../src/templates/pages.mjs';
import { collectTodos, printTodos } from './todo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const CACHE = path.join(ROOT, '.cache', 'img');

const rel = (p) => path.join(ROOT, p);
const hashOf = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);

let sharp; // ładowany tylko, gdy potrzebny
async function getSharp() {
  sharp ??= (await import('sharp')).default;
  return sharp;
}

// ---------------------------------------------------------------------------
//  CSS — proste minifikowanie (CSS jest wstawiany inline w <head>)
// ---------------------------------------------------------------------------
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}

// ---------------------------------------------------------------------------
//  Obrazy: AVIF + WebP w kilku szerokościach, z wymiarami
// ---------------------------------------------------------------------------
async function responsiveImage(srcPath, { name, widths, aspect, sizes, position = 'attention' }) {
  const s = await getSharp();
  const input = await fs.readFile(srcPath);
  const meta = await s(input).rotate().metadata();
  const [ow, oh] = meta.autoOrient ? [meta.autoOrient.width, meta.autoOrient.height] : [meta.width, meta.height];
  const [aw, ah] = aspect ?? [ow, oh];
  const maxW = Math.min(ow, Math.floor((oh * aw) / ah));
  const ws = [...new Set(widths.map((w) => Math.min(w, maxW)))];
  const hash = hashOf(input);
  await fs.mkdir(path.join(DIST, 'img'), { recursive: true });
  await fs.mkdir(CACHE, { recursive: true });

  const formats = [
    ['avif', 'image/avif', { quality: 55, effort: 4 }],
    ['webp', 'image/webp', { quality: 78 }],
  ];
  const sources = [];
  for (const [ext, type, opts] of formats) {
    const entries = [];
    for (const w of ws) {
      const h = Math.round((w * ah) / aw);
      const file = `${name}-${w}.${hash}.${ext}`;
      const cached = path.join(CACHE, file);
      if (!existsSync(cached)) {
        await s(input).rotate().resize(w, h, { fit: 'cover', position }).toFormat(ext, opts).toFile(cached);
      }
      await fs.copyFile(cached, path.join(DIST, 'img', file));
      entries.push({ url: `/img/${file}`, w, h });
    }
    sources.push({ type, srcset: entries.map((e) => `${e.url} ${e.w}w`).join(', '), entries });
  }
  // <img src> = WebP w średnim rozmiarze (pozostałe dobiera przeglądarka z srcset)
  const webp = sources[1].entries;
  const fallback = webp[Math.min(1, webp.length - 1)];
  return {
    sources: sources.map(({ type, srcset }) => ({ type, srcset })),
    src: fallback.url,
    width: fallback.w,
    height: fallback.h,
    sizes,
  };
}

function findAsset(p) {
  if (!p) return null;
  const full = rel(p);
  if (existsSync(full)) return full;
  // Dopuszczamy inne rozszerzenie niż w configu (np. portret.png zamiast .jpg)
  const base = full.replace(/\.[a-z0-9]+$/i, '');
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.JPG', '.JPEG', '.PNG']) {
    if (existsSync(base + ext)) return base + ext;
  }
  return null;
}

async function processImages() {
  const assets = { portrait: null, locations: [], logo: null, og: null };

  const portraitSrc = findAsset(config.images.portrait?.src);
  if (portraitSrc) {
    assets.portrait = await responsiveImage(portraitSrc, {
      name: 'portret',
      widths: [400, 600, 800, 1080],
      aspect: config.images.portrait.aspect,
      sizes: '(min-width: 56em) 30rem, calc(100vw - 2rem)',
    });
  }

  for (const [i, loc] of config.locations.entries()) {
    const src = findAsset(loc.image);
    assets.locations[i] =
      loc.show !== false && src
        ? await responsiveImage(src, {
            name: `placowka-${i + 1}`,
            widths: [480, 800, 1200],
            aspect: [3, 2],
            sizes: '(min-width: 48em) 22rem, calc(100vw - 2rem)',
          })
        : null;
  }

  // Logo (SVG lub raster)
  if (config.brand.logo && existsSync(rel(config.brand.logo))) {
    const file = rel(config.brand.logo);
    const buf = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    let width;
    let height;
    if (ext === '.svg') {
      const svg = buf.toString('utf8');
      const vb = svg.match(/viewBox=["']\s*[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
      width = Math.round(Number(vb?.[1] ?? svg.match(/width=["']([\d.]+)/)?.[1] ?? 240));
      height = Math.round(Number(vb?.[2] ?? svg.match(/height=["']([\d.]+)/)?.[1] ?? 40));
    } else {
      const meta = await (await getSharp())(buf).metadata();
      ({ width, height } = meta);
    }
    const out = `logo.${hashOf(buf)}${ext}`;
    await fs.mkdir(path.join(DIST, 'img'), { recursive: true });
    await fs.writeFile(path.join(DIST, 'img', out), buf);
    assets.logo = { src: `/img/${out}`, width, height };
  }

  // Obrazek Open Graph: własny assets/og.jpg albo neutralny z monogramem
  const s = await getSharp();
  const ogSrc = findAsset(config.images.og);
  if (ogSrc) {
    await s(ogSrc).rotate().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(DIST, 'og-image.jpg'));
    assets.og = { src: '/og-image.jpg', width: 1200, height: 630 };
  } else {
    await s(path.join(SRC, 'static/src/og-image.svg')).png({ compressionLevel: 9 }).toFile(path.join(DIST, 'og-image.png'));
    assets.og = { src: '/og-image.png', width: 1200, height: 630 };
  }

  // Favicony: własny assets/favicon.svg albo monogram ND
  const userFavicon = existsSync(rel('assets/favicon.svg'));
  const favicon = userFavicon ? rel('assets/favicon.svg') : path.join(SRC, 'static/src/favicon.svg');
  const touch = userFavicon ? favicon : path.join(SRC, 'static/src/apple-touch-icon.svg');
  await fs.copyFile(favicon, path.join(DIST, 'favicon.svg'));
  const png = (src, size) => s(src, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
  const [p16, p32, p180] = await Promise.all([png(favicon, 16), png(favicon, 32), png(touch, 180)]);
  await fs.writeFile(path.join(DIST, 'favicon-32.png'), p32);
  await fs.writeFile(path.join(DIST, 'apple-touch-icon.png'), p180);
  await fs.writeFile(path.join(DIST, 'favicon.ico'), ico([{ size: 16, buf: p16 }, { size: 32, buf: p32 }]));

  return assets;
}

// Plik .ico z osadzonymi PNG (format obsługiwany przez wszystkie przeglądarki)
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const dir = images.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size, 0);
    e.writeUInt8(size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });
  return Buffer.concat([header, ...dir, ...images.map((i) => i.buf)]);
}

// ---------------------------------------------------------------------------
//  Kontrole spójności — błędy przerywają build
// ---------------------------------------------------------------------------
function checkOutput(indexHtml) {
  const errors = [];
  const must = [
    [`name="${config.form.name}"`, 'formularz o nazwie z configu'],
    ['data-netlify="true"', 'atrybut data-netlify'],
    ['netlify-honeypot="bot-field"', 'honeypot'],
    [`name="form-name" value="${config.form.name}"`, 'ukryte pole form-name'],
    ['action="/dziekujemy"', 'action="/dziekujemy"'],
  ];
  for (const [needle, label] of must) if (!indexHtml.includes(needle)) errors.push(`Brak w index.html: ${label}`);

  // Zgodność z art. 14 u.d.l. i ustalonym nazewnictwem
  const text = indexHtml.replace(/<[^>]+>/g, ' ');
  const forbidden = [/\bortodont[ay]\b/i, /\bortodontk[ai]\b/i, /\bspecjalist[ay]\b/i, /\bdr\.?\s/, /najlepsz/i, /gwarant/i, /promocj/i, /rabat/i];
  for (const re of forbidden) if (re.test(text)) errors.push(`Niedozwolone sformułowanie w treści strony: ${re}`);

  const opts = config.form.interests.map((o) => o.notion);
  if (new Set(opts).size !== opts.length) errors.push('Powtórzone opcje Notion w form.interests');
  return errors;
}

// ---------------------------------------------------------------------------
async function build() {
  const t0 = Date.now();
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(path.join(DIST, 'fonts'), { recursive: true });
  await fs.mkdir(path.join(DIST, 'js'), { recursive: true });

  // Fonty + licencje
  for (const f of await fs.readdir(path.join(SRC, 'fonts'))) {
    await fs.copyFile(path.join(SRC, 'fonts', f), path.join(DIST, 'fonts', f));
  }
  // JS (moduły ES, bez bundlowania)
  for (const f of await fs.readdir(path.join(SRC, 'js'))) {
    await fs.copyFile(path.join(SRC, 'js', f), path.join(DIST, 'js', f));
  }

  const css = minifyCss(await fs.readFile(path.join(SRC, 'styles/main.css'), 'utf8'));
  const assets = await processImages();
  const ctx = { config, css, assets };

  const pages = {
    'index.html': renderIndex(ctx),
    'dziekujemy.html': renderThanks(ctx),
    'polityka-prywatnosci.html': renderPrivacy(ctx),
    '404.html': renderNotFound(ctx),
  };
  for (const [file, html] of Object.entries(pages)) {
    await fs.writeFile(path.join(DIST, file), String(html));
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/polityka-prywatnosci'];
  await fs.writeFile(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${config.site.url}${u}</loc><lastmod>${today}</lastmod></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  await fs.writeFile(
    path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${config.site.url}/sitemap.xml\n`,
  );

  const errors = checkOutput(String(pages['index.html']));
  if (errors.length) {
    console.error('\n✖ Build przerwany:\n  ' + errors.join('\n  '));
    process.exit(1);
  }

  const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
  const indexSize = Buffer.byteLength(String(pages['index.html']));
  console.log(`✔ Zbudowano dist/ w ${Date.now() - t0} ms (index.html: ${kb(indexSize)}, CSS inline: ${kb(css.length)})`);
  console.log(`  Portret: ${assets.portrait ? 'tak' : 'brak (placeholder)'} · Logo: ${assets.logo ? 'tak' : 'tekstowe'} · OG: ${assets.og.src}`);
  console.log(`  Widżet ZnanyLekarz: ${config.booking.widgetHtml.trim() ? 'tak (ładowany po kliknięciu)' : 'brak — przycisk prowadzi do profilu'} · Cennik: ${config.pricing.visible ? 'widoczny' : 'ukryty'}`);

  const todos = await collectTodos();
  printTodos(todos, { compact: true });
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
