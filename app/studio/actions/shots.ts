"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessStudio } from "@/lib/access";
import { db } from "@/lib/db/client";
import { orderShots, orders, auditLog } from "@/lib/db/schema";

async function requireStudio() {
  const session = await auth();
  if (!session?.user?.id || !canAccessStudio(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

const SHOT_STATUSES = ["planned", "done", "skipped", "reshoot"] as const;
type ShotStatus = (typeof SHOT_STATUSES)[number];

export async function updateShot(input: {
  shotId: string;
  name?: string;
  description?: string;
  notes?: string;
  priority?: "must" | "nice" | "optional";
  category?: string;
  perspective?: string;
  altitudeMeters?: number;
  movement?: string;
  durationSec?: number;
  referenceAssetUrl?: string | null;
}) {
  const session = await requireStudio();
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (k === "shotId") continue;
    if (v !== undefined) patch[k] = v;
  }
  await db.update(orderShots).set(patch).where(eq(orderShots.id, input.shotId));

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "update_shot",
    entityType: "shot",
    entityId: input.shotId,
    payload: patch,
  });

  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function setShotStatus(input: { shotId: string; status: string; notes?: string }) {
  const session = await requireStudio();
  if (!SHOT_STATUSES.includes(input.status as ShotStatus)) throw new Error("Invalid status");

  await db
    .update(orderShots)
    .set({
      status: input.status as ShotStatus,
      notes: input.notes,
      completedAt: input.status === "done" ? new Date() : null,
      completedById: input.status === "done" ? session.user.id : null,
    })
    .where(eq(orderShots.id, input.shotId));

  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function approveShot(input: { shotId: string; approved: boolean }) {
  await requireStudio();
  await db
    .update(orderShots)
    .set({
      isApproved: input.approved,
      approvedAt: input.approved ? new Date() : null,
    })
    .where(eq(orderShots.id, input.shotId));
  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function reorderShots(input: { orderId: string; shotIds: string[] }) {
  await requireStudio();

  // Update positions
  await Promise.all(
    input.shotIds.map((shotId, idx) =>
      db
        .update(orderShots)
        .set({ position: idx })
        .where(and(eq(orderShots.id, shotId), eq(orderShots.orderId, input.orderId))),
    ),
  );
  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function addShot(input: {
  orderId: string;
  name: string;
  description?: string;
  priority?: "must" | "nice" | "optional";
  category?: string;
  perspective?: string;
  altitudeMeters?: number;
  movement?: string;
  durationSec?: number;
}) {
  await requireStudio();

  // Determine next position
  const [maxPos] = await db
    .select({ max: sql<number>`coalesce(max(${orderShots.position}), -1)` })
    .from(orderShots)
    .where(eq(orderShots.orderId, input.orderId));

  await db.insert(orderShots).values({
    orderId: input.orderId,
    name: input.name,
    description: input.description ?? "",
    priority: input.priority ?? "nice",
    category: input.category,
    perspective: input.perspective,
    altitudeMeters: input.altitudeMeters,
    movement: input.movement,
    durationSec: input.durationSec,
    position: Number(maxPos?.max ?? -1) + 1,
    status: "planned",
  });
  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function deleteShot(input: { shotId: string }) {
  const session = await requireStudio();
  await db.delete(orderShots).where(eq(orderShots.id, input.shotId));
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "delete_shot",
    entityType: "shot",
    entityId: input.shotId,
  });
  revalidatePath("/studio/projekte/[code]", "layout");
}
