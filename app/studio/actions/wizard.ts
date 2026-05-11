"use server";

import { auth } from "@/lib/auth";
import { canCreateProjects } from "@/lib/access";
import { db } from "@/lib/db/client";
import {
  orders,
  orderItems,
  orderShots,
  customers,
  users,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateShortCode } from "@/lib/short-code";
import { getService, getBundle, bundlePriceCents, bundleSubtotalCents } from "@/lib/services";
import { shotsForOrder } from "@/lib/shots";

export async function createManualProject(input: {
  customerId?: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  title?: string;
  propertyType:
    | "wohnung"
    | "haus"
    | "villa"
    | "mfh"
    | "gewerbe"
    | "industrie"
    | "grundstueck"
    | "bauprojekt";
  propertyAddress: string;
  propertyPlz: string;
  propertyCity: string;
  propertyNotes?: string;
  propertySizeQm?: number;
  bundleSlug?: string;
  serviceSlugs: string[];
  scheduledAt?: string;
}) {
  const session = await auth();
  if (!session?.user?.id || !canCreateProjects(session.user.role)) {
    throw new Error("Unauthorized");
  }

  if (!input.customerEmail) throw new Error("E-Mail fehlt");
  if (!input.propertyAddress || !input.propertyPlz || !input.propertyCity) {
    throw new Error("Objektdaten fehlen");
  }

  // Get-or-create the auth user account for the customer
  let userRow = await db
    .select()
    .from(users)
    .where(eq(users.email, input.customerEmail.toLowerCase()))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!userRow) {
    [userRow] = await db
      .insert(users)
      .values({
        email: input.customerEmail.toLowerCase(),
        name: input.customerName ?? null,
        phone: input.customerPhone ?? null,
        role: "customer",
      })
      .returning();
  }

  // Ensure customer record
  let customerRow = input.customerId
    ? await db.select().from(customers).where(eq(customers.id, input.customerId)).limit(1).then((r) => r[0] ?? null)
    : null;

  if (!customerRow) {
    [customerRow] = await db
      .insert(customers)
      .values({
        displayName: input.customerName ?? input.customerEmail,
        kind: "person",
        primaryEmail: input.customerEmail.toLowerCase(),
        primaryPhone: input.customerPhone ?? null,
        createdById: session.user.id,
      })
      .returning();
  }

  // Items
  const items: { slug: string; name: string; priceCents: number }[] = [];
  let subtotal = 0;
  let total = 0;

  if (input.bundleSlug) {
    const bundle = getBundle(input.bundleSlug);
    if (!bundle) throw new Error("Bundle nicht gefunden");
    subtotal = bundleSubtotalCents(bundle);
    total = bundlePriceCents(bundle);
    const factor = total / subtotal;
    for (const slug of bundle.serviceSlugs) {
      const svc = getService(slug);
      if (!svc) continue;
      items.push({
        slug: svc.slug,
        name: svc.name,
        priceCents: Math.round(svc.priceCents * factor),
      });
    }
  } else {
    for (const slug of input.serviceSlugs) {
      const svc = getService(slug);
      if (!svc) continue;
      items.push({ slug: svc.slug, name: svc.name, priceCents: svc.priceCents });
      subtotal += svc.priceCents;
      total += svc.priceCents;
    }
  }

  if (items.length === 0) throw new Error("Keine Services gewählt");

  // Create order with studioStatus=production (manuell angelegt → schon in Produktion)
  const shortCode = generateShortCode();
  const [order] = await db
    .insert(orders)
    .values({
      shortCode,
      customerId: userRow.id,
      customerRecordId: customerRow.id,
      customerEmail: input.customerEmail.toLowerCase(),
      customerName: input.customerName ?? null,
      customerPhone: input.customerPhone ?? null,
      status: "paid", // manuell angelegte Projekte gelten als bezahlt
      studioStatus: "production",
      title: input.title ?? null,
      bundleSlug: input.bundleSlug ?? null,
      propertyType: input.propertyType,
      propertyAddress: input.propertyAddress,
      propertyPlz: input.propertyPlz,
      propertyCity: input.propertyCity,
      propertySizeQm: input.propertySizeQm ?? null,
      propertyNotes: input.propertyNotes ?? null,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      subtotalCents: subtotal,
      discountCents: subtotal - total,
      totalCents: total,
      paidAt: new Date(),
    })
    .returning();

  // Items
  await db.insert(orderItems).values(
    items.map((i) => ({
      orderId: order.id,
      serviceSlug: i.slug,
      serviceName: i.name,
      quantity: 1,
      unitPriceCents: i.priceCents,
    })),
  );

  // Shotlist
  const stylePackages = new Set<string>();
  for (const item of items) {
    const svc = getService(item.slug);
    if (svc) stylePackages.add(svc.stylePackage);
  }
  const shots = shotsForOrder(input.propertyType, Array.from(stylePackages));
  if (shots.length > 0) {
    await db.insert(orderShots).values(
      shots.map((s, idx) => ({
        orderId: order.id,
        shotDefinitionId: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        perspective: s.perspective,
        altitudeMeters: Math.round(s.altitudeMeters),
        movement: s.movement,
        durationSec: s.durationSec,
        priority: s.priority,
        position: idx,
        status: "planned" as const,
      })),
    );
  }

  return { id: order.id, shortCode: order.shortCode };
}
