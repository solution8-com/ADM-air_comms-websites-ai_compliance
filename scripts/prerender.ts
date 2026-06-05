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
import { pillars, categories, toolsMeta } from "../src/data/complianceData";

const SITE_ORIGIN = "https://ai-compliance.dk";
const SITE_NAME = "AI Compliance";
const DIST = "dist";

type Crumb = { name: string; url: string };
const ROOT_CRUMB: Crumb = { name: "Overblik", url: `${SITE_ORIGIN}/` };
const pillarNameById = (id: string) => pillars.find((p) => p.id === id)?.name ?? id;

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
  meta: { title: string; description: string; canonical: string; breadcrumb?: Crumb[] }
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

  // BreadcrumbList structured data → Google breadcrumb rich results. Lives in
  // <head> so it's read without executing the SPA's client-side JS.
  if (meta.breadcrumb && meta.breadcrumb.length > 1) {
    const ld = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: meta.breadcrumb.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url,
      })),
    };
    html = html.replace(
      "</head>",
      `    <script type="application/ld+json">${JSON.stringify(ld)}</script>\n  </head>`
    );
  }

  writeFileSync(join(outDir, "index.html"), html);
}

type SitemapEntry = { loc: string; priority: string };
const sitemap: SitemapEntry[] = [{ loc: `${SITE_ORIGIN}/`, priority: "1.0" }];

let count = 0;

// Værktøjs-oversigt + per-tool sider (canonical /vaerktoejer/<slug>)
const toolsCanonical = `${SITE_ORIGIN}/vaerktoejer/`;
generatePage("vaerktoejer", {
  title: `Værktøjer — interaktive AI Act-værktøjer | ${SITE_NAME}`,
  description:
    "Interaktive værktøjer til EU AI Act-compliance: AI Act-tidslinje, sektor × regulering-matrix, bødestruktur og dokumentationskort. Del direkte på LinkedIn eller i mail.",
  canonical: toolsCanonical,
  breadcrumb: [ROOT_CRUMB, { name: "Værktøjer", url: toolsCanonical }],
});
sitemap.push({ loc: toolsCanonical, priority: "0.8" });
count++;

for (const tool of toolsMeta) {
  const toolCanonical = `${SITE_ORIGIN}/vaerktoejer/${tool.slug}/`;
  generatePage(`vaerktoejer/${tool.slug}`, {
    title: `${tool.title} — Værktøj | ${SITE_NAME}`,
    description: tool.description,
    canonical: toolCanonical,
    breadcrumb: [ROOT_CRUMB, { name: "Værktøjer", url: toolsCanonical }, { name: tool.title, url: toolCanonical }],
  });
  sitemap.push({ loc: toolCanonical, priority: "0.7" });
  count++;
}

// Pillar pages
for (const pillar of pillars) {
  const canonical = `${SITE_ORIGIN}/${pillar.id}/`;
  generatePage(pillar.id, {
    title: `${pillar.name} — ${SITE_NAME}`,
    description: pillar.description,
    canonical,
    breadcrumb: [ROOT_CRUMB, { name: pillar.name, url: canonical }],
  });
  sitemap.push({ loc: canonical, priority: "0.8" });
  count++;
}

// Category and subcategory pages
for (const cat of categories) {
  const catCanonical = `${SITE_ORIGIN}/${cat.pillar}/${cat.id}/`;
  const pillarCrumb: Crumb = { name: pillarNameById(cat.pillar), url: `${SITE_ORIGIN}/${cat.pillar}/` };
  generatePage(`${cat.pillar}/${cat.id}`, {
    title: `${cat.name} — ${SITE_NAME}`,
    description: cat.description,
    canonical: catCanonical,
    breadcrumb: [ROOT_CRUMB, pillarCrumb, { name: cat.name, url: catCanonical }],
  });
  sitemap.push({ loc: catCanonical, priority: "0.7" });
  count++;

  for (const sub of cat.subcategories) {
    const subCanonical = `${SITE_ORIGIN}/${cat.pillar}/${cat.id}/${sub.id}/`;
    generatePage(`${cat.pillar}/${cat.id}/${sub.id}`, {
      title: `${sub.name} — ${cat.name} | ${SITE_NAME}`,
      description: sub.description,
      canonical: subCanonical,
      breadcrumb: [ROOT_CRUMB, pillarCrumb, { name: cat.name, url: catCanonical }, { name: sub.name, url: subCanonical }],
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
