import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { desc, eq } from "drizzle-orm";
import { propertySubmissions, customers, orders } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmissionReview } from "@/components/studio/submission-review";

export default async function EinreichungenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/studio/einreichungen");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const rows = await db
    .select({
      id: propertySubmissions.id,
      customerName: customers.displayName,
      customerCompany: customers.companyName,
      submittedByEmail: propertySubmissions.submittedByEmail,
      propertyType: propertySubmissions.propertyType,
      propertyAddress: propertySubmissions.propertyAddress,
      propertyPlz: propertySubmissions.propertyPlz,
      propertyCity: propertySubmissions.propertyCity,
      propertySizeQm: propertySubmissions.propertySizeQm,
      propertyNotes: propertySubmissions.propertyNotes,
      desiredTimeframe: propertySubmissions.desiredTimeframe,
      uploads: propertySubmissions.uploads,
      status: propertySubmissions.status,
      reviewNotes: propertySubmissions.reviewNotes,
      createdAt: propertySubmissions.createdAt,
      convertedShortCode: orders.shortCode,
    })
    .from(propertySubmissions)
    .leftJoin(customers, eq(customers.id, propertySubmissions.customerRecordId))
    .leftJoin(orders, eq(orders.id, propertySubmissions.convertedOrderId))
    .orderBy(desc(propertySubmissions.createdAt))
    .limit(300);

  const pending = rows.filter((r) => r.status === "pending");
  const rest = rows.filter((r) => r.status !== "pending");

  const serialize = (r: (typeof rows)[number]) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  });

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Abo-Einreichungen" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Abo-Einreichungen</h1>
            <p className="text-[var(--color-ink-3)]">
              Selbst eingereichte Objekte von Abo-Kunden · {pending.length} offen
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Noch keine Einreichungen"
            description="Sobald ein Abo-Kunde im /abo-Bereich ein Objekt einreicht, erscheint es hier zur Prüfung."
            className="mt-8"
          />
        ) : (
          <div className="mt-8 space-y-10">
            <SubmissionReview
              title={`Offen (${pending.length})`}
              rows={pending.map(serialize)}
            />
            {rest.length > 0 && (
              <SubmissionReview
                title={`Erledigt (${rest.length})`}
                rows={rest.map(serialize)}
                readOnly
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
