import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessStudio, canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { orders, customers, deals } from "@/lib/db/schema";
import { or, ilike, desc, ne } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!canAccessStudio(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const wildcard = `%${q}%`;

  const orderResults = await db
    .select({
      id: orders.id,
      shortCode: orders.shortCode,
      address: orders.propertyAddress,
      city: orders.propertyCity,
      customerName: orders.customerName,
      title: orders.title,
    })
    .from(orders)
    .where(
      or(
        ilike(orders.shortCode, wildcard),
        ilike(orders.propertyAddress, wildcard),
        ilike(orders.propertyCity, wildcard),
        ilike(orders.customerName, wildcard),
        ilike(orders.customerEmail, wildcard),
        ilike(orders.title, wildcard),
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(10);

  let customerResults: { id: string; name: string; email: string | null }[] = [];
  let dealResults: { id: string; title: string; stage: string; valueCents: number }[] = [];

  if (canAccessCustomers(session.user.role)) {
    customerResults = await db
      .select({
        id: customers.id,
        name: customers.displayName,
        email: customers.primaryEmail,
      })
      .from(customers)
      .where(
        or(
          ilike(customers.displayName, wildcard),
          ilike(customers.companyName, wildcard),
          ilike(customers.primaryEmail, wildcard),
        ),
      )
      .limit(5);

    dealResults = await db
      .select({
        id: deals.id,
        title: deals.title,
        stage: deals.stage,
        valueCents: deals.valueCents,
      })
      .from(deals)
      .where(ilike(deals.title, wildcard))
      .limit(5);
  }

  return NextResponse.json({
    results: [
      ...orderResults.map((o) => ({
        type: "order" as const,
        id: o.id,
        title: o.title ?? `${o.shortCode} · ${o.address}, ${o.city}`,
        subtitle: o.customerName ?? undefined,
        href: `/studio/projekte/${o.shortCode}`,
      })),
      ...customerResults.map((c) => ({
        type: "customer" as const,
        id: c.id,
        title: c.name,
        subtitle: c.email ?? undefined,
        href: `/studio/kunden/${c.id}`,
      })),
      ...dealResults.map((d) => ({
        type: "deal" as const,
        id: d.id,
        title: d.title,
        subtitle: `${d.stage} · ${(d.valueCents / 100).toFixed(0)} €`,
        href: `/studio/deals/${d.id}`,
      })),
    ],
  });
}
