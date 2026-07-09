"use server";

import { redirect } from "next/navigation";
import { bookingDraftSchema, summarizeBooking, type BookingDraft } from "@/lib/booking";
import { isPlzInServiceArea, createOrderDraft, findOrCreateCustomer, getServiceArea } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { orderItems, orderShots } from "@/lib/db/schema";
import { generateShortCode } from "@/lib/short-code";
import { getBundle, getService } from "@/lib/services";
import { shotsForOrder } from "@/lib/shots";
import { sendEmail } from "@/lib/email";
import { InquiryReceivedEmail } from "@/emails/inquiry-received";
import { DEMO_MODE, demoCityForPlz } from "@/lib/demo";

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
  if (DEMO_MODE) {
    return { ok: true, ...demoCityForPlz(plz) };
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

/**
 * Nimmt eine unverbindliche Buchungs-ANFRAGE entgegen (kein Zahlungsschritt).
 * Der Auftrag entsteht mit Status "inquiry" + Beratungstermin. Nach dem
 * Vertriebsgespräch schickt das Team im Studio Preis + Zahlungslink
 * (siehe app/studio/actions/offers.ts → sendOffer).
 */
export async function submitBookingInquiry(payload: BookingDraft) {
  // Demo-Modus: Funnel klickbar machen ohne DB. Form validieren,
  // dann direkt zur Bestätigungsseite (ohne ?anfrage, damit kein DB-Lookup passiert).
  if (DEMO_MODE) {
    bookingDraftSchema.parse(payload);
    redirect("/buchen/erfolg?demo=1");
  }

  const draft = bookingDraftSchema.parse(payload);

  const plzOk = await isPlzInServiceArea(draft.property.plz);
  if (!plzOk) {
    // Sanfter UX-Pfad: zurück zur Adress-Eingabe mit Fehler-Flag — der User
    // sieht dort eine Erklärung und kann die PLZ direkt korrigieren.
    redirect("/buchen/adresse?error=plz");
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

  const order = await createOrderDraft({
    shortCode,
    customerId: customer.id,
    customerEmail: customer.email,
    customerName: customer.name ?? null,
    customerPhone: draft.customer.phone,
    status: "inquiry",
    bundleSlug: draft.bundleSlug ?? null,
    propertyType: draft.property.type,
    propertyAddress: draft.property.address,
    propertyPlz: draft.property.plz,
    propertyCity: draft.property.city,
    propertySizeQm: draft.property.sizeQm ?? null,
    propertyNotes: draft.property.notes ?? null,
    // Shoot date is determined during the consultation call, not at booking.
    scheduledAt: null,
    // Katalog-Werte als unverbindlicher Richtpreis — der finale Preis kommt
    // nach dem Vertriebsgespräch (quotedPriceCents).
    subtotalCents: summary.subtotalCents,
    discountCents: summary.discountCents,
    totalCents: summary.totalCents,
  });

  // Consultation request from the chosen slot (status 'requested' — a sales
  // rep accepts it in the Studio, which then syncs it to Google Calendar).
  let consultationStart: Date | null = null;
  try {
    const { consultations } = await import("@/lib/db/schema");
    const { consultationWindow } = await import("@/lib/consultation");
    const startIso = draft.schedule.slotStart
      ? new Date(draft.schedule.slotStart).toISOString()
      : new Date(`${draft.schedule.date}T${draft.schedule.timeSlot}:00+02:00`).toISOString();
    const { start, end } = consultationWindow(startIso);
    consultationStart = start;
    await db.insert(consultations).values({
      orderId: order.id,
      customerEmail: customer.email,
      customerName: customer.name ?? null,
      customerPhone: draft.customer.phone,
      requestedStart: start,
      requestedEnd: end,
      status: "requested",
      customerNote: draft.property.notes ?? null,
    });
  } catch (err) {
    console.error("[booking] consultation insert failed", err);
  }

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

  // Anfrage-Bestätigung an den Kunden (best-effort — blockt die Anfrage nicht).
  try {
    const whenLabel = consultationStart
      ? consultationStart.toLocaleString("de-DE", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }) + " Uhr"
      : null;
    await sendEmail({
      to: customer.email,
      subject: `Deine Anfrage ${shortCode} ist bei uns`,
      template: "inquiry-received",
      from: "bookingConfirmation",
      orderId: order.id,
      react: InquiryReceivedEmail({
        customerName: customer.name ?? null,
        shortCode,
        items: summary.items.map((i) => ({ name: i.name, priceCents: i.priceCents })),
        estimateCents: summary.totalCents,
        propertyAddress: `${draft.property.address}, ${draft.property.plz} ${draft.property.city}`,
        whenLabel,
      }),
    });
  } catch (err) {
    console.error("[booking] inquiry email failed", err);
  }

  redirect(`/buchen/erfolg?anfrage=${order.shortCode}`);
}
