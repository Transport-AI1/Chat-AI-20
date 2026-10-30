const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderMarkdown(src: string): string {
  const blocks: string[] = [];
  let html = escapeHtml(src);

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code: string) => {
    blocks.push(`<pre><code>${code.replace(/\n$/, "")}</code></pre>`);
    return `\u0000${blocks.length - 1}\u0000`;
  });

  html = html
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, (m) => `<ul>${m}</ul>`);

  html = html
    .split(/\n{2,}/)
    .map((p) => (/^\s*<(ul|h3|pre)/.test(p) ? p : `<p>${p.replace(/\n/g, "<br>")}</p>`))
    .join("");

  return html.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => blocks[Number(i)] ?? "");
}