import { db } from "@/lib/db/client";
import { orders, feedback } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export type HealthTone = "ok" | "warn" | "danger" | "neutral";
export interface HealthSnapshot {
  customerId: string;
  orderCount: number;
  revenueCents: number;
  lastOrderAt: Date | null;
  avgNps: number | null;
  score: number; // 0–100
  tone: HealthTone;
  label: string;
}

/** Berechnet pro Kunde einen einfachen Health-Score 0–100. */
export async function getHealthForCustomers(customerIds: string[]): Promise<Map<string, HealthSnapshot>> {
  const map = new Map<string, HealthSnapshot>();
  if (customerIds.length === 0) return map;

  // Aufträge pro Kunde
  const orderRows = await db
    .select({
      customerRecordId: orders.customerRecordId,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${orders.totalCents}),0)::int`,
      last: sql<Date | null>`max(${orders.createdAt})`,
    })
    .from(orders)
    .where(sql`${orders.customerRecordId} IN (${sql.join(customerIds.map((id) => sql`${id}`), sql`, `)})`)
    .groupBy(orders.customerRecordId);

  // NPS-Durchschnitt pro Kunde (über orders → feedback)
  const npsRows = await db
    .select({
      customerRecordId: orders.customerRecordId,
      avg: sql<number | null>`avg(${feedback.score})`,
    })
    .from(feedback)
    .innerJoin(orders, eq(orders.id, feedback.orderId))
    .where(sql`${orders.customerRecordId} IN (${sql.join(customerIds.map((id) => sql`${id}`), sql`, `)})`)
    .groupBy(orders.customerRecordId);

  const orderMap = new Map(orderRows.map((r) => [r.customerRecordId, r]));
  const npsMap = new Map(npsRows.map((r) => [r.customerRecordId, r.avg]));

  const now = Date.now();
  for (const id of customerIds) {
    const o = orderMap.get(id);
    const orderCount = o?.count ?? 0;
    const revenueCents = o?.revenue ?? 0;
    const lastOrderAt = o?.last ? new Date(o.last) : null;
    const avg = npsMap.get(id);
    const avgNps = typeof avg === "number" || typeof avg === "string" ? Number(avg) : null;

    let score = 0;

    // Aufträge (max 40)
    score += Math.min(orderCount * 10, 40);

    // Umsatz (max 20) — 1k€ = 5
    score += Math.min(Math.round(revenueCents / 100 / 200), 20);

    // Aktualität (max 20) — innerhalb 60 Tage = 20, 365 Tage = 5
    if (lastOrderAt) {
      const daysAgo = (now - lastOrderAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo <= 60) score += 20;
      else if (daysAgo <= 180) score += 12;
      else if (daysAgo <= 365) score += 5;
    }

    // NPS (max 20)
    if (avgNps !== null) {
      if (avgNps >= 9) score += 20;
      else if (avgNps >= 7) score += 12;
      else if (avgNps >= 5) score += 6;
    } else if (orderCount > 0) {
      score += 8; // unbekanntes Feedback, aber zumindest gekauft
    }

    score = Math.max(0, Math.min(100, score));
    let tone: HealthTone = "neutral";
    let label = "Unbekannt";
    if (orderCount === 0) {
      tone = "neutral";
      label = "Neu";
    } else if (score >= 65) {
      tone = "ok";
      label = "Gesund";
    } else if (score >= 35) {
      tone = "warn";
      label = "Beobachten";
    } else {
      tone = "danger";
      label = "Risiko";
    }

    map.set(id, {
      customerId: id,
      orderCount,
      revenueCents,
      lastOrderAt,
      avgNps,
      score,
      tone,
      label,
    });
  }
  return map;
}
