/**
 * Gemeinsamer Buchungs-Kern für Assessor-Calls.
 * Wird vom Chatbot-Tool (book_assessor_call) UND vom Onboarding-Wizard genutzt —
 * eine Implementierung, ein Verhalten: Google-Calendar-Event + Meet-Link direkt,
 * mit "requested"-Fallback, wenn der Kalender nicht erreichbar ist.
 */
import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db/client";
import { consultations, type PilotProfile } from "@/lib/db/schema";
import { consultationWindow } from "@/lib/consultation";
import {
  createConsultationEvent,
  isGoogleCalendarConfigured,
  CALENDAR_ID,
} from "@/lib/google-calendar";

export interface AssessorBookingResult {
  ok: boolean;
  error?: "no_email" | "invalid_slot";
  confirmed?: boolean;
  consultationId?: string;
  start?: string;
  end?: string;
  meetUrl?: string | null;
}

export async function bookAssessorCall(
  profile: PilotProfile,
  slotStartIso: string,
  note?: string | null,
): Promise<AssessorBookingResult> {
  if (!profile.email) return { ok: false, error: "no_email" };

  const start = new Date(slotStartIso);
  if (isNaN(start.getTime()) || start.getTime() < Date.now() + 2 * 3600_000) {
    return { ok: false, error: "invalid_slot" };
  }
  const { start: s, end: e } = consultationWindow(start.toISOString());

  let googleEventId: string | null = null;
  let googleHtmlLink: string | null = null;
  let meetUrl: string | null = null;
  let confirmed = false;
  if (isGoogleCalendarConfigured()) {
    try {
      const ev = await createConsultationEvent({
        summary: `Aero One Pilot-Assessment — ${profile.name ?? profile.email}`,
        description: [
          "30-minütiges Assessor-Videogespräch (Pilot-Onboarding).",
          `Level-Einstufung: ${profile.level ?? "offen"} (Score ${profile.levelScore}, Passport ${profile.passportLevel})`,
          profile.equipment?.length ? `Equipment: ${profile.equipment.map((eq) => eq.model).join(", ")}` : null,
          profile.flightHours != null ? `Flugstunden: ${profile.flightHours}` : null,
          note ? `Notiz: ${note.slice(0, 300)}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        startIso: s.toISOString(),
        endIso: e.toISOString(),
        attendees: [{ email: profile.email, displayName: profile.name ?? undefined }],
        addGoogleMeet: true,
      });
      googleEventId = ev.eventId;
      googleHtmlLink = ev.htmlLink;
      meetUrl = ev.meetUrl;
      confirmed = true;
    } catch (err) {
      console.error("[pilot] direct calendar booking failed", err);
      Sentry.captureException(err, { tags: { feature: "pilot_assessor_booking" } });
    }
  }

  const [row] = await db
    .insert(consultations)
    .values({
      kind: "pilot_assessor",
      customerEmail: profile.email,
      customerName: profile.name,
      requestedStart: s,
      requestedEnd: e,
      status: confirmed ? "confirmed" : "requested",
      meetingProvider: confirmed ? "google_meet" : null,
      meetingUrl: meetUrl,
      googleEventId,
      googleHtmlLink,
      googleCalendarId: confirmed ? CALENDAR_ID : null,
      confirmedAt: confirmed ? new Date() : null,
      customerNote: note
        ? note.slice(0, 500)
        : `Pilot-Assessment (Level: ${profile.level ?? "offen"}, Score ${profile.levelScore})`,
    })
    .returning({ id: consultations.id });

  return {
    ok: true,
    confirmed,
    consultationId: row.id,
    start: s.toISOString(),
    end: e.toISOString(),
    meetUrl,
  };
}
