"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { feedback, auditLog, orders } from "@/lib/db/schema";

export async function submitFeedback(input: {
  token: string;
  score: number;
  comment?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (input.score < 0 || input.score > 10 || !Number.isInteger(input.score)) {
    return { ok: false, error: "Bitte einen Wert zwischen 0 und 10 wählen." };
  }
  const [row] = await db
    .select()
    .from(feedback)
    .where(eq(feedback.token, input.token))
    .limit(1);
  if (!row) return { ok: false, error: "Feedback-Link ungültig." };
  if (row.completedAt) return { ok: false, error: "Feedback wurde bereits abgegeben." };

  await db
    .update(feedback)
    .set({
      score: input.score,
      comment: input.comment?.trim() || null,
      completedAt: new Date(),
    })
    .where(eq(feedback.id, row.id));

  // Audit-Eintrag für die Aktivitäts-Sicht im Kunden-Konto
  const [order] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.id, row.orderId))
    .limit(1);
  if (order) {
    await db.insert(auditLog).values({
      userId: null,
      userName: "Kunde",
      action: "feedback_submitted",
      entityType: "order",
      entityId: order.id,
      payload: { score: input.score },
    });
  }
  return { ok: true };
}
