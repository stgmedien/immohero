import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { mdLite } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>;
}) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const [course] = await db
    .select()
    .from(academyCourses)
    .where(and(eq(academyCourses.slug, courseSlug), eq(academyCourses.published, true)))
    .limit(1);
  if (!course) notFound();

  const lessons = await db
    .select()
    .from(academyLessons)
    .where(and(eq(academyLessons.courseId, course.id), eq(academyLessons.published, true)))
    .orderBy(asc(academyLessons.position), asc(academyLessons.createdAt));

  const idx = lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) notFound();
  const lesson = lessons[idx];
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  return (
    <section className="container-page py-16 md:py-20">
      <Link href={`/academy/${course.slug}`} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← {course.title}
      </Link>
      <article className="mt-3 max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
          Lektion {idx + 1} von {lessons.length}
          {lesson.durationMin ? ` · ~${lesson.durationMin} Min.` : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">{lesson.title}</h1>

        {lesson.videoUrl && (
          <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={lesson.videoUrl} controls className="w-full" />
          </div>
        )}

        <div
          className="mt-6 space-y-3 text-[15px] leading-relaxed text-[var(--color-ink)] [&_p]:text-[var(--color-ink-soft)]"
          dangerouslySetInnerHTML={{ __html: mdLite(lesson.body || "*Inhalt folgt.*") }}
        />

        <div className="mt-10 flex items-center justify-between border-t border-[var(--color-line)] pt-6">
          {prev ? (
            <Button asChild variant="ghost">
              <Link href={`/academy/${course.slug}/${prev.slug}`}>← {prev.title.slice(0, 30)}</Link>
            </Button>
          ) : <span />}
          {next ? (
            <Button asChild>
              <Link href={`/academy/${course.slug}/${next.slug}`}>Weiter: {next.title.slice(0, 30)} →</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/academy">Kurs abgeschlossen — alle Kurse</Link>
            </Button>
          )}
        </div>
      </article>
    </section>
  );
}
