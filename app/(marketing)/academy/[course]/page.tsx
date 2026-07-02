import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mdLite } from "@/lib/markdown";

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

  return (
    <section className="container-page py-16 md:py-20">
      <Link href="/academy" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← Alle Kurse
      </Link>
      <div className="mt-3 max-w-2xl">
        <h1 className="font-serif text-4xl leading-tight md:text-5xl">{course.title}</h1>
        {course.description && (
          <div
            className="mt-4 space-y-2 text-[var(--color-ink-soft)]"
            dangerouslySetInnerHTML={{ __html: mdLite(course.description) }}
          />
        )}
      </div>

      <ol className="mt-10 max-w-2xl space-y-3">
        {lessons.map((lesson, i) => (
          <li key={lesson.id}>
            <Link href={`/academy/${course.slug}/${lesson.slug}`}>
              <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-[var(--color-bg-alt)]/40">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-primary-soft)] font-serif text-lg text-[var(--color-primary)]">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{lesson.title}</p>
                  {lesson.durationMin && (
                    <p className="text-xs text-[var(--color-ink-mute)]">~{lesson.durationMin} Min.</p>
                  )}
                </div>
                {lesson.videoUrl && <Badge tone="neutral">Video</Badge>}
              </Card>
            </Link>
          </li>
        ))}
        {lessons.length === 0 && (
          <p className="text-sm text-[var(--color-ink-soft)]">Lektionen folgen in Kürze.</p>
        )}
      </ol>
    </section>
  );
}
