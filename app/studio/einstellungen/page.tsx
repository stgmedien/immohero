import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userDisplayName, roleLabel } from "@/lib/access";

export default async function StudioSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [me] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Einstellungen" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Einstellungen</h1>
        <p className="text-[var(--color-ink-3)]">Dein Konto und Notification-Vorlieben.</p>

        <Card className="mt-6 p-5">
          <h2 className="text-base font-semibold mb-3">Konto</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <Row label="Name" value={userDisplayName(me)} />
            <Row label="E-Mail" value={me?.email ?? "—"} />
            <Row label="Rolle" value={roleLabel(me?.role)} />
            <Row label="Status" value={me?.status ?? "—"} />
            <Row label="Sprache" value={me?.language ?? "de"} />
            <Row label="Zeitzone" value={me?.timezone ?? "Europe/Berlin"} />
          </dl>
        </Card>

        <Card className="mt-6 p-5">
          <h2 className="text-base font-semibold mb-3">Abmelden</h2>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline">Abmelden</Button>
          </form>
        </Card>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
