/**
 * Reine (test-bare) Bausteine für den Vertriebs-Angebots-Zahlungslink.
 * Bewusst KEINE "use server"-Datei, damit die Stripe-Parameter-Builder
 * sowohl von der Server-Action (app/studio/actions/offers.ts) als auch vom
 * Integrationstest (scripts/test-offer-flow.ts) mit identischem Code laufen.
 *
 * Wir nutzen Stripe PAYMENT LINKS (nicht Checkout Sessions): Checkout-Sessions
 * laufen nach max. 24 h ab — ungeeignet für ein Angebot, das der Kunde nach
 * einem Telefonat in Ruhe bezahlen soll. Payment Links bleiben gültig.
 */
import type Stripe from "stripe";

export interface OfferOrderInfo {
  id: string;
  shortCode: string;
  customerEmail: string;
  propertyAddress: string;
  propertyPlz: string;
  propertyCity: string;
}

/** Preis-Objekt (inline Produkt) für den Angebotspreis. */
export function buildOfferPriceParams(order: OfferOrderInfo, priceCents: number): Stripe.PriceCreateParams {
  return {
    currency: "eur",
    unit_amount: priceCents,
    product_data: { name: `ImmoHero Medienproduktion — Auftrag ${order.shortCode}` },
  };
}

/** Payment-Link-Parameter zum erzeugten Preis. */
export function buildOfferPaymentLinkParams(
  order: OfferOrderInfo,
  priceId: string,
  origin: string,
): Stripe.PaymentLinkCreateParams {
  return {
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { orderId: order.id, shortCode: order.shortCode },
    payment_intent_data: { metadata: { orderId: order.id } },
    payment_method_types: ["card", "sepa_debit", "klarna", "paypal"],
    // Nur EINE Zahlung pro Angebot zulassen (Payment Links sind sonst mehrfach zahlbar).
    restrictions: { completed_sessions: { limit: 1 } },
    billing_address_collection: "required",
    automatic_tax: { enabled: false },
    after_completion: {
      type: "redirect",
      redirect: { url: `${origin}/buchen/erfolg?order=${order.shortCode}` },
    },
  };
}

/**
 * Finale Kunden-URL: hängt client_reference_id an, damit der Webhook den
 * Auftrag der bezahlten Checkout-Session eindeutig zuordnen kann.
 */
export function offerPaymentUrl(link: { url: string }, orderId: string): string {
  const u = new URL(link.url);
  u.searchParams.set("client_reference_id", orderId);
  return u.toString();
}
