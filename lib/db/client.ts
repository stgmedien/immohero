import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://placeholder:placeholder@localhost:5432/placeholder";

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn("[db] DATABASE_URL is not set — DB calls will fail at request time.");
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
export { schema };
