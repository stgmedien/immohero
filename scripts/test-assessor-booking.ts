/**
 * End-to-End-Test der Kalender-Direktbuchung OHNE LLM:
 * ruft die Tool-Executor-Funktionen direkt auf (get_call_slots →
 * book_assessor_call), prüft das echte Google-Calendar-Event und räumt auf.
 *
 *   pnpm tsx --env-file=.env.local scripts/test-assessor-booking.ts
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pilotProfiles, pilotEvents, consultations } from "@/lib/db/schema";
import { executeTool, type ToolContext } from "@/lib/pilot/tools";
import { deleteConsultationEvent } from "@/lib/google-calendar";

const TEST_EMAIL = "assessor-booking-test@example.com";

async function main() {
  // 1) Test-Profil
  const [profile] = await db
    .insert(pilotProfiles)
    .values({
      email: TEST_EMAIL,
      name: "Booking Test",
      level: "intermediate",
      levelScore: 45,
      flightHours: 30,
      equipment: [{ model: "DJI Mini 4 Pro", euClass: "C0" }],
      certificates: { a1a3: true },
    })
    .returning();
  console.log("Profil angelegt:", profile.id);

  const ctx: ToolContext = {
    sessionId: "test-booking-session",
    profile,
    persona: "academy",
    locale: "de",
    profileDirty: false,
  };

  // 2) Slots holen
  const slotsRaw = await executeTool("get_call_slots", {}, ctx);
  const slots = JSON.parse(slotsRaw) as { slots: { start_iso: string; label: string }[] };
  if (!slots.slots?.length) throw new Error("Keine Slots verfügbar");
  const slot = slots.slots[slots.slots.length - 1]; // letzten nehmen (weit weg)
  console.log("Gewählter Slot:", slot.label);

  // 3) Buchen (legt ECHTES Google-Calendar-Event an)
  const bookRaw = await executeTool("book_assessor_call", { slot_start_iso: slot.start_iso, note: "Automatischer Systemtest — wird sofort wieder gelöscht" }, ctx);
  const book = JSON.parse(bookRaw) as { ok: boolean; confirmed: boolean; meet_url?: string | null };
  console.log("Buchung:", JSON.stringify(book, null, 2));

  // 4) DB-Zeile prüfen
  const [row] = await db
    .select()
    .from(consultations)
    .where(eq(consultations.customerEmail, TEST_EMAIL))
    .limit(1);
  console.log("Consultation:", {
    status: row?.status,
    kind: row?.kind,
    meetingUrl: row?.meetingUrl,
    googleEventId: row?.googleEventId ? "gesetzt" : null,
  });

  // 5) Aufräumen: GCal-Event + DB-Zeilen
  if (row?.googleEventId) {
    await deleteConsultationEvent(row.googleEventId);
    console.log("Google-Calendar-Event gelöscht.");
  }
  if (row) await db.delete(consultations).where(eq(consultations.id, row.id));
  await db.delete(pilotEvents).where(eq(pilotEvents.profileId, profile.id));
  await db.delete(pilotProfiles).where(eq(pilotProfiles.id, profile.id));
  console.log("Aufgeräumt. ✓");

  if (!book.confirmed || !book.meet_url) {
    console.error("WARNUNG: Buchung nicht confirmed oder kein Meet-Link!");
    process.exit(1);
  }
  console.log("\n✅ Direkt-Buchung funktioniert: Event + Meet-Link wurden real erzeugt und wieder entfernt.");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
