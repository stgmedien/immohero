"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBooking } from "./booking-store";
import { loadConsultationSlots } from "@/app/buchen/slots-action";
import type { DaySlots } from "@/lib/consultation";
import { germanDate, cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";
import { t } from "@/lib/i18n";

export function ScheduleStep() {
  const router = useRouter();
  const { draft, patchSchedule } = useBooking();
  const locale = useLocale();
  const [days, setDays] = useState<DaySlots[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadConsultationSlots()
      .then((d) => {
        if (active) setDays(d);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const selectedDay = useMemo(
    () => days?.find((d) => d.date === draft.schedule.date) ?? null,
    [days, draft.schedule.date],
  );

  return (
    <div className="space-y-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <section>
        <h2 className="font-serif text-2xl">{t(locale, "sched_title")}</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">{t(locale, "sched_sub")}</p>
      </section>

      {loading ? (
        <p className="text-sm text-[var(--color-ink-soft)]">{t(locale, "sched_loading")}</p>
      ) : !days || days.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-alt)]/40 p-4 text-sm text-[var(--color-ink-soft)]">
          {t(locale, "sched_no_slots")}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="lg" onClick={() => router.push("/buchen/adresse")}>
              {t(locale, "sched_back")}
            </Button>
            <Button
              size="lg"
              onClick={() => {
                const fallback = new Date();
                fallback.setDate(fallback.getDate() + 2);
                fallback.setHours(10, 0, 0, 0);
                patchSchedule({
                  date: fallback.toISOString().slice(0, 10),
                  timeSlot: "10:00",
                  slotStart: fallback.toISOString(),
                });
                router.push("/buchen/kasse");
              }}
            >
              {t(locale, "sched_continue_no_slot")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section>
            <h3 className="font-serif text-xl">{t(locale, "sched_day")}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {days.map((d) => {
                const selected = draft.schedule.date === d.date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() =>
                      patchSchedule({ date: d.date, timeSlot: "", slotStart: "" })
                    }
                    aria-pressed={selected}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      selected
                        ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]"
                        : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                    )}
                  >
                    <p className="font-serif text-lg">{germanDate(d.date)}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
                      {d.weekday} · {t(locale, "sched_free", { n: d.slots.length })}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-serif text-xl">{t(locale, "sched_time")}</h3>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {(selectedDay?.slots ?? []).map((s) => {
                const selected = draft.schedule.slotStart === s.start;
                return (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() =>
                      patchSchedule({
                        date: selectedDay!.date,
                        timeSlot: s.label,
                        slotStart: s.start,
                      })
                    }
                    aria-pressed={selected}
                    className={cn(
                      "rounded-lg border p-3 font-serif text-lg transition-all",
                      selected
                        ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]"
                        : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
              {!selectedDay && (
                <p className="col-span-full text-sm text-[var(--color-ink-soft)]">
                  {t(locale, "sched_pick_day_first")}
                </p>
              )}
            </div>
          </section>

          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" size="lg" onClick={() => router.push("/buchen/adresse")}>
              {t(locale, "sched_back")}
            </Button>
            <Button
              size="lg"
              disabled={!draft.schedule.slotStart}
              onClick={() => router.push("/buchen/kasse")}
            >
              {t(locale, "sched_next")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
