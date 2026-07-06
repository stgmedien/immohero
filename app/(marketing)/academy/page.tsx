import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCoursePrice, isPaidCourse } from "@/lib/academy/access";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "Aero One Academy — vom ersten Flug zum ersten bezahlten Auftrag. Kurse zu Recht, Praxis und Immobilien-Aufnahmen.",
};

export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<string, { label: string; tone: "primary" | "accent" | "ink" }> = {
  basic: { label: "Einsteiger", tone: "primary" },
  intermediate: { label: "Fortgeschritten", tone: "accent" },
  advanced: { label: "Profi", tone: "ink" },
};

export default async function AcademyPage() {
  const session = await auth();
  const courses = await db
    .select()
    .from(academyCourses)
    .where(eq(academyCourses.published, true))
    .orderBy(asc(academyCourses.position), asc(academyCourses.createdAt));

  const lessonCounts = new Map<string, number>();
  if (courses.length > 0) {
    const lessons = await db
      .select({ courseId: academyLessons.courseId })
      .from(academyLessons)
      .where(eq(academyLessons.published, true));
    for (const l of lessons) lessonCounts.set(l.courseId, (lessonCounts.get(l.courseId) ?? 0) + 1);
  }

  return (
    <section className="container-page py-16 md:py-20">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Aero One Academy</p>
        <h1 className="mt-2 font-serif text-5xl leading-[1.05] md:text-6xl">
          Vom ersten Flug zum ersten bezahlten Auftrag.
        </h1>
        <p className="mt-4 text-lg text-[var(--color-ink-soft)]">
          Kompakte Kurse zu Drohnenrecht, Flugpraxis und Immobilien-Aufnahmen — gebaut vom Team hinter
          ImmoHero. Level 3+ Piloten werden für echte Aufträge sichtbar.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {session?.user ? (
            <Button asChild>
              <Link href="/academy/mein-bereich">Mein Lernbereich →</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link href="/piloten/start">Kostenlos einstufen lassen →</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login?callbackUrl=/academy/mein-bereich">Anmelden</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <Card className="mt-12 p-8 text-center">
          <p className="font-serif text-2xl">Die ersten Kurse erscheinen in Kürze.</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Sprich solange mit unserem Pilot-Guide (unten rechts) — er stuft dich ein und beantwortet Rechtsfragen mit Quellen.
          </p>
        </Card>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const lvl = LEVEL_LABEL[course.level] ?? LEVEL_LABEL.basic;
            return (
              <Link key={course.id} href={`/academy/${course.slug}`}>
                <Card className="flex h-full flex-col p-6 transition-colors hover:bg-[var(--color-bg-alt)]/40">
                  <div className="flex items-center justify-between">
                    <Badge tone={lvl.tone}>{lvl.label}</Badge>
                    <span className="text-xs text-[var(--color-ink-mute)]">
                      {lessonCounts.get(course.id) ?? 0} Lektionen
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-2xl leading-tight">{course.title}</h2>
                  <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                    {course.summary ?? course.description ?? ""}
                  </p>
                  <div className="mt-auto pt-4">
                    <Badge tone={isPaidCourse(course) ? "accent" : "primary"}>
                      {formatCoursePrice(course)}
                    </Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
