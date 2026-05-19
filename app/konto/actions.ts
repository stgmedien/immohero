"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users, customers } from "@/lib/db/schema";

export interface ProfileResult {
  ok: boolean;
  error?: string;
}

export async function updateProfile(input: {
  name: string;
  phone: string;
}): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, error: "Bitte zuerst anmelden." };
  }

  const name = input.name.trim();
  const phone = input.phone.trim();
  if (name.length < 2) {
    return { ok: false, error: "Bitte einen gültigen Namen angeben." };
  }
  if (phone && phone.replace(/[\s/+()-]/g, "").length < 6) {
    return { ok: false, error: "Telefonnummer scheint ungültig." };
  }

  await db
    .update(users)
    .set({ name, phone: phone || null })
    .where(eq(users.id, session.user.id));

  // Verknüpften CRM-Kunden (per E-Mail) konsistent halten, falls vorhanden.
  try {
    const email = session.user.email.toLowerCase();
    const matches = await db
      .select({ id: customers.id, primaryEmail: customers.primaryEmail })
      .from(customers)
      .limit(500);
    const mine = matches.filter(
      (c) => (c.primaryEmail ?? "").trim().toLowerCase() === email,
    );
    await Promise.all(
      mine.map((c) =>
        db
          .update(customers)
          .set({ displayName: name, primaryPhone: phone || null })
          .where(eq(customers.id, c.id)),
      ),
    );
  } catch (err) {
    console.error("[profile] customer sync failed", err);
  }

  revalidatePath("/konto/profil");
  return { ok: true };
}
