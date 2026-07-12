"use server";

/**
 * Vertriebs-Angebot: nach dem Telefonat setzt das Team einen finalen Preis,
 * erzeugt einen Stripe-Zahlungslink und schickt ihn dem Kunden per E-Mail.
 * Der Auftrag wandert von "inquiry" → "offer_sent"; der bestehende
 * Stripe-Webhook macht daraus bei Zahlung "paid".
 */
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { orders, auditLog } from "@/lib/db/schema";
import { getOrderById } from "@/lib/db/queries";
import { requireStripe } from "@/lib/stripe";
import { buildOfferPriceParams, buildOfferPaymentLinkParams, offerPaymentUrl } from "@/lib/offer";
import { sendEmail } from "@/lib/email";
import { OfferPaymentEmail } from "@/emails/offer-payment";

async function requireCRM() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export interface SendOfferResult {
  ok: boolean;
  error?: string;
  paymentUrl?: string;
}

export async function sendOffer(input: {
  orderId: string;
  priceCents: number;
  note?: string;
}): Promise<SendOfferResult> {
  const session = await requireCRM();

  const priceCents = Math.round(input.priceCents);
  if (!Number.isFinite(priceCents) || priceCents < 100) {
    return { ok: false, error: "Bitte einen Preis ab 1,00 € angeben." };
  }
  if (priceCents > 5_000_000) {
    return { ok: false, error: "Preis unplausibel hoch — bitte prüfen." };
  }

  const order = await getOrderById(input.orderId);
  if (!order) return { ok: false, error: "Auftrag nicht gefunden." };
  if (order.status === "paid") return { ok: false, error: "Auftrag ist bereits bezahlt." };
  if (order.status === "cancelled") return { ok: false, error: "Auftrag ist storniert." };

  const stripe = requireStripe();

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  // Alten Zahlungslink deaktivieren, falls erneut ein Angebot gesendet wird
  // (verhindert, dass der Kunde einen veralteten Preis bezahlt).
  if (order.stripeSessionId?.startsWith("plink_")) {
    try {
      await stripe.paymentLinks.update(order.stripeSessionId, { active: false });
    } catch (err) {
      console.error("[offer] deactivating old payment link failed", err);
    }
  }

  let paymentUrl: string;
  let paymentLinkId: string;
  try {
    const price = await stripe.prices.create(buildOfferPriceParams(order, priceCents));
    const link = await stripe.paymentLinks.create(buildOfferPaymentLinkParams(order, price.id, origin));
    if (!link.url) return { ok: false, error: "Stripe lieferte keinen Zahlungslink." };
    paymentLinkId = link.id;
    paymentUrl = offerPaymentUrl(link, order.id);
  } catch (err) {
    console.error("[offer] stripe payment link create failed", err);
    return { ok: false, error: "Zahlungslink konnte nicht erstellt werden (Stripe)." };
  }

  await db
    .update(orders)
    .set({
      status: "offer_sent",
      quotedPriceCents: priceCents,
      offerSentAt: new Date(),
      paymentUrl,
      stripeSessionId: paymentLinkId,
    })
    .where(eq(orders.id, order.id));

  try {
    await sendEmail({
      to: order.customerEmail,
      from: "bookingConfirmation",
      subject: `Dein ImmoHero-Angebot ${order.shortCode}`,
      template: "offer-payment",
      orderId: order.id,
      react: OfferPaymentEmail({
        customerName: order.customerName ?? null,
        shortCode: order.shortCode,
        priceCents,
        paymentUrl,
        propertyAddress: `${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`,
        note: input.note?.trim() || null,
      }),
    });
  } catch (err) {
    // Der Link ist gesetzt und im Studio kopierbar — Mail-Fehler blockt nicht.
    console.error("[offer] offer email failed", err);
  }

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "offer_sent",
    entityType: "order",
    entityId: order.id,
    payload: { priceCents, shortCode: order.shortCode },
  });

  revalidatePath(`/studio/projekte/${order.shortCode}/kunde`);
  revalidatePath(`/studio/projekte/${order.shortCode}`);
  revalidatePath("/studio/projekte");

  return { ok: true, paymentUrl };
}
