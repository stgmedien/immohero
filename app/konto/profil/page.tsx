import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/konto/profile-form";

export default async function ProfilPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [row] = userId
    ? await db
        .select({ name: users.name, phone: users.phone, email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
    : [];

  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Profil</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">
        Verwalte deinen Namen und deine Kontaktdaten.
      </p>
      <Card className="mt-6 p-6">
        <ProfileForm
          initialName={row?.name ?? session?.user?.name ?? ""}
          initialPhone={row?.phone ?? ""}
          email={row?.email ?? session?.user?.email ?? ""}
        />
      </Card>
    </section>
  );
}
