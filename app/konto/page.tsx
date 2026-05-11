import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrdersForCustomer } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "@/components/marketing/icons";
import { eurosPrecise, germanDateTime } from "@/lib/utils";

const STATUS_LABEL: Record<string, { label: string; tone: "neutral" | "primary" | "accent" | "ink" | "success" | "warn" }> = {
  pending: { label: "Wartet auf Zahlung", tone: "warn" },
  paid: { label: "Bezahlt", tone: "primary" },
  scheduled: { label: "Termin bestätigt", tone: "primary" },
  shooting: { label: "Shooting läuft", tone: "ink" },
  editing: { label: "Bearbeitung", tone: "ink" },
  delivered: { label: "Geliefert", tone: "success" },
  cancelled: { label: "Storniert", tone: "neutral" },
};

export default async function KontoPage() {
  const session = await auth();
  const orders = session?.user?.id ? await getOrdersForCustomer(session.user.id) : [];

  return (
    <section className="container-page py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Hallo {session?.user?.name?.split(" ")[0] ?? "und willkommen"}.</h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">Hier siehst du alle deine Buchungen und Lieferungen.</p>
        </div>
        <Button asChild>
          <Link href="/buchen">Neue Buchung</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="mt-10 p-8 text-center">
          <p className="font-serif text-2xl">Noch keine Buchungen.</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Starte deine erste Buchung in unter fünf Minuten.</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/buchen">Jetzt buchen</Link>
          </Button>
        </Card>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending;
            return (
              <li key={order.id}>
                <Link href={`/konto/auftraege/${order.shortCode}`}>
                  <Card className="flex items-center gap-6 p-5 transition-colors hover:bg-[var(--color-bg-alt)]/40">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-xl">{order.shortCode}</span>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                        {order.propertyAddress}, {order.propertyPlz} {order.propertyCity}
                      </p>
                      {order.scheduledAt && (
                        <p className="mt-0.5 text-xs text-[var(--color-ink-mute)]">
                          Termin: {germanDateTime(order.scheduledAt)}
                        </p>
                      )}
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="font-serif text-xl">{eurosPrecise(order.totalCents)}</p>
                      <p className="text-xs text-[var(--color-ink-mute)]">inkl. MwSt</p>
                    </div>
                    <ArrowRightIcon size={20} className="text-[var(--color-ink-mute)]" />
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
