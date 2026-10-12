// 1. 収集: フィードを取得し、関連度で絞り込み、既読を除いて data/raw/<日付>.json に保存する
import { FEEDS, KEYWORDS } from "./sources.js";
import { parseFeed } from "./rss.js";
import { p, todayJst, readJson, writeFile } from "./lib.js";

const MAX_ITEMS = Number(process.env.MAX_ITEMS || 40);
const MAX_AGE_HOURS = 48;

export function score(item, focused) {
  const text = (item.title + " " + item.summary).toLowerCase();
  let s = KEYWORDS.reduce((n, k) => n + (text.includes(k) ? 1 : 0), 0);
  if (focused) s += 2;
  return s;
}

// 同じ記事が複数のフィードに出ることがあるため、タイトルを正規化して重複判定する
export const keyOf = item =>
  item.title.replace(/\s+-\s+[^-]+$/, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 80);

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { "user-agent": "physical-ai-daily/1.0 (+https://github.com)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text());
}

async function main() {
  const date = todayJst();
  const seenFile = p("data", "seen.json");
  const seen = new Set(readJson(seenFile, []));
  const now = Date.now();
  const picked = new Map();

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  results.forEach((r, i) => {
    const feed = FEEDS[i];
    if (r.status === "rejected") {
      console.warn(`! ${feed.name}: ${r.reason.message}`);
      return;
    }
    let items = r.value;
    if (feed.maxItems) items = items.slice(0, feed.maxItems);
    let kept = 0;
    for (const it of items) {
      const t = Date.parse(it.date);
      if (Number.isFinite(t) && now - t > MAX_AGE_HOURS * 3600e3) continue;
      const s = score(it, feed.focused);
      if (s < 2) continue;
      const key = keyOf(it);
      if (!key || seen.has(key)) continue;
      const prev = picked.get(key);
      if (!prev || prev.score < s) {
        picked.set(key, { ...it, source: it.source || feed.name, feed: feed.name, score: s, key });
        kept++;
      }
    }
    console.log(`- ${feed.name}: ${items.length} 件中 ${kept} 件を採用`);
  });

  const items = [...picked.values()].sort((a, b) => b.score - a.score).slice(0, MAX_ITEMS);
  writeFile(p("data", "raw", `${date}.json`), JSON.stringify({ date, collectedAt: new Date().toISOString(), items }, null, 2) + "\n");

  const nextSeen = [...seen, ...items.map(i => i.key)].slice(-5000);
  writeFile(seenFile, JSON.stringify(nextSeen) + "\n");
  console.log(`${date}: ${items.length} 件を data/raw/${date}.json に保存しました`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
