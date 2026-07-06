/**
 * Conversion-Kern der Piloten-Funnels.
 *
 * BEIDE Onboarding-Wege (traditioneller Wizard + Chatbot register_pilot)
 * konvergieren hier auf denselben Endzustand:
 *   pilotProfile (mit Level-Score) → users-Account (Magic-Link-Login)
 *   → CRM-Eintrag → Academy-Enrollment im passenden Kurs → Events.
 *
 * Idempotent: Wiederholte Aufrufe mit derselben E-Mail erzeugen keine
 * Duplikate (Profil-Dedupe, User-Dedupe, Enrollment-Unique-Index).
 */
import { and, asc, eq } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db/client";
import {
  academyCourses,
  academyEnrollments,
  customers,
  pilotEvents,
  pilotProfiles,
  users,
  type PilotProfile,
} from "@/lib/db/schema";
import { signIn } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { computeLevelScore, computePassportLevel, levelFromScore, profileCompleteness } from "./scoring";
import { PilotWelcomeEmail } from "@/emails/pilot-welcome";

export interface ConvertPilotInput {
  email: string;
  name?: string | null;
  plz?: string | null;
  country?: string;
  locale?: string;
  persona?: string;
  equipment?: { model: string; euClass?: string | null }[];
  certificates?: { a1a3?: boolean; a2?: boolean; sts?: boolean };
  flightHours?: number | null;
  portfolio?: { links?: string[]; hasRealEstateFootage?: boolean; selfAssessment?: string };
  onboarding?: { goal?: "nebenbei" | "hobby-zum-beruf" | "vollzeit"; availabilityHoursPerWeek?: number; motivation?: string };
}

export interface ConvertPilotOptions {
  source: "onboarding" | "chatbot";
  /** Bestehendes Profil direkt verwenden (Chatbot-Kontext) statt per E-Mail zu suchen. */
  profileId?: string;
  sessionId?: string;
  /** Magic-Link-Mail auslösen (Default true). */
  sendMagicLink?: boolean;
}

export interface ConvertPilotResult {
  profile: PilotProfile;
  level: "basic" | "intermediate" | "advanced";
  levelScore: number;
  passportLevel: number;
  complete: boolean;
  recommendedCourse: { id: string; slug: string; title: string; level: string } | null;
  enrollmentCreated: boolean;
  userCreated: boolean;
  magicLinkSent: boolean;
}

const ACADEMY_MEMBER_URL = "/academy/mein-bereich";

async function logEvent(profileId: string, sessionId: string | undefined, type: string, payload?: Record<string, unknown>) {
  await db.insert(pilotEvents).values({
    profileId,
    sessionId: sessionId ?? null,
    type,
    payload: payload ?? null,
  });
}

export async function convertPilot(
  input: ConvertPilotInput,
  opts: ConvertPilotOptions,
): Promise<ConvertPilotResult> {
  const email = input.email.trim().toLowerCase();

  // ---------- 1) Profil finden/anlegen + Felder mergen ----------
  let profile: PilotProfile | null = null;
  if (opts.profileId) {
    const rows = await db.select().from(pilotProfiles).where(eq(pilotProfiles.id, opts.profileId)).limit(1);
    profile = rows[0] ?? null;
  }
  if (!profile) {
    const rows = await db.select().from(pilotProfiles).where(eq(pilotProfiles.email, email)).limit(1);
    profile = rows[0] ?? null;
  }

  const patch: Partial<PilotProfile> = { email };
  if (input.name?.trim()) patch.name = input.name.trim().slice(0, 120);
  if (input.plz && /^\d{4,5}$/.test(input.plz)) patch.plz = input.plz.slice(0, 5);
  if (input.country) patch.country = input.country.toUpperCase().slice(0, 2);
  if (input.locale) patch.locale = input.locale.slice(0, 2);
  if (input.equipment) {
    patch.equipment = input.equipment
      .filter((e) => typeof e.model === "string" && e.model.trim())
      .slice(0, 10)
      .map((e) => ({ model: e.model.trim().slice(0, 80), euClass: e.euClass ?? null }));
  }
  if (input.certificates) {
    patch.certificates = { ...(profile?.certificates ?? {}), ...input.certificates };
  }
  if (input.flightHours != null) {
    patch.flightHours = Math.max(0, Math.min(20000, Math.round(input.flightHours)));
  }
  if (input.portfolio) {
    patch.portfolio = { ...(profile?.portfolio ?? {}), ...input.portfolio };
  }
  if (input.onboarding) {
    patch.onboarding = { ...(profile?.onboarding ?? {}), ...input.onboarding };
  }

  if (profile) {
    // E-Mail nie überschreiben, wenn das Profil schon eine (andere) hat
    if (profile.email && profile.email !== email) delete (patch as Record<string, unknown>).email;
    if (!profile.consentAt) patch.consentAt = new Date();
  }

  if (!profile) {
    const [created] = await db
      .insert(pilotProfiles)
      .values({
        ...patch,
        email,
        persona: input.persona ?? "recruiter",
        source: opts.source,
        consentAt: new Date(),
      })
      .returning();
    profile = created;
  } else {
    const merged = { ...profile, ...patch };
    const score = computeLevelScore(merged);
    patch.levelScore = score;
    if (profileCompleteness(merged).complete) patch.level = levelFromScore(score);
    patch.passportLevel = computePassportLevel(merged);
    const [updated] = await db.update(pilotProfiles).set(patch).where(eq(pilotProfiles.id, profile.id)).returning();
    profile = updated;
  }

  // Score für frisch angelegte Profile nachziehen (ein Update spart Sonderfälle)
  const score = computeLevelScore(profile);
  const complete = profileCompleteness(profile).complete;
  const level = levelFromScore(score);
  const passportLevel = computePassportLevel(profile);
  if (profile.levelScore !== score || profile.passportLevel !== passportLevel || (complete && profile.level !== level)) {
    const [updated] = await db
      .update(pilotProfiles)
      .set({ levelScore: score, passportLevel, ...(complete ? { level } : {}) })
      .where(eq(pilotProfiles.id, profile.id))
      .returning();
    profile = updated;
  }

  // ---------- 2) User-Account sichern (Magic-Link-Login) ----------
  let userCreated = false;
  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email,
        name: profile.name,
        role: "customer",
        language: profile.locale ?? "de",
      })
      .returning();
    userCreated = true;
    await logEvent(profile.id, opts.sessionId, "account_created", { userId: user.id, source: opts.source });
  }
  if (!profile.userId) {
    const [updated] = await db
      .update(pilotProfiles)
      .set({ userId: user.id })
      .where(eq(pilotProfiles.id, profile.id))
      .returning();
    profile = updated;
  }

  // ---------- 3) CRM-Eintrag sichern ----------
  if (!profile.customerRecordId) {
    const [c] = await db
      .insert(customers)
      .values({
        displayName: profile.name ?? email,
        kind: "person",
        primaryEmail: email,
        source: opts.source === "onboarding" ? "pilot-onboarding" : "pilot-engine",
        notes: `Pilot: Level ${profile.level ?? "offen"}, Score ${profile.levelScore}, Passport ${profile.passportLevel}`,
      })
      .returning({ id: customers.id });
    const [updated] = await db
      .update(pilotProfiles)
      .set({ customerRecordId: c.id })
      .where(eq(pilotProfiles.id, profile.id))
      .returning();
    profile = updated;
    await logEvent(profile.id, opts.sessionId, "pilot_registered", { customerRecordId: c.id, source: opts.source });
  }

  // ---------- 4) Kursempfehlung + Enrollment ----------
  let recommendedCourse: ConvertPilotResult["recommendedCourse"] = null;
  let enrollmentCreated = false;
  const byLevel = await db
    .select({ id: academyCourses.id, slug: academyCourses.slug, title: academyCourses.title, level: academyCourses.level })
    .from(academyCourses)
    .where(and(eq(academyCourses.published, true), eq(academyCourses.level, level)))
    .orderBy(asc(academyCourses.position))
    .limit(1);
  let course = byLevel[0];
  if (!course) {
    const anyCourse = await db
      .select({ id: academyCourses.id, slug: academyCourses.slug, title: academyCourses.title, level: academyCourses.level })
      .from(academyCourses)
      .where(eq(academyCourses.published, true))
      .orderBy(asc(academyCourses.position))
      .limit(1);
    course = anyCourse[0];
  }
  if (course) {
    recommendedCourse = course;
    const inserted = await db
      .insert(academyEnrollments)
      .values({ userId: user.id, courseId: course.id, source: opts.source })
      .onConflictDoNothing()
      .returning({ id: academyEnrollments.id });
    if (inserted.length > 0) {
      enrollmentCreated = true;
      await logEvent(profile.id, opts.sessionId, "course_enrolled", {
        courseId: course.id,
        slug: course.slug,
        source: opts.source,
      });
    }
  }

  // ---------- 5) Magic-Link + Willkommens-Mail ----------
  let magicLinkSent = false;
  if (opts.sendMagicLink !== false) {
    try {
      await signIn("resend", { email, redirect: false, redirectTo: ACADEMY_MEMBER_URL });
      magicLinkSent = true;
    } catch (err) {
      console.error("[pilot-convert] magic link failed", err);
      Sentry.captureException(err, { tags: { feature: "pilot_convert_magic_link" } });
    }
  }

  if (userCreated || enrollmentCreated) {
    try {
      await sendEmail({
        to: email,
        subject: "Willkommen bei Aero One — dein Weg zum bezahlten Piloten",
        template: "pilot-welcome",
        react: PilotWelcomeEmail({
          name: profile.name ?? null,
          level,
          levelScore: score,
          passportLevel,
          courseTitle: recommendedCourse?.title ?? null,
          magicLinkSent,
        }),
      });
    } catch (err) {
      console.error("[pilot-convert] welcome email failed", err);
      Sentry.captureException(err, { tags: { feature: "pilot_convert_welcome_email" } });
    }
  }

  return {
    profile,
    level,
    levelScore: score,
    passportLevel,
    complete,
    recommendedCourse,
    enrollmentCreated,
    userCreated,
    magicLinkSent,
  };
}
