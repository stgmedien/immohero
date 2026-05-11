"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessStudio, canCreateProjects } from "@/lib/access";
import { db } from "@/lib/db/client";
import {
  orders,
  orderShots,
  orderItems,
  orderAssignments,
  orderComments,
  auditLog,
} from "@/lib/db/schema";
import { createNotification } from "./notifications";
import { shotsForOrder } from "@/lib/shots";

const STUDIO_STATUSES = [
  "draft",
  "production",
  "client_approval",
  "revision",
  "approved",
  "completed",
  "archived",
] as const;
type StudioStatus = (typeof STUDIO_STATUSES)[number];

async function recordAudit(
  userId: string | null,
  userName: string | null,
  action: string,
  entityType: string,
  entityId: string,
  payload?: Record<string, unknown>,
) {
  await db.insert(auditLog).values({
    userId,
    userName,
    action,
    entityType,
    entityId,
    payload: payload ?? null,
  });
}

async function requireStudio() {
  const session = await auth();
  if (!session?.user?.id || !canAccessStudio(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function setStudioStatus(orderId: string, status: string) {
  const session = await requireStudio();
  if (!STUDIO_STATUSES.includes(status as StudioStatus)) {
    throw new Error("Invalid status");
  }
  await db
    .update(orders)
    .set({ studioStatus: status as StudioStatus })
    .where(eq(orders.id, orderId));

  await recordAudit(
    session.user.id,
    session.user.name ?? null,
    "studio_status_change",
    "order",
    orderId,
    { status },
  );

  // Notify assignees
  const assignments = await db
    .select({ userId: orderAssignments.userId })
    .from(orderAssignments)
    .where(eq(orderAssignments.orderId, orderId));
  await Promise.all(
    assignments.map((a) =>
      createNotification({
        userId: a.userId,
        type: "status_change",
        title: `Status geändert: ${status}`,
        orderId,
      }),
    ),
  );

  revalidatePath(`/studio/projekte/[code]`, "page");
  revalidatePath(`/studio/projekte/[code]/einstellungen`, "page");
  revalidatePath("/studio/dashboard");
}

export async function updateProjectMeta(input: {
  orderId: string;
  title?: string;
  scheduledAt?: string;
  estimatedDeliveryAt?: string;
  propertyNotes?: string;
  deliveryNotesInternal?: string;
}) {
  await requireStudio();
  const patch: Partial<typeof orders.$inferInsert> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.scheduledAt !== undefined) patch.scheduledAt = new Date(input.scheduledAt);
  if (input.estimatedDeliveryAt !== undefined)
    patch.estimatedDeliveryAt = new Date(input.estimatedDeliveryAt);
  if (input.propertyNotes !== undefined) patch.propertyNotes = input.propertyNotes;
  if (input.deliveryNotesInternal !== undefined)
    patch.deliveryNotesInternal = input.deliveryNotesInternal;

  await db.update(orders).set(patch).where(eq(orders.id, input.orderId));
  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function regenerateShareToken(orderId: string) {
  const session = await requireStudio();
  await db
    .update(orders)
    .set({
      shareToken: sql`replace(gen_random_uuid()::text, '-', '')`,
    })
    .where(eq(orders.id, orderId));

  await recordAudit(
    session.user.id,
    session.user.name ?? null,
    "regenerate_share_token",
    "order",
    orderId,
  );

  revalidatePath("/studio/projekte/[code]/share", "page");
}

export async function archiveOrder(orderId: string) {
  const session = await requireStudio();
  await db
    .update(orders)
    .set({ archivedAt: new Date(), studioStatus: "archived" })
    .where(eq(orders.id, orderId));
  await recordAudit(session.user.id, session.user.name ?? null, "archive", "order", orderId);
  revalidatePath("/studio/projekte/[code]", "layout");
  redirect("/studio/projekte");
}

export async function unarchiveOrder(orderId: string) {
  const session = await requireStudio();
  await db
    .update(orders)
    .set({ archivedAt: null, studioStatus: "production" })
    .where(eq(orders.id, orderId));
  await recordAudit(session.user.id, session.user.name ?? null, "unarchive", "order", orderId);
  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function regenerateShotlist(orderId: string) {
  const session = await requireStudio();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Order not found");

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const stylePackages = new Set<string>();
  const { getService } = await import("@/lib/services");
  for (const item of items) {
    const svc = getService(item.serviceSlug);
    if (svc) stylePackages.add(svc.stylePackage);
  }

  const shots = shotsForOrder(order.propertyType, Array.from(stylePackages));

  // Delete existing shots and recreate
  await db.delete(orderShots).where(eq(orderShots.orderId, orderId));
  if (shots.length > 0) {
    await db.insert(orderShots).values(
      shots.map((s, idx) => ({
        orderId,
        shotDefinitionId: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        perspective: s.perspective,
        altitudeMeters: Math.round(s.altitudeMeters),
        movement: s.movement,
        durationSec: s.durationSec,
        priority: s.priority,
        position: idx,
        status: "planned" as const,
      })),
    );
  }

  await recordAudit(
    session.user.id,
    session.user.name ?? null,
    "regenerate_shotlist",
    "order",
    orderId,
    { count: shots.length },
  );

  revalidatePath("/studio/projekte/[code]", "layout");
}
