import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { auth } from "@/lib/auth";
import { getProjectFull } from "@/lib/db/project-queries";
import { StudioTopbar } from "@/components/studio/topbar";
import { StudioSidebar } from "@/components/studio/sidebar";
import { StudioStatusBadge, OrderStatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarStack } from "@/components/ui/avatar";
import { ProjectTabs } from "@/components/studio/project-tabs";
import { canAccessStudio, userDisplayName, userInitials } from "@/lib/access";
import { germanDateTime, eurosPrecise } from "@/lib/utils";

export default async function ProjectLayout({
  params,
  children,
}: {
  params: Promise<{ code: string }>;
  children: React.ReactNode;
}) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/studio/projekte/${code}`);
  if (!canAccessStudio(session.user.role)) redirect("/konto");

  const data = await getProjectFull(code);
  if (!data) notFound();

  const { project, assignments, totals } = data;

  const sidebarActive = {
    shortCode: project.shortCode,
    city: project.propertyCity,
    shotCount: totals.shots,
    status: project.studioStatus,
  };

  const assigneeUsers = assignments.map((a) => ({
    id: a.userId,
    name: a.name ?? a.email ?? "?",
    image: a.image,
    color: a.accentColor ?? undefined,
  }));

  return (
    <>
      <StudioTopbar
        breadcrumbs={[
          { label: "Workspace", href: "/studio" },
          { label: "Projekte", href: "/studio/projekte" },
          { label: project.shortCode },
        ]}
        user={session.user}
        unreadCount={0}
      />
      <div className="border-b border-[var(--color-hair)] bg-[var(--color-bg-elev)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link
                href="/studio/projekte"
                className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
              >
                <ArrowLeft className="h-3 w-3" />
                Alle Projekte
              </Link>
              <div className="mt-1 flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {project.title ?? project.propertyAddress}
                </h1>
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                  {project.shortCode}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--color-ink-3)] truncate">
                {project.propertyAddress}, {project.propertyPlz} {project.propertyCity} · {project.propertyType}
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <StudioStatusBadge status={project.studioStatus} />
                <OrderStatusBadge status={project.status} />
                <Badge tone="outline">
                  {totals.shotsDone}/{totals.shots} Shots
                </Badge>
                <Badge tone="outline">{eurosPrecise(project.totalCents)}</Badge>
                {project.scheduledAt && (
                  <Badge tone="outline">{germanDateTime(project.scheduledAt)}</Badge>
                )}
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2">
              {assigneeUsers.length > 0 && <AvatarStack users={assigneeUsers} size={28} />}
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/studio/projekte/${code}/feld`}>Field-Mode</Link>
              </Button>
            </div>
          </div>
        </div>
        <ProjectTabs code={code} />
      </div>
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </>
  );
}
