import { redirect } from "next/navigation";
import { Download, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { desc, count, isNotNull } from "drizzle-orm";
import { leads } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { germanDate, germanDateTime } from "@/lib/utils";

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/leads");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(1000);
  const total = rows.length;
  const redeemed = rows.filter((r) => r.redeemedAt).length;
  const conversion = total > 0 ? Math.round((redeemed / total) * 100) : 0;

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Messe-Leads" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Messe-Leads</h1>
            <p className="text-[var(--color-ink-3)]">
              Gesammelte Interessenten + ausgegebene Gutscheine
            </p>
          </div>
          <Button asChild variant="secondary">
            <a href="/api/leads/export" download>
              <Download className="h-4 w-4" />
              CSV exportieren
            </a>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 grid-cols-3">
          <Stat label="Leads gesamt" value={String(total)} />
          <Stat label="Eingelöst" value={String(redeemed)} />
          <Stat label="Conversion" value={`${conversion}%`} />
        </div>

        <Card className="mt-8 overflow-hidden p-0">
          {rows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Noch keine Leads"
              description="Sobald sich am Messestand jemand über /messe einträgt, erscheint er hier."
              className="border-0"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-bg-sunken)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Kontakt</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Erfasst</th>
                    <th className="px-4 py-3">Gültig bis</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} className="border-t border-[var(--color-hair)]">
                      <td className="px-4 py-3 font-medium">{l.name}</td>
                      <td className="px-4 py-3 text-xs">
                        <p>{l.email}</p>
                        <p className="text-[var(--color-ink-3)]">{l.phone}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{l.voucherCode}</td>
                      <td className="px-4 py-3 text-xs text-[var(--color-ink-3)]">
                        {germanDateTime(l.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-ink-3)]">
                        {germanDate(l.expiresAt)}
                      </td>
                      <td className="px-4 py-3">
                        {l.redeemedAt ? (
                          <Badge tone="ok">Eingelöst</Badge>
                        ) : new Date(l.expiresAt) < new Date() ? (
                          <Badge tone="neutral">Abgelaufen</Badge>
                        ) : (
                          <Badge tone="warn">Offen</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}
