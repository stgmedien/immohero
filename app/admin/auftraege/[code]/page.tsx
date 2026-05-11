import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { eq, inArray } from "drizzle-orm";
import { orderAssignments, users } from "@/lib/db/schema";
import { getOrderByShortCode, getOrderItems, getOrderShots } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignmentForm } from "@/components/admin/assignment-form";
import { eurosPrecise, germanDateTime } from "@/lib/utils";

const TEAM_ROLES = ["photographer", "drone_pilot", "editor"] as const;

export default async function AdminAuftragDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await getOrderByShortCode(code);
  if (!order) notFound();
  const items = await getOrderItems(order.id);
  const shots = await getOrderShots(order.id);

  const teamMembers = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(inArray(users.role, ["photographer", "drone_pilot", "editor", "admin"]));

  const existing = await db
    .select()
    .from(orderAssignments)
    .where(eq(orderAssignments.orderId, order.id));

  return (
    <section className="container-page py-10">
      <Link href="/admin" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← Alle Aufträge
      </Link>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">{order.shortCode}</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">
            {order.customerName ?? order.customerEmail} ·{" "}
            <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
          </p>
        </div>
        <Badge tone="primary">{order.status}</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl">Auftrag</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Objekt"
              value={`${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`}
            />
            <Field label="Typ" value={order.propertyType} />
            <Field label="Termin" value={order.scheduledAt ? germanDateTime(order.scheduledAt) : "—"} />
            <Field label="Gebucht am" value={germanDateTime(order.createdAt)} />
            <Field label="Stripe Session" value={order.stripeSessionId ?? "—"} className="sm:col-span-2" />
          </dl>
          <h3 className="mt-8 font-serif text-xl">Leistungen</h3>
          <ul className="mt-3 divide-y divide-[var(--color-line)]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                <span>{item.serviceName}</span>
                <span>{eurosPrecise(item.unitPriceCents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-right font-serif text-2xl">{eurosPrecise(order.totalCents)}</p>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-serif text-xl">Team zuweisen</h3>
            <AssignmentForm
              orderId={order.id}
              existing={existing.map((a) => ({ userId: a.userId, role: a.role }))}
              team={teamMembers.map((u) => ({ id: u.id, name: u.name ?? u.email, role: u.role }))}
              roles={TEAM_ROLES as unknown as string[]}
            />
          </Card>
          <Card className="p-6">
            <h3 className="font-serif text-xl">Shotlist</h3>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{shots.length} Shots geplant</p>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">{label}</dt>
      <dd className="mt-0.5 break-all">{value}</dd>
    </div>
  );
}
