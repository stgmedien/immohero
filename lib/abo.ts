import { db } from "@/lib/db/client";
import { customers, propertySubmissions, orders } from "@/lib/db/schema";
import { and, eq, isNull, desc } from "drizzle-orm";
import { getService, getBundle, type ServiceDefinition } from "@/lib/services";

export interface AboCustomer {
  id: string;
  displayName: string;
  companyName: string | null;
  primaryEmail: string | null;
  aboServiceSlugs: string[] | null;
  aboBundleSlug: string | null;
  aboNotes: string | null;
}

/** Find an active (non-archived) Abo customer by email (case-insensitive). */
export async function getAboCustomerByEmail(email: string): Promise<AboCustomer | null> {
  const norm = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.isAbo, true), isNull(customers.archivedAt)))
    .limit(500)
    .then((rows) =>
      rows.filter((r) => (r.primaryEmail ?? "").trim().toLowerCase() === norm),
    );
  if (!row) return null;
  return {
    id: row.id,
    displayName: row.displayName,
    companyName: row.companyName,
    primaryEmail: row.primaryEmail,
    aboServiceSlugs: row.aboServiceSlugs,
    aboBundleSlug: row.aboBundleSlug,
    aboNotes: row.aboNotes,
  };
}

/** Resolve the predefined services for an Abo customer (bundle expands to its services). */
export function resolveAboServices(c: {
  aboServiceSlugs: string[] | null;
  aboBundleSlug: string | null;
}): ServiceDefinition[] {
  const slugs = new Set<string>();
  if (c.aboBundleSlug) {
    const b = getBundle(c.aboBundleSlug);
    b?.serviceSlugs.forEach((s) => slugs.add(s));
  }
  (c.aboServiceSlugs ?? []).forEach((s) => slugs.add(s));
  return Array.from(slugs)
    .map((s) => getService(s))
    .filter((s): s is ServiceDefinition => Boolean(s));
}

export interface AboSubmissionRow {
  id: string;
  propertyType: string;
  propertyAddress: string;
  propertyPlz: string;
  propertyCity: string;
  status: "pending" | "approved" | "rejected" | "converted";
  reviewNotes: string | null;
  createdAt: Date;
  convertedShortCode: string | null;
  convertedShareToken: string | null;
}

/** List a customer's own property submissions (newest first), with converted-order link. */
export async function listAboSubmissions(customerRecordId: string): Promise<AboSubmissionRow[]> {
  const rows = await db
    .select({
      id: propertySubmissions.id,
      propertyType: propertySubmissions.propertyType,
      propertyAddress: propertySubmissions.propertyAddress,
      propertyPlz: propertySubmissions.propertyPlz,
      propertyCity: propertySubmissions.propertyCity,
      status: propertySubmissions.status,
      reviewNotes: propertySubmissions.reviewNotes,
      createdAt: propertySubmissions.createdAt,
      convertedShortCode: orders.shortCode,
      convertedShareToken: orders.shareToken,
    })
    .from(propertySubmissions)
    .leftJoin(orders, eq(orders.id, propertySubmissions.convertedOrderId))
    .where(eq(propertySubmissions.customerRecordId, customerRecordId))
    .orderBy(desc(propertySubmissions.createdAt))
    .limit(200);
  return rows as AboSubmissionRow[];
}
