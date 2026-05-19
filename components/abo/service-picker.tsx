"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { eurosPrecise } from "@/lib/utils";
import { saveAboSelection } from "@/app/abo/actions";

interface ServiceOpt {
  slug: string;
  name: string;
  shortDescription: string;
  priceCents: number;
}
interface BundleOpt {
  slug: string;
  name: string;
  tagline: string;
  serviceSlugs: string[];
}

export function ServicePicker({
  services,
  bundles,
  initialBundleSlug,
  initialServiceSlugs,
  hasSelection,
}: {
  services: ServiceOpt[];
  bundles: BundleOpt[];
  initialBundleSlug: string | null;
  initialServiceSlugs: string[];
  hasSelection: boolean;
}) {
  const [bundleSlug, setBundleSlug] = useState<string | null>(initialBundleSlug);
  const [serviceSlugs, setServiceSlugs] = useState<string[]>(initialServiceSlugs);
  const [editing, setEditing] = useState(!hasSelection);
  const [pending, startTransition] = useTransition();

  function toggleService(slug: string) {
    setServiceSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function save() {
    startTransition(async () => {
      const res = await saveAboSelection({ bundleSlug, serviceSlugs });
      if (res.ok) {
        toast.success("Leistungen gespeichert.");
        setEditing(false);
      } else {
        toast.error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  if (!editing) {
    return (
      <div className="mt-3">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Leistungen ändern
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
          Paket (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBundleSlug(null)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              bundleSlug === null
                ? "border-[var(--color-brand-1)] bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]"
                : "border-[var(--color-hair)]"
            }`}
          >
            Kein Paket
          </button>
          {bundles.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => setBundleSlug(b.slug)}
              title={b.tagline}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                bundleSlug === b.slug
                  ? "border-[var(--color-brand-1)] bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]"
                  : "border-[var(--color-hair)]"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-mono uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
          Einzel-Leistungen
        </p>
        <ul className="space-y-2">
          {services.map((s) => {
            const active = serviceSlugs.includes(s.slug);
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => toggleService(s.slug)}
                  className={`flex w-full items-start justify-between gap-3 rounded-[var(--radius-md)] border p-3 text-left ${
                    active
                      ? "border-[var(--color-brand-1)] bg-[var(--color-brand-soft)]/40"
                      : "border-[var(--color-hair)]"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium">{s.name}</span>
                    <span className="block text-xs text-[var(--color-ink-mute)]">
                      {s.shortDescription}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-[var(--color-ink-3)]">
                    {eurosPrecise(s.priceCents)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? "Speichert…" : "Leistungen speichern"}
      </Button>
    </div>
  );
}
