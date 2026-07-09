/**
 * LLM-/HTTP-freier Laufzeit-Test des Anfrage→Angebot-Datenkontrakts:
 * bestätigt, dass die Enum-Werte 'inquiry'/'offer_sent' und die neuen
 * Angebots-Spalten real in Postgres schreib- und lesbar sind. Räumt auf.
 *
 *   pnpm tsx --env-file=.env.local scripts/test-inquiry-offer.ts
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { getProjectByShortCode } from "@/lib/db/project-queries";

const CODE = "TESTINQ9";

function assert(c: unknown, m: string): asserts c {
  if (!c) throw new Error(`ASSERT: ${m}`);
}

async function cleanup() {
  await db.delete(orders).where(eq(orders.shortCode, CODE));
}

async function main() {
  await cleanup();

  // 1) Anfrage anlegen (Enum 'inquiry')
  const [created] = await db
    .insert(orders)
    .values({
      shortCode: CODE,
      customerEmail: "inquiry-test@example.com",
      customerName: "Inquiry Test",
      status: "inquiry",
      propertyType: "haus",
      propertyAddress: "Teststr. 1",
      propertyPlz: "33332",
      propertyCity: "Gütersloh",
      subtotalCents: 39900,
      discountCents: 0,
      totalCents: 39900,
    })
    .returning();
  assert(created.status === "inquiry", `status inquiry erwartet, war ${created.status}`);
  assert(created.quotedPriceCents === null, "quotedPriceCents muss initial null sein");
  assert(created.paymentUrl === null, "paymentUrl muss initial null sein");
  console.log("Anfrage angelegt:", created.shortCode, created.status);

  // 2) getProjectByShortCode liefert die neuen Felder (OfferPanel-Props)
  const proj = await getProjectByShortCode(CODE);
  assert(proj, "Projekt-Query lieferte null");
  assert("quotedPriceCents" in proj, "quotedPriceCents fehlt in der Query");
  assert("offerSentAt" in proj, "offerSentAt fehlt in der Query");
  assert("paymentUrl" in proj, "paymentUrl fehlt in der Query");

  // 3) Angebot senden simulieren (Enum 'offer_sent' + Spalten)
  const [offered] = await db
    .update(orders)
    .set({
      status: "offer_sent",
      quotedPriceCents: 34900,
      offerSentAt: new Date(),
      paymentUrl: "https://checkout.stripe.com/c/pay/test_123",
      stripeSessionId: "cs_test_123",
    })
    .where(eq(orders.shortCode, CODE))
    .returning();
  assert(offered.status === "offer_sent", `offer_sent erwartet, war ${offered.status}`);
  assert(offered.quotedPriceCents === 34900, "quotedPriceCents nicht gespeichert");
  assert(offered.offerSentAt instanceof Date, "offerSentAt nicht gesetzt");
  assert(offered.paymentUrl?.includes("stripe"), "paymentUrl nicht gespeichert");
  console.log("Angebot gesetzt:", offered.status, offered.quotedPriceCents, "Cent");

  await cleanup();
  console.log("Aufgeräumt. ✓");
  console.log("\n✅ Anfrage→Angebot-Datenkontrakt (Enum + Spalten) funktioniert zur Laufzeit.");
}

main()
  .then(() => process.exit(0))
  .catch(async (e) => {
    console.error(e);
    try {
      await cleanup();
    } catch {}
    process.exit(1);
  });
