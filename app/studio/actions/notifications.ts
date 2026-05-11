"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.user.id)));
  revalidatePath("/studio");
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, session.user.id), isNull(notifications.readAt)));
  revalidatePath("/studio");
}

export async function createNotification(input: {
  userId: string;
  type: "project_assignment" | "client_comment" | "share_approval" | "weather_warning" | "delivery_ready" | "status_change" | "asset_uploaded";
  title: string;
  body?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    orderId: input.orderId ?? null,
    metadata: input.metadata ?? null,
  });
}
