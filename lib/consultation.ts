import { getFreeBusy, isGoogleCalendarConfigured } from "@/lib/google-calendar";
import { db } from "@/lib/db/client";
import { consultations } from "@/lib/db/schema";
import { and, gte, lte, inArray } from "drizzle-orm";

export const CONSULTATION_DURATION_MIN = 30;

// Business hours (Europe/Berlin) – Mon–Fri
const SLOT_HOURS = [9, 10, 11, 13, 14, 15, 16, 17];

export interface DaySlots {
  date: string; // YYYY-MM-DD
  weekday: string;
  slots: { start: string; label: string }[]; // start = ISO, label = "09:00"
}

function berlinIso(date: Date): string {
  // Build an ISO string with +02:00 (CEST) — good enough for de business hours
  return date.toISOString();
}

/**
 * Generates consultation slots for the next `daysAhead` business days,
 * removing slots that are busy in Google Calendar (if connected) or already
 * requested/confirmed in the DB.
 */
export async function getAvailableConsultationSlots(daysAhead = 14): Promise<DaySlots[]> {
  const now = new Date();
  const horizonStart = new Date(now);
  horizonStart.setDate(horizonStart.getDate() + 1); // earliest = tomorrow
  horizonStart.setHours(0, 0, 0, 0);
  const horizonEnd = new Date(horizonStart);
  horizonEnd.setDate(horizonEnd.getDate() + daysAhead + 4);

  // Busy from Google (best effort)
  let busy: { start: string; end: string }[] = [];
  if (isGoogleCalendarConfigured()) {
    try {
      busy = await getFreeBusy(horizonStart.toISOString(), horizonEnd.toISOString());
    } catch (err) {
      console.error("[consultation] freeBusy failed, falling back to open slots", err);
    }
  }

  // Busy from DB (requested/confirmed consultations block the slot)
  const dbRows = await db
    .select({ start: consultations.requestedStart, end: consultations.requestedEnd })
    .from(consultations)
    .where(
      and(
        gte(consultations.requestedStart, horizonStart),
        lte(consultations.requestedStart, horizonEnd),
        inArray(consultations.status, ["requested", "confirmed"]),
      ),
    );
  const dbBusy = dbRows.map((r) => ({
    start: r.start.toISOString(),
    end: r.end.toISOString(),
  }));
  const allBusy = [...busy, ...dbBusy].map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));

  const overlapsBusy = (slotStart: number, slotEnd: number) =>
    allBusy.some((b) => slotStart < b.end && slotEnd > b.start);

  const out: DaySlots[] = [];
  const cursor = new Date(horizonStart);
  let businessDays = 0;

  while (businessDays < daysAhead) {
    const dow = cursor.getDay(); // 0 Sun .. 6 Sat
    if (dow !== 0 && dow !== 6) {
      businessDays++;
      const daySlots: DaySlots["slots"] = [];
      for (const h of SLOT_HOURS) {
        const start = new Date(cursor);
        start.setHours(h, 0, 0, 0);
        if (start.getTime() < now.getTime() + 12 * 3600_000) continue; // min 12h lead time
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + CONSULTATION_DURATION_MIN);
        if (overlapsBusy(start.getTime(), end.getTime())) continue;
        daySlots.push({
          start: berlinIso(start),
          label: `${String(h).padStart(2, "0")}:00`,
        });
      }
      if (daySlots.length > 0) {
        out.push({
          date: cursor.toISOString().slice(0, 10),
          weekday: cursor.toLocaleDateString("de-DE", { weekday: "long" }),
          slots: daySlots,
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return out;
}

export function consultationWindow(startIso: string): { start: Date; end: Date } {
  const start = new Date(startIso);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + CONSULTATION_DURATION_MIN);
  return { start, end };
}
