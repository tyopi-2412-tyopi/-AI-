// レポート(Markdown)をアプリに埋め込むための seed.js を生成する
// 使い方: node app/build-seed.js
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "report", "physical-ai-report.md");
const out = path.join(__dirname, "seed.js");
const md = fs.readFileSync(src, "utf8");
fs.writeFileSync(
  out,
  "// 自動生成ファイル（node app/build-seed.js で再生成）\n" +
    "window.SEED_REPORT = " + JSON.stringify(md) + ";\n"
);
console.log("wrote " + path.relative(process.cwd(), out));
