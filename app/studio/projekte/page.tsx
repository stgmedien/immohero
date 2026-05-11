import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FolderKanban, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { desc, eq, ne, and, or, ilike } from "drizzle-orm";
import { orders } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StudioStatusBadge, OrderStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { germanDateTime, eurosPrecise } from "@/lib/utils";

interface SearchParams {
  q?: string;
  studio?: string;
}

export default async function ProjectListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/projekte");

  const { q, studio: studioFilter } = await searchParams;
  const wildcard = q ? `%${q}%` : null;

  const where = and(
    ne(orders.status, "cancelled"),
    wildcard
      ? or(
          ilike(orders.shortCode, wildcard),
          ilike(orders.propertyAddress, wildcard),
          ilike(orders.propertyCity, wildcard),
          ilike(orders.customerName, wildcard),
          ilike(orders.title, wildcard),
        )
      : undefined,
    studioFilter && studioFilter !== "all"
      ? eq(orders.studioStatus, studioFilter as "draft" | "production" | "client_approval" | "revision" | "approved" | "completed" | "archived")
      : undefined,
  );

  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(200);

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Projekte" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Projekte</h1>
            <p className="text-[var(--color-ink-3)]">{rows.length} {rows.length === 1 ? "Projekt" : "Projekte"}</p>
          </div>
          <Button asChild>
            <Link href="/studio/projekte/neu">
              <Plus className="h-4 w-4" />
              Neues Projekt
            </Link>
          </Button>
        </div>

        <form className="mt-6 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-3)]" />
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Code, Adresse, Kunde…"
              className="pl-9"
            />
          </div>
          <select
            name="studio"
            defaultValue={studioFilter ?? "all"}
            className="h-10 rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] px-3 text-sm"
          >
            <option value="all">Alle Stati</option>
            <option value="draft">Entwurf</option>
            <option value="production">Produktion</option>
            <option value="client_approval">Freigabe</option>
            <option value="revision">Revision</option>
            <option value="approved">Freigegeben</option>
            <option value="completed">Geliefert</option>
            <option value="archived">Archiviert</option>
          </select>
          <Button type="submit" variant="secondary" size="md">Filtern</Button>
          {(q || studioFilter) && (
            <Button asChild variant="ghost" size="md">
              <Link href="/studio/projekte">Zurücksetzen</Link>
            </Button>
          )}
        </form>

        <Card className="mt-6 overflow-hidden p-0">
          {rows.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="Keine Projekte gefunden"
              description="Passe den Filter an oder lege ein neues Projekt an."
              action={
                <Button asChild>
                  <Link href="/studio/projekte/neu">Neues Projekt</Link>
                </Button>
              }
              className="border-0"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-bg-sunken)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Objekt</th>
                    <th className="px-4 py-3">Kunde</th>
                    <th className="px-4 py-3">Termin</th>
                    <th className="px-4 py-3">Studio</th>
                    <th className="px-4 py-3">Zahlung</th>
                    <th className="px-4 py-3 text-right">Betrag</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-[var(--color-hair)] hover:bg-[var(--color-bg-sunken)]/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/studio/projekte/${p.shortCode}`} className="hover:underline">
                          {p.shortCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/studio/projekte/${p.shortCode}`} className="font-medium">
                          {p.title ?? `${p.propertyAddress}`}
                        </Link>
                        <p className="text-xs text-[var(--color-ink-3)]">{p.propertyPlz} {p.propertyCity}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p>{p.customerName ?? "—"}</p>
                        <p className="text-[var(--color-ink-3)] truncate">{p.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--color-ink-3)]">
                        {p.scheduledAt ? germanDateTime(p.scheduledAt) : "—"}
                      </td>
                      <td className="px-4 py-3"><StudioStatusBadge status={p.studioStatus} /></td>
                      <td className="px-4 py-3"><OrderStatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">{eurosPrecise(p.totalCents)}</td>
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
