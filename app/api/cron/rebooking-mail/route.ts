import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, deliveries, customers } from "@/lib/db/schema";
import { isAuthorizedCron } from "@/lib/cron-auth";
import {
  getOrCreateReferralForCustomer,
  REFERRAL_DEFAULT_DISCOUNT_CENTS,
} from "@/lib/referrals";
import { sendEmail } from "@/lib/email";
import { getOrCreateFeedbackUrl } from "@/lib/feedback";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const candidates = await db
    .select({
      orderId: orders.id,
      shortCode: orders.shortCode,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      customerRecordId: orders.customerRecordId,
      sentAt: deliveries.sentAt,
    })
    .from(orders)
    .innerJoin(deliveries, eq(deliveries.orderId, orders.id))
    .where(
      and(
        isNull(orders.rebookingMailSentAt),
        lt(deliveries.sentAt, sevenDaysAgo),
      ),
    )
    .limit(50);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org";
  const { RebookingReferralEmail } = await import("@/emails/rebooking-referral");
  let sent = 0;
  for (const c of candidates) {
    try {
      // Code an den verknüpften CRM-Kunden binden, falls vorhanden — sonst überspringen
      if (!c.customerRecordId) continue;
      const referral = await getOrCreateReferralForCustomer(c.customerRecordId);
      const feedbackUrl = await getOrCreateFeedbackUrl(c.orderId);

      await sendEmail({
        to: c.customerEmail,
        from: "default",
        subject: "Danke! Dein Empfehlungs-Code wartet — €50 Rabatt",
        template: "rebooking-referral",
        orderId: c.orderId,
        react: RebookingReferralEmail({
          customerName: c.customerName ?? "",
          referralCode: referral.code,
          discountCents: REFERRAL_DEFAULT_DISCOUNT_CENTS,
          bookingUrl: `${baseUrl}/buchen`,
          feedbackUrl: feedbackUrl ?? undefined,
        }),
      });

      await db
        .update(orders)
        .set({ rebookingMailSentAt: new Date(), feedbackRequestedAt: new Date() })
        .where(eq(orders.id, c.orderId));
      sent++;
    } catch (err) {
      console.error("[cron/rebooking-mail] failed for", c.shortCode, err);
    }
  }

  return NextResponse.json({ ok: true, candidates: candidates.length, sent });
}
