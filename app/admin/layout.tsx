import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/studio");

  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg-alt)]">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge tone="accent">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/studio" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
              → Studio-Ansicht
            </Link>
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
        <nav className="container-page flex gap-5 pb-3 text-sm">
          <NavLink href="/admin" label="Aufträge" />
          <NavLink href="/admin/team" label="Team" />
          <NavLink href="/admin/services" label="Services" />
          <NavLink href="/admin/gebiete" label="Servicegebiete" />
        </nav>
      </header>
      <main className="flex-1 bg-[var(--color-bg)]">{children}</main>
    </>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
      {label}
    </Link>
  );
}
