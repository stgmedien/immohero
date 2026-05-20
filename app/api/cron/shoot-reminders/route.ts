import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, isNull, lte, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, customers } from "@/lib/db/schema";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendEmail } from "@/lib/email";
import { sendWhatsApp, sendSms } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in26h = new Date(now.getTime() + 26 * 60 * 60 * 1000);
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const { ShootReminderEmail } = await import("@/emails/shoot-reminder");

  // 24h-Erinnerungen: scheduledAt zwischen jetzt+24h und jetzt+26h, kein Cancel/Delivered
  const for24h = await db
    .select()
    .from(orders)
    .where(
      and(
        ne(orders.status, "cancelled"),
        ne(orders.status, "delivered"),
        isNull(orders.reminder24SentAt),
        gte(orders.scheduledAt, in24h),
        lte(orders.scheduledAt, in26h),
      ),
    )
    .limit(50);

  // 2h-Erinnerungen
  const for2h = await db
    .select()
    .from(orders)
    .where(
      and(
        ne(orders.status, "cancelled"),
        ne(orders.status, "delivered"),
        isNull(orders.reminder2SentAt),
        gte(orders.scheduledAt, in2h),
        lte(orders.scheduledAt, in3h),
      ),
    )
    .limit(50);

  let sent = 0;
  for (const o of for24h) {
    if (!o.scheduledAt || !o.customerEmail) continue;
    try {
      await sendEmail({
        to: o.customerEmail,
        from: "default",
        subject: `Erinnerung — morgen Termin (${o.shortCode})`,
        template: "shoot-reminder-24h",
        orderId: o.id,
        react: ShootReminderEmail({
          customerName: o.customerName ?? "",
          shortCode: o.shortCode,
          scheduledAt: o.scheduledAt.toISOString(),
          propertyAddress: `${o.propertyAddress}, ${o.propertyPlz} ${o.propertyCity}`,
          hoursUntil: 24,
        }),
      });
      await db
        .update(orders)
        .set({ reminder24SentAt: new Date() })
        .where(eq(orders.id, o.id));
      sent++;
      await maybeSendChannel(o, 24);
    } catch (err) {
      console.error("[cron/shoot-reminders] 24h failed", o.shortCode, err);
    }
  }
  for (const o of for2h) {
    if (!o.scheduledAt || !o.customerEmail) continue;
    try {
      await sendEmail({
        to: o.customerEmail,
        from: "default",
        subject: `Letzte Erinnerung — Termin in 2 Std. (${o.shortCode})`,
        template: "shoot-reminder-2h",
        orderId: o.id,
        react: ShootReminderEmail({
          customerName: o.customerName ?? "",
          shortCode: o.shortCode,
          scheduledAt: o.scheduledAt.toISOString(),
          propertyAddress: `${o.propertyAddress}, ${o.propertyPlz} ${o.propertyCity}`,
          hoursUntil: 2,
        }),
      });
      await db
        .update(orders)
        .set({ reminder2SentAt: new Date() })
        .where(eq(orders.id, o.id));
      sent++;
      await maybeSendChannel(o, 2);
    } catch (err) {
      console.error("[cron/shoot-reminders] 2h failed", o.shortCode, err);
    }
  }

  return NextResponse.json({
    ok: true,
    candidates24h: for24h.length,
    candidates2h: for2h.length,
    sent,
  });
}

async function maybeSendChannel(o: typeof orders.$inferSelect, hours: number) {
  if (!o.customerRecordId || !o.scheduledAt) return;
  const [c] = await db
    .select({
      preferredChannel: customers.preferredChannel,
      whatsappPhone: customers.whatsappPhone,
      primaryPhone: customers.primaryPhone,
    })
    .from(customers)
    .where(eq(customers.id, o.customerRecordId))
    .limit(1);
  if (!c) return;
  const phone = c.whatsappPhone ?? c.primaryPhone;
  if (!phone) return;
  const when = o.scheduledAt.toLocaleString("de-DE", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  const body = `ImmoHero: Erinnerung an deinen Termin ${
    hours === 24 ? "morgen" : "in 2 Std."
  } (${when}). Auftrag ${o.shortCode}. Antworte einfach hier, wenn etwas dazwischenkommt.`;
  try {
    if (c.preferredChannel === "whatsapp") await sendWhatsApp(phone, body);
    else if (c.preferredChannel === "sms") await sendSms(phone, body);
  } catch (err) {
    console.error("[cron/shoot-reminders] channel send failed", err);
  }
}
