import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

export default async function AboLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/abo");

  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-[var(--color-brand-soft)] px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--color-brand-ink)] sm:inline">
              Abo-Bereich
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--color-ink-soft)] sm:inline">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">Abmelden</Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-[var(--color-bg-alt)]/40">{children}</main>
    </>
  );
}
