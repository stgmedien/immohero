import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getOrderByShortCode,
  getOrderItems,
  getOrderShots,
  getDeliveryForOrder,
} from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { eurosPrecise, germanDateTime } from "@/lib/utils";

export default async function AuftragDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/konto");

  const order = await getOrderByShortCode(code);
  if (!order) notFound();
  if (order.customerId && order.customerId !== session.user.id && session.user.role !== "admin") {
    notFound();
  }

  const items = await getOrderItems(order.id);
  const shots = await getOrderShots(order.id);
  const delivery = await getDeliveryForOrder(order.id);

  return (
    <section className="container-page py-10">
      <Link href="/konto" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← Alle Aufträge
      </Link>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Auftrag {order.shortCode}</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">
            {order.propertyAddress}, {order.propertyPlz} {order.propertyCity}
          </p>
        </div>
        <Badge tone="primary">{order.status}</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl">Termin & Lieferung</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Geplanter Termin" value={order.scheduledAt ? germanDateTime(order.scheduledAt) : "—"} />
            <Field
              label="Voraussichtliche Lieferung"
              value={order.estimatedDeliveryAt ? germanDateTime(order.estimatedDeliveryAt) : "48 Std. nach Shooting"}
            />
            <Field label="Objekttyp" value={order.propertyType} />
            <Field label="Wohnfläche" value={order.propertySizeQm ? `${order.propertySizeQm} m²` : "—"} />
            {order.propertyNotes && <Field label="Hinweise" value={order.propertyNotes} className="sm:col-span-2" />}
          </dl>

          <h2 className="mt-8 font-serif text-2xl">Gebuchte Leistungen</h2>
          <ul className="mt-3 divide-y divide-[var(--color-line)]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span>{item.serviceName}</span>
                <span className="text-[var(--color-ink-soft)]">{eurosPrecise(item.unitPriceCents)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-end justify-between border-t border-[var(--color-line)] pt-4">
            <span className="text-sm text-[var(--color-ink-soft)]">Gesamt inkl. MwSt</span>
            <span className="font-serif text-2xl">{eurosPrecise(order.totalCents)}</span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-serif text-xl">Lieferung</h2>
            {delivery && delivery.status === "sent" ? (
              <>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Deine Dateien sind bereit.</p>
                <Button asChild size="lg" className="mt-4 w-full">
                  <Link href={`/konto/auftraege/${order.shortCode}/lieferung`}>Lieferung öffnen</Link>
                </Button>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Sobald deine Lieferung fertig ist, bekommst du eine E-Mail und kannst sie hier herunterladen.
              </p>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="font-serif text-xl">Kontakt</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Du hast Fragen zu diesem Auftrag? Schreib uns jederzeit.
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-3">
              <a href={`mailto:jonathan@stg-medien.com?subject=Auftrag ${order.shortCode}`}>E-Mail senden</a>
            </Button>
          </Card>
        </div>
      </div>

      {shots.length > 0 && (
        <Card className="mt-8 p-6">
          <h2 className="font-serif text-2xl">Shotlist ({shots.length})</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Die Aufnahmeliste für dein Shooting.</p>
          <ul className="mt-4 divide-y divide-[var(--color-line)]">
            {shots.map((shot) => (
              <li key={shot.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{shot.name}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">{shot.description}</p>
                </div>
                <Badge tone={shot.status === "done" ? "success" : "neutral"}>
                  {shot.status === "done" ? "Aufgenommen" : shot.priority}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
