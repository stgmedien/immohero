"use server";

/**
 * Server Actions der öffentlichen Academy-Seiten:
 * Lektion abschließen + Quiz einreichen (Bewertung NUR serverseitig —
 * die richtigen Antworten verlassen den Server nie).
 */
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons } from "@/lib/db/schema";
import { getLessonAccess } from "@/lib/academy/access";
import { completeLesson, submitQuiz, type QuizResult } from "@/lib/academy/progress";

async function loadLessonWithAccess(lessonId: string, userId: string) {
  const [lesson] = await db.select().from(academyLessons).where(eq(academyLessons.id, lessonId)).limit(1);
  if (!lesson || !lesson.published) return null;
  const [course] = await db
    .select()
    .from(academyCourses)
    .where(and(eq(academyCourses.id, lesson.courseId), eq(academyCourses.published, true)))
    .limit(1);
  if (!course) return null;

  // Index in der published-Reihenfolge bestimmen (Taster-Regel)
  const siblings = await db
    .select({ id: academyLessons.id, position: academyLessons.position, createdAt: academyLessons.createdAt })
    .from(academyLessons)
    .where(and(eq(academyLessons.courseId, course.id), eq(academyLessons.published, true)));
  siblings.sort((a, b) => a.position - b.position || a.createdAt.getTime() - b.createdAt.getTime());
  const lessonIndex = siblings.findIndex((s) => s.id === lesson.id);

  const access = await getLessonAccess({ userId, course, lessonIndex });
  if (access.state !== "open") return null;
  return { lesson, course };
}

function revalidateLesson(courseSlug: string, lessonSlug: string) {
  revalidatePath(`/academy/${courseSlug}/${lessonSlug}`);
  revalidatePath(`/academy/${courseSlug}`);
  revalidatePath("/academy/mein-bereich");
}

export async function completeLessonAction(
  lessonId: string,
): Promise<{ ok: boolean; courseCompleted?: boolean; certificateSerial?: string | null; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "unauthorized" };

  const loaded = await loadLessonWithAccess(lessonId, session.user.id);
  if (!loaded) return { ok: false, error: "not_found" };

  const result = await completeLesson(session.user.id, loaded.lesson);
  if (!result.ok) return { ok: false, error: result.error };

  revalidateLesson(loaded.course.slug, loaded.lesson.slug);
  return {
    ok: true,
    courseCompleted: result.courseCompleted,
    certificateSerial: result.certificateSerial,
  };
}

export async function submitQuizAction(lessonId: string, answers: number[]): Promise<QuizResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "bad_answers" };

  const loaded = await loadLessonWithAccess(lessonId, session.user.id);
  if (!loaded) return { ok: false, error: "no_quiz" };

  const sanitized = Array.isArray(answers) ? answers.map((a) => Math.max(0, Math.floor(Number(a)))) : [];
  const result = await submitQuiz(session.user.id, loaded.lesson, sanitized);

  if (result.passed) revalidateLesson(loaded.course.slug, loaded.lesson.slug);
  return result;
}
