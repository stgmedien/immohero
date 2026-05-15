"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Gift, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { captureLeadAndIssueVoucher, type CaptureResult } from "@/app/messe/actions";

export function LeadForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", consent: false, website: "" });
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (!form.consent) {
      setError("Bitte stimme der Datenverarbeitung zu.");
      return;
    }
    startTransition(async () => {
      const res = await captureLeadAndIssueVoucher(form);
      if (!res.ok) {
        setError(res.error ?? "Etwas ist schiefgelaufen.");
        return;
      }
      setResult(res);
    });
  };

  const reset = () => {
    setResult(null);
    setForm({ name: "", email: "", phone: "", consent: false, website: "" });
    setError(null);
  };

  if (result?.ok) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] p-8 text-center shadow-lg">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <Gift className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-serif text-3xl">
          {result.alreadyRegistered ? "Willkommen zurück!" : "Geschafft — 15 € geschenkt!"}
        </h2>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          {result.alreadyRegistered
            ? "Du hast bereits einen Gutschein — hier ist er nochmal:"
            : "Dein persönlicher Gutschein-Code:"}
        </p>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(result.voucherCode ?? "");
            toast.success("Code kopiert");
          }}
          className="group mx-auto mt-6 flex items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-brand-1)] bg-[var(--color-brand-softer)] px-8 py-6 transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          <span className="font-mono text-3xl font-bold tracking-[0.2em] text-[var(--color-ink)] sm:text-4xl">
            {result.voucherCode}
          </span>
          <Copy className="h-5 w-5 text-[var(--color-ink-3)] group-hover:text-[var(--color-ink)]" />
        </button>

        <p className="mt-5 text-sm text-[var(--color-ink-soft)]">
          Wir haben den Code auch an <strong>{result.email}</strong> geschickt.
        </p>
        <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
          15 € Rabatt · einlösbar ab 199 € Bestellwert · gültig bis {result.expiresAt}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/buchen">Direkt buchen</Link>
          </Button>
          <Button variant="secondary" size="lg" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Nächste Person erfassen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] p-6 shadow-lg sm:p-8">
      <div className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-base">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Max Mustermann"
            autoComplete="name"
            className="!h-14 !text-lg"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-base">E-Mail</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="max@beispiel.de"
            autoComplete="email"
            inputMode="email"
            className="!h-14 !text-lg"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone" className="text-base">Telefon</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0151 23456789"
            autoComplete="tel"
            inputMode="tel"
            className="!h-14 !text-lg"
          />
        </div>

        {/* Honeypot — hidden from humans */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-hair)] bg-[var(--color-bg-subtle)] p-4">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand-1)]"
          />
          <span className="text-sm text-[var(--color-ink-soft)]">
            Ich willige ein, dass ImmoHero meine Daten zur Zusendung des Gutscheins und zur
            Kontaktaufnahme speichert und verarbeitet. Widerruf jederzeit an hallo@immohero.org.
            Mehr in der{" "}
            <Link href="/datenschutz" className="underline" target="_blank">
              Datenschutzerklärung
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="rounded-lg border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)]/40 px-4 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <Button
          size="xl"
          className="w-full"
          onClick={submit}
          disabled={pending || !form.name || !form.email || !form.phone}
        >
          {pending ? (
            "Gutschein wird erstellt…"
          ) : (
            <>
              <Check className="h-5 w-5" />
              15 € Gutschein sichern
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
