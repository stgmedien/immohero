"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { propertySubmissions, customers, users, notifications } from "@/lib/db/schema";
import { getAboCustomerByEmail } from "@/lib/abo";
import { sendEmail } from "@/lib/email";

export async function saveAboSelection(input: {
  bundleSlug: string | null;
  serviceSlugs: string[];
}): Promise<SubmitResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, error: "Bitte zuerst anmelden." };
  }
  const abo = await getAboCustomerByEmail(session.user.email);
  if (!abo) {
    return { ok: false, error: "Kein aktives Abo für diese E-Mail gefunden." };
  }

  const { SERVICES, BUNDLES } = await import("@/lib/services");
  const validServices = (input.serviceSlugs ?? []).filter((s) =>
    SERVICES.some((svc) => svc.slug === s),
  );
  const validBundle =
    input.bundleSlug && BUNDLES.some((b) => b.slug === input.bundleSlug)
      ? input.bundleSlug
      : null;

  if (!validBundle && validServices.length === 0) {
    return { ok: false, error: "Bitte mindestens eine Leistung auswählen." };
  }

  await db
    .update(customers)
    .set({
      aboBundleSlug: validBundle,
      aboServiceSlugs: validServices.length > 0 ? validServices : null,
    })
    .where(eq(customers.id, abo.id));

  revalidatePath("/abo");
  return { ok: true };
}

const schema = z.object({
  propertyType: z.enum([
    "wohnung",
    "haus",
    "villa",
    "mfh",
    "gewerbe",
    "industrie",
    "grundstueck",
    "bauprojekt",
  ]),
  propertyAddress: z.string().min(3, "Adresse fehlt."),
  propertyPlz: z.string().regex(/^\d{5}$/, "PLZ muss 5 Ziffern haben."),
  propertyCity: z.string().min(2, "Stadt fehlt."),
  propertySizeQm: z.number().int().positive().optional(),
  propertyNotes: z.string().max(2000).optional(),
  desiredTimeframe: z.string().max(200).optional(),
  uploads: z
    .array(
      z.object({
        url: z.string().url(),
        pathname: z.string(),
        filename: z.string(),
        sizeBytes: z.number(),
        mimeType: z.string(),
      }),
    )
    .optional(),
});

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

export async function submitProperty(input: unknown): Promise<SubmitResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, error: "Bitte zuerst anmelden." };
  }

  const abo = await getAboCustomerByEmail(session.user.email);
  if (!abo) {
    return { ok: false, error: "Kein aktives Abo für diese E-Mail gefunden." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Eingabe ungültig." };
  }
  const d = parsed.data;

  await db.insert(propertySubmissions).values({
    customerRecordId: abo.id,
    submittedByUserId: session.user.id,
    submittedByEmail: session.user.email.toLowerCase(),
    propertyType: d.propertyType,
    propertyAddress: d.propertyAddress.trim(),
    propertyPlz: d.propertyPlz,
    propertyCity: d.propertyCity.trim(),
    propertySizeQm: d.propertySizeQm ?? null,
    propertyNotes: d.propertyNotes ?? null,
    desiredTimeframe: d.desiredTimeframe ?? null,
    uploads: d.uploads && d.uploads.length > 0 ? d.uploads : null,
    status: "pending",
  });

  // Notify the team (in-app) — all admins/editors
  try {
    const team = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));
    await Promise.all(
      team.map((t) =>
        db.insert(notifications).values({
          userId: t.id,
          type: "consultation_requested",
          title: `Neue Abo-Einreichung: ${abo.displayName}`,
          body: `${d.propertyAddress}, ${d.propertyPlz} ${d.propertyCity}`,
        }),
      ),
    );
  } catch (err) {
    console.error("[abo] team notify failed", err);
  }

  // Confirm to customer
  try {
    const { AboSubmissionReceivedEmail } = await import("@/emails/abo-submission-received");
    await sendEmail({
      to: session.user.email,
      from: "default",
      subject: "Objekt eingereicht — wir prüfen es",
      template: "abo-submission-received",
      react: AboSubmissionReceivedEmail({
        customerName: abo.displayName,
        address: `${d.propertyAddress}, ${d.propertyPlz} ${d.propertyCity}`,
      }),
    });
  } catch (err) {
    console.error("[abo] received mail failed", err);
  }

  revalidatePath("/abo");
  return { ok: true };
}
