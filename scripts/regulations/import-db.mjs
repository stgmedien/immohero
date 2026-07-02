/**
 * Pilot Journey Engine — Korpus-Import nach Neon (Schritt 4)
 *
 * Liest manifest.json + chunks/all.jsonl (+ optional embeddings/all.jsonl)
 * und upsertet regulation_document + regulation_chunk. Volltext-Suche (FTS)
 * funktioniert sofort; die embedding-Spalte bleibt null bis embed.mjs +
 * erneuter Import gelaufen sind.
 *
 *   node --env-file=.env.local scripts/regulations/import-db.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const ROOT = path.resolve("data/regulations");

const manifest = JSON.parse(readFileSync(path.join(ROOT, "manifest.json"), "utf8")).filter(
  (m) => m.status === "ok",
);
const chunks = readFileSync(path.join(ROOT, "chunks/all.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map((l) => JSON.parse(l));

// Optionale Embeddings
const embPath = path.join(ROOT, "embeddings/all.jsonl");
const embeddings = new Map();
if (existsSync(embPath)) {
  for (const line of readFileSync(embPath, "utf8").trim().split("\n")) {
    const e = JSON.parse(line);
    embeddings.set(e.id, e.embedding);
  }
  console.log(`Embeddings gefunden: ${embeddings.size}`);
} else {
  console.log("Keine Embeddings vorhanden — Import nur mit FTS (Vector folgt nach embed.mjs).");
}

console.log(`Importiere ${manifest.length} Dokumente, ${chunks.length} Chunks …`);

for (const m of manifest) {
  await sql.query(
    `INSERT INTO regulation_document (id, country, authority, language, doc_type, title, source_url, content_hash, last_crawled_at, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active')
     ON CONFLICT (id) DO UPDATE SET
       country=$2, authority=$3, language=$4, doc_type=$5, title=$6, source_url=$7,
       content_hash=$8, last_crawled_at=$9, status='active'`,
    [
      m.id,
      m.country ?? "EU",
      m.authority ?? "",
      m.language ?? "de",
      m.docType ?? "regulation",
      m.title ?? m.id,
      m.url ?? "",
      m.sha256 ?? null,
      m.fetchedAt ?? new Date().toISOString(),
    ],
  );
}
console.log("Dokumente ok. Chunks …");

let done = 0;
for (const c of chunks) {
  const emb = embeddings.get(c.id);
  await sql.query(
    `INSERT INTO regulation_chunk (id, document_id, section_ref, content, tokens, embedding)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET
       document_id=$2, section_ref=$3, content=$4, tokens=$5,
       embedding=COALESCE($6, regulation_chunk.embedding)`,
    [c.id, c.docId, c.sectionRef ?? null, c.content, c.tokens ?? 0, emb ? JSON.stringify(emb) : null],
  );
  done++;
  if (done % 100 === 0) console.log(`  ${done}/${chunks.length}`);
}

const [{ count }] = await sql.query(`SELECT count(*)::int AS count FROM regulation_chunk`);
const [{ withEmb }] = await sql.query(
  `SELECT count(*)::int AS "withEmb" FROM regulation_chunk WHERE embedding IS NOT NULL`,
);
console.log(`\nFertig: ${count} Chunks in der DB, davon ${withEmb} mit Embedding.`);
