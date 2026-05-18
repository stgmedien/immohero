import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { consultations, orders } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConsultationManager } from "@/components/studio/consultation-manager";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";

export default async function BeratungPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/beratung");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const rows = await db
    .select({
      id: consultations.id,
      orderId: consultations.orderId,
      customerEmail: consultations.customerEmail,
      customerName: consultations.customerName,
      customerPhone: consultations.customerPhone,
      requestedStart: consultations.requestedStart,
      requestedEnd: consultations.requestedEnd,
      status: consultations.status,
      meetingProvider: consultations.meetingProvider,
      meetingUrl: consultations.meetingUrl,
      customerNote: consultations.customerNote,
      internalNotes: consultations.internalNotes,
      googleHtmlLink: consultations.googleHtmlLink,
      shortCode: orders.shortCode,
      orderStatus: orders.status,
      propertyCity: orders.propertyCity,
      propertyAddress: orders.propertyAddress,
    })
    .from(consultations)
    .leftJoin(orders, eq(consultations.orderId, orders.id))
    .orderBy(desc(consultations.requestedStart))
    .limit(300);

  const open = rows.filter((r) => r.status === "requested");
  const confirmed = rows.filter((r) => r.status === "confirmed");
  const rest = rows.filter((r) => !["requested", "confirmed"].includes(r.status));

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Beratungstermine" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Beratungstermine</h1>
            <p className="text-[var(--color-ink-3)]">
              Vorab-Gespräche mit Kunden · {open.length} offen, {confirmed.length} bestätigt
            </p>
          </div>
        </div>

        {!isGoogleCalendarConfigured() && (
          <Card className="mt-6 p-4 border-[var(--color-warn)]/30 bg-[var(--color-warn-soft)]/40">
            <p className="text-sm text-[var(--color-warn)]">
              Google Calendar ist noch nicht verbunden — Termine werden bestätigt &amp; per
              E-Mail versendet, aber nicht automatisch in den Kalender geschrieben. Sobald die
              GOOGLE_CALENDAR_* Variablen gesetzt sind, läuft der Sync automatisch.
            </p>
          </Card>
        )}

        {rows.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Noch keine Anfragen"
            description="Sobald ein Kunde im Buchungsfunnel ein Beratungsgespräch wählt, erscheint es hier."
            className="mt-8"
          />
        ) : (
          <div className="mt-8 space-y-10">
            <ConsultationManager
              title={`Offene Anfragen (${open.length})`}
              rows={open.map(serialize)}
              repName={session.user.name ?? "Ich"}
            />
            <ConsultationManager
              title={`Bestätigt (${confirmed.length})`}
              rows={confirmed.map(serialize)}
              repName={session.user.name ?? "Ich"}
              confirmedView
            />
            {rest.length > 0 && (
              <ConsultationManager
                title={`Erledigt / Abgelehnt (${rest.length})`}
                rows={rest.map(serialize)}
                repName={session.user.name ?? "Ich"}
                readOnly
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}

function serialize(r: {
  id: string;
  orderId: string | null;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  requestedStart: Date;
  requestedEnd: Date;
  status: string;
  meetingProvider: string | null;
  meetingUrl: string | null;
  customerNote: string | null;
  internalNotes: string | null;
  googleHtmlLink: string | null;
  shortCode: string | null;
  orderStatus: string | null;
  propertyCity: string | null;
  propertyAddress: string | null;
}) {
  return {
    ...r,
    requestedStart: r.requestedStart.toISOString(),
    requestedEnd: r.requestedEnd.toISOString(),
  };
}
