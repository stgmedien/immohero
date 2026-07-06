/**
 * Demo-Modus für Offline-Prototyp-Präsentationen.
 *
 * Wird über die Env-Variable DEMO_MODE=1 (nur lokal, gitignored via .env.local)
 * aktiviert. Wenn an, werden die wenigen Stellen, die sonst Datenbank, Stripe
 * oder Google Calendar bräuchten, durch lokale Stubs ersetzt — so läuft der
 * komplette Marketing- + Buchungs-Funnel ohne Internet durch.
 *
 * In Production ist DEMO_MODE nicht gesetzt → alle Branches sind tot, der echte
 * Code läuft unverändert.
 */
export const DEMO_MODE = process.env.DEMO_MODE === "1";

// Kleine PLZ→Stadt-Tabelle, damit die Adress-Prüfung im Demo realistisch wirkt.
const DEMO_CITIES: Record<string, string> = {
  "33332": "Gütersloh",
  "33333": "Gütersloh",
  "33602": "Bielefeld",
  "33098": "Paderborn",
  "32049": "Herford",
  "32756": "Detmold",
  "32105": "Bad Salzuflen",
  "33689": "Bielefeld",
  "40213": "Düsseldorf",
  "50667": "Köln",
  "44135": "Dortmund",
  "48143": "Münster",
};

export function demoCityForPlz(plz: string): { city: string; region: string } {
  return { city: DEMO_CITIES[plz] ?? "Gütersloh", region: "OWL · NRW" };
}

const SLOT_HOURS = [9, 10, 11, 13, 14, 15, 16, 17];

/** Erzeugt rein lokal Beratungs-Slots (keine DB, kein Kalender). */
export function demoConsultationSlots(daysAhead = 14) {
  const now = new Date();
  const cursor = new Date(now);
  cursor.setDate(cursor.getDate() + 1);
  cursor.setHours(0, 0, 0, 0);

  const out: { date: string; weekday: string; slots: { start: string; label: string }[] }[] = [];
  let businessDays = 0;

  while (businessDays < daysAhead) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      businessDays++;
      const daySlots: { start: string; label: string }[] = [];
      for (const h of SLOT_HOURS) {
        const start = new Date(cursor);
        start.setHours(h, 0, 0, 0);
        if (start.getTime() < now.getTime() + 12 * 3600_000) continue;
        daySlots.push({
          start: start.toISOString(),
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
