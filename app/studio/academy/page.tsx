import { redirect } from "next/navigation";
import { asc, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import {
  academyCertificates,
  academyCourses,
  academyEnrollments,
  academyLessonProgress,
  academyLessons,
  users,
} from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { AcademyManager } from "@/components/studio/academy-manager";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StudioAcademyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/academy");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const [courses, lessons, enrollments, certificates, recentLearners] = await Promise.all([
    db.select().from(academyCourses).orderBy(asc(academyCourses.position), asc(academyCourses.createdAt)),
    db.select().from(academyLessons).orderBy(asc(academyLessons.position), asc(academyLessons.createdAt)),
    db
      .select({
        courseId: academyEnrollments.courseId,
        status: academyEnrollments.status,
        n: sql<number>`count(*)::int`,
      })
      .from(academyEnrollments)
      .groupBy(academyEnrollments.courseId, academyEnrollments.status),
    db
      .select({
        serial: academyCertificates.serial,
        courseTitle: academyCertificates.courseTitle,
        recipientName: academyCertificates.recipientName,
        issuedAt: academyCertificates.issuedAt,
      })
      .from(academyCertificates)
      .orderBy(desc(academyCertificates.issuedAt))
      .limit(6),
    db
      .select({
        email: users.email,
        name: users.name,
        courseTitle: academyCourses.title,
        courseId: academyCourses.id,
        status: academyEnrollments.status,
        enrolledAt: academyEnrollments.enrolledAt,
        userId: academyEnrollments.userId,
        source: academyEnrollments.source,
      })
      .from(academyEnrollments)
      .innerJoin(users, eq(users.id, academyEnrollments.userId))
      .innerJoin(academyCourses, eq(academyCourses.id, academyEnrollments.courseId))
      .orderBy(desc(academyEnrollments.enrolledAt))
      .limit(25),
  ]);

  // Fortschritt der letzten Lernenden (eine Query für alle)
  const progressRows = await db
    .select({
      userId: academyLessonProgress.userId,
      courseId: academyLessons.courseId,
      n: sql<number>`count(*)::int`,
    })
    .from(academyLessonProgress)
    .innerJoin(academyLessons, eq(academyLessons.id, academyLessonProgress.lessonId))
    .groupBy(academyLessonProgress.userId, academyLessons.courseId);
  const progressMap = new Map(progressRows.map((r) => [`${r.userId}:${r.courseId}`, r.n]));
  const publishedLessonCount = new Map<string, number>();
  for (const l of lessons) {
    if (l.published) publishedLessonCount.set(l.courseId, (publishedLessonCount.get(l.courseId) ?? 0) + 1);
  }

  const enrollTotals = new Map<string, { total: number; completed: number }>();
  for (const e of enrollments) {
    const cur = enrollTotals.get(e.courseId) ?? { total: 0, completed: 0 };
    cur.total += e.n;
    if (e.status === "completed") cur.completed += e.n;
    enrollTotals.set(e.courseId, cur);
  }
  const totalEnrollments = [...enrollTotals.values()].reduce((s, v) => s + v.total, 0);
  const totalCompleted = [...enrollTotals.values()].reduce((s, v) => s + v.completed, 0);

  const withLessons = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    summary: c.summary,
    level: c.level,
    priceCents: c.priceCents,
    position: c.position,
    published: c.published,
    enrollmentCount: enrollTotals.get(c.id)?.total ?? 0,
    completedCount: enrollTotals.get(c.id)?.completed ?? 0,
    lessons: lessons
      .filter((l) => l.courseId === c.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        body: l.body,
        durationMin: l.durationMin,
        videoUrl: l.videoUrl,
        quiz: l.quiz,
        position: l.position,
        published: l.published,
      })),
  }));

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Academy" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Academy</h1>
            <p className="text-[var(--color-ink-3)]">
              Kurse, Lernende & Zertifikate — live unter <a href="/academy" className="underline" target="_blank">/academy</a>
            </p>
          </div>
        </div>

        {/* ------------------------------ Analytics ------------------------------ */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--color-ink-3)]">Einschreibungen</p>
            <p className="mt-1 text-3xl font-semibold">{totalEnrollments}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--color-ink-3)]">Kurs-Abschlüsse</p>
            <p className="mt-1 text-3xl font-semibold">
              {totalCompleted}
              <span className="ml-2 text-sm font-normal text-[var(--color-ink-3)]">
                ({totalEnrollments ? Math.round((totalCompleted / totalEnrollments) * 100) : 0} %)
              </span>
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--color-ink-3)]">Zertifikate</p>
            <p className="mt-1 text-3xl font-semibold">{certificates.length > 5 ? "6+" : certificates.length}</p>
            {certificates[0] ? (
              <p className="mt-1 truncate text-xs text-[var(--color-ink-3)]">
                zuletzt: {certificates[0].recipientName} · {certificates[0].serial}
              </p>
            ) : null}
          </Card>
        </div>

        {/* ------------------------------ Lernende ------------------------------ */}
        {recentLearners.length > 0 ? (
          <Card className="mt-6 overflow-x-auto p-0">
            <div className="border-b border-[var(--color-hair)] px-4 py-3">
              <h2 className="text-sm font-semibold">Neueste Lernende</h2>
            </div>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-hair)] text-left text-xs uppercase tracking-wider text-[var(--color-ink-3)]">
                  <th className="px-4 py-2 font-medium">Lernende:r</th>
                  <th className="px-4 py-2 font-medium">Kurs</th>
                  <th className="px-4 py-2 font-medium">Quelle</th>
                  <th className="px-4 py-2 font-medium">Fortschritt</th>
                  <th className="px-4 py-2 font-medium">Seit</th>
                </tr>
              </thead>
              <tbody>
                {recentLearners.map((l) => {
                  const done = progressMap.get(`${l.userId}:${l.courseId}`) ?? 0;
                  const total = publishedLessonCount.get(l.courseId) ?? 0;
                  const pct = total ? Math.round((done / total) * 100) : 0;
                  return (
                    <tr key={`${l.userId}:${l.courseId}`} className="border-b border-[var(--color-hair)] last:border-0">
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{l.name ?? "—"}</p>
                        <p className="text-xs text-[var(--color-ink-3)]">{l.email}</p>
                      </td>
                      <td className="px-4 py-2.5">{l.courseTitle}</td>
                      <td className="px-4 py-2.5">
                        <Badge tone="neutral">{l.source}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        {l.status === "completed" ? (
                          <Badge tone="ok">Abgeschlossen ✓</Badge>
                        ) : (
                          <span className="text-xs">
                            {done}/{total} · {pct} %
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[var(--color-ink-3)]">
                        {l.enrolledAt.toLocaleDateString("de-DE")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : null}

        <div className="mt-8">
          <AcademyManager initial={withLessons} />
        </div>
      </main>
    </>
  );
}
