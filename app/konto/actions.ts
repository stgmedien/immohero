"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users, customers, orders, auditLog, notifications } from "@/lib/db/schema";

export interface ProfileResult {
  ok: boolean;
  error?: string;
}

export async function updateProfile(input: {
  name: string;
  phone: string;
}): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, error: "Bitte zuerst anmelden." };
  }

  const name = input.name.trim();
  const phone = input.phone.trim();
  if (name.length < 2) {
    return { ok: false, error: "Bitte einen gültigen Namen angeben." };
  }
  if (phone && phone.replace(/[\s/+()-]/g, "").length < 6) {
    return { ok: false, error: "Telefonnummer scheint ungültig." };
  }

  await db
    .update(users)
    .set({ name, phone: phone || null })
    .where(eq(users.id, session.user.id));

  // Verknüpften CRM-Kunden (per E-Mail) konsistent halten, falls vorhanden.
  try {
    const email = session.user.email.toLowerCase();
    const matches = await db
      .select({ id: customers.id, primaryEmail: customers.primaryEmail })
      .from(customers)
      .limit(500);
    const mine = matches.filter(
      (c) => (c.primaryEmail ?? "").trim().toLowerCase() === email,
    );
    await Promise.all(
      mine.map((c) =>
        db
          .update(customers)
          .set({ displayName: name, primaryPhone: phone || null })
          .where(eq(customers.id, c.id)),
      ),
    );
  } catch (err) {
    console.error("[profile] customer sync failed", err);
  }

  revalidatePath("/konto/profil");
  return { ok: true };
}

export async function rescheduleShoot(input: {
  orderShortCode: string;
  newScheduledAt: string; // ISO
  note?: string;
}): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Bitte zuerst anmelden." };

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.shortCode, input.orderShortCode))
    .limit(1);
  if (!order) return { ok: false, error: "Auftrag nicht gefunden." };
  if (order.customerId && order.customerId !== session.user.id && session.user.role !== "admin") {
    return { ok: false, error: "Kein Zugriff auf diesen Auftrag." };
  }
  if (order.status === "cancelled" || order.status === "delivered") {
    return { ok: false, error: "Auftrag ist abgeschlossen oder storniert." };
  }

  const newDate = new Date(input.newScheduledAt);
  if (isNaN(newDate.getTime())) {
    return { ok: false, error: "Ungültiger Termin." };
  }
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (newDate < minDate) {
    return { ok: false, error: "Termine müssen mindestens 24 Stunden in der Zukunft liegen — schreib uns sonst kurz an hello@immohero.org." };
  }

  const previous = order.scheduledAt;

  await db
    .update(orders)
    .set({
      scheduledAt: newDate,
      reminder24SentAt: null,
      reminder2SentAt: null,
    })
    .where(eq(orders.id, order.id));

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "reschedule",
    entityType: "order",
    entityId: order.id,
    payload: {
      from: previous?.toISOString() ?? null,
      to: newDate.toISOString(),
      note: input.note ?? null,
    },
  });

  // Team in-app notification
  try {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));
    await Promise.all(
      admins.map((a) =>
        db.insert(notifications).values({
          userId: a.id,
          type: "status_change",
          title: `Termin verschoben — ${order.shortCode}`,
          body: `Neuer Termin: ${newDate.toLocaleString("de-DE")}${
            previous ? ` (vorher: ${previous.toLocaleString("de-DE")})` : ""
          }`,
          orderId: order.id,
        }),
      ),
    );
  } catch (err) {
    console.error("[reschedule] team notify failed", err);
  }

  revalidatePath(`/konto/auftraege/${order.shortCode}`);
  return { ok: true };
}
