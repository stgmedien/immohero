import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

export default async function KontoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/konto");
  if (session.user.role !== "customer") redirect("/studio");

  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
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
        <div className="container-page flex gap-6 pb-3 text-sm">
          <KontoLink href="/konto" label="Aufträge" />
          <KontoLink href="/konto/profil" label="Profil" />
        </div>
      </header>
      <main className="flex-1 bg-[var(--color-bg-alt)]/40">{children}</main>
    </>
  );
}

function KontoLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
    >
      {label}
    </Link>
  );
}
