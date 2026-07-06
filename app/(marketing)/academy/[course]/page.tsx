import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mdLite } from "@/lib/markdown";
import { getEnrollment, isPaidCourse, formatCoursePrice } from "@/lib/academy/access";
import { getCourseProgress } from "@/lib/academy/progress";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const [course] = await db
    .select()
    .from(academyCourses)
    .where(and(eq(academyCourses.slug, slug), eq(academyCourses.published, true)))
    .limit(1);
  if (!course) notFound();

  const lessons = await db
    .select()
    .from(academyLessons)
    .where(and(eq(academyLessons.courseId, course.id), eq(academyLessons.published, true)))
    .orderBy(asc(academyLessons.position), asc(academyLessons.createdAt));

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const enrollment = userId ? await getEnrollment(userId, course.id) : null;
  const progress = userId ? await getCourseProgress(userId, course.id) : null;
  const paid = isPaidCourse(course);

  // Sperr-Logik pro Lektion (Index 0 = Taster, immer offen)
  const lessonLocked = (i: number) => {
    if (i === 0) return false;
    if (paid) return !enrollment;
    return !userId;
  };

  const continueLesson =
    progress && lessons.length > 0
      ? lessons.find((l) => !progress.completedLessonIds.has(l.id)) ?? lessons[0]
      : lessons[0];

  return (
    <section className="container-page py-16 md:py-20">
      <Link href="/academy" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← Alle Kurse
      </Link>
      <div className="mt-3 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={paid ? "accent" : "primary"}>{formatCoursePrice(course)}</Badge>
          {enrollment ? (
            <Badge tone={enrollment.status === "completed" ? "ok" : "brand"}>
              {enrollment.status === "completed" ? "Abgeschlossen ✓" : "Eingeschrieben"}
            </Badge>
          ) : null}
        </div>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{course.title}</h1>
        {course.description && (
          <div
            className="mt-4 space-y-2 text-[var(--color-ink-soft)]"
            dangerouslySetInnerHTML={{ __html: mdLite(course.description) }}
          />
        )}

        {progress && progress.total > 0 ? (
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-xs text-[var(--color-ink-mute)]">
              <span>Dein Fortschritt</span>
              <span>
                {progress.completed}/{progress.total} Lektionen · {progress.pct} %
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
              <div
                className="h-full rounded-full bg-[var(--color-brand-1)]"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
        ) : null}

        {lessons.length > 0 && continueLesson ? (
          <Button asChild size="lg" className="mt-6">
            <Link href={`/academy/${course.slug}/${continueLesson.slug}`}>
              {progress && progress.completed > 0 ? "Weiterlernen" : "Kurs starten"} →
            </Link>
          </Button>
        ) : null}
      </div>

      <ol className="mt-10 max-w-2xl space-y-3">
        {lessons.map((lesson, i) => {
          const locked = lessonLocked(i);
          const done = progress?.completedLessonIds.has(lesson.id) ?? false;
          return (
            <li key={lesson.id}>
              <Link href={`/academy/${course.slug}/${lesson.slug}`}>
                <Card
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-[var(--color-bg-alt)]/40 ${locked ? "opacity-70" : ""}`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-serif text-lg ${
                      done
                        ? "bg-[var(--color-brand-1)] text-white"
                        : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-[var(--color-ink-mute)]">
                      {lesson.durationMin ? `~${lesson.durationMin} Min.` : null}
                      {lesson.durationMin && Array.isArray(lesson.quiz) && lesson.quiz.length > 0 ? " · " : null}
                      {Array.isArray(lesson.quiz) && lesson.quiz.length > 0 ? "Quiz" : null}
                      {i === 0 && (paid || !userId) ? " · Kostenlose Probe-Lektion" : null}
                    </p>
                  </div>
                  {lesson.videoUrl && <Badge tone="neutral">Video</Badge>}
                  {locked ? <span aria-label="Gesperrt">🔒</span> : null}
                </Card>
              </Link>
            </li>
          );
        })}
        {lessons.length === 0 && (
          <p className="text-sm text-[var(--color-ink-soft)]">Lektionen folgen in Kürze.</p>
        )}
      </ol>
    </section>
  );
}
