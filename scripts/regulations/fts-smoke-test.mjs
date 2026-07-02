/** Schneller FTS-Smoke-Test gegen die Live-DB. */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const q = process.argv[2] ?? "Kompetenznachweis A2 Fernpilot";

const rows = await sql.query(
  `SELECT c.id, c.section_ref, d.title, d.source_url,
          ts_rank(to_tsvector('german', c.content), websearch_to_tsquery('german', $1)) AS rank,
          left(c.content, 90) AS preview
   FROM regulation_chunk c JOIN regulation_document d ON d.id = c.document_id
   WHERE to_tsvector('german', c.content) @@ websearch_to_tsquery('german', $1)
   ORDER BY rank DESC LIMIT 4`,
  [q],
);
console.log(`Query: "${q}" — Treffer: ${rows.length}`);
for (const r of rows) {
  console.log(
    Number(r.rank).toFixed(3),
    "|", r.id,
    "|", (r.section_ref ?? "").slice(0, 36),
    "|", r.preview.replace(/\n/g, " "),
  );
}
