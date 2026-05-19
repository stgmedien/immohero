"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import {
  propertySubmissions,
  customers,
  orders,
  orderItems,
  orderShots,
  users,
  auditLog,
} from "@/lib/db/schema";
import { generateShortCode } from "@/lib/short-code";
import {
  getService,
  getBundle,
  bundlePriceCents,
  bundleSubtotalCents,
} from "@/lib/services";
import { shotsForOrder } from "@/lib/shots";
import { resolveAboServices } from "@/lib/abo";
import { sendEmail } from "@/lib/email";

async function requireCRM() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function approveSubmission(submissionId: string) {
  const session = await requireCRM();

  const [sub] = await db
    .select()
    .from(propertySubmissions)
    .where(eq(propertySubmissions.id, submissionId))
    .limit(1);
  if (!sub) throw new Error("Einreichung nicht gefunden");
  if (sub.status === "converted") throw new Error("Bereits in Produktion");

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, sub.customerRecordId))
    .limit(1);
  if (!customer) throw new Error("Kunde nicht gefunden");

  // Resolve predefined Abo services
  const services = resolveAboServices({
    aboServiceSlugs: customer.aboServiceSlugs,
    aboBundleSlug: customer.aboBundleSlug,
  });

  const items: { slug: string; name: string; priceCents: number }[] = [];
  let subtotal = 0;
  let total = 0;

  if (customer.aboBundleSlug && getBundle(customer.aboBundleSlug)) {
    const bundle = getBundle(customer.aboBundleSlug)!;
    subtotal = bundleSubtotalCents(bundle);
    total = bundlePriceCents(bundle);
    const factor = subtotal > 0 ? total / subtotal : 1;
    for (const slug of bundle.serviceSlugs) {
      const svc = getService(slug);
      if (!svc) continue;
      items.push({
        slug: svc.slug,
        name: svc.name,
        priceCents: Math.round(svc.priceCents * factor),
      });
    }
    // Extra single services on top of the bundle
    for (const slug of customer.aboServiceSlugs ?? []) {
      if (bundle.serviceSlugs.includes(slug)) continue;
      const svc = getService(slug);
      if (!svc) continue;
      items.push({ slug: svc.slug, name: svc.name, priceCents: svc.priceCents });
      subtotal += svc.priceCents;
      total += svc.priceCents;
    }
  } else {
    for (const svc of services) {
      items.push({ slug: svc.slug, name: svc.name, priceCents: svc.priceCents });
      subtotal += svc.priceCents;
      total += svc.priceCents;
    }
  }

  // Get-or-create the auth user account for the customer
  const email = (customer.primaryEmail ?? sub.submittedByEmail).toLowerCase();
  let userRow = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!userRow) {
    [userRow] = await db
      .insert(users)
      .values({
        email,
        name: customer.displayName,
        role: "customer",
      })
      .returning();
  }

  const shortCode = generateShortCode();
  const [order] = await db
    .insert(orders)
    .values({
      shortCode,
      customerId: userRow.id,
      customerRecordId: customer.id,
      customerEmail: email,
      customerName: customer.displayName,
      customerPhone: customer.primaryPhone ?? null,
      status: "paid",
      studioStatus: "production",
      origin: "abo",
      bundleSlug: customer.aboBundleSlug ?? null,
      propertyType: sub.propertyType,
      propertyAddress: sub.propertyAddress,
      propertyPlz: sub.propertyPlz,
      propertyCity: sub.propertyCity,
      propertySizeQm: sub.propertySizeQm ?? null,
      propertyNotes: sub.propertyNotes ?? null,
      scheduledAt: null,
      subtotalCents: subtotal,
      discountCents: Math.max(0, subtotal - total),
      totalCents: total,
      paidAt: new Date(),
    })
    .returning();

  if (items.length > 0) {
    await db.insert(orderItems).values(
      items.map((i) => ({
        orderId: order.id,
        serviceSlug: i.slug,
        serviceName: i.name,
        quantity: 1,
        unitPriceCents: i.priceCents,
      })),
    );
  }

  // Shotlist
  const stylePackages = new Set<string>();
  for (const item of items) {
    const svc = getService(item.slug);
    if (svc) stylePackages.add(svc.stylePackage);
  }
  const shots = shotsForOrder(sub.propertyType, Array.from(stylePackages));
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

  await db
    .update(propertySubmissions)
    .set({
      status: "converted",
      convertedOrderId: order.id,
      reviewedByUserId: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(propertySubmissions.id, submissionId));

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "approve",
    entityType: "property_submission",
    entityId: submissionId,
    payload: { orderId: order.id, shortCode },
  });

  try {
    const { AboSubmissionApprovedEmail } = await import(
      "@/emails/abo-submission-approved"
    );
    await sendEmail({
      to: email,
      from: "default",
      subject: `Dein Objekt ist in Produktion — ${shortCode}`,
      template: "abo-submission-approved",
      react: AboSubmissionApprovedEmail({
        customerName: customer.displayName,
        address: `${sub.propertyAddress}, ${sub.propertyPlz} ${sub.propertyCity}`,
        shortCode,
        portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/abo`,
      }),
    });
  } catch (err) {
    console.error("[abo] approved mail failed", err);
  }

  revalidatePath("/studio/einreichungen");
  return { ok: true, shortCode };
}

export async function rejectSubmission(input: {
  submissionId: string;
  reason: string;
}) {
  const session = await requireCRM();
  const reason = input.reason.trim();
  if (reason.length < 3) throw new Error("Bitte einen kurzen Grund angeben.");

  const [sub] = await db
    .select()
    .from(propertySubmissions)
    .where(eq(propertySubmissions.id, input.submissionId))
    .limit(1);
  if (!sub) throw new Error("Einreichung nicht gefunden");

  await db
    .update(propertySubmissions)
    .set({
      status: "rejected",
      reviewNotes: reason,
      reviewedByUserId: session.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(propertySubmissions.id, input.submissionId));

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "reject",
    entityType: "property_submission",
    entityId: input.submissionId,
    payload: { reason },
  });

  try {
    const { AboSubmissionRejectedEmail } = await import(
      "@/emails/abo-submission-rejected"
    );
    await sendEmail({
      to: sub.submittedByEmail,
      from: "default",
      subject: "Rückfrage zu deinem eingereichten Objekt",
      template: "abo-submission-rejected",
      react: AboSubmissionRejectedEmail({
        address: `${sub.propertyAddress}, ${sub.propertyPlz} ${sub.propertyCity}`,
        reason,
        portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/abo`,
      }),
    });
  } catch (err) {
    console.error("[abo] rejected mail failed", err);
  }

  revalidatePath("/studio/einreichungen");
  return { ok: true };
}
