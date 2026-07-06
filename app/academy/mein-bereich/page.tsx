import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, notInArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import {
  academyCertificates,
  academyCourses,
  academyEnrollments,
  pilotProfiles,
} from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { firstOpenLesson, getCourseProgress } from "@/lib/academy/progress";
import { formatCoursePrice, isPaidCourse } from "@/lib/academy/access";

export const metadata: Metadata = { title: "Mein Lernbereich" };
export const dynamic = "force-dynamic";

const LEVEL_LABEL: Record<string, string> = {
  basic: "Einsteiger",
  intermediate: "Fortgeschritten",
  advanced: "Profi",
};

const PASSPORT_STEPS = [
  "Profil vollständig",
  "A1/A3-Nachweis",
  "Assessment bestanden",
  "Probeauftrag eingereicht",
];

export default async function MemberAreaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/academy/mein-bereich");
  const userId = session.user.id;

  const enrollments = await db
    .select({
      enrollment: academyEnrollments,
      course: academyCourses,
    })
    .from(academyEnrollments)
    .innerJoin(academyCourses, eq(academyCourses.id, academyEnrollments.courseId))
    .where(eq(academyEnrollments.userId, userId))
    .orderBy(desc(academyEnrollments.enrolledAt));

  const enrolledCards = await Promise.all(
    enrollments
      .filter((e) => e.course.published)
      .map(async ({ enrollment, course }) => {
        const progress = await getCourseProgress(userId, course.id);
        const nextLesson = await firstOpenLesson(userId, course.id);
        return { enrollment, course, progress, nextLesson };
      }),
  );

  const [profile] = await db
    .select()
    .from(pilotProfiles)
    .where(eq(pilotProfiles.userId, userId))
    .limit(1);

  const certificates = await db
    .select()
    .from(academyCertificates)
    .where(eq(academyCertificates.userId, userId))
    .orderBy(desc(academyCertificates.issuedAt));

  // Empfehlung: passender published Kurs, in dem der Nutzer noch nicht eingeschrieben ist
  const enrolledIds = enrollments.map((e) => e.course.id);
  const recommendation = await db
    .select()
    .from(academyCourses)
    .where(
      and(
        eq(academyCourses.published, true),
        ...(profile?.level ? [eq(academyCourses.level, profile.level)] : []),
        ...(enrolledIds.length ? [notInArray(academyCourses.id, enrolledIds)] : []),
      ),
    )
    .orderBy(asc(academyCourses.position))
    .limit(1);

  const firstName = session.user.name?.split(" ")[0] ?? null;

  return (
    <section className="container-page py-12 md:py-16">
      <p className="label-mono text-[var(--color-ink-mute)]">Aero One Academy</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
        {firstName ? `Weiter geht's, ${firstName}.` : "Dein Lernbereich."}
      </h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ------------------------- Kurse ------------------------- */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl">Deine Kurse</h2>
          {enrolledCards.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-serif text-xl">Du bist noch in keinem Kurs eingeschrieben.</p>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Lass dich in 3 Minuten einstufen — wir schreiben dich direkt in den passenden Kurs ein.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button asChild>
                  <Link href="/piloten/start">Jetzt einstufen lassen</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/academy">Kurse ansehen</Link>
                </Button>
              </div>
            </Card>
          ) : (
            enrolledCards.map(({ enrollment, course, progress, nextLesson }) => (
              <Card key={course.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{LEVEL_LABEL[course.level] ?? course.level}</Badge>
                      {enrollment.status === "completed" ? (
                        <Badge tone="ok">Abgeschlossen ✓</Badge>
                      ) : null}
                    </div>
                    <h3 className="mt-2 font-serif text-2xl leading-tight">{course.title}</h3>
                  </div>
                  {nextLesson && enrollment.status !== "completed" ? (
                    <Button asChild>
                      <Link href={`/academy/${course.slug}/${nextLesson.slug}`}>
                        {progress.completed > 0 ? "Weiterlernen →" : "Starten →"}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={`/academy/${course.slug}`}>Zum Kurs</Link>
                    </Button>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[var(--color-ink-mute)]">
                    <span>
                      {progress.completed}/{progress.total} Lektionen
                    </span>
                    <span>{progress.pct} %</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-brand-1)]"
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))
          )}

          {recommendation[0] ? (
            <Card className="border-dashed p-6">
              <p className="label-mono text-[var(--color-ink-mute)]">Empfohlen für dich</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl leading-tight">{recommendation[0].title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                    {recommendation[0].summary ?? ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={isPaidCourse(recommendation[0]) ? "accent" : "primary"}>
                    {formatCoursePrice(recommendation[0])}
                  </Badge>
                  <Button asChild variant="outline">
                    <Link href={`/academy/${recommendation[0].slug}`}>Ansehen</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        {/* ------------------------ Seitenleiste ------------------------ */}
        <div className="space-y-4">
          {/* Pilot-Passport */}
          <Card className="p-6">
            <p className="label-mono text-[var(--color-ink-mute)]">Pilot-Passport</p>
            {profile ? (
              <>
                <p className="mt-2 font-serif text-3xl">
                  Stufe {profile.passportLevel}
                  <span className="text-lg text-[var(--color-ink-mute)]"> / 4</span>
                </p>
                <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                  {profile.level ? `Level: ${LEVEL_LABEL[profile.level]}` : "Noch nicht eingestuft"}
                  {profile.levelScore ? ` · Score ${profile.levelScore}/100` : ""}
                </p>
                <ol className="mt-4 space-y-2">
                  {PASSPORT_STEPS.map((step, i) => {
                    const reached = profile.passportLevel >= i + 1;
                    return (
                      <li key={step} className="flex items-center gap-2 text-sm">
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                            reached
                              ? "bg-[var(--color-brand-1)] text-white"
                              : "bg-[var(--color-bg-sunken)] text-[var(--color-ink-mute)]"
                          }`}
                        >
                          {reached ? "✓" : i + 1}
                        </span>
                        <span className={reached ? "" : "text-[var(--color-ink-mute)]"}>{step}</span>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-brand-softer)] px-3 py-2 text-xs text-[var(--color-brand-ink)]">
                  Ab Stufe 3 wirst du für bezahlte ImmoHero-Aufträge sichtbar (Ø 339 €/Projekt).
                </p>
                {profile.passportLevel === 2 ? (
                  <Button asChild className="mt-3 w-full">
                    <Link href="/piloten/start">Assessment-Call buchen →</Link>
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  Du hast noch kein Piloten-Profil. In 3 Minuten bist du eingestuft.
                </p>
                <Button asChild className="mt-4 w-full">
                  <Link href="/piloten/start">Jetzt einstufen lassen</Link>
                </Button>
              </>
            )}
          </Card>

          {/* Zertifikate */}
          <Card className="p-6">
            <p className="label-mono text-[var(--color-ink-mute)]">Zertifikate</p>
            {certificates.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Schließe einen Kurs vollständig ab, um dein erstes Zertifikat zu erhalten.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {certificates.map((cert) => (
                  <li key={cert.id}>
                    <Link
                      href={`/zertifikat/${cert.serial}`}
                      className="block rounded-[var(--radius-md)] border border-[var(--color-line)] p-3 transition-colors hover:bg-[var(--color-bg-alt)]/40"
                    >
                      <p className="text-sm font-medium">🎓 {cert.courseTitle}</p>
                      <p className="mt-0.5 font-mono text-xs text-[var(--color-ink-mute)]">
                        {cert.serial} · {cert.issuedAt.toLocaleDateString("de-DE")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
