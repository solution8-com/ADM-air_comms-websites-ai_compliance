/**
 * Fetch + aggregate topic news into public/news.json (consumed by the dashboard
 * "Nyheder" section). Run weekly by .github/workflows/news.yml; the result is
 * committed, which triggers the normal Azure deploy.
 *
 * v1: authoritative RSS only — we link to the real source, generate no claims.
 * Broad feeds (filter:true) are keyword-filtered to AI relevance.
 *
 * Run manually:  npx tsx scripts/fetch-news.ts
 */
import Parser from "rss-parser";
import { writeFileSync } from "node:fs";

const FEEDS: { url: string; source: string; filter: boolean }[] = [
  { url: "https://artificialintelligenceact.eu/feed/", source: "AI Act", filter: false },
  { url: "https://digital-strategy.ec.europa.eu/en/rss.xml", source: "EU-Kommissionen", filter: true },
];

// Topic relevance filter for the broad feeds (compliance = AI regulation).
const TOPIC = /\b(a\.?i\.?|artificial intelligence|kunstig intelligens|ai act|gpai|algorithm|machine learning|gdpr|datatilsyn)\b/i;
const MAX_ITEMS = 8;

type NewsItem = { title: string; link: string; source: string; date: string };

async function main() {
  const parser = new Parser({ timeout: 15000, headers: { "User-Agent": "Mozilla/5.0 (onepager-news-bot)" } });
  const collected: NewsItem[] = [];

  for (const f of FEEDS) {
    try {
      const feed = await parser.parseURL(f.url);
      for (const it of feed.items ?? []) {
        const title = (it.title ?? "").trim();
        const link = (it.link ?? "").trim();
        if (!title || !link) continue;
        if (f.filter && !TOPIC.test(title)) continue;
        const date = it.isoDate ?? (it.pubDate ? new Date(it.pubDate).toISOString() : "");
        collected.push({ title, link, source: f.source, date });
      }
      console.log(`  ${f.source}: ${feed.items?.length ?? 0} items`);
    } catch (e) {
      console.warn(`  ! feed failed (${f.url}): ${(e as Error).message}`);
    }
  }

  const seen = new Set<string>();
  const items = collected
    .filter((i) => (seen.has(i.link) ? false : (seen.add(i.link), true)))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, MAX_ITEMS);

  writeFileSync("public/news.json", JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2) + "\n");
  console.log(`✓ public/news.json — ${items.length} items`);
}

main();
