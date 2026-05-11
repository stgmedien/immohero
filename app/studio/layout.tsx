import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TEAM_ROLES = ["photographer", "drone_pilot", "editor", "admin"] as const;

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/studio");
  if (!TEAM_ROLES.includes(session.user.role as never)) redirect("/konto");

  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-ink)] text-[var(--color-primary-ink)]">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="[&_span]:text-[var(--color-primary-ink)]" />
            <Badge tone="primary" className="hidden sm:inline-flex">Studio</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--color-primary-soft)]/80 sm:inline">
              {session.user.name ?? session.user.email} · {session.user.role}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm" className="text-[var(--color-primary-ink)] hover:bg-white/10">
                Abmelden
              </Button>
            </form>
          </div>
        </div>
        <nav className="container-page flex gap-5 pb-3 text-sm">
          <NavLink href="/studio" label="Heute" />
          <NavLink href="/studio/projekte" label="Alle Projekte" />
          <NavLink href="/studio/kalender" label="Kalender" />
          {session.user.role === "admin" && <NavLink href="/admin" label="Admin" />}
        </nav>
      </header>
      <main className="flex-1 bg-[var(--color-bg)]">{children}</main>
    </>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[var(--color-primary-soft)]/80 transition-colors hover:text-[var(--color-primary-ink)]"
    >
      {label}
    </Link>
  );
}
