/**
 * Pilot Journey Engine — Chunking (Schritt 2/3)
 *
 * Liest data/regulations/text/*.txt + manifest.json, zerlegt überschriften-
 * bewusst (§/Artikel/Article/ANNEX/UAS.xxx/AMC/GM) in Chunks von ~600 Tokens
 * mit Überlappung und schreibt data/regulations/chunks/<id>.jsonl + all.jsonl.
 *
 *   node scripts/regulations/chunk.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve("data/regulations");
const TEXT = path.join(ROOT, "text");
const CHUNKS = path.join(ROOT, "chunks");
mkdirSync(CHUNKS, { recursive: true });

const TARGET_CHARS = 2600; // ≈ 600–650 Tokens
const MAX_CHARS = 3400;
const OVERLAP_CHARS = 300;

// Überschriften, an denen Rechtstexte sinnvoll brechen
const HEADING = /^(?:§\s?\d+\w?\b.*|Artikel\s+\d+\w?\b.*|Article\s+\d+\w?\b.*|ANHANG\s+[IVXLC]*.*|ANNEX\s+[IVXLC]*.*|Anlage\s+\d.*|TEIL\s+[A-Z].*|PART\s+[A-Z].*|UAS\.[A-Z]+\.\d+.*|AMC\d*\s.*|GM\d*\s.*|Kapitel\s+\d.*|CHAPTER\s+\d.*)$/;

function splitSections(text) {
  const lines = text.split("\n");
  const sections = [];
  let ref = "Präambel";
  let buf = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.length > 0 && t.length < 160 && HEADING.test(t)) {
      if (buf.join("\n").trim().length > 0) sections.push({ ref, content: buf.join("\n").trim() });
      ref = t;
      buf = [t];
    } else {
      buf.push(line);
    }
  }
  if (buf.join("\n").trim().length > 0) sections.push({ ref, content: buf.join("\n").trim() });
  return sections;
}

function packChunks(sections) {
  const chunks = [];
  let cur = "";
  let curRef = sections[0]?.ref ?? "";
  const flush = () => {
    const c = cur.trim();
    if (c.length > 200) chunks.push({ sectionRef: curRef, content: c });
    cur = "";
  };
  for (const s of sections) {
    // Übergroße Sektionen intern hart teilen
    let body = s.content;
    while (body.length > MAX_CHARS) {
      const cut = body.lastIndexOf("\n", MAX_CHARS) > MAX_CHARS * 0.5 ? body.lastIndexOf("\n", MAX_CHARS) : MAX_CHARS;
      if (cur.length > 0) flush();
      cur = body.slice(0, cut);
      curRef = s.ref;
      flush();
      body = body.slice(Math.max(cut - OVERLAP_CHARS, 0));
    }
    if (cur.length + body.length > TARGET_CHARS && cur.length > 0) {
      const tail = cur.slice(-OVERLAP_CHARS);
      flush();
      cur = tail + "\n";
    }
    if (cur.trim().length === 0) curRef = s.ref;
    cur += body + "\n\n";
  }
  flush();
  return chunks;
}

const manifest = JSON.parse(readFileSync(path.join(ROOT, "manifest.json"), "utf8"));
const byId = Object.fromEntries(manifest.map((m) => [m.id, m]));

const all = [];
let files = readdirSync(TEXT).filter((f) => f.endsWith(".txt"));
console.log(`Chunke ${files.length} Dokumente …\n`);

for (const file of files) {
  const id = file.replace(/\.txt$/, "");
  const meta = byId[id] ?? {};
  const text = readFileSync(path.join(TEXT, file), "utf8");
  const chunks = packChunks(splitSections(text)).map((c, i) => ({
    id: `${id}#${String(i).padStart(3, "0")}`,
    docId: id,
    country: meta.country ?? "EU",
    authority: meta.authority ?? "",
    language: meta.language ?? "de",
    sourceTitle: meta.title ?? id,
    sourceUrl: meta.url ?? "",
    effectiveDate: meta.fetchedAt?.slice(0, 10) ?? null,
    sectionRef: c.sectionRef,
    content: c.content,
    tokens: Math.ceil(c.content.length / 4),
  }));
  writeFileSync(path.join(CHUNKS, `${id}.jsonl`), chunks.map((c) => JSON.stringify(c)).join("\n") + "\n");
  all.push(...chunks);
  console.log(`  ${id}: ${chunks.length} Chunks (Ø ${Math.round(chunks.reduce((s, c) => s + c.tokens, 0) / Math.max(chunks.length, 1))} Tokens)`);
}

writeFileSync(path.join(CHUNKS, "all.jsonl"), all.map((c) => JSON.stringify(c)).join("\n") + "\n");
const totalTokens = all.reduce((s, c) => s + c.tokens, 0);
console.log(`\n=== Gesamt: ${all.length} Chunks, ~${totalTokens.toLocaleString("de-DE")} Tokens ===`);
console.log(`Embedding-Kosten (Voyage voyage-3.5): ~${(totalTokens / 1e6 * 0.06).toFixed(2)} USD (Free-Tier: 200M Tokens)`);
