import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const file = "drizzle/migrations/0006_luxuriant_saracen.sql";
const content = readFileSync(file, "utf8");
const statements = content
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of statements) {
  try {
    await sql.query(stmt);
    console.log("OK:", stmt.slice(0, 70));
  } catch (e) {
    if (/already exists|duplicate column/i.test(String(e.message))) {
      console.log("SKIP (exists):", stmt.slice(0, 60));
    } else {
      console.error("FAIL:", stmt.slice(0, 80), "\n", e.message);
      process.exit(1);
    }
  }
}

await sql.query(
  `CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)`,
);
const hash = createHash("sha256").update(content).digest("hex");
const existing = await sql.query(
  `SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = $1`,
  [hash],
);
if (existing.length === 0) {
  await sql.query(
    `INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
    [hash, Date.now()],
  );
  console.log("Journal row inserted.");
} else {
  console.log("Journal row already present.");
}
console.log("Migration 0006 applied.");
