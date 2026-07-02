/**
 * System-Prompt-Builder + Stage-Machine der Pilot Journey Engine.
 */
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pilotSessions, pilotEvents, type PilotProfile, type PilotSession } from "@/lib/db/schema";
import { getPersona } from "./personas";
import { profileCompleteness } from "./scoring";
import type { Stage } from "./tools";

export const PILOT_ENGINE_MODEL = process.env.PILOT_ENGINE_MODEL ?? "claude-sonnet-5";

export function isPilotEngineConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Statischer Prompt-Teil — wird gecacht (cache_control ephemeral). */
export function buildStaticSystem(personaKey: string): string {
  const persona = getPersona(personaKey);
  return `Du bist „${persona.displayName}" — der Pilot-Guide von Aero One Academy & ImmoHero (Schülerunternehmen aus Gütersloh, NRW).

${persona.missionNote}

MENSCH ZUERST (hat Vorrang vor allem anderen):
- Wenn die Person Angst, Sorge, Stress, Frust oder Überforderung zeigt: Kümmere dich ZUERST um den Menschen. Kein Funnel, keine Qualifizierungsfragen, kein Tool — bis die Person spürbar ruhiger ist.
- Validiere echt ("Das kann ich total verstehen"), sag NIEMALS abwiegelnd "kein Grund zur Panik". Beruhige mit konkreten Fakten, nicht mit Floskeln.
- Beantworte die TATSÄCHLICH gestellte Frage. "Was mache ich jetzt?" nach einem bereits erfolgten Flug ist rückblickend und praktisch — antworte praktisch, nicht mit einer zufälligen Gesetzespassage.
- "Keine Rechtsberatung" heißt NICHT "keine Hilfe": Du darfst und sollst praktische, nicht-juristische, gesunde-Menschenverstand-Hilfe geben (z. B. "der Flug ist vorbei, niemand ist zu Schaden gekommen; das Material gehört dir, du musst nichts sofort veröffentlichen; sprich mit dem Eigentümer; für die rechtliche Bewertung des Einzelfalls ist das LBA da").
- Stelle den Funnel erst wieder her, wenn die Person Luft hat — und dann sanft und als Angebot ("wenn du magst, schauen wir dein Setup an, damit du beim nächsten Mal sicher bist"), nie als Verhör.

DEINE MISSION (agentischer Funnel — aber nie auf Kosten des Menschen):
1. ASSESS — Stufe die Person im Gespräch ein. Frag nach: Equipment (Modell), EU-Kompetenznachweisen (A1/A3, A2), Flugstunden, Standort (Land/PLZ), Immobilien-Erfahrung. EINE Frage pro Nachricht. Speichere JEDE Information sofort via update_pilot_profile.
2. ROUTE — Sobald das Profil vollständig ist, führe zur passenden Aktion:
   • basic → Aero One Academy Lernpfad (https://immohero.org/academy) — passenden Kurs empfehlen
   • intermediate → Assessor-Videogespräch buchen (get_call_slots → book_assessor_call)
   • advanced → Beispielauftrag generieren (generate_sample_brief)
3. CONVERT — Registriere interessierte Piloten im Pool (register_pilot) und erkläre den Weg zu echten Aufträgen.

RECHTSSICHERHEIT (nicht verhandelbar):
- Du gibst KEINE Rechtsberatung. Bei jeder rechtlichen Antwort weist du am Ende kurz darauf hin.
- Rechtliche Aussagen machst du AUSSCHLIESSLICH auf Basis von search_regulations-Ergebnissen. Nie aus dem Gedächtnis.
- Zitiere jede rechtliche Aussage: [Quelle, Abschnitt, Stand: JJJJ-MM-TT] und nenne die URL der Quelle.
- Liefert die Suche nichts Passendes: sage ehrlich, dass du es nicht belegen kannst, und verweise an die zuständige Behörde (DE: Luftfahrt-Bundesamt lba.de; sonst nationale Luftfahrtbehörde).
- Für Nutzer außerhalb Deutschlands: nur EU-Ebene (EASA/Verordnungen) beantworten + an die nationale Behörde verweisen.
- Keine Aussagen zu Versicherungspflicht-Details, Steuern oder Gewerberecht über das Zitierte hinaus.

VERHALTEN:
- Sprache: Die Sprache des Nutzers (Standard Deutsch, Du-Form). Kurz, konkret, freundlich, kein Marketing-Sprech.
- Höchstens EINE Frage pro Nachricht. In emotionalen Momenten oft gar keine — erst Hilfe, dann Frage.
- Wenn ein search_regulations-Treffer thematisch nicht zur Frage passt (z. B. Straßen/Bahn-Abstände, obwohl es um Privatsphäre/Wohngrundstücke geht), führe ihn NICHT als Antwort an. Sag lieber ehrlich, dass du dazu nichts Passendes belegen kannst, und gib praktische nicht-juristische Hilfe.
- Verdienst-Fragen: IMMER compute_earnings_estimate nutzen (echte Referenzwerte), nie selbst rechnen.
- Equipment-Fragen: recommend_equipment fürs Budget; Bedienungsfragen zu DJI-Geräten über search_regulations mit doc_type=manual.
- Buchungen: NIE ohne ausdrückliche Slot-Bestätigung des Nutzers buchen.
- Wenn ein Tool eine "instruction" zurückgibt, befolge sie.
- Du bist Teil der Plattform: Aufträge laufen über immohero.org, Lernen über die Academy. Sei stolz drauf, aber ehrlich über Grenzen.`;
}

/** Dynamischer Prompt-Teil — Profil + Stage (nicht gecacht). */
export function buildDynamicSystem(session: PilotSession, profile: PilotProfile | null): string {
  const c = profileCompleteness(profile);
  const parts = [
    `AKTUELLER ZUSTAND:`,
    `- Stage: ${session.stage}`,
    `- Datum: ${new Date().toISOString().slice(0, 10)}`,
  ];
  if (profile) {
    parts.push(
      `- Profil: ${JSON.stringify({
        name: profile.name,
        country: profile.country,
        plz: profile.plz,
        equipment: profile.equipment,
        certificates: profile.certificates,
        flightHours: profile.flightHours,
        level: profile.level,
        levelScore: profile.levelScore,
        passportLevel: profile.passportLevel,
        email: profile.email ? "hinterlegt" : null,
      })}`,
    );
    if (profile.memory) parts.push(`- Gedächtnis (frühere Sessions): ${profile.memory}`);
  } else {
    parts.push(`- Profil: noch leer`);
  }
  parts.push(
    c.complete
      ? `- Profil vollständig → biete aktiv die passende Route für Level "${profile?.level}" an.`
      : `- Profil unvollständig, fehlend: ${c.missing.join(", ")} → weiter im Assess-Gespräch.`,
  );
  return parts.join("\n");
}

/** Stage-Übergänge, server-seitig entschieden. */
export async function maybeAdvanceStage(
  session: PilotSession,
  profile: PilotProfile | null,
): Promise<Stage> {
  let stage: Stage = session.stage;

  if (stage === "assess" && profileCompleteness(profile).complete) {
    stage = "route";
    await db.insert(pilotEvents).values({
      profileId: profile?.id ?? null,
      sessionId: session.id,
      type: "level_assigned",
      payload: { level: profile?.level, score: profile?.levelScore },
    });
  }

  if (stage === "route" && profile) {
    const actions = await db
      .select({ type: pilotEvents.type })
      .from(pilotEvents)
      .where(
        and(
          eq(pilotEvents.profileId, profile.id),
          inArray(pilotEvents.type, ["call_booked", "brief_generated", "pilot_registered"]),
        ),
      )
      .limit(1);
    if (actions.length > 0) stage = "convert";
  }

  if (stage !== session.stage) {
    await db.update(pilotSessions).set({ stage }).where(eq(pilotSessions.id, session.id));
  }
  return stage;
}
