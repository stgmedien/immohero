import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, Building2, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { asc, ilike, isNull, or, desc } from "drizzle-orm";
import { customers } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateCustomerDialog } from "@/components/studio/create-customer-dialog";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; new?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/kunden");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const { q, new: showNew } = await searchParams;
  const wildcard = q ? `%${q}%` : null;

  const rows = await db
    .select()
    .from(customers)
    .where(
      wildcard
        ? or(
            ilike(customers.displayName, wildcard),
            ilike(customers.companyName, wildcard),
            ilike(customers.primaryEmail, wildcard),
          )
        : isNull(customers.archivedAt),
    )
    .orderBy(desc(customers.createdAt))
    .limit(200);

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Kunden" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Kunden</h1>
            <p className="text-[var(--color-ink-3)]">{rows.length} aktive Stammdaten</p>
          </div>
          <CreateCustomerDialog defaultOpen={showNew === "1"} />
        </div>

        <form className="mt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-3)]" />
            <Input name="q" defaultValue={q ?? ""} placeholder="Name, E-Mail, Firma…" className="pl-9" />
          </div>
        </form>

        <div className="mt-6">
          {rows.length === 0 ? (
            <EmptyState
              icon={UserIcon}
              title="Noch keine Kunden"
              description="Lege deinen ersten CRM-Eintrag an, um wiederkehrende B2B-Beziehungen zu pflegen."
            />
          ) : (
            <ul className="space-y-2">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/studio/kunden/${c.id}`}
                    className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] p-4 transition-colors hover:bg-[var(--color-bg-sunken)]/40"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-bg-sunken)] text-[var(--color-ink-3)]">
                      {c.kind === "company" ? <Building2 className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{c.displayName}</p>
                      <p className="text-xs text-[var(--color-ink-3)] truncate">
                        {c.primaryEmail ?? "—"} {c.primaryPhone ? `· ${c.primaryPhone}` : ""}
                      </p>
                    </div>
                    <Badge tone={c.kind === "company" ? "info" : "neutral"}>
                      {c.kind === "company" ? "Firma" : "Privat"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
