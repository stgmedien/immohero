import Link from "next/link";
import { Logo } from "@/components/site/logo";

export default function BuchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-[var(--color-line)] bg-[var(--color-bg)]">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
            Buchung abbrechen
          </Link>
        </div>
      </header>
      <main className="flex-1 bg-[var(--color-bg-alt)]/40">{children}</main>
    </>
  );
}
