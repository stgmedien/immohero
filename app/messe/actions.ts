"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads, customers } from "@/lib/db/schema";
import {
  generateVoucherCode,
  voucherExpiry,
  VOUCHER_AMOUNT_CENTS,
  VOUCHER_MIN_ORDER_CENTS,
} from "@/lib/voucher";
import { getOrCreateMesseCoupon, createVoucherPromotionCode, getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { germanDate } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Bitte Namen angeben."),
  email: z.string().email("Bitte gültige E-Mail angeben."),
  phone: z.string().min(5, "Bitte Telefonnummer angeben."),
  consent: z.literal(true, { message: "Bitte der Datenverarbeitung zustimmen." }),
  website: z.string().optional(), // honeypot
});

export interface CaptureResult {
  ok: boolean;
  error?: string;
  voucherCode?: string;
  expiresAt?: string;
  email?: string;
  alreadyRegistered?: boolean;
}

export async function captureLeadAndIssueVoucher(input: unknown): Promise<CaptureResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Eingabe ungültig." };
  }
  const { name, email: rawEmail, phone, website } = parsed.data;

  // Honeypot: bots fill hidden field
  if (website && website.trim().length > 0) {
    return { ok: false, error: "Ungültige Anfrage." };
  }

  const email = rawEmail.trim().toLowerCase();

  // Dedupe: same email → return existing voucher
  const existing = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
  if (existing[0]) {
    return {
      ok: true,
      voucherCode: existing[0].voucherCode,
      expiresAt: germanDate(existing[0].expiresAt),
      email,
      alreadyRegistered: true,
    };
  }

  const code = generateVoucherCode();
  const expiresAt = voucherExpiry();

  // Create Stripe coupon + promotion code (best effort — lead is saved even if Stripe is down)
  let stripeCouponId: string | null = null;
  let stripePromotionCodeId: string | null = null;
  if (getStripe()) {
    try {
      const couponId = await getOrCreateMesseCoupon();
      const promo = await createVoucherPromotionCode({
        code,
        couponId,
        expiresAt,
        minOrderCents: VOUCHER_MIN_ORDER_CENTS,
        email,
      });
      stripeCouponId = couponId;
      stripePromotionCodeId = promo.id;
    } catch (err) {
      console.error("[messe] Stripe promo code creation failed", err);
      return {
        ok: false,
        error: "Gutschein konnte nicht erstellt werden. Bitte Standpersonal ansprechen.",
      };
    }
  }

  const [lead] = await db
    .insert(leads)
    .values({
      name: name.trim(),
      email,
      phone: phone.trim(),
      voucherCode: code,
      voucherAmountCents: VOUCHER_AMOUNT_CENTS,
      minOrderCents: VOUCHER_MIN_ORDER_CENTS,
      stripeCouponId,
      stripePromotionCodeId,
      consentMarketing: true,
      consentAt: new Date(),
      source: "messe-2026",
      expiresAt,
    })
    .returning();

  // Mirror into CRM (best effort, non-blocking)
  try {
    const crmExisting = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.primaryEmail, email))
      .limit(1);
    if (!crmExisting[0]) {
      await db.insert(customers).values({
        displayName: name.trim(),
        kind: "person",
        primaryEmail: email,
        primaryPhone: phone.trim(),
        source: "messe-2026",
      });
    }
  } catch (err) {
    console.error("[messe] CRM mirror failed", err);
  }

  // Send voucher email (best effort)
  try {
    const { VoucherEmail } = await import("@/emails/voucher");
    await sendEmail({
      to: email,
      from: "voucher",
      subject: `Dein 15 €-Gutschein für ImmoHero — ${code}`,
      template: "voucher",
      react: VoucherEmail({
        name: name.trim().split(" ")[0],
        voucherCode: code,
        amountEuro: "15 €",
        minOrderEuro: "199 €",
        expiresAt: germanDate(expiresAt),
        bookingUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/buchen`,
      }),
    });
  } catch (err) {
    console.error("[messe] voucher email failed", err);
  }

  return {
    ok: true,
    voucherCode: lead.voucherCode,
    expiresAt: germanDate(lead.expiresAt),
    email,
  };
}
