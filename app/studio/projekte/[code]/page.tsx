import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByShortCode, getOrderShots, getOrderItems } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { germanDateTime } from "@/lib/utils";

export default async function ProjektDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderByShortCode(code);
  if (!order) notFound();
  const shots = await getOrderShots(order.id);
  const items = await getOrderItems(order.id);

  const doneCount = shots.filter((s) => s.status === "done").length;
  const total = shots.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <section className="container-page py-10">
      <Link href="/studio/projekte" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← Projekte
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">{order.shortCode}</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">
            {order.propertyAddress}, {order.propertyPlz} {order.propertyCity} · {order.propertyType}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="primary">{order.status}</Badge>
          <Button asChild>
            <Link href={`/studio/projekte/${order.shortCode}/feld`}>Field-Mode öffnen</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Shotlist</h2>
            <span className="text-sm text-[var(--color-ink-soft)]">
              {doneCount} / {total} · {pct}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-alt)]">
            <div className="h-full bg-[var(--color-primary)]" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-6 divide-y divide-[var(--color-line)]">
            {shots.map((shot) => (
              <li key={shot.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{shot.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{shot.description}</p>
                </div>
                <Badge tone={shot.status === "done" ? "success" : shot.priority === "must" ? "warn" : "neutral"}>
                  {shot.status === "done" ? "✓" : shot.priority}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-serif text-xl">Termin</h3>
            <p className="mt-2 text-sm">
              {order.scheduledAt ? germanDateTime(order.scheduledAt) : "Termin offen"}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-serif text-xl">Leistungen</h3>
            <ul className="mt-3 space-y-1 text-sm">
              {items.map((item) => (
                <li key={item.id} className="text-[var(--color-ink-soft)]">
                  • {item.serviceName}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-serif text-xl">Kundenkontakt</h3>
            <p className="mt-2 text-sm">{order.customerName ?? order.customerEmail}</p>
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="text-sm underline">
                {order.customerPhone}
              </a>
            )}
            <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
              <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
            </p>
          </Card>
        </div>
      </div>

      {order.propertyNotes && (
        <Card className="mt-6 p-6">
          <h3 className="font-serif text-xl">Hinweise vom Kunden</h3>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{order.propertyNotes}</p>
        </Card>
      )}
    </section>
  );
}
