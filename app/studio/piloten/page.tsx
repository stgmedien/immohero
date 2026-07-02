import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { pilotProfiles, pilotEvents, pilotSessions } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Plane } from "lucide-react";
import { germanDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LEVEL_BADGE: Record<string, { label: string; tone: "primary" | "warn" | "ok" }> = {
  basic: { label: "Basic", tone: "primary" },
  intermediate: { label: "Intermediate", tone: "warn" },
  advanced: { label: "Advanced", tone: "ok" },
};

export default async function StudioPilotenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/piloten");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const [profiles, funnel, sessionCount] = await Promise.all([
    db.select().from(pilotProfiles).orderBy(desc(pilotProfiles.updatedAt)).limit(100),
    db
      .select({ type: pilotEvents.type, n: sql<number>`count(*)::int` })
      .from(pilotEvents)
      .groupBy(pilotEvents.type),
    db.select({ n: sql<number>`count(*)::int` }).from(pilotSessions),
  ]);

  const f = Object.fromEntries(funnel.map((r) => [r.type, r.n]));
  const stats: { label: string; value: number }[] = [
    { label: "Gespräche", value: sessionCount[0]?.n ?? 0 },
    { label: "Leads", value: f["lead_captured"] ?? 0 },
    { label: "Einstufungen", value: f["level_assigned"] ?? 0 },
    { label: "Calls gebucht", value: f["call_booked"] ?? 0 },
    { label: "Beispielaufträge", value: f["brief_generated"] ?? 0 },
    { label: "Pool-Registrierungen", value: f["pilot_registered"] ?? 0 },
  ];

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Piloten" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Piloten-Pool</h1>
          <p className="text-[var(--color-ink-3)]">
            Pilot Journey Engine — Profile, Einstufungen und Funnel-Metriken
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <Card key={s.label} className="p-4">
              <p className="font-serif text-3xl">{s.value}</p>
              <p className="mt-0.5 text-xs text-[var(--color-ink-3)]">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          {profiles.length === 0 ? (
            <EmptyState
              icon={Plane}
              title="Noch keine Piloten-Profile"
              description="Sobald jemand mit dem Pilot-Guide (Widget unten rechts auf der Website) spricht, erscheinen die Profile hier."
            />
          ) : (
            <ul className="space-y-2">
              {profiles.map((p) => {
                const lvl = p.level ? LEVEL_BADGE[p.level] : null;
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] p-4"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-bg-sunken)] text-[var(--color-ink-3)]">
                      <Plane className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">
                        {p.name ?? p.email ?? "Anonym"}
                        {p.plz ? <span className="text-[var(--color-ink-3)]"> · {p.plz}</span> : null}
                      </p>
                      <p className="truncate text-xs text-[var(--color-ink-3)]">
                        {p.email ?? "keine E-Mail"} · {(p.equipment ?? []).map((e) => e.model).join(", ") || "kein Equipment"} ·{" "}
                        {p.flightHours ?? "?"} Flugstunden · zuletzt {germanDateTime(p.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">Passport {p.passportLevel}</Badge>
                      {lvl ? <Badge tone={lvl.tone}>{lvl.label} · {p.levelScore}</Badge> : <Badge tone="neutral">offen</Badge>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
