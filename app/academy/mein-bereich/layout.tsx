import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

/**
 * Lernbereich-Guard: jeder eingeloggte Nutzer darf lernen —
 * bewusst KEINE Rollen-Restriktion (Piloten sind role "customer",
 * Team-Mitglieder dürfen die Kurse ebenfalls sehen).
 */
export default async function AcademyMemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/academy/mein-bereich");

  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-sm text-[var(--color-ink-mute)] sm:inline">· Academy</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/academy">Alle Kurse</Link>
            </Button>
            <span className="hidden text-sm text-[var(--color-ink-soft)] sm:inline">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/academy" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Abmelden
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-[var(--color-bg)]">{children}</main>
    </>
  );
}
