/**
 * Zugriffsmodell der Academy.
 *
 * Regeln:
 * - Die ERSTE published Lektion jedes Kurses ist öffentlicher Taster (auch bei Bezahlkursen).
 * - Kostenlose Kurse: eingeloggt → voller Zugriff (Auto-Enroll beim ersten Aufruf),
 *   anonym → Login nötig.
 * - Bezahlkurse (priceCents > 0): Zugriff nur mit Enrollment (Freischaltung aktuell
 *   manuell übers Studio — Checkout kommt später).
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  academyEnrollments,
  type AcademyCourse,
  type AcademyEnrollment,
} from "@/lib/db/schema";

export type LessonAccessState = "open" | "login_required" | "locked_paid";

export function isPaidCourse(course: Pick<AcademyCourse, "priceCents">): boolean {
  return (course.priceCents ?? 0) > 0;
}

export function formatCoursePrice(course: Pick<AcademyCourse, "priceCents">): string {
  if (!isPaidCourse(course)) return "Kostenlos";
  return `${((course.priceCents ?? 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 0 })} €`;
}

export async function getEnrollment(
  userId: string,
  courseId: string,
): Promise<AcademyEnrollment | null> {
  const rows = await db
    .select()
    .from(academyEnrollments)
    .where(and(eq(academyEnrollments.userId, userId), eq(academyEnrollments.courseId, courseId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Legt ein Enrollment an, falls noch keins existiert (idempotent). */
export async function ensureEnrollment(
  userId: string,
  courseId: string,
  source: "onboarding" | "chatbot" | "self" | "studio" = "self",
): Promise<{ enrollment: AcademyEnrollment; created: boolean }> {
  const inserted = await db
    .insert(academyEnrollments)
    .values({ userId, courseId, source })
    .onConflictDoNothing()
    .returning();
  if (inserted[0]) return { enrollment: inserted[0], created: true };
  const existing = await getEnrollment(userId, courseId);
  if (!existing) throw new Error("enrollment_upsert_failed");
  return { enrollment: existing, created: false };
}

export interface LessonAccessInput {
  userId: string | null;
  course: AcademyCourse;
  /** Index der Lektion in der published-Reihenfolge (0 = Taster). */
  lessonIndex: number;
  /** Bereits geladenes Enrollment (spart eine Query), sonst wird selbst geladen. */
  enrollment?: AcademyEnrollment | null;
}

export async function getLessonAccess(input: LessonAccessInput): Promise<{
  state: LessonAccessState;
  enrollment: AcademyEnrollment | null;
}> {
  const { userId, course, lessonIndex } = input;
  let enrollment = input.enrollment ?? null;
  if (enrollment === undefined) enrollment = null;
  if (!enrollment && userId) enrollment = await getEnrollment(userId, course.id);

  // Taster-Lektion ist immer offen
  if (lessonIndex === 0) return { state: "open", enrollment };

  if (isPaidCourse(course)) {
    return { state: enrollment ? "open" : "locked_paid", enrollment };
  }

  // Kostenloser Kurs
  if (!userId) return { state: "login_required", enrollment: null };
  return { state: "open", enrollment };
}
