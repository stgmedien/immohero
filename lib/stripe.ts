import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) return null;
  cached = new Stripe(apiKey, {
    typescript: true,
    appInfo: { name: "ImmoHero", url: "https://immohero.org" },
  });
  return cached;
}

export function requireStripe(): Stripe {
  const client = getStripe();
  if (!client) throw new Error("Stripe is not configured (set STRIPE_SECRET_KEY).");
  return client;
}

const MESSE_COUPON_NAME = "ImmoHero Messe-Gutschein €15";
let cachedCouponId: string | null = null;

/**
 * Idempotent: returns the shared €15 coupon, creating it once. We look it up by
 * name (Stripe has no native idempotency for coupons by name, so we list and match).
 */
export async function getOrCreateMesseCoupon(): Promise<string> {
  if (cachedCouponId) return cachedCouponId;
  const stripe = requireStripe();

  const existing = await stripe.coupons.list({ limit: 100 });
  const match = existing.data.find(
    (c) => c.name === MESSE_COUPON_NAME && c.valid && c.amount_off === 1500 && c.currency === "eur",
  );
  if (match) {
    cachedCouponId = match.id;
    return match.id;
  }

  const coupon = await stripe.coupons.create({
    name: MESSE_COUPON_NAME,
    amount_off: 1500,
    currency: "eur",
    duration: "once",
    metadata: { campaign: "messe-2026" },
  });
  cachedCouponId = coupon.id;
  return coupon.id;
}

/**
 * Creates a single-use promotion code tied to the Messe coupon.
 * Enforces min order (€199) + 90-day expiry server-side via Stripe.
 */
export async function createVoucherPromotionCode(input: {
  code: string;
  couponId: string;
  expiresAt: Date;
  minOrderCents: number;
  email: string;
}): Promise<{ id: string }> {
  const stripe = requireStripe();
  const promo = await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: input.couponId },
    code: input.code,
    max_redemptions: 1,
    expires_at: Math.floor(input.expiresAt.getTime() / 1000),
    restrictions: {
      minimum_amount: input.minOrderCents,
      minimum_amount_currency: "eur",
      first_time_transaction: false,
    },
    metadata: { campaign: "messe-2026", email: input.email },
  });
  return { id: promo.id };
}
