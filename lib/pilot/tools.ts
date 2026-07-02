/**
 * Tool-Definitionen + Ausführung für die Pilot Journey Engine.
 * Die Stage bestimmt server-seitig, welche Tools das Modell sieht —
 * das ist der "agentische Funnel" statt freiem Chatbot.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  pilotProfiles,
  pilotEvents,
  sampleBriefs,
  consultations,
  customers,
  type PilotProfile,
} from "@/lib/db/schema";
import { searchRegulations } from "./rag";
import { estimateEarnings } from "./earnings";
import { recommendEquipment, EQUIPMENT_CATALOG } from "./equipment";
import { profileCompleteness, computeLevelScore, levelFromScore, computePassportLevel } from "./scoring";
import { getAvailableConsultationSlots, consultationWindow } from "@/lib/consultation";
import { shotsForOrder } from "@/lib/shots";

export type Stage = "assess" | "route" | "convert";

export interface ToolContext {
  sessionId: string;
  profile: PilotProfile | null;
  persona: string;
  locale: string;
  /** Wird gesetzt, wenn ein Tool das Profil verändert hat (Route lädt neu). */
  profileDirty: boolean;
}

const ASSESS_TOOLS = [
  "update_pilot_profile",
  "search_regulations",
  "compute_earnings_estimate",
  "recommend_equipment",
] as const;
const ROUTE_TOOLS = [...ASSESS_TOOLS, "get_call_slots", "book_assessor_call", "generate_sample_brief", "register_pilot"] as const;

export function toolsForStage(stage: Stage): Anthropic.Tool[] {
  const names: readonly string[] = stage === "assess" ? ASSESS_TOOLS : ROUTE_TOOLS;
  const tools = ALL_TOOLS.filter((t) => names.includes(t.name));
  // Prompt-Caching auf der Tool-Liste (ändert sich pro Stage nicht)
  return tools.map((t, i) =>
    i === tools.length - 1 ? ({ ...t, cache_control: { type: "ephemeral" } } as Anthropic.Tool) : t,
  );
}

const ALL_TOOLS: Anthropic.Tool[] = [
  {
    name: "update_pilot_profile",
    description:
      "Speichert Angaben des Nutzers strukturiert im Pilotenprofil. Rufe das Tool IMMER auf, sobald der Nutzer eine relevante Information nennt (Equipment, Zertifikate, Flugstunden, Standort, Portfolio). Nur Felder übergeben, die der Nutzer tatsächlich genannt hat — nichts erfinden.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Vorname oder voller Name" },
        country: { type: "string", description: "ISO-2 Ländercode, z. B. DE, AT" },
        plz: { type: "string", description: "Postleitzahl (5-stellig, DE)" },
        flight_hours: { type: "integer", description: "Geschätzte Flugstunden gesamt" },
        equipment: {
          type: "array",
          items: {
            type: "object",
            properties: {
              model: { type: "string" },
              eu_class: { type: "string", description: "C0–C6, falls bekannt" },
            },
            required: ["model"],
          },
        },
        certificates: {
          type: "object",
          properties: {
            a1a3: { type: "boolean" },
            a2: { type: "boolean" },
            sts: { type: "boolean" },
          },
        },
        portfolio_links: { type: "array", items: { type: "string" } },
        has_real_estate_footage: { type: "boolean" },
        self_assessment: { type: "string", description: "Kurze Selbsteinschätzung in eigenen Worten" },
      },
    },
  },
  {
    name: "search_regulations",
    description:
      "Durchsucht die amtliche Wissensbasis (EU-Verordnungen 2019/947 & 2019/945, EASA Easy Access Rules, LuftVO, LBA, dipul, DFS sowie Hersteller-Handbücher). PFLICHT vor jeder rechtlichen Aussage. doc_type: regulation für Rechtsfragen, manual für Geräte-Bedienfragen, guide für Praxis-/Behördeninfos, any für gemischt.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "2–4 präzise AMTLICHE Suchbegriffe, KEINE ganzen Sätze. Nutze Gesetzes-Vokabular: 'Wohngrundstücke Überflug' statt 'Wohngebiete', 'Fernpiloten-Zeugnis' statt 'A2-Schein', 'geografische UAS-Gebiete' statt 'Flugverbotszonen'.",
        },
        doc_type: { type: "string", enum: ["regulation", "guide", "manual", "any"] },
      },
      required: ["query"],
    },
  },
  {
    name: "compute_earnings_estimate",
    description:
      "Berechnet deterministisch das Verdienstpotenzial mit echten ImmoHero-Referenzwerten (339 €/Projekt, 449 €/Monat Retainer). Für 'Was kann ich verdienen?'-Fragen.",
    input_schema: {
      type: "object" as const,
      properties: {
        projects_per_month: { type: "integer", description: "Angenommene Projekte pro Monat (1–40)" },
        include_retainer: { type: "boolean", description: "Makler-Retainer einrechnen" },
      },
      required: ["projects_per_month"],
    },
  },
  {
    name: "recommend_equipment",
    description:
      "Empfiehlt aus dem kuratierten Katalog Drohnen fürs Budget, inkl. Kennzeichnung, ob das Gerät die ImmoHero-Mindestanforderung erfüllt.",
    input_schema: {
      type: "object" as const,
      properties: {
        budget_eur: { type: "integer", description: "Budget in Euro" },
      },
      required: ["budget_eur"],
    },
  },
  {
    name: "get_call_slots",
    description:
      "Liefert freie Termine (nächste 7 Tage) für ein 30-minütiges Assessor-Videogespräch mit dem Aero-One-Team.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "book_assessor_call",
    description:
      "Bucht einen Assessor-Call verbindlich. NUR aufrufen, nachdem der Nutzer einen konkreten Slot ausdrücklich bestätigt hat. Benötigt eine E-Mail im Profil.",
    input_schema: {
      type: "object" as const,
      properties: {
        slot_start_iso: { type: "string", description: "Start des gewählten Slots (ISO 8601, aus get_call_slots)" },
        note: { type: "string", description: "Optionale Notiz des Nutzers" },
      },
      required: ["slot_start_iso"],
    },
  },
  {
    name: "generate_sample_brief",
    description:
      "Erzeugt einen realistischen ImmoHero-Beispielauftrag (Objekt, Shotliste aus der echten Produktions-Bibliothek, Abgabeformat) für fortgeschrittene Piloten zum Üben/Beweisen.",
    input_schema: {
      type: "object" as const,
      properties: {
        property_type: {
          type: "string",
          enum: ["haus", "wohnung", "villa", "mfh", "gewerbe", "grundstueck"],
          description: "Objekttyp des Beispielauftrags (Default haus)",
        },
      },
    },
  },
  {
    name: "register_pilot",
    description:
      "Registriert den Piloten im Aero-One/ImmoHero-Pool (CRM). Aufrufen, wenn der Nutzer aktiv dabei sein will und eine E-Mail im Profil ist.",
    input_schema: { type: "object" as const, properties: {} },
  },
];

async function logEvent(ctx: ToolContext, type: string, payload?: Record<string, unknown>) {
  await db.insert(pilotEvents).values({
    profileId: ctx.profile?.id ?? null,
    sessionId: ctx.sessionId,
    type,
    payload: payload ?? null,
  });
}

async function ensureProfile(ctx: ToolContext): Promise<PilotProfile> {
  if (ctx.profile) return ctx.profile;
  const [row] = await db
    .insert(pilotProfiles)
    .values({ persona: ctx.persona, locale: ctx.locale })
    .returning();
  ctx.profile = row;
  ctx.profileDirty = true;
  return row;
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  try {
    switch (name) {
      case "update_pilot_profile": {
        const p = await ensureProfile(ctx);
        const patch: Partial<PilotProfile> = {};
        if (typeof input.name === "string") patch.name = input.name.slice(0, 120);
        if (typeof input.country === "string") patch.country = input.country.toUpperCase().slice(0, 2);
        if (typeof input.plz === "string" && /^\d{4,5}$/.test(input.plz)) patch.plz = input.plz.slice(0, 5);
        if (typeof input.flight_hours === "number") patch.flightHours = Math.max(0, Math.min(20000, Math.round(input.flight_hours)));
        if (Array.isArray(input.equipment)) {
          patch.equipment = (input.equipment as { model?: unknown; eu_class?: unknown }[])
            .filter((e) => typeof e.model === "string")
            .slice(0, 10)
            .map((e) => ({ model: String(e.model).slice(0, 80), euClass: typeof e.eu_class === "string" ? e.eu_class.slice(0, 4) : null }));
        }
        if (input.certificates && typeof input.certificates === "object") {
          const c = input.certificates as Record<string, unknown>;
          patch.certificates = {
            ...(p.certificates ?? {}),
            ...(typeof c.a1a3 === "boolean" ? { a1a3: c.a1a3 } : {}),
            ...(typeof c.a2 === "boolean" ? { a2: c.a2 } : {}),
            ...(typeof c.sts === "boolean" ? { sts: c.sts } : {}),
          };
        }
        const portfolio = { ...(p.portfolio ?? {}) };
        if (Array.isArray(input.portfolio_links)) {
          portfolio.links = (input.portfolio_links as unknown[])
            .filter((l) => typeof l === "string" && /^https?:\/\//.test(l as string))
            .slice(0, 5) as string[];
        }
        if (typeof input.has_real_estate_footage === "boolean") portfolio.hasRealEstateFootage = input.has_real_estate_footage;
        if (typeof input.self_assessment === "string") portfolio.selfAssessment = input.self_assessment.slice(0, 500);
        if (Object.keys(portfolio).length > 0) patch.portfolio = portfolio;

        const merged = { ...p, ...patch };
        const score = computeLevelScore(merged);
        const completeness = profileCompleteness(merged);
        patch.levelScore = score;
        if (completeness.complete) patch.level = levelFromScore(score);
        patch.passportLevel = computePassportLevel(merged);

        const [updated] = await db.update(pilotProfiles).set(patch).where(eq(pilotProfiles.id, p.id)).returning();
        ctx.profile = updated;
        ctx.profileDirty = true;
        return JSON.stringify({
          ok: true,
          completeness,
          level_score: score,
          level: completeness.complete ? levelFromScore(score) : null,
          hint: completeness.complete
            ? "Profil vollständig — Einstufung steht. Jetzt die passende Route anbieten."
            : `Es fehlen noch: ${completeness.missing.join(", ")}. Frage gezielt nach der nächsten fehlenden Info (eine Frage pro Nachricht).`,
        });
      }

      case "search_regulations": {
        const hits = await searchRegulations({
          query: String(input.query ?? "").slice(0, 300),
          country: ctx.profile?.country ?? "DE",
          docType: (input.doc_type as "regulation" | "guide" | "manual" | "any" | undefined) ?? "any",
          limit: 6,
        });
        await logEvent(ctx, "regulation_search", { query: input.query, hits: hits.length });
        if (hits.length === 0) {
          return JSON.stringify({
            results: [],
            instruction:
              "Keine Treffer. Versuche GENAU EINEN weiteren search_regulations-Aufruf mit anderen amtlichen Begriffen/Synonymen (z. B. 'Wohngrundstücke' statt 'Wohngebiete', '§ 21h LuftVO', 'Betrieb offene Kategorie'). Liefert auch der nichts: sage ehrlich, dass du es nicht belegen kannst, und verweise auf die zuständige Behörde (Deutschland: Luftfahrt-Bundesamt, lba.de).",
          });
        }
        return JSON.stringify({
          results: hits.map((h) => ({
            source: h.sourceTitle,
            authority: h.authority,
            section: h.sectionRef,
            url: h.sourceUrl,
            doc_type: h.docType,
            stand: h.crawledAt ? String(h.crawledAt).slice(0, 10) : null,
            content: h.content.slice(0, 1800),
          })),
          instruction:
            "Antworte NUR auf Basis dieser Auszüge. Zitiere jede rechtliche Aussage im Format [Quelle, Abschnitt, Stand: JJJJ-MM-TT] und nenne die URL. Schließe rechtliche Antworten mit dem Hinweis ab, dass dies keine Rechtsberatung ist.",
        });
      }

      case "compute_earnings_estimate": {
        const est = estimateEarnings({
          projectsPerMonth: Number(input.projects_per_month ?? 2),
          includeRetainer: Boolean(input.include_retainer),
        });
        await logEvent(ctx, "earnings_estimated", { projects: est.projectsPerMonth });
        return JSON.stringify(est);
      }

      case "recommend_equipment": {
        const budget = Math.max(100, Math.min(20000, Number(input.budget_eur ?? 800)));
        const picks = recommendEquipment(budget);
        return JSON.stringify({
          budget_eur: budget,
          recommendations: picks,
          catalog_note: "Preise sind Richtwerte (Stand Mitte 2026). immoheroReady = erfüllt Mindestanforderung für bezahlte ImmoHero-Aufträge.",
          all_ready_models: EQUIPMENT_CATALOG.filter((e) => e.immoheroReady).map((e) => e.model),
        });
      }

      case "get_call_slots": {
        const days = await getAvailableConsultationSlots(7);
        const slots = days.flatMap((d) =>
          d.slots.slice(0, 3).map((s) => ({ date: d.date, weekday: d.weekday, start_iso: s.start, label: `${d.weekday} ${d.date}, ${s.label} Uhr` })),
        ).slice(0, 12);
        return JSON.stringify({
          slots,
          instruction: "Biete 3–4 Slots als Auswahl an. Buche erst nach ausdrücklicher Bestätigung eines konkreten Slots.",
        });
      }

      case "book_assessor_call": {
        const p = await ensureProfile(ctx);
        if (!p.email) {
          return JSON.stringify({ ok: false, error: "no_email", instruction: "Bitte zuerst nach der E-Mail-Adresse fragen (fürs Kalender-Invite) — sie wird über das E-Mail-Formular im Chat gespeichert." });
        }
        const startIso = String(input.slot_start_iso ?? "");
        const start = new Date(startIso);
        if (isNaN(start.getTime()) || start.getTime() < Date.now() + 2 * 3600_000) {
          return JSON.stringify({ ok: false, error: "invalid_slot", instruction: "Slot ungültig oder zu kurzfristig — erneut get_call_slots aufrufen und wählen lassen." });
        }
        const { start: s, end: e } = consultationWindow(start.toISOString());
        const [row] = await db
          .insert(consultations)
          .values({
            kind: "pilot_assessor",
            customerEmail: p.email,
            customerName: p.name,
            requestedStart: s,
            requestedEnd: e,
            status: "requested",
            customerNote: typeof input.note === "string" ? input.note.slice(0, 500) : `Pilot-Assessment (Level: ${p.level ?? "offen"}, Score ${p.levelScore})`,
          })
          .returning({ id: consultations.id });
        await logEvent(ctx, "call_booked", { consultationId: row.id, start: s.toISOString() });
        return JSON.stringify({
          ok: true,
          booked: { start: s.toISOString(), duration_min: 30 },
          instruction: "Bestätige die Anfrage: Das Team bestätigt den Termin per E-Mail mit Video-Link. Kein weiterer Schritt nötig.",
        });
      }

      case "generate_sample_brief": {
        const p = await ensureProfile(ctx);
        const propertyType = typeof input.property_type === "string" ? input.property_type : "haus";
        const shots = shotsForOrder(propertyType, ["standard", "cinematic"]).slice(0, 8);
        const brief = {
          title: `Beispielauftrag: Drohnenaufnahmen ${propertyType === "haus" ? "Einfamilienhaus" : propertyType}`,
          objekt: "Fiktives Objekt in deiner Region — such dir ein frei anfliegbares Gebäude (eigenes Grundstück oder mit Erlaubnis!)",
          shotlist: shots.map((s, i) => ({ nr: i + 1, name: s.name, beschreibung: s.description, prioritaet: s.priority })),
          abgabe: "8–12 Fotos als JPG (min. 12 MP) + optional 1 Clip (10–20 s, 4K), Link-Upload",
          hinweis: "Rechtlich sauber fliegen: Kategorie beachten, keine unbeteiligten Personen, Grundstückseigentümer fragen.",
          deadline_tage: 14,
        };
        const [row] = await db.insert(sampleBriefs).values({ profileId: p.id, brief }).returning({ id: sampleBriefs.id });
        await logEvent(ctx, "brief_generated", { briefId: row.id, propertyType });
        return JSON.stringify({ ok: true, brief, instruction: "Präsentiere den Auftrag kompakt und motivierend. Ergebnis-Einreichung: Link im Chat teilen oder per E-Mail." });
      }

      case "register_pilot": {
        const p = await ensureProfile(ctx);
        if (!p.email) {
          return JSON.stringify({ ok: false, error: "no_email", instruction: "Zuerst E-Mail über das Formular erfassen." });
        }
        let customerRecordId = p.customerRecordId;
        if (!customerRecordId) {
          const [c] = await db
            .insert(customers)
            .values({
              displayName: p.name ?? p.email,
              kind: "person",
              primaryEmail: p.email,
              source: "pilot-engine",
              notes: `Pilot-Engine: Level ${p.level ?? "offen"}, Score ${p.levelScore}, Passport ${p.passportLevel}`,
            })
            .returning({ id: customers.id });
          customerRecordId = c.id;
          await db.update(pilotProfiles).set({ customerRecordId }).where(eq(pilotProfiles.id, p.id));
          ctx.profileDirty = true;
        }
        await logEvent(ctx, "pilot_registered", { customerRecordId });
        return JSON.stringify({ ok: true, instruction: "Bestätige die Aufnahme in den Piloten-Pool und erkläre die nächsten Schritte (Level erhöhen → sichtbar für echte Aufträge)." });
      }

      default:
        return JSON.stringify({ ok: false, error: `unknown_tool:${name}` });
    }
  } catch (err) {
    console.error(`[pilot-engine] tool ${name} failed`, err);
    return JSON.stringify({ ok: false, error: "tool_execution_failed", instruction: "Entschuldige dich kurz und fahre ohne dieses Tool fort." });
  }
}
