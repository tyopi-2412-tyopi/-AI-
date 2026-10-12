// レポート(Markdown)をアプリに埋め込むための seed.js を生成する
// 使い方: node app/build-seed.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "..", "report", "physical-ai-report.md");
const out = path.join(here, "seed.js");
const md = fs.readFileSync(src, "utf8");
fs.writeFileSync(
  out,
  "// 自動生成ファイル（node app/build-seed.js で再生成）\n" +
    "window.SEED_REPORT = " + JSON.stringify(md) + ";\n"
);
console.log("wrote " + path.relative(process.cwd(), out));
