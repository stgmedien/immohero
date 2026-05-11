"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessStudio } from "@/lib/access";
import { db } from "@/lib/db/client";
import {
  orderComments,
  orderShotComments,
  orderAssignments,
  orders,
} from "@/lib/db/schema";
import { createNotification } from "./notifications";

async function requireStudio() {
  const session = await auth();
  if (!session?.user?.id || !canAccessStudio(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function addProjectComment(input: {
  orderId: string;
  body: string;
  source?: "internal" | "client";
}) {
  const session = await requireStudio();
  if (!input.body.trim()) throw new Error("Kommentar darf nicht leer sein.");

  await db.insert(orderComments).values({
    orderId: input.orderId,
    source: input.source ?? "internal",
    authorId: session.user.id,
    authorName: session.user.name ?? session.user.email,
    body: input.body.trim(),
  });

  // Notify other team members
  const assignments = await db
    .select({ userId: orderAssignments.userId })
    .from(orderAssignments)
    .where(eq(orderAssignments.orderId, input.orderId));
  await Promise.all(
    assignments
      .filter((a) => a.userId !== session.user.id)
      .map((a) =>
        createNotification({
          userId: a.userId,
          type: "client_comment",
          title: `Neuer Kommentar: ${session.user.name ?? session.user.email}`,
          body: input.body.trim().slice(0, 120),
          orderId: input.orderId,
        }),
      ),
  );

  revalidatePath("/studio/projekte/[code]/kommentare", "page");
}

export async function addShotComment(input: {
  orderShotId: string;
  body: string;
  source?: "internal" | "client";
}) {
  const session = await requireStudio();
  if (!input.body.trim()) throw new Error("Kommentar darf nicht leer sein.");

  await db.insert(orderShotComments).values({
    orderShotId: input.orderShotId,
    source: input.source ?? "internal",
    authorId: session.user.id,
    authorName: session.user.name ?? session.user.email,
    body: input.body.trim(),
  });
  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function resolveComment(input: {
  commentId: string;
  isShot: boolean;
  resolved: boolean;
}) {
  const session = await requireStudio();
  const table = input.isShot ? orderShotComments : orderComments;
  await db
    .update(table)
    .set({
      resolvedAt: input.resolved ? new Date() : null,
      resolvedById: input.resolved ? session.user.id : null,
    })
    .where(eq(table.id, input.commentId));
  revalidatePath("/studio/projekte/[code]", "layout");
}
