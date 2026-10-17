// X（旧Twitter）の投稿文から、投稿画面を開くリンク（Web Intent）を作る
//   使い方: node pipeline/xpost.js [投稿文ファイル]   … 省略時は out/x/<日付>.md
// 投稿文ファイルの形式（ROUTINE.md を参照）:
//   MAIN:
//   （本文。リンクは入れない）
//   REPLY:
//   （自分の投稿へのリプライ。{URL} はその日の記事ページの URL に置き換わる）
// 出力は Markdown で、Routine の最終報告にそのまま貼れる形にする
import fs from "node:fs";
import { p, todayJst, loadConfig } from "./lib.js";

const LIMIT = 280;
const URL_WEIGHT = 23;

// X の文字数の数え方: URL は一律 23、ラテン文字などは 1、日本語などそれ以外は 2
export function weightedLength(text) {
  let n = 0;
  const rest = text.replace(/https?:\/\/\S+/g, () => { n += URL_WEIGHT; return ""; });
  for (const ch of rest) {
    const c = ch.codePointAt(0);
    const light = c <= 0x10ff || (c >= 0x2000 && c <= 0x200d) || (c >= 0x2010 && c <= 0x201f) || (c >= 0x2032 && c <= 0x2037);
    n += light ? 1 : 2;
  }
  return n;
}

export const intentUrl = text => "https://x.com/intent/post?text=" + encodeURIComponent(text);

export function parseDraft(md) {
  const m = md.match(/^MAIN:\s*\n([\s\S]*?)\n\s*REPLY:\s*\n([\s\S]*)$/m);
  if (!m) throw new Error("投稿文ファイルに MAIN: と REPLY: の見出しが必要です");
  return { main: m[1].trim(), reply: m[2].trim() };
}

function main() {
  const date = todayJst();
  const file = process.argv[2] || p("out", "x", `${date}.md`);
  const { main, reply: rawReply } = parseDraft(fs.readFileSync(file, "utf8"));
  const base = (loadConfig().siteUrl || "").replace(/\/$/, "");
  const articleUrl = base ? `${base}/daily/${date}.html` : "";
  const reply = rawReply.replace(/\{URL\}/g, articleUrl);

  let ok = true;
  for (const [name, text] of [["本文", main], ["リプライ", reply]]) {
    const len = weightedLength(text);
    if (len > LIMIT) { console.error(`! ${name}が長すぎます（${len} / ${LIMIT}）`); ok = false; }
  }
  if (!ok) process.exit(1);

  console.log(`### X 投稿文

**1. 本文**（下のリンクをタップすると、この文章が入った投稿画面が開きます）

[▶ X で本文を投稿する](${intentUrl(main)})

\`\`\`
${main}
\`\`\`

**2. リプライ**（投稿した本文を開いて「返信」に貼り付けてください。note の URL に差し替えても構いません）

\`\`\`
${reply}
\`\`\``);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
