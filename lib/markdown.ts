/**
 * Markdown-lite → HTML für vertrauenswürdige, intern verfasste Inhalte
 * (Academy-Lektionen, Bot-Antworten). Erst HTML-escapen, dann Transformationen —
 * kein rohes HTML aus dem Input möglich. Bewusst ohne Dependency.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  return s
    // Links [text](https://…)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline decoration-[var(--color-primary)] underline-offset-2">$1</a>')
    // fett **…**
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // kursiv *…*
    .replace(/(^|\s)\*([^*\n]+)\*/g, "$1<em>$2</em>")
    // Inline-Code `…`
    .replace(/`([^`]+)`/g, '<code class="rounded bg-black/5 px-1 py-0.5 text-[0.9em]">$1</code>');
}

export function mdLite(md: string): string {
  const lines = escapeHtml(md.replace(/\r/g, "")).split("\n");
  const out: string[] = [];
  let inList = false;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();
    if (t === "") {
      flushPara();
      closeList();
      continue;
    }
    const h = t.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushPara();
      closeList();
      const lvl = h[1].length;
      const cls = lvl === 1 ? "text-2xl font-serif mt-6 mb-2" : lvl === 2 ? "text-xl font-serif mt-5 mb-2" : "text-lg font-semibold mt-4 mb-1";
      out.push(`<h${lvl + 1} class="${cls}">${inline(h[2])}</h${lvl + 1}>`);
      continue;
    }
    const li = t.match(/^[-*]\s+(.*)$/);
    if (li) {
      flushPara();
      if (!inList) {
        out.push('<ul class="list-disc space-y-1 pl-5">');
        inList = true;
      }
      out.push(`<li>${inline(li[1])}</li>`);
      continue;
    }
    para.push(t);
  }
  flushPara();
  closeList();
  return out.join("\n");
}
