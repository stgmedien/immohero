import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { LangSwitcher } from "./lang-switcher";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";
import { DEMO_MODE } from "@/lib/demo";

export async function TopNav() {
  // Im Demo-Modus kein Auth-Lookup (vermeidet DB-Zugriff offline).
  const [session, locale] = await Promise.all([
    DEMO_MODE ? Promise.resolve(null) : auth(),
    getLocale(),
  ]);
  const navLinks = [
    { href: "/pakete", label: t(locale, "nav_packages") },
    { href: "/services", label: t(locale, "nav_services") },
    { href: "/faq", label: t(locale, "nav_faq") },
  ];
  const accountHref =
    !session?.user ? "/login"
      : session.user.role === "customer" ? "/konto"
      : "/studio";
  const accountLabel = !session?.user
    ? t(locale, "nav_login")
    : session.user.role === "customer"
      ? t(locale, "nav_account")
      : t(locale, "nav_studio");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-bg)]/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden gap-7 md:flex">
          {navLinks.map((link) => (
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
            <Link href="/buchen">{t(locale, "nav_book")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
