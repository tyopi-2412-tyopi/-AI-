// 2. 記事化: 収集したニュースから、無料部分＋有料部分の日次ノートを作る
//   - content/daily/<日付>.md … サイトで公開する記事（既定では無料部分のみ）
//   - out/note/<日付>.md       … note.com に貼り付ける完全版の原稿（有料部分を含む）
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { p, todayJst, readJson, writeFile, loadConfig, toFrontmatter, PAID_MARKER } from "./lib.js";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

const SYSTEM = `あなたは日本のビジネスパーソン向けに、フィジカルAI（ロボット、ヒューマノイド、ロボット基盤モデル、ワールドモデル、自動運転など、AIが物理世界で動く技術）の毎朝のニュースレターを書く編集者です。

書き方のルール:
- 与えられたニュース一覧に書かれている事実だけを使う。一覧にない数値・日付・発言を作らない。推測や見解は「〜と考えられる」「筆者の見立てでは」と明示する。
- 各ニュースには必ず出典リンクを Markdown のリンクで付ける。
- 重複する話題はまとめる。フィジカルAIと関係の薄いものは取り上げない。
- 読者は忙しい。結論から書き、専門用語には短い説明を添える。
- 出力は Markdown のみ。前置きや後書きは書かない。

出力の構成（見出しはこのとおり）:
# （その日の最重要トピックを表す、思わず読みたくなる日本語タイトル。40字以内）

## 今日の3行まとめ
（箇条書き3つ）

## 注目ニュース
（重要度順に5〜8件。各件は「### 見出し」＋2〜3文の要約＋出典リンク）

${PAID_MARKER}

## 深掘り分析
（今日のニュースから最も重要な1〜2テーマを選び、背景・技術的な意味・競争環境を解説。800字程度）

## ビジネス・投資への示唆
（事業者・投資家が取るべき視点を箇条書きで）

## 日本企業への影響
（日本の製造業・ロボットメーカー・スタートアップにとっての意味）

## 今後のウォッチポイント
（次に何が起きるか、何を見ておくべきかを箇条書きで）

最後の行に、記事に付けるハッシュタグを「TAGS: タグ1, タグ2, タグ3, タグ4, タグ5」の形式で書く（#は付けない）。`;

function formatItems(items) {
  return items.map((it, i) =>
    `[${i + 1}] ${it.title}\n出典: ${it.source}\n日時: ${it.date || "不明"}\nURL: ${it.link}\n概要: ${it.summary || "（なし）"}`
  ).join("\n\n");
}

async function writeWithClaude(date, items) {
  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    output_config: { effort: "medium" },
    // 安全性分類器が誤って拒否した場合に、自動で別モデルに引き継ぐ
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    messages: [{
      role: "user",
      content: `${date}（日本時間）の朝刊を書いてください。過去24〜48時間に収集したニュースは次のとおりです。\n\n${formatItems(items)}`,
    }],
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") throw new Error("モデルが生成を拒否しました");
  if (msg.stop_reason === "max_tokens") console.warn("! 出力が上限で切れました");
  const text = msg.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
  if (!text) throw new Error("空の応答でした");
  console.log(`Claude: 入力 ${msg.usage.input_tokens} / 出力 ${msg.usage.output_tokens} トークン`);
  return text;
}

// API キーがない場合や API が失敗した場合の、見出しとリンクだけの簡易版
function writeFallback(date, items) {
  const top = items.slice(0, 12);
  return `# フィジカルAI ニュース ${date}

## 今日の3行まとめ
${top.slice(0, 3).map(i => `- ${i.title}`).join("\n")}

## 注目ニュース
${top.map(i => `### ${i.title}\n${i.summary ? i.summary.slice(0, 160) + "\n" : ""}出典: [${i.source}](${i.link})`).join("\n\n")}

${PAID_MARKER}

## 深掘り分析
（ANTHROPIC_API_KEY が設定されていないため、自動分析は生成されていません）

TAGS: フィジカルAI, ロボット, AI, ニュース`;
}

export function splitArticle(text) {
  let tags = [];
  const lines = text.split("\n");
  const ti = lines.findLastIndex(l => /^TAGS:/i.test(l.trim()));
  if (ti >= 0) {
    tags = lines[ti].replace(/^\s*TAGS:/i, "").split(/[,、]/).map(s => s.trim().replace(/^#/, "")).filter(Boolean);
    lines.splice(ti, 1);
  }
  const body = lines.join("\n").trim();
  const titleLine = body.split("\n").find(l => /^# /.test(l));
  const title = titleLine ? titleLine.slice(2).trim() : "フィジカルAI ニュース";
  const withoutTitle = titleLine ? body.replace(titleLine, "").trim() : body;
  const [free, ...rest] = withoutTitle.split(PAID_MARKER);
  return { title, tags, free: free.trim(), paid: rest.join("\n").trim() };
}

function noteDraft({ title, tags, free, paid }, config) {
  const price = config.paidPriceYen ? `（有料ライン: ${config.paidPriceYen}円）` : "";
  return `${title}

${free}

---
▼ ここから有料${price} ― note の編集画面でこの位置に「有料エリア設定」の線を引いてください
---

${paid}

${tags.map(t => "#" + t.replace(/\s+/g, "")).join(" ")}
`;
}

async function main() {
  const date = todayJst();
  const raw = readJson(p("data", "raw", `${date}.json`), null);
  if (!raw) { console.error(`data/raw/${date}.json がありません。先に collect を実行してください`); process.exit(1); }
  if (!raw.items.length) { console.log("新しいニュースがないため記事化をスキップします"); return; }

  const config = loadConfig();
  let text, generator;
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
    try { text = await writeWithClaude(date, raw.items); generator = MODEL; }
    catch (e) { console.warn(`! Claude での生成に失敗したため簡易版にします: ${e.message}`); }
  } else {
    console.warn("! ANTHROPIC_API_KEY が未設定のため、見出しのみの簡易版を作ります");
  }
  if (!text) { text = writeFallback(date, raw.items); generator = "fallback"; }

  const art = splitArticle(text);
  const meta = {
    title: art.title, date, tags: art.tags, sources: raw.items.length,
    generator, hasPaid: !!art.paid && generator !== "fallback",
  };
  const publicBody = config.commitPaidContent && art.paid ? `${art.free}\n\n${PAID_MARKER}\n\n${art.paid}` : art.free;
  writeFile(p("content", "daily", `${date}.md`), toFrontmatter(meta) + "\n" + publicBody + "\n");
  writeFile(p("out", "note", `${date}.md`), noteDraft(art, config));
  console.log(`記事を作成しました: content/daily/${date}.md, out/note/${date}.md`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
