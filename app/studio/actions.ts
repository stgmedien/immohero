"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { orderShots } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

const TEAM_ROLES = new Set(["photographer", "drone_pilot", "editor", "admin"]);

export async function updateShotStatus(input: { shotId: string; status: string; notes?: string | null }) {
  const session = await auth();
  if (!session?.user?.role || !TEAM_ROLES.has(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const allowed = ["planned", "done", "skipped", "reshoot"];
  if (!allowed.includes(input.status)) throw new Error("Invalid status");

  await db
    .update(orderShots)
    .set({
      status: input.status as "planned" | "done" | "skipped" | "reshoot",
      notes: input.notes ?? undefined,
      completedAt: input.status === "done" ? new Date() : null,
      completedById: input.status === "done" ? session.user.id : null,
    })
    .where(eq(orderShots.id, input.shotId));

  revalidatePath("/studio/projekte/[code]/feld", "page");
  revalidatePath("/studio/projekte/[code]", "page");
}
