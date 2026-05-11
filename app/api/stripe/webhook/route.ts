import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { requireStripe } from "@/lib/stripe";
import { db } from "@/lib/db/client";
import { orders, orderItems, users, customers } from "@/lib/db/schema";
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
        const session = event.data.object as { metadata?: { orderId?: string } };
        if (session.metadata?.orderId) {
          await db
            .update(orders)
            .set({ status: "cancelled" })
            .where(eq(orders.id, session.metadata.orderId));
        }
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
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await getOrderById(orderId);
  if (!order || order.status !== "pending") return;

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

  if (typeof session.customer === "string" && order.customerId) {
    await db
      .update(users)
      .set({ stripeCustomerId: session.customer })
      .where(eq(users.id, order.customerId));
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

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
        scheduledAt: order.scheduledAt?.toISOString() ?? new Date().toISOString(),
        propertyAddress: `${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`,
        items: items.map((i) => ({ name: i.serviceName, priceCents: i.unitPriceCents })),
        totalCents: order.totalCents,
        portalUrl,
      }),
    });
  } catch (err) {
    console.error("[stripe-webhook] could not send confirmation mail", err);
  }
}
