"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBooking } from "./booking-store";
import { createCheckoutSession } from "@/app/buchen/actions";
import { bookingDraftSchema } from "@/lib/booking";
import { useLocale } from "@/components/site/locale-provider";
import { t } from "@/lib/i18n";

export function CheckoutStep() {
  const router = useRouter();
  const { draft, patchCustomer } = useBooking();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [acceptedAgb, setAcceptedAgb] = useState(false);

  const onSubmit = () => {
    setError(null);
    const parsed = bookingDraftSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t(locale, "check_error_required"));
      return;
    }
    if (!acceptedAgb) {
      setError(t(locale, "check_error_agb"));
      return;
    }
    startTransition(async () => {
      try {
        await createCheckoutSession(parsed.data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t(locale, "check_error_unknown");
        if (msg.includes("NEXT_REDIRECT")) return;
        setError(msg);
      }
    });
  };

  return (
    <div className="space-y-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <section>
        <h2 className="font-serif text-2xl">{t(locale, "check_who_title")}</h2>
        <p className="text-sm text-[var(--color-ink-soft)]">{t(locale, "check_who_sub")}</p>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">{t(locale, "check_first_name")}</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={draft.customer.firstName}
                onChange={(e) => patchCustomer({ firstName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">{t(locale, "check_last_name")}</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={draft.customer.lastName}
                onChange={(e) => patchCustomer({ lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">{t(locale, "check_email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={draft.customer.email}
                onChange={(e) => patchCustomer({ email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t(locale, "check_phone")}</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={draft.customer.phone}
                onChange={(e) => patchCustomer({ phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">{t(locale, "check_company")}</Label>
            <Input
              id="company"
              autoComplete="organization"
              value={draft.customer.company ?? ""}
              onChange={(e) => patchCustomer({ company: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-alt)]/60 p-4">
          <input
            type="checkbox"
            checked={acceptedAgb}
            onChange={(e) => setAcceptedAgb(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--color-ink)]"
          />
          <span className="text-sm text-[var(--color-ink-soft)]">
            {t(locale, "check_agb_prefix")}{" "}
            <a href="/agb" className="underline">{t(locale, "check_agb_terms")}</a>{" "}
            {t(locale, "check_agb_and")}{" "}
            <a href="/datenschutz" className="underline">{t(locale, "check_agb_privacy")}</a>
            {t(locale, "check_agb_suffix")}
          </span>
        </label>
      </section>

      {error && (
        <div className="rounded-lg border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] p-3 text-sm text-[var(--color-accent)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="lg" onClick={() => router.push("/buchen/termin")}>
          {t(locale, "check_back")}
        </Button>
        <Button size="xl" onClick={onSubmit} disabled={pending}>
          {pending ? t(locale, "check_submitting") : t(locale, "check_submit")}
        </Button>
      </div>

      <p className="pt-2 text-xs text-[var(--color-ink-mute)]">{t(locale, "check_payment_info")}</p>
    </div>
  );
}
