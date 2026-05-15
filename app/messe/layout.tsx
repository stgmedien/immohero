import type { Metadata } from "next";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = {
  title: "Messe-Aktion · €15 geschenkt",
  description: "Sichere dir am Stand 15 € Rabatt auf deine erste Immobilienmedien-Buchung.",
  robots: { index: false, follow: false },
};

export default function MesseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-hair)] bg-[var(--color-bg-elev)]">
        <div className="mx-auto max-w-2xl px-5 py-4 flex items-center justify-between">
          <Logo />
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--color-ink-4)]">
            Messe-Aktion
          </span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
