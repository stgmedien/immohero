import { db } from "@/lib/db/client";
import { feedback, orders } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

/**
 * Erzeugt (oder findet) eine Feedback-Anfrage für den Auftrag und gibt die
 * öffentliche Feedback-URL zurück. Idempotent pro orderId.
 */
export async function getOrCreateFeedbackUrl(orderId: string): Promise<string | null> {
  const [order] = await db
    .select({ id: orders.id, email: orders.customerEmail })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return null;

  let [row] = await db
    .select({ token: feedback.token })
    .from(feedback)
    .where(and(eq(feedback.orderId, orderId), isNull(feedback.completedAt)))
    .limit(1);

  if (!row) {
    [row] = await db
      .insert(feedback)
      .values({
        orderId,
        customerEmail: order.email,
      })
      .returning({ token: feedback.token });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org";
  return `${base}/feedback/${row.token}`;
}

export function npsBucket(score: number): "promoter" | "passive" | "detractor" {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}
