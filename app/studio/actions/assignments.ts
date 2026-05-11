"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessStudio } from "@/lib/access";
import { db } from "@/lib/db/client";
import { orderAssignments, orders, users, auditLog } from "@/lib/db/schema";
import { createNotification } from "./notifications";
import { sendEmail } from "@/lib/email";

async function requireStudio() {
  const session = await auth();
  if (!session?.user?.id || !canAccessStudio(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

type AssignableRole = "photographer" | "drone_pilot" | "editor" | "admin";
const ROLES: AssignableRole[] = ["photographer", "drone_pilot", "editor", "admin"];

export async function assignMember(input: {
  orderId: string;
  userId: string;
  role: string;
}) {
  const session = await requireStudio();
  if (!ROLES.includes(input.role as AssignableRole)) throw new Error("Invalid role");

  await db
    .insert(orderAssignments)
    .values({
      orderId: input.orderId,
      userId: input.userId,
      role: input.role as AssignableRole,
    })
    .onConflictDoNothing();

  // Notify assignee (in-app + email)
  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  const [member] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
  if (order) {
    await createNotification({
      userId: input.userId,
      type: "project_assignment",
      title: `Du wurdest zugewiesen — ${order.shortCode}`,
      body: `Rolle: ${input.role}`,
      orderId: input.orderId,
    });
    if (member?.email) {
      try {
        const { TeamAssignmentEmail } = await import("@/emails/team-assignment");
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org";
        await sendEmail({
          to: member.email,
          from: "studio",
          subject: `ImmoHero Studio — Auftrag ${order.shortCode} zugewiesen`,
          template: "team-assignment",
          orderId: order.id,
          react: TeamAssignmentEmail({
            recipientName: member.name ?? member.email,
            shortCode: order.shortCode,
            scheduledAt: order.scheduledAt?.toISOString() ?? new Date().toISOString(),
            propertyAddress: `${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`,
            role: input.role,
            studioUrl: `${siteUrl}/studio/projekte/${order.shortCode}`,
          }),
        });
      } catch (err) {
        console.error("[assignments] could not send team-assignment mail", err);
      }
    }
  }

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "assign",
    entityType: "order",
    entityId: input.orderId,
    payload: { userId: input.userId, role: input.role },
  });

  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function unassignMember(input: { orderId: string; userId: string; role: string }) {
  const session = await requireStudio();
  await db
    .delete(orderAssignments)
    .where(
      and(
        eq(orderAssignments.orderId, input.orderId),
        eq(orderAssignments.userId, input.userId),
        eq(orderAssignments.role, input.role as AssignableRole),
      ),
    );
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "unassign",
    entityType: "order",
    entityId: input.orderId,
    payload: { userId: input.userId, role: input.role },
  });
  revalidatePath("/studio/projekte/[code]", "layout");
}
