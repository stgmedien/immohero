import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { and, gte, lte, inArray, asc, eq } from "drizzle-orm";
import { orders, orderAssignments } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { germanDateTime } from "@/lib/utils";

export default async function StudioHomePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  const myAssignments = await db
    .select({ orderId: orderAssignments.orderId, role: orderAssignments.role })
    .from(orderAssignments)
    .where(eq(orderAssignments.userId, session.user.id));

  const myOrderIds = myAssignments.map((a) => a.orderId);

  const myOrders = myOrderIds.length === 0
    ? []
    : await db
        .select()
        .from(orders)
        .where(
          and(
            inArray(orders.id, myOrderIds),
            gte(orders.scheduledAt, start),
            lte(orders.scheduledAt, end),
          ),
        )
        .orderBy(asc(orders.scheduledAt));

  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Heute & diese Woche</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">Deine zugewiesenen Termine in den nächsten 7 Tagen.</p>

      {myOrders.length === 0 ? (
        <Card className="mt-8 p-8 text-center">
          <p className="font-serif text-2xl">Keine Termine.</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Schau im{" "}
            <Link href="/studio/projekte" className="underline">
              Projekt-Pool
            </Link>{" "}
            nach offenen Aufträgen.
          </p>
        </Card>
      ) : (
        <ul className="mt-8 space-y-4">
          {myOrders.map((order) => (
            <li key={order.id}>
              <Link href={`/studio/projekte/${order.shortCode}`}>
                <Card className="p-5 transition-colors hover:bg-[var(--color-bg-alt)]/40">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-serif text-2xl">{order.shortCode}</span>
                    <Badge tone="primary">{order.status}</Badge>
                    <Badge tone="neutral">{order.propertyType}</Badge>
                  </div>
                  <p className="mt-2 text-sm">
                    {order.propertyAddress}, {order.propertyPlz} {order.propertyCity}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
                    {order.scheduledAt ? germanDateTime(order.scheduledAt) : "Termin offen"}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
