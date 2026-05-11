import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-hair)] bg-[var(--color-bg-subtle)]/30 p-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-bg-elev)] text-[var(--color-ink-3)] shadow-[var(--shadow-sm)]">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-[var(--color-ink-3)]">{description}</p>
        )}
      </div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
