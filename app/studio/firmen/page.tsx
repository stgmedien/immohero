import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { isNull, desc } from "drizzle-orm";
import { companies } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function FirmenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const rows = await db
    .select()
    .from(companies)
    .where(isNull(companies.archivedAt))
    .orderBy(desc(companies.createdAt))
    .limit(200);

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Firmen" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Firmen</h1>
        <p className="text-[var(--color-ink-3)]">{rows.length} Stammdaten</p>

        <div className="mt-6">
          {rows.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Noch keine Firmen"
              description="Firmen werden separat von Kontakten gepflegt — sinnvoll für B2B-Beziehungen mit mehreren Ansprechpartnern."
            />
          ) : (
            <ul className="space-y-2">
              {rows.map((c) => (
                <li key={c.id}>
                  <Card className="p-4 flex items-center gap-4">
                    <Building2 className="h-6 w-6 text-[var(--color-ink-3)]" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{c.displayName}</p>
                      {c.legalName && <p className="text-xs text-[var(--color-ink-3)]">{c.legalName}</p>}
                      {c.primaryEmail && <p className="text-xs text-[var(--color-ink-3)]">{c.primaryEmail}</p>}
                    </div>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-[var(--color-brand-1)] hover:underline">
                        Website
                      </a>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
