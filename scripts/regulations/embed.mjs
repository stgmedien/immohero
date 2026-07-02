/**
 * Pilot Journey Engine — Embeddings (Schritt 3/3)
 *
 * Liest data/regulations/chunks/all.jsonl, erzeugt Voyage-Embeddings und
 * schreibt data/regulations/embeddings/all.jsonl ({id, embedding[1024]}).
 * Der Import in Neon/pgvector passiert in Phase 0 (Migration 0007) mit
 * einem separaten Insert-Skript.
 *
 * Voraussetzung: VOYAGE_API_KEY in .env.local
 *   node --env-file=.env.local scripts/regulations/embed.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const KEY = process.env.VOYAGE_API_KEY;
if (!KEY) {
  console.error("VOYAGE_API_KEY fehlt in .env.local — Key anlegen unter https://dash.voyageai.com");
  process.exit(1);
}

const ROOT = path.resolve("data/regulations");
const OUT = path.join(ROOT, "embeddings");
mkdirSync(OUT, { recursive: true });

const MODEL = "voyage-3.5";
const BATCH = 96;

const chunks = readFileSync(path.join(ROOT, "chunks/all.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map((l) => JSON.parse(l));

console.log(`Embedde ${chunks.length} Chunks mit ${MODEL} …`);
const out = [];
for (let i = 0; i < chunks.length; i += BATCH) {
  const batch = chunks.slice(i, i + BATCH);
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      input: batch.map((c) => `${c.sourceTitle}\n${c.sectionRef}\n\n${c.content}`),
      input_type: "document",
    }),
  });
  if (!res.ok) {
    console.error(`Batch ${i}: HTTP ${res.status} — ${await res.text()}`);
    process.exit(1);
  }
  const data = await res.json();
  data.data.forEach((d, j) => out.push({ id: batch[j].id, embedding: d.embedding }));
  console.log(`  ${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync(path.join(OUT, "all.jsonl"), out.map((o) => JSON.stringify(o)).join("\n") + "\n");
console.log(`Fertig: ${out.length} Embeddings → data/regulations/embeddings/all.jsonl`);
