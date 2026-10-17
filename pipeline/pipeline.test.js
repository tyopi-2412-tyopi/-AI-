import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed } from "./rss.js";
import { score, keyOf } from "./collect.js";
import { splitArticle } from "./save.js";
import { parseFrontmatter, toFrontmatter, PAID_MARKER } from "./lib.js";

test("RSS 2.0 をパースできる", () => {
  const xml = `<rss><channel><item><title><![CDATA[NVIDIA、新しい &amp; GR00T を発表]]></title>
    <link>https://example.com/a</link><pubDate>Mon, 12 Oct 2026 01:00:00 GMT</pubDate>
    <description>&lt;p&gt;ヒューマノイド向け&lt;/p&gt;</description><source url="x">日経</source></item></channel></rss>`;
  const [it] = parseFeed(xml);
  assert.equal(it.title, "NVIDIA、新しい & GR00T を発表");
  assert.equal(it.link, "https://example.com/a");
  assert.equal(it.summary, "ヒューマノイド向け");
  assert.equal(it.source, "日経");
});

test("Atom をパースできる", () => {
  const xml = `<feed><entry><title>Humanoid robot paper</title><link href="https://arxiv.org/abs/1"/>
    <updated>2026-10-12T00:00:00Z</updated><summary>VLA model</summary></entry></feed>`;
  const [it] = parseFeed(xml);
  assert.equal(it.link, "https://arxiv.org/abs/1");
  assert.equal(it.summary, "VLA model");
});

test("関連度と重複キー", () => {
  assert.ok(score({ title: "Figure AI humanoid robot", summary: "" }, false) >= 2);
  assert.equal(score({ title: "Stock market today", summary: "" }, false), 0);
  assert.equal(keyOf({ title: "Tesla Optimus 量産へ - 日経新聞" }), keyOf({ title: "Tesla Optimus 量産へ - Reuters" }));
});

test("記事を無料・有料・タグに分割できる", () => {
  const a = splitArticle(`# 今日のタイトル\n\n## 今日の3行まとめ\n- a\n\n${PAID_MARKER}\n\n## 深掘り分析\n本文\n\nTAGS: フィジカルAI, #ロボット`);
  assert.equal(a.title, "今日のタイトル");
  assert.match(a.free, /3行まとめ/);
  assert.doesNotMatch(a.free, /深掘り/);
  assert.match(a.paid, /深掘り分析/);
  assert.deepEqual(a.tags, ["フィジカルAI", "ロボット"]);
});

test("フロントマターの往復", () => {
  const meta = { title: "a: b", tags: ["x"], sources: 3, hasPaid: true };
  assert.deepEqual(parseFrontmatter(toFrontmatter(meta) + "\nbody").meta, meta);
});
