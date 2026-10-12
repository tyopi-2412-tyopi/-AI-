// パイプライン共通の小さなユーティリティ
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const p = (...xs) => path.join(ROOT, ...xs);

// 日本時間の日付（YYYY-MM-DD）。DATE 環境変数で上書きできる（再実行・テスト用）
export function todayJst() {
  if (process.env.DATE) return process.env.DATE;
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}

export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

export function writeFile(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

export const loadConfig = () => readJson(p("config", "monetization.json"), {});

// --- フロントマター付き Markdown ---
export function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    try { meta[k] = JSON.parse(v); } catch { meta[k] = v; }
  }
  return { meta, body: md.slice(m[0].length) };
}

export function toFrontmatter(meta) {
  return "---\n" + Object.entries(meta).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n") + "\n---\n";
}

export const PAID_MARKER = "<!-- PAID -->";
