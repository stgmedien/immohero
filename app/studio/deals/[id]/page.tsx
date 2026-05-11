import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";
import { deals, dealNotes, customers } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { DealStageBadge } from "@/components/ui/status-badge";
import { eurosPrecise, germanDate, germanDateTime } from "@/lib/utils";
import { DealNotes } from "@/components/studio/deal-notes";
import { DealStageActions } from "@/components/studio/deal-stage-actions";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const [deal] = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  if (!deal) notFound();

  const [notes, customer] = await Promise.all([
    db.select().from(dealNotes).where(eq(dealNotes.dealId, id)).orderBy(desc(dealNotes.happenedAt)),
    deal.customerId
      ? db.select().from(customers).where(eq(customers.id, deal.customerId)).limit(1).then((r) => r[0] ?? null)
      : Promise.resolve(null),
  ]);

  return (
    <>
      <StudioTopbar
        breadcrumbs={[
          { label: "Workspace", href: "/studio" },
          { label: "Deals", href: "/studio/deals" },
          { label: deal.title },
        ]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
        <Link href="/studio/deals" className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-3)] hover:text-[var(--color-ink)]">
          <ArrowLeft className="h-3 w-3" />
          Pipeline
        </Link>
        <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{deal.title}</h1>
            <p className="mt-1 text-[var(--color-ink-3)]">
              {eurosPrecise(deal.valueCents)} · {deal.probability}% Wahrscheinlichkeit
            </p>
          </div>
          <DealStageBadge stage={deal.stage} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <DealStageActions dealId={deal.id} currentStage={deal.stage} />
            {deal.description && (
              <Card className="p-5">
                <h3 className="text-base font-semibold mb-2">Beschreibung</h3>
                <p className="text-sm whitespace-pre-wrap text-[var(--color-ink-2)]">{deal.description}</p>
              </Card>
            )}
            <DealNotes
              dealId={deal.id}
              notes={notes.map((n) => ({
                id: n.id,
                kind: n.kind,
                body: n.body,
                happenedAt: n.happenedAt.toISOString(),
                authorName: n.authorName,
              }))}
            />
          </div>
          <aside className="space-y-6">
            {customer && (
              <Card className="p-5">
                <h3 className="text-base font-semibold mb-2">Kunde</h3>
                <Link href={`/studio/kunden/${customer.id}`} className="block hover:opacity-80">
                  <p className="font-medium">{customer.displayName}</p>
                  {customer.primaryEmail && <p className="text-xs text-[var(--color-ink-3)]">{customer.primaryEmail}</p>}
                </Link>
              </Card>
            )}
            <Card className="p-5">
              <h3 className="text-base font-semibold mb-2">Daten</h3>
              <dl className="space-y-2 text-xs">
                <Row label="Erwarteter Abschluss" value={deal.expectedCloseDate ? germanDate(deal.expectedCloseDate) : "—"} />
                <Row label="Erstellt" value={germanDateTime(deal.createdAt)} />
                <Row label="Aktualisiert" value={germanDateTime(deal.updatedAt)} />
              </dl>
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--color-ink-4)] uppercase tracking-wider font-mono text-[10px]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
