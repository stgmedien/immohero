"use client";

/**
 * Interaktiver Verdienst-Rechner für die Piloten-Landing.
 * Rechnet mit denselben Referenzwerten wie der Chatbot
 * (lib/pilot/earnings.ts) — eine Wahrheit, zwei Oberflächen.
 */
import { useMemo, useState } from "react";
import { estimateEarnings, REF_PER_PROJECT_EUR, REF_RETAINER_EUR } from "@/lib/pilot/earnings";
import { Card } from "@/components/ui/card";

const EUR = (n: number) => n.toLocaleString("de-DE") + " €";

export function EarningsTeaser() {
  const [projects, setProjects] = useState(4);
  const [retainer, setRetainer] = useState(false);
  const est = useMemo(
    () => estimateEarnings({ projectsPerMonth: projects, includeRetainer: retainer }),
    [projects, retainer],
  );

  return (
    <Card className="p-6 md:p-8">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <label htmlFor="projects-slider" className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Projekte pro Monat</span>
            <span className="font-serif text-2xl">{projects}</span>
          </label>
          <input
            id="projects-slider"
            type="range"
            min={1}
            max={12}
            step={1}
            value={projects}
            onChange={(e) => setProjects(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-brand-1)]"
          />
          <div className="mt-1 flex justify-between text-[11px] text-[var(--color-ink-mute)]">
            <span>1 · nebenbei</span>
            <span>6 · ambitioniert</span>
            <span>12 · Vollgas</span>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={retainer}
              onChange={(e) => setRetainer(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand-1)]"
            />
            <span>
              Makler-Retainer einrechnen{" "}
              <span className="text-[var(--color-ink-mute)]">(+{EUR(REF_RETAINER_EUR)}/Monat)</span>
            </span>
          </label>

          <p className="mt-4 text-xs text-[var(--color-ink-mute)]">
            Basis: Ø {EUR(REF_PER_PROJECT_EUR)} pro Drohnen-Projekt — echte ImmoHero-Auszahlung, keine
            Fantasiezahl. Brutto, vor Steuern/Kosten.
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] bg-[var(--color-brand-softer)] px-8 py-6 text-center md:min-w-[220px]">
          <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Dein Potenzial</p>
          <p className="mt-2 font-serif text-4xl text-[var(--color-brand-ink)]">{EUR(est.monthlyEur)}</p>
          <p className="text-sm text-[var(--color-ink-soft)]">pro Monat</p>
          <p className="mt-3 border-t border-[var(--color-brand-soft)] pt-3 text-sm text-[var(--color-ink-3)]">
            {EUR(est.yearlyEur)} / Jahr
          </p>
        </div>
      </div>
    </Card>
  );
}
