/**
 * Regulatorik-Retrieval: Vector-Suche (Voyage + pgvector), Fallback
 * deutsche Volltext-Suche. Jedes Ergebnis trägt Quelle + URL + Stand —
 * die Zitierpflicht wird dadurch technisch möglich gemacht.
 */
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

export interface RegulationHit {
  id: string;
  docType: string;
  country: string;
  authority: string;
  sourceTitle: string;
  sourceUrl: string;
  sectionRef: string | null;
  crawledAt: string | null;
  content: string;
}

let embeddingsAvailable: boolean | null = null;
let embeddingsCheckedAt = 0;

async function hasEmbeddings(): Promise<boolean> {
  if (embeddingsAvailable !== null && Date.now() - embeddingsCheckedAt < 5 * 60_000) {
    return embeddingsAvailable;
  }
  try {
    const rows = await db.execute(
      sql`SELECT 1 FROM regulation_chunk WHERE embedding IS NOT NULL LIMIT 1`,
    );
    embeddingsAvailable = rows.rows.length > 0;
  } catch {
    embeddingsAvailable = false;
  }
  embeddingsCheckedAt = Date.now();
  return embeddingsAvailable;
}

async function embedQuery(query: string): Promise<number[] | null> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "voyage-3.5", input: [query], input_type: "query" }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data: { embedding: number[] }[] };
    return data.data[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

export async function searchRegulations(input: {
  query: string;
  country?: string; // ISO-2, z. B. "DE"
  docType?: "regulation" | "guide" | "manual" | "any";
  limit?: number;
}): Promise<RegulationHit[]> {
  const limit = Math.min(input.limit ?? 6, 10);
  const country = (input.country ?? "DE").toUpperCase().slice(0, 2);
  const docFilter =
    input.docType && input.docType !== "any"
      ? sql`AND d.doc_type = ${input.docType}`
      : sql``;

  // 1) Vector-Pfad (wenn Embeddings + Key vorhanden)
  if (await hasEmbeddings()) {
    const vec = await embedQuery(input.query);
    if (vec) {
      const res = await db.execute(sql`
        SELECT c.id, d.doc_type AS "docType", d.country, d.authority,
               d.title AS "sourceTitle", d.source_url AS "sourceUrl",
               c.section_ref AS "sectionRef", d.last_crawled_at AS "crawledAt",
               c.content
        FROM regulation_chunk c
        JOIN regulation_document d ON d.id = c.document_id
        WHERE c.embedding IS NOT NULL
          AND d.status = 'active'
          AND (d.country = ${country} OR d.country = 'EU')
          ${docFilter}
        ORDER BY c.embedding <=> ${JSON.stringify(vec)}::vector
        LIMIT ${limit}
      `);
      if (res.rows.length > 0) return res.rows as unknown as RegulationHit[];
    }
  }

  // 2) Fallback: deutsche Volltext-Suche
  const res = await db.execute(sql`
    SELECT c.id, d.doc_type AS "docType", d.country, d.authority,
           d.title AS "sourceTitle", d.source_url AS "sourceUrl",
           c.section_ref AS "sectionRef", d.last_crawled_at AS "crawledAt",
           c.content,
           ts_rank(to_tsvector('german', c.content), websearch_to_tsquery('german', ${input.query})) AS rank
    FROM regulation_chunk c
    JOIN regulation_document d ON d.id = c.document_id
    WHERE to_tsvector('german', c.content) @@ websearch_to_tsquery('german', ${input.query})
      AND d.status = 'active'
      AND (d.country = ${country} OR d.country = 'EU')
      ${docFilter}
    ORDER BY rank DESC
    LIMIT ${limit}
  `);
  return res.rows as unknown as RegulationHit[];
}
