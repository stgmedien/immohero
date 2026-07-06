"use server";

/**
 * Server Actions des traditionellen Piloten-Onboardings (/piloten/start).
 * Kern-Konvertierung läuft über lib/pilot/convert.ts — denselben Code,
 * den auch der Chatbot nutzt. Hier kommen nur Validierung, Routing-Extras
 * (Slots für intermediate, Beispielauftrag für advanced) und Events dazu.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pilotEvents, pilotProfiles, sampleBriefs } from "@/lib/db/schema";
import { convertPilot } from "@/lib/pilot/convert";
import { bookAssessorCall } from "@/lib/pilot/booking";
import { estimateEarnings } from "@/lib/pilot/earnings";
import { getAvailableConsultationSlots } from "@/lib/consultation";
import { shotsForOrder } from "@/lib/shots";

const onboardingSchema = z.object({
  name: z.string().min(2, "Bitte sag uns deinen Namen.").max(120),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse angeben.").max(200),
  plz: z
    .string()
    .regex(/^\d{4,5}$/, "PLZ bitte 4–5-stellig.")
    .or(z.literal(""))
    .optional(),
  consent: z.literal(true, { message: "Bitte stimme der Datenverarbeitung zu." }),
  website: z.string().max(0).optional().or(z.literal("")), // Honeypot
  equipment: z.array(z.object({ model: z.string().min(1).max(80) })).max(10),
  certificates: z.object({
    a1a3: z.boolean(),
    a2: z.boolean(),
    sts: z.boolean(),
  }),
  flightHours: z.number().int().min(0).max(20000),
  hasRealEstateFootage: z.boolean(),
  portfolioLinks: z.array(z.string().url().max(300)).max(5).optional(),
  goal: z.enum(["nebenbei", "hobby-zum-beruf", "vollzeit"]),
  availabilityHoursPerWeek: z.number().int().min(1).max(40),
  durationSec: z.number().int().min(0).max(3600).optional(),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;

export interface SlotOption {
  startIso: string;
  label: string;
}

export interface OnboardingResult {
  ok: boolean;
  error?: string;
  profileId?: string;
  level?: "basic" | "intermediate" | "advanced";
  levelScore?: number;
  passportLevel?: number;
  courseTitle?: string | null;
  courseSlug?: string | null;
  magicLinkSent?: boolean;
  monthlyEur?: number;
  nextAction?: "course" | "call" | "brief";
  slots?: SlotOption[];
  brief?: {
    title: string;
    shotlist: { nr: number; name: string; beschreibung: string }[];
    abgabe: string;
    deadlineTage: number;
  };
}

export async function submitOnboarding(raw: unknown): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingaben." };
  }
  const data = parsed.data;

  // Honeypot gefüllt → Bot. Stumm "ok" zurückgeben, nichts speichern.
  if (data.website) return { ok: true, level: "basic", levelScore: 0, passportLevel: 0 };

  const result = await convertPilot(
    {
      email: data.email,
      name: data.name,
      plz: data.plz || null,
      country: "DE",
      persona: "recruiter",
      equipment: data.equipment,
      certificates: data.certificates,
      flightHours: data.flightHours,
      portfolio: {
        hasRealEstateFootage: data.hasRealEstateFootage,
        ...(data.portfolioLinks?.length ? { links: data.portfolioLinks } : {}),
      },
      onboarding: {
        goal: data.goal,
        availabilityHoursPerWeek: data.availabilityHoursPerWeek,
      },
    },
    { source: "onboarding" },
  );

  await db.insert(pilotEvents).values({
    profileId: result.profile.id,
    sessionId: null,
    type: "onboarding_completed",
    payload: {
      goal: data.goal,
      level: result.level,
      score: result.levelScore,
      durationSec: data.durationSec ?? null,
    },
  });

  const monthly = estimateEarnings({
    projectsPerMonth: Math.min(8, Math.max(2, Math.round(data.availabilityHoursPerWeek / 2))),
  }).monthlyEur;

  const base: OnboardingResult = {
    ok: true,
    profileId: result.profile.id,
    level: result.level,
    levelScore: result.levelScore,
    passportLevel: result.passportLevel,
    courseTitle: result.recommendedCourse?.title ?? null,
    courseSlug: result.recommendedCourse?.slug ?? null,
    magicLinkSent: result.magicLinkSent,
    monthlyEur: monthly,
  };

  // Routing nach Level
  if (result.level === "intermediate") {
    const days = await getAvailableConsultationSlots(7);
    const slots = days
      .flatMap((d) =>
        d.slots.slice(0, 3).map((s) => ({
          startIso: s.start,
          label: `${d.weekday} ${d.date.slice(8, 10)}.${d.date.slice(5, 7)}., ${s.label} Uhr`,
        })),
      )
      .slice(0, 9);
    return { ...base, nextAction: "call", slots };
  }

  if (result.level === "advanced") {
    const shots = shotsForOrder("haus", ["standard", "cinematic"]).slice(0, 8);
    const brief = {
      title: "Beispielauftrag: Drohnenaufnahmen Einfamilienhaus",
      objekt:
        "Fiktives Objekt in deiner Region — such dir ein frei anfliegbares Gebäude (eigenes Grundstück oder mit Erlaubnis!)",
      shotlist: shots.map((s, i) => ({ nr: i + 1, name: s.name, beschreibung: s.description, prioritaet: s.priority })),
      abgabe: "8–12 Fotos als JPG (min. 12 MP) + optional 1 Clip (10–20 s, 4K), Link-Upload",
      hinweis: "Rechtlich sauber fliegen: Kategorie beachten, keine unbeteiligten Personen, Grundstückseigentümer fragen.",
      deadline_tage: 14,
    };
    const [row] = await db
      .insert(sampleBriefs)
      .values({ profileId: result.profile.id, brief })
      .returning({ id: sampleBriefs.id });
    await db.insert(pilotEvents).values({
      profileId: result.profile.id,
      sessionId: null,
      type: "brief_generated",
      payload: { briefId: row.id, propertyType: "haus", source: "onboarding" },
    });
    return {
      ...base,
      nextAction: "brief",
      brief: {
        title: brief.title,
        shotlist: brief.shotlist.map(({ nr, name, beschreibung }) => ({ nr, name, beschreibung })),
        abgabe: brief.abgabe,
        deadlineTage: brief.deadline_tage,
      },
    };
  }

  return { ...base, nextAction: "course" };
}

export interface BookSlotResult {
  ok: boolean;
  error?: string;
  confirmed?: boolean;
  meetUrl?: string | null;
  startIso?: string;
}

/** Bucht den Assessor-Call direkt aus dem Ergebnis-Screen (profileId = Capability aus submitOnboarding). */
export async function bookAssessorSlotAction(
  profileId: string,
  slotStartIso: string,
): Promise<BookSlotResult> {
  if (!/^[a-f0-9-]{32,40}$/i.test(profileId)) return { ok: false, error: "bad_profile" };
  const [profile] = await db.select().from(pilotProfiles).where(eq(pilotProfiles.id, profileId)).limit(1);
  if (!profile?.email) return { ok: false, error: "not_found" };

  const result = await bookAssessorCall(profile, slotStartIso, "Gebucht über das Piloten-Onboarding");
  if (!result.ok) {
    return { ok: false, error: result.error === "invalid_slot" ? "Slot ungültig oder zu kurzfristig — bitte anderen wählen." : "Buchung fehlgeschlagen." };
  }

  await db.insert(pilotEvents).values({
    profileId: profile.id,
    sessionId: null,
    type: "call_booked",
    payload: { consultationId: result.consultationId, start: result.start, confirmed: result.confirmed, source: "onboarding" },
  });

  return { ok: true, confirmed: result.confirmed, meetUrl: result.meetUrl, startIso: result.start };
}
