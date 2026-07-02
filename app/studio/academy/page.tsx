import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { academyCourses, academyLessons } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { AcademyManager } from "@/components/studio/academy-manager";

export default async function StudioAcademyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/academy");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const [courses, lessons] = await Promise.all([
    db.select().from(academyCourses).orderBy(asc(academyCourses.position), asc(academyCourses.createdAt)),
    db.select().from(academyLessons).orderBy(asc(academyLessons.position), asc(academyLessons.createdAt)),
  ]);

  const withLessons = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    level: c.level,
    position: c.position,
    published: c.published,
    lessons: lessons
      .filter((l) => l.courseId === c.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        body: l.body,
        durationMin: l.durationMin,
        videoUrl: l.videoUrl,
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
              Kurse & Lektionen verwalten — live unter <a href="/academy" className="underline" target="_blank">/academy</a>
            </p>
          </div>
        </div>
        <div className="mt-8">
          <AcademyManager initial={withLessons} />
        </div>
      </main>
    </>
  );
}
