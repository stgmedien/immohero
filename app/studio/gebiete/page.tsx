import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageCatalog } from "@/lib/access";
import { db } from "@/lib/db/client";
import { asc } from "drizzle-orm";
import { serviceAreas } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function GebietePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canManageCatalog(session.user.role)) redirect("/studio/dashboard");

  const rows = await db.select().from(serviceAreas).orderBy(asc(serviceAreas.plz));
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!grouped.has(row.region)) grouped.set(row.region, []);
    grouped.get(row.region)!.push(row);
  }

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Servicegebiete" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Servicegebiete</h1>
        <p className="text-[var(--color-ink-3)]">{rows.length} PLZs aktiv in {grouped.size} Regionen</p>

        <div className="mt-8 space-y-6">
          {[...grouped.entries()].map(([region, areas]) => (
            <Card key={region} className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{region}</h2>
                <Badge tone="primary">{areas.length} PLZs</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {areas.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full border border-[var(--color-hair)] bg-[var(--color-bg-sunken)] px-2.5 py-0.5 text-xs font-mono"
                  >
                    {a.plz}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
