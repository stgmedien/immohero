import { db } from "@/lib/db/client";
import { referralCodes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function rawCode(length = 5): string {
  let body = "";
  for (let i = 0; i < length; i++) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `IH-${body}`;
}

export interface ReferralRecord {
  id: string;
  code: string;
  discountCents: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: Date | null;
}

export const REFERRAL_DEFAULT_DISCOUNT_CENTS = 5000;

/** Idempotent: hole oder erstelle den Empfehlungs-Code für einen Kunden. */
export async function getOrCreateReferralForCustomer(
  customerId: string,
): Promise<ReferralRecord> {
  const existing = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.ownerCustomerId, customerId))
    .limit(1);
  if (existing[0]) return existing[0] as ReferralRecord;

  // Bis zu 5 Anläufe wegen Unique-Konflikt
  for (let i = 0; i < 5; i++) {
    const code = rawCode();
    try {
      const [row] = await db
        .insert(referralCodes)
        .values({
          code,
          ownerCustomerId: customerId,
          discountCents: REFERRAL_DEFAULT_DISCOUNT_CENTS,
          maxUses: null,
        })
        .returning();
      return row as ReferralRecord;
    } catch {
      // Code collision — neuen versuchen
    }
  }
  throw new Error("Could not create referral code");
}

/** Validiere einen Code; gibt das Rabatt-Detail zurück (oder null). */
export async function lookupReferral(code: string): Promise<ReferralRecord | null> {
  const normalized = code.trim().toUpperCase();
  if (!/^IH-[A-Z0-9]{4,8}$/.test(normalized)) return null;
  const rows = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, normalized))
    .limit(1);
  const row = rows[0] as ReferralRecord | undefined;
  if (!row) return null;
  if (row.expiresAt && row.expiresAt < new Date()) return null;
  if (row.maxUses && row.usesCount >= row.maxUses) return null;
  return row;
}

/** Inkrementiere den Use-Count nach erfolgreicher Buchung. */
export async function consumeReferral(code: string) {
  const normalized = code.trim().toUpperCase();
  await db
    .update(referralCodes)
    .set({ usesCount: sql`${referralCodes.usesCount} + 1` })
    .where(eq(referralCodes.code, normalized));
}

/** Aufzählung aller Codes eines Kunden + Statistiken. */
export async function listReferralsForCustomer(customerId: string) {
  return db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.ownerCustomerId, customerId));
}
