import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)} aria-label="ImmoHero — Startseite">
      <span
        aria-hidden
        className="relative grid h-9 w-9 place-items-center rounded-full bg-[var(--color-ink)] text-[var(--color-primary-ink)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
      </span>
      <span className="font-serif text-xl tracking-tight">ImmoHero</span>
    </Link>
  );
}
