// 簡易 Markdown レンダラー（ノートアプリとサイト生成の両方で使う）
// ブラウザでは <script src>、Node では import で読み込み、globalThis.renderMarkdown を使う
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }
  function render(md) {
    const lines = md.split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim() || /^<!--.*-->\s*$/.test(l)) { i++; continue; }
      let m;
      if ((m = l.match(/^(#{1,4})\s+(.*)/))) {
        const n = Math.min(m[1].length + 1, 4);
        out.push(`<h${n}>${inline(m[2])}</h${n}>`); i++;
      } else if (/^-{3,}\s*$/.test(l)) {
        out.push("<hr>"); i++;
      } else if (/^>\s?/.test(l)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
        out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
      } else if (/^\|/.test(l)) {
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++]);
        const cells = r => r.replace(/^\||\|\s*$/g, "").split("|").map(c => c.trim());
        let html = "<table>";
        rows.forEach((r, idx) => {
          if (/^\|[\s:|-]+\|?\s*$/.test(r)) return;
          const tag = idx === 0 ? "th" : "td";
          html += "<tr>" + cells(r).map(c => `<${tag}>${inline(c)}</${tag}>`).join("") + "</tr>";
        });
        out.push(html + "</table>");
      } else if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
        const ordered = /^\s*\d+\./.test(l);
        const items = [];
        while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
          const indent = lines[i].match(/^\s*/)[0].length;
          const text = inline(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""));
          if (indent >= 2 && items.length) items[items.length - 1].sub.push(text);
          else items.push({ text, sub: [] });
          i++;
        }
        const t = ordered ? "ol" : "ul";
        out.push(`<${t}>` + items.map(it =>
          `<li>${it.text}${it.sub.length ? "<ul>" + it.sub.map(s => `<li>${s}</li>`).join("") + "</ul>" : ""}</li>`
        ).join("") + `</${t}>`);
      } else {
        const buf = [];
        while (i < lines.length && lines[i].trim() && !/^(#|>|\||\s*([-*]|\d+\.)\s|-{3,}|<!--)/.test(lines[i])) buf.push(lines[i++]);
        out.push(`<p>${buf.map(inline).join("<br>")}</p>`);
      }
    }
    return out.join("\n");
  }
  globalThis.renderMarkdown = render;
  globalThis.escapeHtml = esc;
})();
