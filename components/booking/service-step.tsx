"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon, CheckIcon } from "@/components/marketing/icons";
import { useBooking } from "./booking-store";
import { BUNDLES, SERVICES, bundlePriceCents, bundleSubtotalCents } from "@/lib/services";
import { euros, cn } from "@/lib/utils";

export function ServiceStep() {
  const router = useRouter();
  const { draft, patch } = useBooking();

  const hasSelection = Boolean(draft.bundleSlug) || draft.serviceSlugs.length > 0;

  const toggleService = (slug: string) => {
    if (draft.bundleSlug) {
      patch({
        bundleSlug: null,
        serviceSlugs: draft.serviceSlugs.includes(slug) ? draft.serviceSlugs.filter((s) => s !== slug) : [...draft.serviceSlugs, slug],
      });
      return;
    }
    patch({
      serviceSlugs: draft.serviceSlugs.includes(slug)
        ? draft.serviceSlugs.filter((s) => s !== slug)
        : [...draft.serviceSlugs, slug],
    });
  };

  const pickBundle = (slug: string) => {
    patch({ bundleSlug: slug, serviceSlugs: [] });
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-2xl">Paket wählen — empfohlen</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">Bis zu 20 % Rabatt gegenüber Einzelbuchung.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {BUNDLES.map((bundle) => {
            const selected = draft.bundleSlug === bundle.slug;
            return (
              <button
                key={bundle.slug}
                onClick={() => pickBundle(bundle.slug)}
                type="button"
                aria-pressed={selected}
                className={cn(
                  "rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-5 text-left transition-all",
                  selected
                    ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl">{bundle.name}</span>
                  <Badge tone={bundle.recommended ? "ink" : "neutral"}>{bundle.discountPercent}% sparen</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{bundle.tagline}</p>
                <p className="mt-3 font-serif text-3xl">{euros(bundlePriceCents(bundle))}</p>
                <p className="text-xs text-[var(--color-ink-mute)] line-through">{euros(bundleSubtotalCents(bundle))}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">… oder Einzelservices</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">
          {draft.bundleSlug
            ? "Eine Auswahl ersetzt das Paket — du kannst trotzdem zusätzlich Services kombinieren."
            : "Tippe alle Services an, die du buchen möchtest."}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const selected = draft.serviceSlugs.includes(service.slug);
            return (
              <button
                key={service.slug}
                onClick={() => toggleService(service.slug)}
                type="button"
                aria-pressed={selected}
                className={cn(
                  "group flex items-start gap-3 rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-4 text-left transition-all",
                  selected
                    ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                )}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-bg-alt)]">
                  <ServiceIcon name={service.iconKey} size={20} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{service.name}</span>
                    {selected && <CheckIcon size={18} className="text-[var(--color-primary)]" />}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{service.shortDescription}</p>
                  <p className="mt-2 font-serif text-lg">{euros(service.priceCents)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          size="lg"
          disabled={!hasSelection}
          onClick={() => router.push("/buchen/adresse")}
        >
          Weiter zu Objekt & Adresse
        </Button>
      </div>
    </div>
  );
}
