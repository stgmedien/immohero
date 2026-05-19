"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { SERVICES, BUNDLES } from "@/lib/services";
import { updateAboConfig } from "@/app/studio/actions/customers";

interface Props {
  customerId: string;
  customerEmail: string | null;
  initialIsAbo: boolean;
  initialBundleSlug: string | null;
  initialServiceSlugs: string[];
  initialNotes: string | null;
  aboLink: string;
}

export function AboConfigPanel({
  customerId,
  customerEmail,
  initialIsAbo,
  initialBundleSlug,
  initialServiceSlugs,
  initialNotes,
  aboLink,
}: Props) {
  const [isAbo, setIsAbo] = useState(initialIsAbo);
  const [bundleSlug, setBundleSlug] = useState<string | null>(initialBundleSlug);
  const [serviceSlugs, setServiceSlugs] = useState<string[]>(initialServiceSlugs);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleService(slug: string) {
    setServiceSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function save() {
    startTransition(async () => {
      try {
        await updateAboConfig({
          customerId,
          isAbo,
          aboBundleSlug: bundleSlug,
          aboServiceSlugs: serviceSlugs,
          aboNotes: notes.trim() || null,
        });
        toast.success("Abo-Konfiguration gespeichert.");
      } catch {
        toast.error("Speichern fehlgeschlagen.");
      }
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(aboLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Kopieren fehlgeschlagen.");
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Abo-Modell</h2>
          {isAbo && <Badge tone="brand-soft">Aktiv</Badge>}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAbo}
            onChange={(e) => setIsAbo(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-brand-1)]"
          />
          Abo aktiviert
        </label>
      </div>

      {isAbo && (
        <div className="mt-4 space-y-5">
          <div>
            <p className="mb-2 text-xs font-mono uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              Vordefiniertes Bundle (optional)
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
                Keins
              </button>
              {BUNDLES.map((b) => (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => setBundleSlug(b.slug)}
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
              Zusätzliche Einzel-Leistungen
            </p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => {
                const active = serviceSlugs.includes(s.slug);
                return (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => toggleService(s.slug)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      active
                        ? "border-[var(--color-brand-1)] bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]"
                        : "border-[var(--color-hair)]"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-mono uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              Interne Abo-Notizen
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Konditionen, Abrechnung, Besonderheiten …"
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-subtle)] p-3">
            <p className="text-xs text-[var(--color-ink-3)]">
              Self-Service-Link für den Kunden{" "}
              {customerEmail ? (
                <>
                  (Login per Magic-Link an <strong>{customerEmail}</strong>)
                </>
              ) : (
                <span className="text-[var(--color-danger)]">
                  — Achtung: keine E-Mail hinterlegt, Login nicht möglich
                </span>
              )}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-[var(--color-bg)] px-2 py-1.5 text-xs">
                {aboLink}
              </code>
              <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Kopiert" : "Kopieren"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Speichert…" : "Abo-Konfiguration speichern"}
        </Button>
      </div>
    </Card>
  );
}
