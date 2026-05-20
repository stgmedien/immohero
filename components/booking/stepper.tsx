"use client";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";
import { t } from "@/lib/i18n";

export function Stepper({ current }: { current: number }) {
  const locale = useLocale();
  const STEPS = [
    { id: 1, label: t(locale, "step_service") },
    { id: 2, label: t(locale, "step_property") },
    { id: 3, label: t(locale, "step_schedule") },
    { id: 4, label: t(locale, "step_checkout") },
  ];
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
