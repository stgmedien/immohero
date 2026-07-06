/**
 * Lern-Fortschritt, Quiz-Bewertung und Zertifikats-Ausstellung.
 *
 * Abschluss-Logik:
 * - Lektion ohne Quiz: "Lektion abschließen" schreibt den Progress.
 * - Lektion mit Quiz: Bestehen (≥ 70 %) IST der Abschluss (Server bewertet,
 *   die richtigen Antworten verlassen nie den Server).
 * - Sind alle published Lektionen eines Kurses abgeschlossen: Zertifikat mit
 *   öffentlich verifizierbarer Seriennummer + E-Mail, Enrollment → completed.
 */
import { and, asc, eq, inArray } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
import { db } from "@/lib/db/client";
import {
  academyCertificates,
  academyCourses,
  academyLessonProgress,
  academyLessons,
  pilotEvents,
  pilotProfiles,
  users,
  type AcademyCertificate,
  type AcademyCourse,
  type AcademyLesson,
} from "@/lib/db/schema";
import { academyEnrollments } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { CertificateEmail } from "@/emails/certificate";

export const QUIZ_PASS_SCORE = 70;

/* ----------------------------- Fortschritt ----------------------------- */

export interface CourseProgress {
  total: number;
  completed: number;
  pct: number;
  completedLessonIds: Set<string>;
}

export async function getCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
  const lessons = await db
    .select({ id: academyLessons.id })
    .from(academyLessons)
    .where(and(eq(academyLessons.courseId, courseId), eq(academyLessons.published, true)));
  const ids = lessons.map((l) => l.id);
  if (ids.length === 0) return { total: 0, completed: 0, pct: 0, completedLessonIds: new Set() };

  const done = await db
    .select({ lessonId: academyLessonProgress.lessonId })
    .from(academyLessonProgress)
    .where(and(eq(academyLessonProgress.userId, userId), inArray(academyLessonProgress.lessonId, ids)));
  const completedLessonIds = new Set(done.map((d) => d.lessonId));
  return {
    total: ids.length,
    completed: completedLessonIds.size,
    pct: Math.round((completedLessonIds.size / ids.length) * 100),
    completedLessonIds,
  };
}

async function logAcademyEvent(userId: string, type: string, payload: Record<string, unknown>) {
  const [profile] = await db
    .select({ id: pilotProfiles.id })
    .from(pilotProfiles)
    .where(eq(pilotProfiles.userId, userId))
    .limit(1);
  await db.insert(pilotEvents).values({
    profileId: profile?.id ?? null,
    sessionId: null,
    type,
    payload,
  });
}

/* ------------------------------- Abschluss ------------------------------ */

export interface CompleteLessonResult {
  ok: boolean;
  error?: "quiz_required" | "not_found";
  courseCompleted?: boolean;
  certificateSerial?: string | null;
}

export async function completeLesson(
  userId: string,
  lesson: AcademyLesson,
  opts?: { quizScore?: number },
): Promise<CompleteLessonResult> {
  // Quiz-Lektionen können nur über submitQuiz abgeschlossen werden
  const hasQuiz = Array.isArray(lesson.quiz) && lesson.quiz.length > 0;
  if (hasQuiz && opts?.quizScore == null) {
    return { ok: false, error: "quiz_required" };
  }

  const inserted = await db
    .insert(academyLessonProgress)
    .values({ userId, lessonId: lesson.id, quizScore: opts?.quizScore ?? null })
    .onConflictDoNothing()
    .returning({ id: academyLessonProgress.id });

  if (inserted.length > 0) {
    await logAcademyEvent(userId, "lesson_completed", {
      lessonId: lesson.id,
      courseId: lesson.courseId,
      quizScore: opts?.quizScore ?? null,
    });
  }

  const completion = await maybeCompleteCourse(userId, lesson.courseId);
  return { ok: true, ...completion };
}

export interface QuizResult {
  ok: boolean;
  error?: "no_quiz" | "bad_answers";
  score?: number;
  passed?: boolean;
  results?: { correctIndex: number; correct: boolean; explanation?: string }[];
  courseCompleted?: boolean;
  certificateSerial?: string | null;
}

export async function submitQuiz(
  userId: string,
  lesson: AcademyLesson,
  answers: number[],
): Promise<QuizResult> {
  const quiz = lesson.quiz;
  if (!Array.isArray(quiz) || quiz.length === 0) return { ok: false, error: "no_quiz" };
  if (!Array.isArray(answers) || answers.length !== quiz.length) {
    return { ok: false, error: "bad_answers" };
  }

  const results = quiz.map((q, i) => ({
    correctIndex: q.correctIndex,
    correct: answers[i] === q.correctIndex,
    explanation: q.explanation,
  }));
  const score = Math.round((results.filter((r) => r.correct).length / quiz.length) * 100);
  const passed = score >= QUIZ_PASS_SCORE;

  if (!passed) {
    return { ok: true, score, passed, results };
  }

  await logAcademyEvent(userId, "quiz_passed", { lessonId: lesson.id, score });
  const completion = await completeLesson(userId, lesson, { quizScore: score });
  return {
    ok: true,
    score,
    passed,
    results,
    courseCompleted: completion.courseCompleted,
    certificateSerial: completion.certificateSerial,
  };
}

/* ------------------------------ Zertifikate ----------------------------- */

const SERIAL_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // ohne 0/O, 1/I/L

export function generateCertificateSerial(now = new Date()): string {
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  for (const b of bytes) code += SERIAL_ALPHABET[b % SERIAL_ALPHABET.length];
  return `AO-${now.getFullYear()}-${code}`;
}

async function maybeCompleteCourse(
  userId: string,
  courseId: string,
): Promise<{ courseCompleted: boolean; certificateSerial: string | null }> {
  const progress = await getCourseProgress(userId, courseId);
  if (progress.total === 0 || progress.completed < progress.total) {
    return { courseCompleted: false, certificateSerial: null };
  }

  const [course] = await db.select().from(academyCourses).where(eq(academyCourses.id, courseId)).limit(1);
  if (!course) return { courseCompleted: false, certificateSerial: null };

  const cert = await issueCertificate(userId, course);

  await db
    .update(academyEnrollments)
    .set({ status: "completed", completedAt: new Date() })
    .where(and(eq(academyEnrollments.userId, userId), eq(academyEnrollments.courseId, courseId)));

  return { courseCompleted: true, certificateSerial: cert.serial };
}

export async function issueCertificate(userId: string, course: AcademyCourse): Promise<AcademyCertificate> {
  // Dedupe: pro User+Kurs genau ein Zertifikat
  const existing = await db
    .select()
    .from(academyCertificates)
    .where(and(eq(academyCertificates.userId, userId), eq(academyCertificates.courseId, course.id)))
    .limit(1);
  if (existing[0]) return existing[0];

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const recipientName = user?.name ?? user?.email ?? "Aero One Pilot";

  let cert: AcademyCertificate | null = null;
  for (let attempt = 0; attempt < 3 && !cert; attempt++) {
    try {
      const [row] = await db
        .insert(academyCertificates)
        .values({
          userId,
          courseId: course.id,
          serial: generateCertificateSerial(),
          recipientName,
          courseTitle: course.title,
        })
        .returning();
      cert = row;
    } catch (err) {
      // Serial-Kollision (unique) → neuer Versuch
      if (attempt === 2) throw err;
    }
  }
  if (!cert) throw new Error("certificate_creation_failed");

  await logAcademyEvent(userId, "certificate_issued", { courseId: course.id, serial: cert.serial });

  if (user?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org";
    try {
      await sendEmail({
        to: user.email,
        subject: `Dein Zertifikat: ${course.title}`,
        template: "certificate",
        react: CertificateEmail({
          name: user.name ?? null,
          courseTitle: course.title,
          serial: cert.serial,
          verifyUrl: `${baseUrl}/zertifikat/${cert.serial}`,
        }),
      });
    } catch (err) {
      console.error("[academy] certificate email failed", err);
      Sentry.captureException(err, { tags: { feature: "academy_certificate_email" } });
    }
  }

  return cert;
}

/** Erste noch offene Lektion eines Kurses (für "Weiterlernen"-Deeplinks). */
export async function firstOpenLesson(
  userId: string,
  courseId: string,
): Promise<AcademyLesson | null> {
  const lessons = await db
    .select()
    .from(academyLessons)
    .where(and(eq(academyLessons.courseId, courseId), eq(academyLessons.published, true)))
    .orderBy(asc(academyLessons.position), asc(academyLessons.createdAt));
  if (lessons.length === 0) return null;
  const progress = await getCourseProgress(userId, courseId);
  return lessons.find((l) => !progress.completedLessonIds.has(l.id)) ?? lessons[0];
}
