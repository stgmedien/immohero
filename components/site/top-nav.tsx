import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { LangSwitcher } from "./lang-switcher";

const NAV_LINKS = [
  { href: "/pakete", label: "Pakete" },
  { href: "/services", label: "Einzelservices" },
  { href: "/faq", label: "FAQ" },
];

export async function TopNav() {
  const session = await auth();
  const accountHref =
    !session?.user ? "/login"
      : session.user.role === "customer" ? "/konto"
      : "/studio";
  const accountLabel = !session?.user
    ? "Login"
    : session.user.role === "customer"
      ? "Konto"
      : "Studio";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-bg)]/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={accountHref}>{accountLabel}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/buchen">Jetzt buchen</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
