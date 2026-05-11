import Link from "next/link";
import { db } from "@/lib/db/client";
import { desc, eq, inArray } from "drizzle-orm";
import { orders, orderAssignments, users } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eurosPrecise, germanDateTime } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  const orderIds = rows.map((r) => r.id);

  const assignmentRows = orderIds.length === 0
    ? []
    : await db
        .select({
          orderId: orderAssignments.orderId,
          role: orderAssignments.role,
          userId: orderAssignments.userId,
          userName: users.name,
        })
        .from(orderAssignments)
        .innerJoin(users, eq(orderAssignments.userId, users.id))
        .where(inArray(orderAssignments.orderId, orderIds));

  const assignmentMap = new Map<string, { role: string; name: string | null }[]>();
  for (const a of assignmentRows) {
    if (!assignmentMap.has(a.orderId)) assignmentMap.set(a.orderId, []);
    assignmentMap.get(a.orderId)!.push({ role: a.role, name: a.userName });
  }

  const totalCount = rows.length;
  const totalRevenue = rows
    .filter((r) => r.status !== "pending" && r.status !== "cancelled")
    .reduce((sum, r) => sum + r.totalCents, 0);
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const inFlightCount = rows.filter((r) => ["paid", "scheduled", "shooting", "editing"].includes(r.status)).length;

  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Aufträge</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Aufträge gesamt" value={totalCount.toString()} />
        <Stat label="In Bearbeitung" value={inFlightCount.toString()} />
        <Stat label="Offene Zahlungen" value={pendingCount.toString()} />
        <Stat label="Umsatz brutto" value={eurosPrecise(totalRevenue)} />
      </div>

      <Card className="mt-8 overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Kunde</th>
              <th className="px-4 py-3 font-medium">Objekt</th>
              <th className="px-4 py-3 font-medium">Termin</th>
              <th className="px-4 py-3 font-medium">Team</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => {
              const assignees = assignmentMap.get(order.id) ?? [];
              return (
                <tr key={order.id} className="border-t border-[var(--color-line)] hover:bg-[var(--color-bg-alt)]/40">
                  <td className="px-4 py-3 font-serif">
                    <Link href={`/admin/auftraege/${order.shortCode}`}>{order.shortCode}</Link>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p>{order.customerName ?? "—"}</p>
                    <p className="text-[var(--color-ink-mute)]">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p>{order.propertyCity}</p>
                    <p className="text-[var(--color-ink-mute)]">{order.propertyAddress}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-ink-soft)]">
                    {order.scheduledAt ? germanDateTime(order.scheduledAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {assignees.length === 0 ? (
                      <span className="text-[var(--color-ink-mute)]">— nicht zugewiesen</span>
                    ) : (
                      assignees.map((a, i) => (
                        <span key={`${a.role}-${i}`} className="block">
                          {a.name ?? "?"} · {a.role}
                        </span>
                      ))
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="primary">{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{eurosPrecise(order.totalCents)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-[var(--color-ink-mute)]">
                  Noch keine Aufträge.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">{label}</p>
      <p className="mt-1 font-serif text-3xl">{value}</p>
    </Card>
  );
}
