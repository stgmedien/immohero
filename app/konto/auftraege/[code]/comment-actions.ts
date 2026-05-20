"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { orders, orderComments, users, notifications, orderAttachments, auditLog } from "@/lib/db/schema";

export async function postClientComment(input: {
  orderShortCode: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Bitte zuerst anmelden." };

  const body = input.body.trim();
  if (body.length < 1) return { ok: false, error: "Kommentar darf nicht leer sein." };
  if (body.length > 4000) return { ok: false, error: "Kommentar ist zu lang." };

  const [order] = await db
    .select({ id: orders.id, shortCode: orders.shortCode })
    .from(orders)
    .where(eq(orders.shortCode, input.orderShortCode))
    .limit(1);
  if (!order) return { ok: false, error: "Auftrag nicht gefunden." };

  await db.insert(orderComments).values({
    orderId: order.id,
    source: "client",
    authorId: session.user.id,
    authorName: session.user.name ?? session.user.email ?? null,
    body,
  });

  // Team-Benachrichtigung
  try {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));
    await Promise.all(
      admins.map((a) =>
        db.insert(notifications).values({
          userId: a.id,
          type: "client_comment",
          title: `Neue Nachricht — ${order.shortCode}`,
          body: body.slice(0, 200),
          orderId: order.id,
        }),
      ),
    );
  } catch (err) {
    console.error("[comments] team notify failed", err);
  }

  revalidatePath(`/konto/auftraege/${order.shortCode}`);
  return { ok: true };
}

export async function addOrderAttachment(input: {
  orderShortCode: string;
  filename: string;
  blobUrl: string;
  blobPathname: string;
  sizeBytes: number;
  mimeType: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Bitte zuerst anmelden." };

  const [order] = await db
    .select({ id: orders.id, shortCode: orders.shortCode, customerId: orders.customerId })
    .from(orders)
    .where(eq(orders.shortCode, input.orderShortCode))
    .limit(1);
  if (!order) return { ok: false, error: "Auftrag nicht gefunden." };
  if (order.customerId && order.customerId !== session.user.id && session.user.role !== "admin") {
    return { ok: false, error: "Kein Zugriff." };
  }

  await db.insert(orderAttachments).values({
    orderId: order.id,
    uploadedByUserId: session.user.id,
    filename: input.filename.slice(0, 200),
    blobUrl: input.blobUrl,
    blobPathname: input.blobPathname,
    sizeBytes: input.sizeBytes,
    mimeType: input.mimeType,
    kind: "customer_supplied",
    note: input.note?.trim().slice(0, 1000) || null,
  });

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "attachment_added",
    entityType: "order",
    entityId: order.id,
    payload: { filename: input.filename },
  });

  try {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));
    await Promise.all(
      admins.map((a) =>
        db.insert(notifications).values({
          userId: a.id,
          type: "asset_uploaded",
          title: `Kunde hat Datei nachgereicht — ${order.shortCode}`,
          body: input.filename,
          orderId: order.id,
        }),
      ),
    );
  } catch (err) {
    console.error("[attachments] team notify failed", err);
  }

  revalidatePath(`/konto/auftraege/${order.shortCode}`);
  return { ok: true };
}
