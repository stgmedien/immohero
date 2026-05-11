import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FolderKanban, Cloud, Layers, Users as UsersIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { and, count, desc, eq, gte, inArray, lte, ne, sql } from "drizzle-orm";
import { orders, orderShots, customers, deals } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudioStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getGreeting, formatTasksHint } from "@/lib/greeting";
import { germanDate, germanDateTime } from "@/lib/utils";

interface SearchParams {
  filter?: string;
}

const FILTERS = [
  { id: "all", label: "Alle" },
  { id: "draft", label: "Entwurf" },
  { id: "production", label: "Produktion" },
  { id: "client_approval", label: "Freigabe" },
  { id: "revision", label: "Revision" },
  { id: "approved", label: "Freigegeben" },
  { id: "completed", label: "Geliefert" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/dashboard");

  const { filter: rawFilter } = await searchParams;
  const filter = FILTERS.find((f) => f.id === rawFilter)?.id ?? "all";

  const greeting = getGreeting(session.user.name);

  // Stats
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [scheduledToday] = await db
    .select({ c: count() })
    .from(orders)
    .where(and(gte(orders.scheduledAt, today), lte(orders.scheduledAt, todayEnd)));

  const [scheduledWeek] = await db
    .select({ c: count() })
    .from(orders)
    .where(and(gte(orders.scheduledAt, today), lte(orders.scheduledAt, weekEnd)));

  const [totalProjects] = await db
    .select({ c: count() })
    .from(orders)
    .where(ne(orders.status, "cancelled"));

  const [inProduction] = await db
    .select({ c: count() })
    .from(orders)
    .where(inArray(orders.studioStatus, ["production", "client_approval", "revision"]));

  const [shotsRow] = await db
    .select({
      total: count(orderShots.id),
      done: sql<number>`count(case when ${orderShots.status} = 'done' then 1 end)`,
    })
    .from(orderShots);

  // Projects
  const projectsQuery =
    filter === "all"
      ? db
          .select()
          .from(orders)
          .where(ne(orders.status, "cancelled"))
          .orderBy(desc(orders.createdAt))
          .limit(30)
      : db
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.studioStatus, filter as "draft" | "production" | "client_approval" | "revision" | "approved" | "completed" | "archived"),
              ne(orders.status, "cancelled"),
            ),
          )
          .orderBy(desc(orders.createdAt))
          .limit(30);
  const projects = await projectsQuery;

  const subtitle = greeting.subtitleTemplate
    .replace("{weekday}", greeting.weekday)
    .replace("{tasks}", formatTasksHint(Number(scheduledToday?.c ?? 0), Number(scheduledWeek?.c ?? 0)));

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Dashboard" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{greeting.title}</h1>
            <p className="mt-1 text-[var(--color-ink-3)]">{subtitle}</p>
          </div>
          <Button asChild>
            <Link href="/studio/projekte/neu">
              <Plus className="h-4 w-4" />
              Neues Projekt
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FolderKanban} label="Projekte" value={Number(totalProjects?.c ?? 0)} />
          <StatCard icon={Layers} label="In Produktion" value={Number(inProduction?.c ?? 0)} />
          <StatCard icon={Cloud} label="Shots geplant" value={Number(shotsRow?.total ?? 0)} />
          <StatCard
            icon={UsersIcon}
            label="Shots fertig"
            value={Number(shotsRow?.done ?? 0)}
            sub={
              Number(shotsRow?.total ?? 0) > 0
                ? `${Math.round((Number(shotsRow?.done ?? 0) / Number(shotsRow?.total ?? 0)) * 100)}%`
                : undefined
            }
          />
        </div>

        <div className="mt-8 flex items-center gap-1 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 pb-2">
          {FILTERS.map((f) => {
            const active = f.id === filter;
            const href = f.id === "all" ? "/studio/dashboard" : `/studio/dashboard?filter=${f.id}`;
            return (
              <Link
                key={f.id}
                href={href}
                className={
                  "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors " +
                  (active
                    ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                    : "bg-[var(--color-bg-elev)] border border-[var(--color-hair)] text-[var(--color-ink-2)] hover:border-[var(--color-ink-4)]")
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title={filter === "all" ? "Noch keine Projekte" : `Keine Projekte im Filter "${FILTERS.find((f) => f.id === filter)?.label}"`}
              description="Starte mit deinem ersten Projekt — wir legen Shotliste, Crew und Lieferung automatisch an."
              action={
                <Button asChild>
                  <Link href="/studio/projekte/neu">
                    <Plus className="h-4 w-4" />
                    Projekt anlegen
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
          {label}
        </p>
        <Icon className="h-4 w-4 text-[var(--color-ink-4)]" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[var(--color-ink-3)]">{sub}</p>}
    </Card>
  );
}

function ProjectCard({ project }: { project: typeof orders.$inferSelect }) {
  return (
    <Link
      href={`/studio/projekte/${project.shortCode}`}
      className="group block rounded-[var(--radius-lg)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] overflow-hidden hover:shadow-[var(--shadow-elev)] hover:-translate-y-0.5 transition-all"
    >
      <div
        className="aspect-[16/10] bg-brand-grad relative overflow-hidden"
        style={
          project.coverImageUrl
            ? { backgroundImage: `url(${project.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {!project.coverImageUrl && (
          <div className="absolute inset-0 grid place-items-center text-white/90">
            <span className="font-mono text-xs uppercase tracking-[0.15em]">
              {project.propertyType}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StudioStatusBadge status={project.studioStatus} />
        </div>
      </div>
      <div className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
          {project.shortCode}
        </p>
        <h3 className="mt-0.5 font-semibold leading-tight truncate">
          {project.title ?? project.propertyAddress}
        </h3>
        <p className="mt-0.5 text-xs text-[var(--color-ink-3)] truncate">
          {project.propertyPlz} {project.propertyCity}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-ink-3)]">
          <span>{project.scheduledAt ? germanDate(project.scheduledAt) : "—"}</span>
          <span>{project.customerName ?? "—"}</span>
        </div>
      </div>
    </Link>
  );
}
