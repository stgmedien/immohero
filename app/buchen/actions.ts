"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { bookingDraftSchema, summarizeBooking, type BookingDraft } from "@/lib/booking";
import { isPlzInServiceArea, createOrderDraft, findOrCreateCustomer, getServiceArea } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { orderItems, orderShots } from "@/lib/db/schema";
import { generateShortCode } from "@/lib/short-code";
import { requireStripe } from "@/lib/stripe";
import { getBundle, getService } from "@/lib/services";
import { shotsForOrder } from "@/lib/shots";

export interface CheckPlzResult {
  ok: boolean;
  city?: string;
  region?: string;
  reason?: string;
}

export async function checkPlz(plz: string): Promise<CheckPlzResult> {
  if (!/^\d{5}$/.test(plz)) {
    return { ok: false, reason: "Bitte gib eine fünfstellige Postleitzahl ein." };
  }
  const row = await getServiceArea(plz);
  if (!row || !row.active) {
    return {
      ok: false,
      reason:
        "Dieses Gebiet liegt aktuell außerhalb unseres Service-Radius (OWL/NRW). Wir melden uns gern für Sonderfahrten — info@immohero.org.",
    };
  }
  return { ok: true, city: row.city, region: row.region };
}

export async function createCheckoutSession(payload: BookingDraft) {
  const stripe = requireStripe();
  const draft = bookingDraftSchema.parse(payload);

  const plzOk = await isPlzInServiceArea(draft.property.plz);
  if (!plzOk) {
    throw new Error("Diese Postleitzahl liegt außerhalb unseres Service-Gebiets.");
  }

  const summary = summarizeBooking({
    bundleSlug: draft.bundleSlug ?? null,
    serviceSlugs: draft.serviceSlugs,
  });

  if (summary.items.length === 0) {
    throw new Error("Bitte wähle mindestens einen Service oder ein Paket.");
  }

  const customer = await findOrCreateCustomer(
    draft.customer.email,
    `${draft.customer.firstName} ${draft.customer.lastName}`.trim(),
    draft.customer.phone,
  );

  const shortCode = generateShortCode();
  const scheduledAt = new Date(`${draft.schedule.date}T${draft.schedule.timeSlot}:00+02:00`);

  const order = await createOrderDraft({
    shortCode,
    customerId: customer.id,
    customerEmail: customer.email,
    customerName: customer.name ?? null,
    customerPhone: draft.customer.phone,
    status: "pending",
    bundleSlug: draft.bundleSlug ?? null,
    propertyType: draft.property.type,
    propertyAddress: draft.property.address,
    propertyPlz: draft.property.plz,
    propertyCity: draft.property.city,
    propertySizeQm: draft.property.sizeQm ?? null,
    propertyNotes: draft.property.notes ?? null,
    scheduledAt,
    subtotalCents: summary.subtotalCents,
    discountCents: summary.discountCents,
    totalCents: summary.totalCents,
  });

  await db.insert(orderItems).values(
    summary.items.map((item) => ({
      orderId: order.id,
      serviceSlug: item.slug,
      serviceName: item.name,
      quantity: 1,
      unitPriceCents: item.priceCents,
    })),
  );

  const stylePackages = new Set<string>();
  if (draft.bundleSlug) {
    const bundle = getBundle(draft.bundleSlug);
    bundle?.serviceSlugs.forEach((slug) => {
      const svc = getService(slug);
      if (svc) stylePackages.add(svc.stylePackage);
    });
  }
  draft.serviceSlugs.forEach((slug) => {
    const svc = getService(slug);
    if (svc) stylePackages.add(svc.stylePackage);
  });

  const shotsToInsert = shotsForOrder(draft.property.type, Array.from(stylePackages));
  if (shotsToInsert.length > 0) {
    await db.insert(orderShots).values(
      shotsToInsert.map((shot, index) => ({
        orderId: order.id,
        shotDefinitionId: shot.id,
        name: shot.name,
        description: shot.description,
        priority: shot.priority,
        position: index,
        status: "planned" as const,
      })),
    );
  }

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  const stripeLineItems = summary.items.map((item) => ({
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: item.priceCents,
      product_data: {
        name: item.name,
        description: getService(item.slug)?.shortDescription ?? undefined,
      },
    },
  }));

  if (summary.discountCents > 0 && draft.bundleSlug) {
    const bundle = getBundle(draft.bundleSlug);
    if (bundle) {
      // Stripe will compute discount via coupon. For MVP we adjust unit_amount instead.
      const factor = summary.totalCents / summary.subtotalCents;
      for (const li of stripeLineItems) {
        li.price_data.unit_amount = Math.round(li.price_data.unit_amount * factor);
      }
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: stripeLineItems,
    customer_email: customer.email,
    metadata: {
      orderId: order.id,
      shortCode: order.shortCode,
    },
    payment_intent_data: {
      metadata: { orderId: order.id },
    },
    locale: "de",
    payment_method_types: ["card", "sepa_debit", "klarna", "paypal"],
    billing_address_collection: "required",
    success_url: `${origin}/buchen/erfolg?order=${order.shortCode}`,
    cancel_url: `${origin}/buchen/kasse?order=${order.shortCode}`,
    automatic_tax: { enabled: false },
  });

  const { orders: ordersTable } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(ordersTable).set({ stripeSessionId: session.id }).where(eq(ordersTable.id, order.id));

  if (!session.url) throw new Error("Stripe gave no checkout URL.");
  redirect(session.url);
}
