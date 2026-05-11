import Link from "next/link";
import { db } from "@/lib/db/client";
import { desc, ne } from "drizzle-orm";
import { orders } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { germanDateTime } from "@/lib/utils";

export default async function ProjekteListPage() {
  const rows = await db
    .select()
    .from(orders)
    .where(ne(orders.status, "pending"))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Alle Projekte</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">Aktuelle Aufträge im Team.</p>

      <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Objekt</th>
              <th className="px-4 py-3 font-medium">Termin</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id} className="border-t border-[var(--color-line)] hover:bg-[var(--color-bg-alt)]/30">
                <td className="px-4 py-3 font-serif">
                  <Link href={`/studio/projekte/${order.shortCode}`}>{order.shortCode}</Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/studio/projekte/${order.shortCode}`}>
                    <p className="font-medium">{order.propertyCity}</p>
                    <p className="text-xs text-[var(--color-ink-mute)]">{order.propertyAddress}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--color-ink-soft)]">
                  {order.scheduledAt ? germanDateTime(order.scheduledAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone="primary">{order.status}</Badge>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--color-ink-mute)]">
                  Noch keine bezahlten Aufträge.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
