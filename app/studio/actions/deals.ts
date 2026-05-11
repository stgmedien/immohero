"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { deals, dealNotes, auditLog } from "@/lib/db/schema";

const STAGE_PROBABILITY: Record<string, number> = {
  lead: 10,
  qualified: 30,
  proposal: 60,
  won: 100,
  lost: 0,
};

type Stage = "lead" | "qualified" | "proposal" | "won" | "lost";
type NoteKind = "note" | "call" | "meeting" | "email" | "task";

async function requireCRM() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createDeal(input: {
  title: string;
  customerId?: string;
  valueCents?: number;
  stage?: Stage;
  expectedCloseDate?: string;
  description?: string;
}) {
  const session = await requireCRM();
  if (!input.title.trim()) throw new Error("Titel fehlt");
  const stage = (input.stage ?? "lead") as Stage;
  const [row] = await db
    .insert(deals)
    .values({
      title: input.title.trim(),
      customerId: input.customerId ?? null,
      valueCents: input.valueCents ?? 0,
      stage,
      probability: STAGE_PROBABILITY[stage] ?? 20,
      expectedCloseDate: input.expectedCloseDate ? new Date(input.expectedCloseDate) : null,
      description: input.description ?? null,
      ownerUserId: session.user.id,
      createdById: session.user.id,
    })
    .returning();
  revalidatePath("/studio/deals");
  return row;
}

export async function updateDealStage(input: { dealId: string; stage: string }) {
  await requireCRM();
  const stage = input.stage as Stage;
  await db
    .update(deals)
    .set({
      stage,
      probability: STAGE_PROBABILITY[stage] ?? 0,
      actualCloseDate: stage === "won" || stage === "lost" ? new Date() : null,
    })
    .where(eq(deals.id, input.dealId));
  revalidatePath("/studio/deals");
  revalidatePath("/studio/deals/[id]", "page");
}

export async function updateDeal(input: {
  dealId: string;
  patch: Partial<typeof deals.$inferInsert>;
}) {
  await requireCRM();
  await db.update(deals).set(input.patch).where(eq(deals.id, input.dealId));
  revalidatePath("/studio/deals/[id]", "page");
}

export async function addDealNote(input: {
  dealId: string;
  body: string;
  kind?: NoteKind;
  happenedAt?: string;
}) {
  const session = await requireCRM();
  if (!input.body.trim()) throw new Error("Notiz fehlt");
  await db.insert(dealNotes).values({
    dealId: input.dealId,
    kind: (input.kind ?? "note") as NoteKind,
    body: input.body.trim(),
    happenedAt: input.happenedAt ? new Date(input.happenedAt) : new Date(),
    authorUserId: session.user.id,
    authorName: session.user.name ?? session.user.email ?? "?",
  });
  revalidatePath("/studio/deals/[id]", "page");
}
