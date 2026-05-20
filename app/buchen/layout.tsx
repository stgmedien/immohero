import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export default async function BuchenLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            {t(locale, "buchen_cancel")}
          </Link>
        </div>
      </header>
      <main className="flex-1 bg-[var(--color-bg-alt)]/40">{children}</main>
    </>
  );
}
