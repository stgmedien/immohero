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
