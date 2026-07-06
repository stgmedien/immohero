"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import {
  academyCourses,
  academyLessons,
  auditLog,
  users,
  type AcademyQuizQuestion,
} from "@/lib/db/schema";
import { ensureEnrollment } from "@/lib/academy/access";

async function requireAcademyAdmin() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "kurs";
}

async function audit(session: { user: { id: string; name?: string | null } }, action: string, entityId: string) {
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action,
    entityType: "academy",
    entityId,
  });
}

export async function createCourse(input: { title: string; level: "basic" | "intermediate" | "advanced"; description?: string }) {
  const session = await requireAcademyAdmin();
  if (!input.title.trim()) throw new Error("Titel fehlt");
  const base = slugify(input.title);
  let slug = base;
  for (let i = 2; i < 20; i++) {
    const exists = await db.select({ id: academyCourses.id }).from(academyCourses).where(eq(academyCourses.slug, slug)).limit(1);
    if (exists.length === 0) break;
    slug = `${base}-${i}`;
  }
  const [row] = await db
    .insert(academyCourses)
    .values({ title: input.title.trim(), slug, level: input.level, description: input.description?.trim() || null })
    .returning();
  await audit(session, "academy_course_created", row.id);
  revalidatePath("/studio/academy");
  return row;
}

export async function updateCourse(input: {
  courseId: string;
  patch: {
    title?: string;
    description?: string | null;
    summary?: string | null;
    level?: "basic" | "intermediate" | "advanced";
    priceCents?: number | null;
    position?: number;
    published?: boolean;
  };
}) {
  const session = await requireAcademyAdmin();
  if (input.patch.priceCents != null) {
    input.patch.priceCents = Math.max(0, Math.min(1_000_000, Math.round(input.patch.priceCents))) || null;
  }
  await db.update(academyCourses).set(input.patch).where(eq(academyCourses.id, input.courseId));
  await audit(session, "academy_course_updated", input.courseId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}

export async function deleteCourse(courseId: string) {
  const session = await requireAcademyAdmin();
  await db.delete(academyCourses).where(eq(academyCourses.id, courseId));
  await audit(session, "academy_course_deleted", courseId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}

export async function createLesson(input: { courseId: string; title: string }) {
  const session = await requireAcademyAdmin();
  if (!input.title.trim()) throw new Error("Titel fehlt");
  const base = slugify(input.title);
  let slug = base;
  for (let i = 2; i < 20; i++) {
    const exists = await db
      .select({ id: academyLessons.id })
      .from(academyLessons)
      .where(eq(academyLessons.slug, slug))
      .limit(1);
    if (exists.length === 0 || exists.every(() => false)) break;
    slug = `${base}-${i}`;
  }
  const siblings = await db.select({ id: academyLessons.id }).from(academyLessons).where(eq(academyLessons.courseId, input.courseId));
  const [row] = await db
    .insert(academyLessons)
    .values({ courseId: input.courseId, title: input.title.trim(), slug, position: siblings.length })
    .returning();
  await audit(session, "academy_lesson_created", row.id);
  revalidatePath("/studio/academy");
  return row;
}

/** Validiert die Quiz-Struktur aus dem Editor — kaputte Quizzes erreichen nie die DB. */
function sanitizeQuiz(input: unknown): AcademyQuizQuestion[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const out: AcademyQuizQuestion[] = [];
  for (const q of input.slice(0, 20)) {
    if (!q || typeof q !== "object") continue;
    const item = q as Record<string, unknown>;
    const question = typeof item.question === "string" ? item.question.trim().slice(0, 500) : "";
    const options = Array.isArray(item.options)
      ? item.options.filter((o): o is string => typeof o === "string" && o.trim().length > 0).map((o) => o.trim().slice(0, 300)).slice(0, 6)
      : [];
    const correctIndex = Number(item.correctIndex);
    if (!question || options.length < 2 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      continue;
    }
    const explanation = typeof item.explanation === "string" && item.explanation.trim() ? item.explanation.trim().slice(0, 500) : undefined;
    out.push({ question, options, correctIndex, ...(explanation ? { explanation } : {}) });
  }
  return out.length > 0 ? out : null;
}

export async function updateLesson(input: {
  lessonId: string;
  patch: {
    title?: string;
    body?: string;
    durationMin?: number | null;
    videoUrl?: string | null;
    quiz?: AcademyQuizQuestion[] | null;
    position?: number;
    published?: boolean;
  };
}) {
  const session = await requireAcademyAdmin();
  const patch = { ...input.patch };
  if ("quiz" in patch) patch.quiz = sanitizeQuiz(patch.quiz);
  await db.update(academyLessons).set(patch).where(eq(academyLessons.id, input.lessonId));
  await audit(session, "academy_lesson_updated", input.lessonId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}

/**
 * Manuelle Kurs-Freischaltung (z. B. Bezahlkurs auf Rechnung, bevor der
 * Checkout existiert). Legt bei Bedarf den User-Account an (Magic-Link-Login).
 */
export async function grantEnrollment(input: { email: string; courseId: string }) {
  const session = await requireAcademyAdmin();
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Ungültige E-Mail");

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    [user] = await db.insert(users).values({ email, role: "customer" }).returning();
  }
  const { created } = await ensureEnrollment(user.id, input.courseId, "studio");
  await audit(session, "academy_enrollment_granted", `${input.courseId}:${user.id}`);
  revalidatePath("/studio/academy");
  return { ok: true, created, userEmail: email };
}

export async function deleteLesson(lessonId: string) {
  const session = await requireAcademyAdmin();
  await db.delete(academyLessons).where(eq(academyLessons.id, lessonId));
  await audit(session, "academy_lesson_deleted", lessonId);
  revalidatePath("/studio/academy");
  revalidatePath("/academy");
}
