import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { requireStripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { orders, orderItems, users, customers, leads } from "@/lib/db/schema";
import { getOrderById } from "@/lib/db/queries";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = requireStripe();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case "payment_intent.payment_failed":
      case "checkout.session.expired": {
        // Im Anfrage-Modell darf ein abgelaufener/fehlgeschlagener Zahlungslink
        // die Anfrage NICHT stornieren — das Team schickt bei Bedarf einfach
        // erneut ein Angebot (sendOffer). Nur protokollieren.
        const session = event.data.object as { metadata?: { orderId?: string } };
        console.warn("[stripe-webhook] payment link expired/failed for order", session.metadata?.orderId);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] processing failed", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Direkter Checkout (Legacy): orderId in der Session-Metadata.
  // Payment Link (Angebot): orderId als client_reference_id an der URL.
  const orderId = session.metadata?.orderId ?? session.client_reference_id ?? undefined;
  if (!orderId) return;

  const order = await getOrderById(orderId);
  // Zahlbar sind Aufträge mit gesendetem Angebot ("offer_sent") sowie
  // Legacy-Direkt-Checkouts ("pending"). Alles andere ignorieren (Idempotenz).
  if (!order || (order.status !== "offer_sent" && order.status !== "pending")) return;

  // Get-or-create customer in CRM table
  const email = order.customerEmail.toLowerCase();
  let crmCustomer = await db
    .select()
    .from(customers)
    .where(eq(customers.primaryEmail, email))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!crmCustomer) {
    [crmCustomer] = await db
      .insert(customers)
      .values({
        displayName: order.customerName ?? email,
        kind: "person",
        primaryEmail: email,
        primaryPhone: order.customerPhone ?? null,
        address: `${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`,
        source: "stripe-checkout",
      })
      .returning();
  }

  await db
    .update(orders)
    .set({
      status: "paid",
      studioStatus: "production",
      paidAt: new Date(),
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
      customerRecordId: crmCustomer?.id ?? null,
    })
    .where(eq(orders.id, orderId));

  // Voucher redemption tracking — match promotion code → mark lead redeemed
  try {
    const stripe = requireStripe();
    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["discounts.promotion_code"],
    });
    const discount = full.discounts?.[0];
    const promo = discount?.promotion_code;
    const promoId = typeof promo === "string" ? promo : promo?.id;
    if (promoId) {
      await db
        .update(leads)
        .set({ redeemedAt: new Date(), redeemedOrderId: orderId })
        .where(eq(leads.stripePromotionCodeId, promoId));
    }
  } catch (err) {
    console.error("[stripe-webhook] voucher redemption tracking failed", err);
  }

  if (typeof session.customer === "string" && order.customerId) {
    await db
      .update(users)
      .set({ stripeCustomerId: session.customer })
      .where(eq(users.id, order.customerId));
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  // Consultation slot for this order (if any)
  let consultationStart: Date | null = null;
  try {
    const { consultations } = await import("@/lib/db/schema");
    const [c] = await db
      .select({ start: consultations.requestedStart })
      .from(consultations)
      .where(eq(consultations.orderId, order.id))
      .limit(1);
    consultationStart = c?.start ?? null;
  } catch (err) {
    console.error("[stripe-webhook] consultation lookup failed", err);
  }

  try {
    const { BookingConfirmationEmail } = await import("@/emails/booking-confirmation");
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/konto`;
    await sendEmail({
      to: order.customerEmail,
      from: "bookingConfirmation",
      subject: `ImmoHero — Buchung ${order.shortCode} bestätigt`,
      template: "booking-confirmation",
      orderId: order.id,
      react: BookingConfirmationEmail({
        customerName: order.customerName ?? "",
        shortCode: order.shortCode,
        scheduledAt: consultationStart?.toISOString() ?? new Date().toISOString(),
        isConsultation: true,
        propertyAddress: `${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`,
        items: items.map((i) => ({ name: i.serviceName, priceCents: i.unitPriceCents })),
        totalCents: order.quotedPriceCents ?? order.totalCents,
        portalUrl,
      }),
    });
  } catch (err) {
    console.error("[stripe-webhook] could not send confirmation mail", err);
  }
}
