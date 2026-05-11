"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "", label: "Shotliste" },
  { slug: "crew", label: "Crew" },
  { slug: "kunde", label: "Kunde" },
  { slug: "kommentare", label: "Kommentare" },
  { slug: "assets", label: "Assets" },
  { slug: "share", label: "Share" },
  { slug: "einstellungen", label: "Einstellungen" },
];

export function ProjectTabs({ code }: { code: string }) {
  const pathname = usePathname();
  const base = `/studio/projekte/${code}`;
  return (
    <nav className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-1 -mb-px overflow-x-auto">
      {TABS.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base;
        const isActive = tab.slug ? pathname === href : pathname === base;
        return (
          <Link
            key={tab.slug || "root"}
            href={href}
            className={cn(
              "relative inline-flex items-center whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors border-b-2",
              isActive
                ? "border-[var(--color-brand-1)] text-[var(--color-ink)]"
                : "border-transparent text-[var(--color-ink-3)] hover:text-[var(--color-ink)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
