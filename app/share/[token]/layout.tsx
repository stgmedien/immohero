import Link from "next/link";
import { Logo } from "@/components/site/logo";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-hair)] bg-[var(--color-bg-elev)]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <Logo />
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
            Kunden-Ansicht
          </span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--color-hair)] mt-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 text-center text-xs text-[var(--color-ink-3)]">
          <p>
            Fragen?{" "}
            <a href="mailto:jonathan@stg-medien.com" className="underline">
              jonathan@stg-medien.com
            </a>
            {" · "}
            <Link href="/" className="underline">
              immohero.org
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
