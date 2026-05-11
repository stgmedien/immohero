import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--color-hair)] bg-[var(--color-bg-elev)] px-1.5 font-mono text-[10px] font-medium text-[var(--color-ink-3)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
