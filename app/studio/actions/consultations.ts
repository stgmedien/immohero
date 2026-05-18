"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { consultations, orders, users, auditLog } from "@/lib/db/schema";
import {
  createConsultationEvent,
  updateConsultationEvent,
  deleteConsultationEvent,
  isGoogleCalendarConfigured,
  CALENDAR_ID,
} from "@/lib/google-calendar";
import { sendEmail } from "@/lib/email";
import { germanDateTime } from "@/lib/utils";

async function requireCRM() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

type Provider = "google_meet" | "teams" | "zoom" | "custom";

export async function acceptConsultation(input: {
  consultationId: string;
  meetingProvider: Provider;
  meetingUrl?: string;
  internalNotes?: string;
}) {
  const session = await requireCRM();

  const [c] = await db
    .select()
    .from(consultations)
    .where(eq(consultations.id, input.consultationId))
    .limit(1);
  if (!c) throw new Error("Consultation not found");

  const [order] = c.orderId
    ? await db.select().from(orders).where(eq(orders.id, c.orderId)).limit(1)
    : [undefined];

  const [rep] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  let googleEventId = c.googleEventId;
  let googleHtmlLink = c.googleHtmlLink;
  let meetingUrl = input.meetingUrl?.trim() || null;
  const useMeet = input.meetingProvider === "google_meet";

  if (isGoogleCalendarConfigured()) {
    try {
      const summary = `ImmoHero Beratung — ${c.customerName ?? c.customerEmail}`;
      const description = [
        `Beratungsgespräch vor dem Dreh.`,
        order ? `Auftrag: ${order.shortCode}` : null,
        order ? `Objekt: ${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}` : null,
        c.customerPhone ? `Telefon: ${c.customerPhone}` : null,
        c.customerNote ? `Kundennotiz: ${c.customerNote}` : null,
        meetingUrl ? `Meeting-Link: ${meetingUrl}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const attendees = [
        { email: c.customerEmail, displayName: c.customerName ?? undefined },
        ...(rep?.email ? [{ email: rep.email, displayName: rep.name ?? undefined }] : []),
      ];

      if (googleEventId) {
        await updateConsultationEvent(googleEventId, {
          summary,
          description,
          startIso: c.requestedStart.toISOString(),
          endIso: c.requestedEnd.toISOString(),
          location: meetingUrl ?? undefined,
        });
      } else {
        const ev = await createConsultationEvent({
          summary,
          description,
          startIso: c.requestedStart.toISOString(),
          endIso: c.requestedEnd.toISOString(),
          attendees,
          addGoogleMeet: useMeet,
          location: meetingUrl ?? undefined,
        });
        googleEventId = ev.eventId;
        googleHtmlLink = ev.htmlLink;
        if (useMeet && !meetingUrl && ev.meetUrl) meetingUrl = ev.meetUrl;
      }
    } catch (err) {
      console.error("[consultations] google sync failed (continuing)", err);
    }
  }

  await db
    .update(consultations)
    .set({
      status: "confirmed",
      assignedUserId: session.user.id,
      meetingProvider: input.meetingProvider,
      meetingUrl,
      internalNotes: input.internalNotes ?? c.internalNotes,
      googleEventId,
      googleHtmlLink,
      googleCalendarId: isGoogleCalendarConfigured() ? CALENDAR_ID : null,
      confirmedAt: new Date(),
    })
    .where(eq(consultations.id, c.id));

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "consultation_confirmed",
    entityType: "consultation",
    entityId: c.id,
    payload: { provider: input.meetingProvider },
  });

  try {
    const { ConsultationConfirmedEmail } = await import("@/emails/consultation-confirmed");
    await sendEmail({
      to: c.customerEmail,
      from: "bookingConfirmation",
      subject: `Dein Beratungstermin bei ImmoHero ist bestätigt`,
      template: "consultation-confirmed",
      orderId: c.orderId ?? undefined,
      react: ConsultationConfirmedEmail({
        customerName: (c.customerName ?? "").split(" ")[0],
        whenLabel: germanDateTime(c.requestedStart),
        meetingUrl: meetingUrl,
        repName: rep?.name ?? "ImmoHero Team",
        shortCode: order?.shortCode ?? null,
      }),
    });
  } catch (err) {
    console.error("[consultations] confirm mail failed", err);
  }

  revalidatePath("/studio/beratung");
}

export async function declineConsultation(input: {
  consultationId: string;
  reason: string;
}) {
  const session = await requireCRM();
  const [c] = await db
    .select()
    .from(consultations)
    .where(eq(consultations.id, input.consultationId))
    .limit(1);
  if (!c) throw new Error("Consultation not found");

  if (c.googleEventId) await deleteConsultationEvent(c.googleEventId);

  await db
    .update(consultations)
    .set({
      status: "declined",
      declineReason: input.reason,
      declinedAt: new Date(),
      assignedUserId: session.user.id,
      googleEventId: null,
    })
    .where(eq(consultations.id, c.id));

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "consultation_declined",
    entityType: "consultation",
    entityId: c.id,
  });

  try {
    const { ConsultationDeclinedEmail } = await import("@/emails/consultation-declined");
    await sendEmail({
      to: c.customerEmail,
      from: "bookingConfirmation",
      subject: `Terminvorschlag — wir finden einen neuen Termin`,
      template: "consultation-declined",
      orderId: c.orderId ?? undefined,
      react: ConsultationDeclinedEmail({
        customerName: (c.customerName ?? "").split(" ")[0],
        reason: input.reason,
      }),
    });
  } catch (err) {
    console.error("[consultations] decline mail failed", err);
  }

  revalidatePath("/studio/beratung");
}

export async function completeConsultation(consultationId: string) {
  await requireCRM();
  await db
    .update(consultations)
    .set({ status: "completed" })
    .where(eq(consultations.id, consultationId));
  revalidatePath("/studio/beratung");
}

export async function updateConsultationMeetingLink(input: {
  consultationId: string;
  meetingProvider: Provider;
  meetingUrl: string;
}) {
  await requireCRM();
  const [c] = await db
    .select()
    .from(consultations)
    .where(eq(consultations.id, input.consultationId))
    .limit(1);
  if (!c) throw new Error("Not found");

  if (c.googleEventId) {
    await updateConsultationEvent(c.googleEventId, {
      location: input.meetingUrl,
      description: `Aktualisierter Meeting-Link: ${input.meetingUrl}`,
    });
  }

  await db
    .update(consultations)
    .set({ meetingProvider: input.meetingProvider, meetingUrl: input.meetingUrl })
    .where(eq(consultations.id, c.id));

  revalidatePath("/studio/beratung");
}
