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
import { db } from "@/lib/db/client";
import { consultations, auditLog, orderComments, orderAttachments } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { eurosPrecise, germanDateTime } from "@/lib/utils";
import { OrderTimeline } from "@/components/konto/order-timeline";
import { OrderActivity } from "@/components/konto/order-activity";
import { RescheduleForm } from "@/components/konto/reschedule-form";
import { OrderComments } from "@/components/konto/order-comments";
import { AttachmentUpload } from "@/components/konto/attachment-upload";

const CONSULTATION_STATUS_LABEL: Record<string, string> = {
  requested: "angefragt — wird bestätigt",
  confirmed: "bestätigt",
  declined: "abgelehnt — neuer Vorschlag folgt",
  cancelled: "storniert",
  completed: "abgeschlossen",
};

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
  const [consultation] = await db
    .select()
    .from(consultations)
    .where(eq(consultations.orderId, order.id))
    .limit(1);
  const delivery = await getDeliveryForOrder(order.id);

  const activity = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      userName: auditLog.userName,
      payload: auditLog.payload,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(and(eq(auditLog.entityType, "order"), eq(auditLog.entityId, order.id)))
    .orderBy(desc(auditLog.createdAt))
    .limit(20);

  const clientComments = await db
    .select({
      id: orderComments.id,
      body: orderComments.body,
      authorName: orderComments.authorName,
      authorId: orderComments.authorId,
      createdAt: orderComments.createdAt,
    })
    .from(orderComments)
    .where(and(eq(orderComments.orderId, order.id), eq(orderComments.source, "client")))
    .orderBy(orderComments.createdAt);

  const commentsForUI = clientComments.map((c) => ({
    id: c.id,
    body: c.body,
    authorName: c.authorName,
    createdAt: c.createdAt.toISOString(),
    isClient: c.authorId === session.user!.id,
  }));

  const attachments = await db
    .select({
      id: orderAttachments.id,
      filename: orderAttachments.filename,
      blobUrl: orderAttachments.blobUrl,
      note: orderAttachments.note,
      createdAt: orderAttachments.createdAt,
    })
    .from(orderAttachments)
    .where(eq(orderAttachments.orderId, order.id))
    .orderBy(desc(orderAttachments.createdAt));
  const attachmentsForUI = attachments.map((a) => ({
    id: a.id,
    filename: a.filename,
    blobUrl: a.blobUrl,
    note: a.note,
    createdAt: a.createdAt.toISOString(),
  }));

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

      <div className="mt-6">
        <OrderTimeline status={order.status} studioStatus={order.studioStatus} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl">Termin & Lieferung</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {consultation ? (
              <Field
                label="Beratungsgespräch"
                value={`${germanDateTime(consultation.requestedStart)} Uhr — ${
                  CONSULTATION_STATUS_LABEL[consultation.status] ?? consultation.status
                }`}
                className="sm:col-span-2"
              />
            ) : null}
            <Field
              label="Drehtermin"
              value={order.scheduledAt ? germanDateTime(order.scheduledAt) : "wird im Beratungsgespräch festgelegt"}
            />
            <Field
              label="Voraussichtliche Lieferung"
              value={order.estimatedDeliveryAt ? germanDateTime(order.estimatedDeliveryAt) : "48 Std. nach Shooting"}
            />
            <Field label="Objekttyp" value={order.propertyType} />
            <Field label="Wohnfläche" value={order.propertySizeQm ? `${order.propertySizeQm} m²` : "—"} />
            {order.propertyNotes && <Field label="Hinweise" value={order.propertyNotes} className="sm:col-span-2" />}
          </dl>

          {consultation?.status === "confirmed" && consultation.meetingUrl ? (
            <div className="mt-4">
              <Button asChild size="sm">
                <a href={consultation.meetingUrl} target="_blank" rel="noopener noreferrer">
                  Video-Call beitreten
                </a>
              </Button>
            </div>
          ) : null}

          {order.status !== "cancelled" && order.status !== "delivered" && (
            <div className="mt-4">
              <RescheduleForm
                orderShortCode={order.shortCode}
                currentScheduledAt={order.scheduledAt?.toISOString() ?? null}
              />
            </div>
          )}

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
              <a href={`mailto:hello@immohero.org?subject=Auftrag ${order.shortCode}`}>E-Mail senden</a>
            </Button>
          </Card>
          <Card className="p-6">
            <h2 className="font-serif text-xl">Aktivität</h2>
            <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
              Was zuletzt an deinem Auftrag passiert ist.
            </p>
            <div className="mt-4">
              <OrderActivity rows={activity} />
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-8 p-6">
        <h2 className="font-serif text-2xl">Unterlagen nachreichen</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Fotos, Grundriss-Scans, Schlüssel-Übergabe-Hinweise — alles, was uns hilft.
        </p>
        <div className="mt-4">
          <AttachmentUpload
            orderShortCode={order.shortCode}
            initial={attachmentsForUI}
          />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-serif text-2xl">Nachrichten</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Direkter Draht zum Team — wir antworten meist innerhalb eines Werktags.
        </p>
        <div className="mt-4">
          <OrderComments
            orderShortCode={order.shortCode}
            comments={commentsForUI}
            customerName={session.user.name ?? "Du"}
          />
        </div>
      </Card>

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
