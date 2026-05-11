import { db } from "@/lib/db/client";
import { asc } from "drizzle-orm";
import { serviceAreas } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminGebietePage() {
  const rows = await db.select().from(serviceAreas).orderBy(asc(serviceAreas.plz));
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!grouped.has(row.region)) grouped.set(row.region, []);
    grouped.get(row.region)!.push(row);
  }

  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Servicegebiete</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">{rows.length} aktive PLZs in {grouped.size} Regionen.</p>

      <div className="mt-8 space-y-6">
        {[...grouped.entries()].map(([region, areas]) => (
          <Card key={region} className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">{region}</h2>
              <Badge tone="primary">{areas.length} PLZs</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {areas.map((area) => (
                <span
                  key={area.id}
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg-alt)] px-3 py-1 text-xs"
                >
                  {area.plz} · {area.city}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
