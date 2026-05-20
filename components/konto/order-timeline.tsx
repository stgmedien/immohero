import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  studioStatus: string;
}

interface Step {
  key: string;
  label: string;
  caption?: string;
}

const STEPS: Step[] = [
  { key: "booked", label: "Gebucht" },
  { key: "scheduled", label: "Termin bestätigt" },
  { key: "production", label: "Shooting & Bearbeitung" },
  { key: "client_approval", label: "Freigabe durch dich" },
  { key: "delivered", label: "Lieferung bereit" },
];

function currentIndex(status: string, studioStatus: string): number {
  if (status === "delivered" || studioStatus === "completed") return 4;
  if (studioStatus === "client_approval" || studioStatus === "revision") return 3;
  if (
    studioStatus === "production" ||
    status === "shooting" ||
    status === "editing"
  ) return 2;
  if (status === "scheduled" || studioStatus === "draft") return 1;
  return 0;
}

export function OrderTimeline({ status, studioStatus }: Props) {
  if (status === "cancelled") {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/25 bg-[var(--color-danger-soft)] p-3 text-sm text-[var(--color-danger)]">
        Dieser Auftrag wurde storniert.
      </div>
    );
  }
  const idx = currentIndex(status, studioStatus);
  return (
    <ol className="grid gap-2 md:grid-cols-5">
      {STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li
            key={step.key}
            className={cn(
              "flex items-start gap-2 rounded-[var(--radius-md)] border p-3",
              done && "border-[var(--color-ok)]/30 bg-[var(--color-ok-soft)]",
              active && "border-[var(--color-brand-1)] bg-[var(--color-brand-soft)]",
              !done && !active && "border-[var(--color-hair)] bg-[var(--color-bg-subtle)]/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                done && "bg-[var(--color-ok)] text-white",
                active && "bg-[var(--color-brand-1)] text-white",
                !done && !active && "bg-[var(--color-bg-sunken)] text-[var(--color-ink-3)]",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : active ? <Clock className="h-3 w-3" /> : i + 1}
            </span>
            <div className="text-xs">
              <p className="font-medium">{step.label}</p>
              {active && (
                <p className="mt-0.5 text-[var(--color-ink-mute)]">aktuell</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
