"use client";
import { euros, eurosPrecise } from "@/lib/utils";
import { summarizeBooking } from "@/lib/booking";
import { useBooking } from "./booking-store";
import { getBundle } from "@/lib/services";

export function SummaryCard() {
  const { draft } = useBooking();
  const summary = summarizeBooking({
    bundleSlug: draft.bundleSlug ?? null,
    serviceSlugs: draft.serviceSlugs,
  });
  const bundle = draft.bundleSlug ? getBundle(draft.bundleSlug) : null;

  return (
    <aside className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <h2 className="font-serif text-xl">Deine Auswahl</h2>
      {summary.items.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">Noch nichts ausgewählt.</p>
      ) : (
        <>
          {bundle && (
            <p className="mt-2 text-xs uppercase tracking-wider text-[var(--color-accent)]">
              Paket „{bundle.name}" — {bundle.discountPercent} % Rabatt
            </p>
          )}
          <ul className="mt-4 divide-y divide-[var(--color-line)]">
            {summary.items.map((item) => (
              <li key={item.slug} className="flex items-center justify-between py-2 text-sm">
                <span>{item.name}</span>
                <span className="text-[var(--color-ink-soft)]">{euros(item.priceCents)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 text-sm">
            <Row label="Zwischensumme" value={eurosPrecise(summary.subtotalCents)} />
            {summary.discountCents > 0 && (
              <Row label="Paketrabatt" value={`− ${eurosPrecise(summary.discountCents)}`} accent />
            )}
            <div className="mt-3 flex items-end justify-between border-t border-[var(--color-line)] pt-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Gesamt</p>
                <p className="font-serif text-3xl tracking-tight">{eurosPrecise(summary.totalCents)}</p>
              </div>
              <p className="pb-1 text-xs text-[var(--color-ink-mute)]">{summary.taxInfo}</p>
            </div>
          </dl>
        </>
      )}
    </aside>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--color-ink-soft)]">{label}</dt>
      <dd className={accent ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"}>{value}</dd>
    </div>
  );
}
