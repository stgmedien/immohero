import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { orders, orderAssignments } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { germanDateTime } from "@/lib/utils";

export default async function KalenderPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();

  const assignments = await db
    .select({ orderId: orderAssignments.orderId })
    .from(orderAssignments)
    .where(eq(orderAssignments.userId, session.user.id));

  const orderIds = assignments.map((a) => a.orderId);

  const rows = orderIds.length === 0
    ? []
    : await db
        .select()
        .from(orders)
        .where(and(inArray(orders.id, orderIds), gte(orders.scheduledAt, now)))
        .orderBy(asc(orders.scheduledAt));

  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Kalender</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">Alle anstehenden Termine.</p>

      <ul className="mt-8 space-y-3">
        {rows.map((order) => (
          <li key={order.id}>
            <Card className="flex items-center gap-4 p-4">
              <div className="text-center">
                <p className="font-serif text-2xl">
                  {order.scheduledAt?.toLocaleDateString("de-DE", { day: "2-digit" })}
                </p>
                <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
                  {order.scheduledAt?.toLocaleDateString("de-DE", { month: "short" })}
                </p>
              </div>
              <div className="flex-1">
                <p className="font-medium">{order.propertyAddress}, {order.propertyCity}</p>
                <p className="text-xs text-[var(--color-ink-soft)]">{germanDateTime(order.scheduledAt!)}</p>
              </div>
              <Badge tone="primary">{order.status}</Badge>
            </Card>
          </li>
        ))}
        {rows.length === 0 && (
          <Card className="p-8 text-center text-sm text-[var(--color-ink-soft)]">Keine anstehenden Termine.</Card>
        )}
      </ul>
    </section>
  );
}
