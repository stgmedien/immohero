"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { customers, customerContacts, companies, auditLog } from "@/lib/db/schema";

async function requireCRM() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createCustomer(input: {
  displayName: string;
  kind: "person" | "company";
  companyName?: string;
  companyId?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  address?: string;
  notes?: string;
}) {
  const session = await requireCRM();
  if (!input.displayName.trim()) throw new Error("Name fehlt");

  const [row] = await db
    .insert(customers)
    .values({
      displayName: input.displayName.trim(),
      kind: input.kind,
      companyName: input.companyName ?? null,
      companyId: input.companyId ?? null,
      primaryEmail: input.primaryEmail ?? null,
      primaryPhone: input.primaryPhone ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
      createdById: session.user.id,
    })
    .returning();
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "create",
    entityType: "customer",
    entityId: row.id,
  });
  revalidatePath("/studio/kunden");
  return row;
}

export async function updateCustomer(input: {
  customerId: string;
  patch: Partial<typeof customers.$inferInsert>;
}) {
  const session = await requireCRM();
  await db.update(customers).set(input.patch).where(eq(customers.id, input.customerId));
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "update",
    entityType: "customer",
    entityId: input.customerId,
  });
  revalidatePath("/studio/kunden/[id]", "page");
}

export async function updateAboConfig(input: {
  customerId: string;
  isAbo: boolean;
  aboBundleSlug: string | null;
  aboServiceSlugs: string[];
  aboNotes: string | null;
}) {
  const session = await requireCRM();
  const [existing] = await db
    .select({ isAbo: customers.isAbo })
    .from(customers)
    .where(eq(customers.id, input.customerId))
    .limit(1);
  await db
    .update(customers)
    .set({
      isAbo: input.isAbo,
      aboBundleSlug: input.aboBundleSlug,
      aboServiceSlugs: input.aboServiceSlugs.length > 0 ? input.aboServiceSlugs : null,
      aboNotes: input.aboNotes,
      aboActivatedAt:
        input.isAbo && !existing?.isAbo ? new Date() : input.isAbo ? undefined : null,
    })
    .where(eq(customers.id, input.customerId));
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "update",
    entityType: "customer",
    entityId: input.customerId,
    payload: { abo: input.isAbo },
  });
  revalidatePath("/studio/kunden/[id]", "page");
}

export async function archiveCustomer(customerId: string) {
  const session = await requireCRM();
  await db.update(customers).set({ archivedAt: new Date() }).where(eq(customers.id, customerId));
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name,
    action: "archive",
    entityType: "customer",
    entityId: customerId,
  });
  revalidatePath("/studio/kunden");
}

export async function createCompany(input: {
  displayName: string;
  legalName?: string;
  website?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  billingAddress?: string;
  notes?: string;
}) {
  const session = await requireCRM();
  if (!input.displayName.trim()) throw new Error("Name fehlt");
  const [row] = await db
    .insert(companies)
    .values({
      displayName: input.displayName.trim(),
      legalName: input.legalName ?? null,
      website: input.website ?? null,
      primaryEmail: input.primaryEmail ?? null,
      primaryPhone: input.primaryPhone ?? null,
      billingAddress: input.billingAddress ?? null,
      notes: input.notes ?? null,
      createdById: session.user.id,
    })
    .returning();
  revalidatePath("/studio/firmen");
  return row;
}

export async function updateCompany(input: {
  companyId: string;
  patch: Partial<typeof companies.$inferInsert>;
}) {
  await requireCRM();
  await db.update(companies).set(input.patch).where(eq(companies.id, input.companyId));
  revalidatePath("/studio/firmen/[id]", "page");
}

export async function createContact(input: {
  customerId: string;
  fullName: string;
  email?: string;
  phone?: string;
  roleAtCustomer?: string;
  isPrimary?: boolean;
}) {
  await requireCRM();
  if (!input.fullName.trim()) throw new Error("Name fehlt");
  await db.insert(customerContacts).values({
    customerId: input.customerId,
    fullName: input.fullName.trim(),
    email: input.email ?? null,
    phone: input.phone ?? null,
    roleAtCustomer: input.roleAtCustomer ?? null,
    isPrimary: input.isPrimary ?? false,
  });
  revalidatePath("/studio/kunden/[id]", "page");
}

export async function deleteContact(contactId: string) {
  await requireCRM();
  await db.delete(customerContacts).where(eq(customerContacts.id, contactId));
  revalidatePath("/studio/kunden/[id]", "page");
}
