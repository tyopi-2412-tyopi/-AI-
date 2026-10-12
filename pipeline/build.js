// 3. サイト生成: content/daily/*.md から公開サイト（site/）を作る
//   - トップページ（最新号＋バックナンバー）、各日の記事ページ、RSS フィード
//   - 収益導線: note の有料記事・メンバーシップ、ニュースレター、スポンサー枠、アフィリエイト、AdSense
//   - ノートアプリ（site/app/）と、アプリが取り込む daily.json
import fs from "node:fs";
import { p, writeFile, loadConfig, parseFrontmatter, PAID_MARKER } from "./lib.js";

await import("../app/markdown.js");
const md = globalThis.renderMarkdown;
const esc = globalThis.escapeHtml;

const config = loadConfig();
const SITE = p("site");
const base = (config.siteUrl || "").replace(/\/$/, "");

function loadArticles() {
  const dir = p("content", "daily");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse().map(f => {
    const { meta, body } = parseFrontmatter(fs.readFileSync(`${dir}/${f}`, "utf8"));
    const date = meta.date || f.slice(0, 10);
    const [free, paid = ""] = body.split(PAID_MARKER);
    return { ...meta, date, free: free.trim(), paid: paid.trim(), path: `daily/${date}.html` };
  });
}

const CSS = `
:root{--bg:#fafaf8;--panel:#fff;--text:#1f2328;--muted:#646a73;--border:#e3e3de;--accent:#2f6fdb;--accent-weak:#eaf1fd;--cta:#0e8a5f}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#15171a;--panel:#1d2024;--text:#e7e7e4;--muted:#9ba1a8;--border:#30343a;--accent:#76a6ff;--accent-weak:#223148;--cta:#3cc48e}}
:root[data-theme="dark"]{--bg:#15171a;--panel:#1d2024;--text:#e7e7e4;--muted:#9ba1a8;--border:#30343a;--accent:#76a6ff;--accent-weak:#223148;--cta:#3cc48e}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.8 system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif}
a{color:var(--accent)}
.wrap{max-width:760px;margin:0 auto;padding:0 16px}
header.site{border-bottom:1px solid var(--border);background:var(--panel)}
header.site .wrap{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding-top:12px;padding-bottom:12px}
header.site a.brand{font-weight:700;font-size:18px;color:var(--text);text-decoration:none}
header.site nav{display:flex;gap:14px;font-size:14px}
h1{font-size:26px;line-height:1.4;margin:28px 0 6px}
h2{font-size:20px;margin:32px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--border)}
h3{font-size:18px;margin:26px 0 6px}
h4{font-size:16px;margin:20px 0 2px}
.meta{color:var(--muted);font-size:13px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.tag{font-size:12px;padding:1px 9px;border-radius:99px;background:var(--accent-weak);color:var(--accent)}
.box{border:1px solid var(--border);background:var(--panel);border-radius:10px;padding:18px 20px;margin:28px 0}
.box.cta{border-color:var(--cta)}
.box h2{border:0;margin:0 0 6px;font-size:18px}
.btn{display:inline-block;padding:9px 18px;border-radius:8px;background:var(--cta);color:#fff;text-decoration:none;font-weight:600;margin:6px 8px 0 0}
.btn.sub{background:transparent;color:var(--accent);border:1px solid var(--accent)}
ul.issues{list-style:none;padding:0}
ul.issues li{padding:10px 0;border-bottom:1px solid var(--border)}
ul.issues .d{color:var(--muted);font-size:13px;margin-right:8px}
.ad{margin:24px 0;min-height:0}
footer{color:var(--muted);font-size:13px;padding:32px 0 48px}
table{border-collapse:collapse;display:block;overflow-x:auto}th,td{border:1px solid var(--border);padding:4px 10px}
`;

function layout({ title, description, body, depth = 0, canonical }) {
  const up = "../".repeat(depth);
  const ads = config.adsenseClientId
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(config.adsenseClientId)}" crossorigin="anonymous"></script>`
    : "";
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description || config.siteDescription || "")}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description || config.siteDescription || "")}">
<meta property="og:type" content="article">
${canonical && base ? `<link rel="canonical" href="${esc(base + "/" + canonical)}">` : ""}
<link rel="alternate" type="application/rss+xml" title="${esc(config.siteTitle)}" href="${up}feed.xml">
<style>${CSS}</style>
${ads}
</head>
<body>
<header class="site"><div class="wrap">
  <a class="brand" href="${up}index.html">${esc(config.siteTitle || "フィジカルAI デイリー")}</a>
  <nav>
    <a href="${up}index.html#archive">バックナンバー</a>
    <a href="${up}app/index.html">ノートアプリ</a>
    <a href="${up}feed.xml">RSS</a>
  </nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer class="wrap">
  ${config.sponsorContactUrl ? `<p>スポンサー・広告掲載のご相談は<a href="${esc(config.sponsorContactUrl)}">こちら</a>。</p>` : ""}
  <p>このサイトの記事は、公開ニュースをもとに AI（Claude）を使って自動で要約・分析しています。正確な情報は各出典をご確認ください。</p>
  <p>&copy; ${new Date().getFullYear()} ${esc(config.author || config.siteTitle || "")}</p>
</footer>
</body>
</html>
`;
}

// 記事末尾の収益導線
function ctaBox(a) {
  const parts = [];
  const paidLink = a.noteUrl || config.noteProfileUrl;
  if (a.hasPaid && paidLink) {
    parts.push(`<div class="box cta">
  <h2>続きの「深掘り分析」は note で公開中</h2>
  <p>今日のニュースの背景、ビジネス・投資への示唆、日本企業への影響、今後のウォッチポイントを解説しています${config.paidPriceYen ? `（${config.paidPriceYen}円）` : ""}。</p>
  <a class="btn" href="${esc(paidLink)}" target="_blank" rel="noopener">続きを読む</a>
  ${config.noteMembershipUrl ? `<a class="btn sub" href="${esc(config.noteMembershipUrl)}" target="_blank" rel="noopener">メンバーシップで毎日読む</a>` : ""}
</div>`);
  } else if (config.noteMembershipUrl) {
    parts.push(`<div class="box cta"><h2>毎日の深掘り分析はメンバーシップで</h2>
  <a class="btn" href="${esc(config.noteMembershipUrl)}" target="_blank" rel="noopener">メンバーシップを見る</a></div>`);
  }
  if (config.newsletterUrl) {
    parts.push(`<div class="box"><h2>毎朝メールで受け取る</h2>
  <p>フィジカルAIの最新ニュースを、毎朝7時にお届けします（無料）。</p>
  <a class="btn sub" href="${esc(config.newsletterUrl)}" target="_blank" rel="noopener">ニュースレターに登録</a></div>`);
  }
  if (config.affiliateLinks?.length) {
    parts.push(`<div class="box"><h2>フィジカルAIをもっと学ぶ</h2><ul>${config.affiliateLinks.map(l =>
      `<li><a href="${esc(l.url)}" target="_blank" rel="sponsored noopener">${esc(l.label)}</a>${l.note ? ` ― ${esc(l.note)}` : ""}</li>`
    ).join("")}</ul><p class="meta">※ 一部のリンクはアフィリエイトリンクです。</p></div>`);
  }
  if (config.adsenseClientId) {
    parts.push(`<div class="ad"><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(config.adsenseClientId)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`);
  }
  return parts.join("\n");
}

const tagsHtml = tags => tags?.length ? `<div class="tags">${tags.map(t => `<span class="tag">#${esc(t)}</span>`).join("")}</div>` : "";

function articlePage(a) {
  const body = `
<article>
  <h1>${esc(a.title)}</h1>
  <div class="meta">${esc(a.date)} 朝刊 ・ ${a.sources ?? "?"} 件のニュースから作成</div>
  ${tagsHtml(a.tags)}
  ${md(a.free)}
  ${a.paid ? md(a.paid) : ""}
</article>
${a.paid ? "" : ctaBox(a)}
<p><a href="../index.html">← トップへ戻る</a></p>`;
  return layout({ title: `${a.title}｜${config.siteTitle}`, description: a.free.replace(/[#*\[\]()>\-|]/g, "").slice(0, 120), body, depth: 1, canonical: a.path });
}

function indexPage(articles) {
  const [latest, ...rest] = articles;
  const latestHtml = latest ? `
<section>
  <p class="meta">最新号 ・ ${esc(latest.date)}</p>
  <h1><a href="${latest.path}" style="color:inherit;text-decoration:none">${esc(latest.title)}</a></h1>
  ${tagsHtml(latest.tags)}
  ${md(latest.free.split(/\n## 注目ニュース/)[0])}
  <p><a class="btn" href="${latest.path}">今日の記事を読む</a></p>
</section>` : `<h1>${esc(config.siteTitle)}</h1><p>まだ記事がありません。最初の配信をお待ちください。</p>`;
  const body = `
<p class="meta" style="margin-top:20px">${esc(config.siteDescription || "")}</p>
${latestHtml}
${ctaBox({ hasPaid: false })}
<section id="archive">
  <h2>バックナンバー</h2>
  <ul class="issues">${(latest ? [latest, ...rest] : []).map(a =>
    `<li><span class="d">${esc(a.date)}</span><a href="${a.path}">${esc(a.title)}</a></li>`).join("")}</ul>
</section>`;
  return layout({ title: config.siteTitle || "フィジカルAI デイリー", body, canonical: "index.html" });
}

function feedXml(articles) {
  const link = base || ".";
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(config.siteTitle || "")}</title>
<link>${esc(link)}/</link>
<description>${esc(config.siteDescription || "")}</description>
<language>ja</language>
${articles.slice(0, 30).map(a => `<item>
  <title>${esc(a.title)}</title>
  <link>${esc(link + "/" + a.path)}</link>
  <guid isPermaLink="false">physical-ai-daily-${a.date}</guid>
  <pubDate>${new Date(a.date + "T07:00:00+09:00").toUTCString()}</pubDate>
  <description>${esc(md(a.free))}</description>
</item>`).join("\n")}
</channel></rss>
`;
}

const articles = loadArticles();
fs.rmSync(SITE, { recursive: true, force: true });
writeFile(`${SITE}/index.html`, indexPage(articles));
for (const a of articles) writeFile(`${SITE}/${a.path}`, articlePage(a));
writeFile(`${SITE}/feed.xml`, feedXml(articles));
writeFile(`${SITE}/.nojekyll`, "");

// ノートアプリとその取り込み用データ
fs.mkdirSync(`${SITE}/app`, { recursive: true });
for (const f of ["index.html", "markdown.js", "seed.js"]) fs.copyFileSync(p("app", f), `${SITE}/app/${f}`);
writeFile(`${SITE}/app/daily.json`, JSON.stringify(articles.map(a => ({
  date: a.date, title: a.title, tags: a.tags || [], url: `../${a.path}`,
  body: a.free + (a.paid ? `\n\n${a.paid}` : ""),
}))));
console.log(`site/ を生成しました（記事 ${articles.length} 件）`);
