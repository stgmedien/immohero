import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { eq, desc } from "drizzle-orm";
import { customers, customerContacts, deals, orders } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerDetailEditor } from "@/components/studio/customer-detail-editor";
import { eurosPrecise, germanDate } from "@/lib/utils";
import { StudioStatusBadge, DealStageBadge } from "@/components/ui/status-badge";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canAccessCustomers(session.user.role)) redirect("/studio/dashboard");

  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  if (!customer) notFound();

  const [contacts, customerDeals, customerOrders] = await Promise.all([
    db.select().from(customerContacts).where(eq(customerContacts.customerId, id)),
    db.select().from(deals).where(eq(deals.customerId, id)).orderBy(desc(deals.createdAt)),
    db.select().from(orders).where(eq(orders.customerRecordId, id)).orderBy(desc(orders.createdAt)),
  ]);

  return (
    <>
      <StudioTopbar
        breadcrumbs={[
          { label: "Workspace", href: "/studio" },
          { label: "Kunden", href: "/studio/kunden" },
          { label: customer.displayName },
        ]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
        <Link href="/studio/kunden" className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-3)] hover:text-[var(--color-ink)]">
          <ArrowLeft className="h-3 w-3" />
          Alle Kunden
        </Link>
        <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{customer.displayName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={customer.kind === "company" ? "info" : "neutral"}>
                {customer.kind === "company" ? "Firma" : "Privat"}
              </Badge>
              {customer.companyName && (
                <span className="text-sm text-[var(--color-ink-3)]">{customer.companyName}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <CustomerDetailEditor customer={customer} />

            <Card className="p-5">
              <h2 className="text-base font-semibold mb-3">Aufträge ({customerOrders.length})</h2>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-3)]">Keine Aufträge bisher.</p>
              ) : (
                <ul className="divide-y divide-[var(--color-hair)]">
                  {customerOrders.map((o) => (
                    <li key={o.id}>
                      <Link href={`/studio/projekte/${o.shortCode}`} className="flex items-center justify-between py-2.5 text-sm hover:opacity-80">
                        <div>
                          <p className="font-mono text-xs text-[var(--color-ink-3)]">{o.shortCode}</p>
                          <p className="font-medium">{o.title ?? o.propertyAddress}</p>
                          <p className="text-xs text-[var(--color-ink-3)]">{o.propertyCity}</p>
                        </div>
                        <div className="text-right">
                          <StudioStatusBadge status={o.studioStatus} />
                          <p className="mt-0.5 text-xs text-[var(--color-ink-3)]">{eurosPrecise(o.totalCents)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-base font-semibold mb-3">Deals ({customerDeals.length})</h2>
              {customerDeals.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-3)]">Keine Deals.</p>
              ) : (
                <ul className="divide-y divide-[var(--color-hair)]">
                  {customerDeals.map((d) => (
                    <li key={d.id}>
                      <Link href={`/studio/deals/${d.id}`} className="flex items-center justify-between py-2.5 text-sm hover:opacity-80">
                        <div>
                          <p className="font-medium">{d.title}</p>
                          {d.expectedCloseDate && (
                            <p className="text-xs text-[var(--color-ink-3)]">Bis {germanDate(d.expectedCloseDate)}</p>
                          )}
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <DealStageBadge stage={d.stage} />
                          <p className="font-mono text-xs">{eurosPrecise(d.valueCents)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="p-5">
              <h3 className="text-base font-semibold mb-3">Kontakt</h3>
              <dl className="space-y-3 text-sm">
                {customer.primaryEmail && (
                  <Row icon={Mail} value={customer.primaryEmail} href={`mailto:${customer.primaryEmail}`} />
                )}
                {customer.primaryPhone && (
                  <Row icon={Phone} value={customer.primaryPhone} href={`tel:${customer.primaryPhone}`} />
                )}
                {customer.address && <Row icon={MapPin} value={customer.address} />}
              </dl>
            </Card>
            <Card className="p-5">
              <h3 className="text-base font-semibold mb-3">Kontakte ({contacts.length})</h3>
              {contacts.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-3)]">Keine Ansprechpartner.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {contacts.map((c) => (
                    <li key={c.id} className="border border-[var(--color-hair)] rounded-[var(--radius-md)] p-2.5">
                      <p className="font-medium">{c.fullName}</p>
                      {c.roleAtCustomer && <p className="text-xs text-[var(--color-ink-3)]">{c.roleAtCustomer}</p>}
                      {c.email && <p className="text-xs">{c.email}</p>}
                      {c.phone && <p className="text-xs text-[var(--color-ink-3)]">{c.phone}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}

function Row({ icon: Icon, value, href }: { icon: typeof Mail; value: string; href?: string }) {
  const content = (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-[var(--color-ink-4)]" />
      {value}
    </span>
  );
  return <dd>{href ? <a href={href} className="hover:underline">{content}</a> : content}</dd>;
}
