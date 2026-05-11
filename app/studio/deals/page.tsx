import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { desc, isNull } from "drizzle-orm";
import { deals } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { DealsKanban } from "@/components/studio/deals-kanban";

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const rows = await db
    .select()
    .from(deals)
    .where(isNull(deals.archivedAt))
    .orderBy(desc(deals.updatedAt));

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Deals" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-[var(--color-ink-3)]">{rows.length} Deals · drag-drop zwischen Spalten</p>

        <div className="mt-6">
          <DealsKanban
            deals={rows.map((d) => ({
              id: d.id,
              title: d.title,
              stage: d.stage,
              valueCents: d.valueCents,
              probability: d.probability,
              expectedCloseDate: d.expectedCloseDate?.toISOString() ?? null,
              customerId: d.customerId,
            }))}
          />
        </div>
      </main>
    </>
  );
}
