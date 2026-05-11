"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBooking } from "./booking-store";
import { generateTimeSlots, generateUpcomingDates } from "@/lib/booking";
import { germanDate, cn } from "@/lib/utils";

export function ScheduleStep() {
  const router = useRouter();
  const { draft, patchSchedule } = useBooking();
  const dates = useMemo(() => generateUpcomingDates(14), []);
  const slots = generateTimeSlots();

  return (
    <div className="space-y-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <section>
        <h2 className="font-serif text-2xl">Datum</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">
          Verfügbar Mo–Sa. Bei Wetterunsicherheit nehmen wir Kontakt auf.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {dates.map((d) => {
            const selected = draft.schedule.date === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => patchSchedule({ date: d })}
                aria-pressed={selected}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  selected
                    ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                )}
              >
                <p className="font-serif text-lg">{germanDate(d)}</p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                  {new Date(d + "T12:00:00").toLocaleDateString("de-DE", { weekday: "long" })}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Uhrzeit</h2>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((slot) => {
            const selected = draft.schedule.timeSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => patchSchedule({ timeSlot: slot })}
                aria-pressed={selected}
                disabled={!draft.schedule.date}
                className={cn(
                  "rounded-lg border p-3 font-serif text-lg transition-all",
                  selected
                    ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                  !draft.schedule.date && "opacity-50",
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" size="lg" onClick={() => router.push("/buchen/adresse")}>
          ← Zurück
        </Button>
        <Button
          size="lg"
          disabled={!draft.schedule.date || !draft.schedule.timeSlot}
          onClick={() => router.push("/buchen/kasse")}
        >
          Weiter zum Kontakt
        </Button>
      </div>
    </div>
  );
}
