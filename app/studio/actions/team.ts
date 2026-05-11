"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageTeam } from "@/lib/access";
import { db } from "@/lib/db/client";
import { users, auditLog } from "@/lib/db/schema";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !canManageTeam(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

const ROLES = ["customer", "photographer", "drone_pilot", "editor", "admin"] as const;
type Role = (typeof ROLES)[number];

const STATUSES = ["active", "pending", "suspended"] as const;
type Status = (typeof STATUSES)[number];

export async function updateUserRole(input: { userId: string; role: string }) {
  const session = await requireAdmin();
  if (!ROLES.includes(input.role as Role)) throw new Error("Invalid role");
  await db.update(users).set({ role: input.role as Role }).where(eq(users.id, input.userId));
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "set_role",
    entityType: "user",
    entityId: input.userId,
    payload: { role: input.role },
  });
  revalidatePath("/studio/team");
}

export async function updateUserStatus(input: { userId: string; status: string }) {
  const session = await requireAdmin();
  if (!STATUSES.includes(input.status as Status)) throw new Error("Invalid status");
  await db.update(users).set({ status: input.status as Status }).where(eq(users.id, input.userId));
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "set_status",
    entityType: "user",
    entityId: input.userId,
    payload: { status: input.status },
  });
  revalidatePath("/studio/team");
}

export async function updateUserMeta(input: {
  userId: string;
  name?: string;
  phone?: string;
  initials?: string;
  accentColor?: string;
}) {
  await requireAdmin();
  const patch: Partial<typeof users.$inferInsert> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.initials !== undefined) patch.initials = input.initials.slice(0, 4);
  if (input.accentColor !== undefined) patch.accentColor = input.accentColor;
  await db.update(users).set(patch).where(eq(users.id, input.userId));
  revalidatePath("/studio/team");
}
