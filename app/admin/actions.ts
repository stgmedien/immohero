"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { orderAssignments, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");
  return session;
}

export async function assignTeamMember(input: { orderId: string; userId: string; role: string }) {
  await requireAdmin();

  const allowed = ["photographer", "drone_pilot", "editor", "admin"];
  if (!allowed.includes(input.role)) throw new Error("Invalid role");

  await db
    .insert(orderAssignments)
    .values({
      orderId: input.orderId,
      userId: input.userId,
      role: input.role as "photographer" | "drone_pilot" | "editor" | "admin",
    })
    .onConflictDoNothing();

  const [member] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
  if (member?.email) {
    try {
      const { db: db2 } = await import("@/lib/db/client");
      const { orders } = await import("@/lib/db/schema");
      const [order] = await db2.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (order) {
        const { TeamAssignmentEmail } = await import("@/emails/team-assignment");
        const studioUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/studio/projekte/${order.shortCode}`;
        await sendEmail({
          to: member.email,
          subject: `ImmoHero Studio — Auftrag ${order.shortCode} zugewiesen`,
          template: "team-assignment",
          orderId: order.id,
          react: TeamAssignmentEmail({
            recipientName: member.name ?? member.email,
            shortCode: order.shortCode,
            scheduledAt: order.scheduledAt?.toISOString() ?? new Date().toISOString(),
            propertyAddress: `${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`,
            role: input.role,
            studioUrl,
          }),
        });
      }
    } catch (err) {
      console.error("[admin/assign] could not notify member", err);
    }
  }

  revalidatePath(`/admin/auftraege/[code]`, "page");
}

export async function unassignTeamMember(input: { orderId: string; userId: string; role: string }) {
  await requireAdmin();
  await db
    .delete(orderAssignments)
    .where(
      and(
        eq(orderAssignments.orderId, input.orderId),
        eq(orderAssignments.userId, input.userId),
        eq(orderAssignments.role, input.role as "photographer" | "drone_pilot" | "editor" | "admin"),
      ),
    );
  revalidatePath(`/admin/auftraege/[code]`, "page");
}

export async function updateUserRole(input: { userId: string; role: string }) {
  await requireAdmin();
  const allowed = ["customer", "photographer", "drone_pilot", "editor", "admin"];
  if (!allowed.includes(input.role)) throw new Error("Invalid role");
  await db
    .update(users)
    .set({ role: input.role as "customer" | "photographer" | "drone_pilot" | "editor" | "admin" })
    .where(eq(users.id, input.userId));
  revalidatePath("/admin/team");
}
