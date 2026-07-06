import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mdLite } from "@/lib/markdown";
import { ensureEnrollment, getLessonAccess, isPaidCourse, formatCoursePrice } from "@/lib/academy/access";
import { getCourseProgress, QUIZ_PASS_SCORE } from "@/lib/academy/progress";
import { LessonPlayer } from "@/components/academy/lesson-player";
import { LessonQuiz } from "@/components/academy/quiz";
import { LessonCompleteButton } from "@/components/academy/lesson-complete-button";

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

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const access = await getLessonAccess({ userId, course, lessonIndex: idx });

  // Kostenloser Kurs + eingeloggt → beim ersten Besuch automatisch einschreiben
  if (userId && !access.enrollment && !isPaidCourse(course)) {
    await ensureEnrollment(userId, course.id, "self");
  }

  /* ---------------------- Gate: Login nötig (kostenlos) ---------------------- */
  if (access.state === "login_required") {
    return (
      <section className="container-page py-16 md:py-20">
        <BackLink course={course} />
        <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
          <p className="label-mono text-[var(--color-ink-mute)]">Kostenloser Kurs</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight">
            Melde dich an, um weiterzulernen.
          </h1>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            Die erste Lektion ist frei — für den Rest brauchst du nur deine E-Mail-Adresse.
            Kein Passwort: Wir schicken dir einen Login-Link. Dein Fortschritt und dein
            Zertifikat werden gespeichert.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button asChild size="lg">
              <Link href={`/login?callbackUrl=/academy/${course.slug}/${lesson.slug}`}>
                Kostenlos anmelden
              </Link>
            </Button>
            <Link
              href={`/academy/${course.slug}/${lessons[0].slug}`}
              className="text-sm text-[var(--color-ink-soft)] underline-offset-2 hover:underline"
            >
              Erst die kostenlose Probe-Lektion ansehen
            </Link>
          </div>
        </Card>
      </section>
    );
  }

  /* ------------------------- Gate: Bezahlkurs gesperrt ------------------------ */
  if (access.state === "locked_paid") {
    return (
      <section className="container-page py-16 md:py-20">
        <BackLink course={course} />
        <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
          <p className="label-mono text-[var(--color-ink-mute)]">Premium-Kurs · {formatCoursePrice(course)}</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight">Dieser Kurs ist bald buchbar.</h1>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            Die erste Lektion kannst du kostenlos ansehen. Den vollen Kurs schalten wir aktuell
            persönlich frei — schreib uns, und du bist dabei, bevor der offizielle Verkauf startet.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button asChild size="lg">
              <Link href={`mailto:hello@immohero.org?subject=Kurs-Freischaltung: ${encodeURIComponent(course.title)}`}>
                Freischaltung anfragen
              </Link>
            </Button>
            <Link
              href={`/academy/${course.slug}/${lessons[0].slug}`}
              className="text-sm text-[var(--color-ink-soft)] underline-offset-2 hover:underline"
            >
              Kostenlose Probe-Lektion ansehen
            </Link>
            {!userId ? (
              <p className="text-xs text-[var(--color-ink-mute)]">
                Schon freigeschaltet? <Link href={`/login?callbackUrl=/academy/${course.slug}/${lesson.slug}`} className="underline">Einloggen</Link>
              </p>
            ) : null}
          </div>
        </Card>
      </section>
    );
  }

  /* ------------------------------ Voller Inhalt ------------------------------ */
  const progress = userId ? await getCourseProgress(userId, course.id) : null;
  const lessonCompleted = progress?.completedLessonIds.has(lesson.id) ?? false;
  const hasQuiz = Array.isArray(lesson.quiz) && lesson.quiz.length > 0;

  return (
    <section className="container-page py-16 md:py-20">
      <BackLink course={course} />
      <article className="mt-3 max-w-2xl">
        <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">
          Lektion {idx + 1} von {lessons.length}
          {lesson.durationMin ? ` · ~${lesson.durationMin} Min.` : ""}
          {hasQuiz ? ` · Quiz (ab ${QUIZ_PASS_SCORE} %)` : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight">{lesson.title}</h1>

        {progress && progress.total > 0 ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-[var(--color-ink-mute)]">
              <span>Kurs-Fortschritt</span>
              <span>
                {progress.completed}/{progress.total} · {progress.pct} %
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
              <div
                className="h-full rounded-full bg-[var(--color-brand-1)] transition-all"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
        ) : null}

        {lesson.videoUrl && (
          <div className="mt-6">
            <LessonPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
          </div>
        )}

        <div
          className="mt-6 space-y-3 text-[15px] leading-relaxed text-[var(--color-ink)] [&_p]:text-[var(--color-ink-soft)]"
          dangerouslySetInnerHTML={{ __html: mdLite(lesson.body || "*Inhalt folgt.*") }}
        />

        {userId && hasQuiz ? (
          <LessonQuiz
            lessonId={lesson.id}
            questions={(lesson.quiz ?? []).map((q) => ({ question: q.question, options: q.options }))}
            alreadyPassed={lessonCompleted}
          />
        ) : null}

        {userId && !hasQuiz ? (
          <div className="mt-10 border-t border-[var(--color-line)] pt-6">
            <LessonCompleteButton lessonId={lesson.id} completed={lessonCompleted} />
          </div>
        ) : null}

        {!userId && idx === 0 ? (
          <Card className="mt-10 bg-[var(--color-brand-softer)] p-6">
            <p className="font-serif text-xl">Gefällt dir der Kurs?</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              Melde dich kostenlos an, um alle Lektionen freizuschalten, deinen Fortschritt zu
              speichern und am Ende dein Zertifikat zu bekommen.
            </p>
            <Button asChild className="mt-4">
              <Link href={`/login?callbackUrl=/academy/${course.slug}/${lesson.slug}`}>
                Kostenlos anmelden
              </Link>
            </Button>
          </Card>
        ) : null}

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
              <Link href={userId ? "/academy/mein-bereich" : "/academy"}>
                {userId ? "Zu meinem Lernbereich" : "Kurs abgeschlossen — alle Kurse"}
              </Link>
            </Button>
          )}
        </div>
      </article>
    </section>
  );
}

function BackLink({ course }: { course: { slug: string; title: string } }) {
  return (
    <Link
      href={`/academy/${course.slug}`}
      className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
    >
      ← {course.title}
    </Link>
  );
}
