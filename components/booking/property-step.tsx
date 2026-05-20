"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBooking } from "./booking-store";
import { PROPERTY_TYPES } from "@/lib/services";
import { checkPlz } from "@/app/buchen/actions";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";
import { t } from "@/lib/i18n";

export function PropertyStep() {
  const router = useRouter();
  const { draft, patchProperty } = useBooking();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [plzMessage, setPlzMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const submit = () => {
    const next: Partial<Record<string, string>> = {};
    if (!draft.property.address) next.address = t(locale, "prop_error_address");
    if (!/^\d{5}$/.test(draft.property.plz)) next.plz = t(locale, "prop_error_plz");
    if (!draft.property.city) next.city = t(locale, "prop_error_city");
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (plzMessage && !plzMessage.ok) return;

    router.push("/buchen/termin");
  };

  const verifyPlz = (plz: string) => {
    if (!/^\d{5}$/.test(plz)) {
      setPlzMessage(null);
      return;
    }
    startTransition(async () => {
      const result = await checkPlz(plz);
      if (result.ok) {
        setPlzMessage({
          ok: true,
          text: t(locale, "prop_plz_match", { city: result.city ?? "", region: result.region ?? "" }),
        });
        if (result.city && !draft.property.city) patchProperty({ city: result.city });
      } else {
        setPlzMessage({ ok: false, text: result.reason ?? t(locale, "prop_plz_out") });
      }
    });
  };

  return (
    <div className="space-y-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <section>
        <h2 className="font-serif text-2xl">{t(locale, "prop_type_title")}</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">{t(locale, "prop_type_sub")}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PROPERTY_TYPES.map((pt) => {
            const selected = draft.property.type === pt.value;
            return (
              <button
                key={pt.value}
                type="button"
                onClick={() => patchProperty({ type: pt.value })}
                aria-pressed={selected}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  selected
                    ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]",
                )}
              >
                <p className="text-sm font-medium">{pt.label}</p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{pt.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">{t(locale, "prop_address_title")}</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">{t(locale, "prop_address_sub")}</p>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="address">{t(locale, "prop_label_address")}</Label>
            <Input
              id="address"
              autoComplete="street-address"
              value={draft.property.address}
              onChange={(e) => patchProperty({ address: e.target.value })}
              placeholder="Musterstraße 12"
            />
            {errors.address && <p className="text-xs text-[var(--color-danger)]">{errors.address}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="grid gap-2">
              <Label htmlFor="plz">{t(locale, "prop_label_plz")}</Label>
              <Input
                id="plz"
                inputMode="numeric"
                maxLength={5}
                value={draft.property.plz}
                onChange={(e) => {
                  const next = e.target.value.replace(/\D/g, "").slice(0, 5);
                  patchProperty({ plz: next });
                  if (next.length === 5) verifyPlz(next);
                  else setPlzMessage(null);
                }}
                placeholder="33332"
              />
              {errors.plz && <p className="text-xs text-[var(--color-danger)]">{errors.plz}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">{t(locale, "prop_label_city")}</Label>
              <Input
                id="city"
                autoComplete="address-level2"
                value={draft.property.city}
                onChange={(e) => patchProperty({ city: e.target.value })}
                placeholder="Gütersloh"
              />
              {errors.city && <p className="text-xs text-[var(--color-danger)]">{errors.city}</p>}
            </div>
          </div>

          {plzMessage && (
            <div
              className={cn(
                "rounded-lg border p-3 text-sm",
                plzMessage.ok
                  ? "border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : "border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
              )}
            >
              {pending ? t(locale, "prop_plz_checking") : plzMessage.text}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">{t(locale, "prop_optional_title")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="grid gap-2">
            <Label htmlFor="notes">{t(locale, "prop_label_notes")}</Label>
            <Textarea
              id="notes"
              value={draft.property.notes ?? ""}
              onChange={(e) => patchProperty({ notes: e.target.value })}
              placeholder={t(locale, "prop_placeholder_notes")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="qm">{t(locale, "prop_label_qm")}</Label>
            <Input
              id="qm"
              inputMode="numeric"
              value={draft.property.sizeQm ?? ""}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                patchProperty({ sizeQm: Number.isFinite(n) ? n : undefined });
              }}
              placeholder={t(locale, "prop_placeholder_qm")}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" size="lg" onClick={() => router.push("/buchen")}>
          {t(locale, "prop_back")}
        </Button>
        <Button size="lg" onClick={submit} disabled={pending}>
          {t(locale, "prop_next")}
        </Button>
      </div>
    </div>
  );
}
