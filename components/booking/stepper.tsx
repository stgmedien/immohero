"use client";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Objekt" },
  { id: 3, label: "Termin" },
  { id: 4, label: "Kontakt & Kasse" },
];

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1 text-xs">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <li key={step.id} className="flex items-center gap-1">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-medium transition-colors",
                done && "bg-[var(--color-primary)] text-[var(--color-primary-ink)]",
                active && "bg-[var(--color-ink)] text-[var(--color-primary-ink)]",
                !done && !active && "bg-[var(--color-bg-alt)] text-[var(--color-ink-mute)]",
              )}
            >
              {done ? "✓" : step.id}
            </span>
            <span
              className={cn(
                "hidden sm:inline",
                active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-mute)]",
              )}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <span className="mx-2 h-px w-6 bg-[var(--color-line)] sm:w-10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
