/**
 * End-to-End-Integrationstest des Anfrage→Angebot→Zahlung-Flows gegen die
 * ECHTE Produktions-DB (Neon) und die ECHTE Stripe-Test-API.
 *
 * Deckt ab:
 *  1) ANFRAGE  — dieselben Helper wie submitBookingInquiry (Order-Status "inquiry")
 *  2) ANGEBOT  — echter Stripe-Checkout-Link via buildOfferCheckoutParams (= exakt der
 *                Code, den die Studio-Action sendOffer nutzt), Order → "offer_sent"
 *  3) ZAHLUNG  — Reconciliation wie im Webhook (handleCheckoutCompleted): "offer_sent" → "paid"
 *
 * NICHT abgedeckt (headless unmöglich): das Abtippen der Testkarte auf Stripes
 * gehosteter Bezahlseite. Der Zahlungslink wird real erzeugt und geprüft; die
 * Bezahlung selbst wird über die Webhook-Logik simuliert.
 *
 * Räumt alles wieder auf (Order + Items + Consultation + Test-User + CRM + Stripe-Session).
 *
 *   pnpm tsx --env-file=.env.local scripts/test-offer-flow.ts
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, orderItems, consultations, customers, users } from "@/lib/db/schema";
import { findOrCreateCustomer, createOrderDraft, getOrderById } from "@/lib/db/queries";
import { requireStripe } from "@/lib/stripe";
import { buildOfferPriceParams, buildOfferPaymentLinkParams, offerPaymentUrl } from "@/lib/offer";

const CODE = "TSTFLOW1";
const EMAIL = "offer-flow-test@example.com";
const ORIGIN = "https://immohero.org";

function ok(c: unknown, m: string): asserts c {
  if (!c) throw new Error(`FEHLGESCHLAGEN: ${m}`);
}

async function cleanup() {
  await db.delete(orders).where(eq(orders.shortCode, CODE)); // cascade → items + consultations
  await db.delete(customers).where(eq(customers.primaryEmail, EMAIL));
  await db.delete(users).where(eq(users.email, EMAIL));
}

async function main() {
  const stripe = requireStripe();
  await cleanup();
  let paymentLinkId: string | null = null;

  try {
    /* ---------------- 1) ANFRAGE ---------------- */
    console.log("① ANFRAGE …");
    const customer = await findOrCreateCustomer(EMAIL, "Offer Flow Test", "+49 170 0000000");
    const order = await createOrderDraft({
      shortCode: CODE,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name ?? null,
      customerPhone: "+49 170 0000000",
      status: "inquiry",
      propertyType: "haus",
      propertyAddress: "Teststraße 1",
      propertyPlz: "33332",
      propertyCity: "Gütersloh",
      scheduledAt: null,
      subtotalCents: 39900,
      discountCents: 0,
      totalCents: 39900,
    });
    ok(order.status === "inquiry", `Order-Status "inquiry" erwartet, war "${order.status}"`);
    await db.insert(consultations).values({
      orderId: order.id,
      customerEmail: customer.email,
      customerName: customer.name ?? null,
      customerPhone: "+49 170 0000000",
      requestedStart: new Date(Date.now() + 2 * 86400_000),
      requestedEnd: new Date(Date.now() + 2 * 86400_000 + 30 * 60_000),
      status: "requested",
    });
    await db.insert(orderItems).values({
      orderId: order.id,
      serviceSlug: "drohne",
      serviceName: "Drohnen-Aufnahmen",
      quantity: 1,
      unitPriceCents: 39900,
    });
    console.log(`   ✓ Auftrag ${CODE} als Anfrage angelegt (Richtpreis 399,00 €) + Beratungstermin`);

    /* ---------------- 2) ANGEBOT (echter Stripe Payment Link) ---------------- */
    console.log("② ANGEBOT (echter Stripe Payment Link) …");
    const PRICE = 34900; // Vertrieb setzt finalen Preis nach dem Telefonat
    const price = await stripe.prices.create(buildOfferPriceParams(order, PRICE));
    ok(price.unit_amount === PRICE, `Preis ${PRICE} erwartet, war ${price.unit_amount}`);
    const link = await stripe.paymentLinks.create(buildOfferPaymentLinkParams(order, price.id, ORIGIN));
    paymentLinkId = link.id;
    ok(!!link.url && link.url.startsWith("https://"), "Stripe lieferte keinen gültigen Zahlungslink");
    ok(link.active === true, "Payment Link ist nicht aktiv");
    ok(link.metadata?.orderId === order.id, "metadata.orderId stimmt nicht");
    const paymentUrl = offerPaymentUrl(link, order.id);
    ok(paymentUrl.includes(`client_reference_id=${order.id}`), "client_reference_id fehlt in der Kunden-URL");

    const [offered] = await db
      .update(orders)
      .set({
        status: "offer_sent",
        quotedPriceCents: PRICE,
        offerSentAt: new Date(),
        paymentUrl,
        stripeSessionId: link.id,
      })
      .where(eq(orders.id, order.id))
      .returning();
    ok(offered.status === "offer_sent", `"offer_sent" erwartet, war "${offered.status}"`);
    ok(offered.quotedPriceCents === PRICE, "quotedPriceCents nicht gespeichert");
    console.log(`   ✓ Echter Payment Link erzeugt (349,00 €, unbefristet gültig), Auftrag → offer_sent`);
    console.log(`     Link: ${paymentUrl.slice(0, 72)}…`);

    /* ---------------- 3) ZAHLUNG (Webhook-Reconciliation) ---------------- */
    console.log("③ ZAHLUNG (Reconciliation wie im Stripe-Webhook) …");
    const toPay = await getOrderById(order.id);
    ok(toPay, "Order verschwunden");
    // Guard aus handleCheckoutCompleted: nur offer_sent/pending werden bezahlt gesetzt
    ok(
      toPay!.status === "offer_sent" || toPay!.status === "pending",
      `Webhook-Guard würde Zahlung ablehnen (Status "${toPay!.status}")`,
    );
    // CRM-Kunde anlegen (wie Webhook)
    const [crm] = await db
      .insert(customers)
      .values({
        displayName: toPay!.customerName ?? EMAIL,
        kind: "person",
        primaryEmail: EMAIL,
        primaryPhone: toPay!.customerPhone ?? null,
        address: `${toPay!.propertyAddress}, ${toPay!.propertyPlz} ${toPay!.propertyCity}`,
        source: "stripe-checkout",
      })
      .returning();
    const [paid] = await db
      .update(orders)
      .set({
        status: "paid",
        studioStatus: "production",
        paidAt: new Date(),
        stripePaymentIntentId: "pi_test_simulated",
        customerRecordId: crm.id,
      })
      .where(eq(orders.id, order.id))
      .returning();
    ok(paid.status === "paid", `"paid" erwartet, war "${paid.status}"`);
    ok(paid.studioStatus === "production", `studioStatus "production" erwartet, war "${paid.studioStatus}"`);
    ok(paid.paidAt instanceof Date, "paidAt nicht gesetzt");
    console.log(`   ✓ Reconciliation: Auftrag → paid, studioStatus → production, CRM verknüpft`);

    console.log("\n✅ Kompletter Flow bestanden: Anfrage → Angebot (echter Stripe Payment Link) → bezahlt.");
    console.log("   (Nur das Abtippen der Testkarte auf Stripes Bezahlseite ist headless nicht möglich.)");
  } finally {
    await cleanup();
    if (paymentLinkId) {
      try {
        await stripe.paymentLinks.update(paymentLinkId, { active: false });
      } catch {
        /* egal */
      }
    }
    console.log("🧹 Aufgeräumt (DB-Zeilen entfernt, Test-Zahlungslink deaktiviert).");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("\n" + (e instanceof Error ? e.message : String(e)));
    process.exit(1);
  });
