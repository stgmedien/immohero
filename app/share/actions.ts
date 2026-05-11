"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  orders,
  orderShots,
  orderShotComments,
  orderAssignments,
  auditLog,
} from "@/lib/db/schema";
import { createNotification } from "@/app/studio/actions/notifications";

async function getOrderByToken(token: string) {
  if (!token || token.length < 16) throw new Error("Invalid token");
  const [order] = await db.select().from(orders).where(eq(orders.shareToken, token)).limit(1);
  if (!order) throw new Error("Not found");
  if (order.studioStatus === "draft" || order.studioStatus === "archived") {
    throw new Error("Not available");
  }
  return order;
}

export async function submitShotApproval(input: { token: string; shotId: string; approved: boolean }) {
  const order = await getOrderByToken(input.token);

  // Make sure shot belongs to this order
  const [shot] = await db
    .select()
    .from(orderShots)
    .where(and(eq(orderShots.id, input.shotId), eq(orderShots.orderId, order.id)))
    .limit(1);
  if (!shot) throw new Error("Shot not found");

  await db
    .update(orderShots)
    .set({
      isApproved: input.approved,
      approvedAt: input.approved ? new Date() : null,
      approvedByClient: input.approved,
    })
    .where(eq(orderShots.id, input.shotId));

  // Check if all are approved → set studioStatus to approved
  const allShots = await db
    .select({ isApproved: orderShots.isApproved })
    .from(orderShots)
    .where(eq(orderShots.orderId, order.id));
  const allApproved = allShots.length > 0 && allShots.every((s) => s.isApproved);
  if (allApproved && order.studioStatus !== "approved") {
    await db
      .update(orders)
      .set({ studioStatus: "approved", clientApproval: "approved" })
      .where(eq(orders.id, order.id));

    // Notify all assignees
    const assignments = await db
      .select({ userId: orderAssignments.userId })
      .from(orderAssignments)
      .where(eq(orderAssignments.orderId, order.id));
    await Promise.all(
      assignments.map((a) =>
        createNotification({
          userId: a.userId,
          type: "share_approval",
          title: `Kunde hat alle Shots freigegeben — ${order.shortCode}`,
          orderId: order.id,
        }),
      ),
    );
  }

  await db.insert(auditLog).values({
    userId: null,
    userName: "Kunde (Share)",
    action: input.approved ? "client_approve_shot" : "client_unapprove_shot",
    entityType: "shot",
    entityId: input.shotId,
  });

  revalidatePath(`/share/${input.token}`);
}

export async function submitAllApproval(token: string) {
  const order = await getOrderByToken(token);

  await db
    .update(orderShots)
    .set({
      isApproved: true,
      approvedAt: new Date(),
      approvedByClient: true,
    })
    .where(eq(orderShots.orderId, order.id));

  await db
    .update(orders)
    .set({ studioStatus: "approved", clientApproval: "approved" })
    .where(eq(orders.id, order.id));

  const assignments = await db
    .select({ userId: orderAssignments.userId })
    .from(orderAssignments)
    .where(eq(orderAssignments.orderId, order.id));
  await Promise.all(
    assignments.map((a) =>
      createNotification({
        userId: a.userId,
        type: "share_approval",
        title: `Kunde hat alle Shots freigegeben — ${order.shortCode}`,
        orderId: order.id,
      }),
    ),
  );

  await db.insert(auditLog).values({
    userId: null,
    userName: "Kunde (Share)",
    action: "client_approve_all",
    entityType: "order",
    entityId: order.id,
  });

  revalidatePath(`/share/${token}`);
}

export async function submitShotComment(input: {
  token: string;
  shotId: string;
  body: string;
  authorName: string;
}) {
  const order = await getOrderByToken(input.token);
  const [shot] = await db
    .select()
    .from(orderShots)
    .where(and(eq(orderShots.id, input.shotId), eq(orderShots.orderId, order.id)))
    .limit(1);
  if (!shot) throw new Error("Shot not found");

  if (!input.body.trim() || !input.authorName.trim()) throw new Error("Eingaben fehlen");

  await db.insert(orderShotComments).values({
    orderShotId: input.shotId,
    source: "client",
    authorName: input.authorName.trim().slice(0, 100),
    body: input.body.trim().slice(0, 5000),
  });

  // Move project to revision if it was in client_approval
  if (order.studioStatus === "client_approval") {
    await db
      .update(orders)
      .set({ studioStatus: "revision" })
      .where(eq(orders.id, order.id));
  }

  // Notify assignees
  const assignments = await db
    .select({ userId: orderAssignments.userId })
    .from(orderAssignments)
    .where(eq(orderAssignments.orderId, order.id));
  await Promise.all(
    assignments.map((a) =>
      createNotification({
        userId: a.userId,
        type: "client_comment",
        title: `Kunden-Kommentar — ${order.shortCode}`,
        body: input.body.slice(0, 120),
        orderId: order.id,
      }),
    ),
  );

  revalidatePath(`/share/${input.token}`);
}
