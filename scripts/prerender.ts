/**
 * Post-build SSG: emits per-route static HTML with route-specific meta tags.
 *
 * Each subcategory + category + pillar becomes its own static HTML file at
 * `dist/<pillar>/<category>/<subcategory>/index.html` etc. The body is the
 * same SPA shell as the original index.html (it still hydrates client-side),
 * but the meta tags are now route-specific so LinkedIn / Twitter / Google
 * see proper per-page metadata.
 *
 * Run after `vite build`.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pillars, categories } from "../src/data/complianceData";

const SITE_ORIGIN = "https://ai-compliance.dk";
const SITE_NAME = "AI Compliance";
const DIST = "dist";

const template = readFileSync(join(DIST, "index.html"), "utf-8");

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ")
    .trim();

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

function generatePage(
  routePath: string,
  meta: { title: string; description: string; canonical: string }
) {
  const outDir = join(DIST, routePath);
  mkdirSync(outDir, { recursive: true });

  let html = template;
  const t = esc(meta.title);
  const d = esc(truncate(meta.description, 200));
  const c = esc(meta.canonical);

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  // Replace description meta
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${d}" />`
  );
  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${c}" />`
  );
  // Replace og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${t}" />`
  );
  // Replace og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${d}" />`
  );
  // Replace og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${c}" />`
  );
  // Replace twitter:title
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${t}" />`
  );
  // Replace twitter:description
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${d}" />`
  );

  writeFileSync(join(outDir, "index.html"), html);
}

type SitemapEntry = { loc: string; priority: string };
const sitemap: SitemapEntry[] = [{ loc: `${SITE_ORIGIN}/`, priority: "1.0" }];

let count = 0;

// Pillar pages
for (const pillar of pillars) {
  const canonical = `${SITE_ORIGIN}/${pillar.id}/`;
  generatePage(pillar.id, {
    title: `${pillar.name} — ${SITE_NAME}`,
    description: pillar.description,
    canonical,
  });
  sitemap.push({ loc: canonical, priority: "0.8" });
  count++;
}

// Category and subcategory pages
for (const cat of categories) {
  const catCanonical = `${SITE_ORIGIN}/${cat.pillar}/${cat.id}/`;
  generatePage(`${cat.pillar}/${cat.id}`, {
    title: `${cat.name} — ${SITE_NAME}`,
    description: cat.description,
    canonical: catCanonical,
  });
  sitemap.push({ loc: catCanonical, priority: "0.7" });
  count++;

  for (const sub of cat.subcategories) {
    const subCanonical = `${SITE_ORIGIN}/${cat.pillar}/${cat.id}/${sub.id}/`;
    generatePage(`${cat.pillar}/${cat.id}/${sub.id}`, {
      title: `${sub.name} — ${cat.name} | ${SITE_NAME}`,
      description: sub.description,
      canonical: subCanonical,
    });
    sitemap.push({ loc: subCanonical, priority: "0.6" });
    count++;
  }
}

const today = new Date().toISOString().slice(0, 10);
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map(
    (e) =>
      `  <url><loc>${e.loc}</loc><lastmod>${today}</lastmod><priority>${e.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
writeFileSync(join(DIST, "sitemap.xml"), sitemapXml);

console.log(`✓ Prerendered ${count} routes + sitemap.xml (${sitemap.length} URLs) into dist/`);
