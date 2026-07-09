"use client";

/**
 * Angebots-Panel im Studio (Kunde-Tab): finalen Preis eintragen →
 * Stripe-Zahlungslink erzeugen + per E-Mail an den Kunden schicken.
 * Zeigt danach den Link zum Kopieren/erneut Senden.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { sendOffer } from "@/app/studio/actions/offers";

const euro = (c: number) => (c / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export function OfferPanel({
  orderId,
  status,
  estimateCents,
  quotedPriceCents,
  offerSentAt,
  paymentUrl,
}: {
  orderId: string;
  status: string;
  estimateCents: number;
  quotedPriceCents: number | null;
  offerSentAt: string | null;
  paymentUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const offered = status === "offer_sent" || status === "pending";
  const paid = ["paid", "scheduled", "shooting", "editing", "delivered"].includes(status);
  const cancelled = status === "cancelled";

  const [editing, setEditing] = useState(!offered && !paid && !cancelled);
  const [price, setPrice] = useState(
    ((quotedPriceCents ?? estimateCents) / 100).toFixed(2).replace(".", ","),
  );
  const [note, setNote] = useState("");

  if (paid) {
    return (
      <Card className="p-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Angebot & Zahlung</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge tone="ok">Bezahlt</Badge>
          <span className="text-sm text-[var(--color-ink-2)]">
            {euro(quotedPriceCents ?? estimateCents)}
          </span>
        </div>
      </Card>
    );
  }

  if (cancelled) return null;

  function submit() {
    const cents = Math.round(parseFloat(price.replace(/\./g, "").replace(",", ".")) * 100);
    if (!Number.isFinite(cents) || cents < 100) {
      toast.error("Bitte einen gültigen Preis ab 1,00 € eintragen.");
      return;
    }
    startTransition(async () => {
      const res = await sendOffer({ orderId, priceCents: cents, note: note.trim() || undefined });
      if (!res.ok) {
        toast.error(res.error ?? "Konnte nicht senden.");
        return;
      }
      toast.success("Angebot verschickt — Zahlungslink ist raus.");
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Angebot & Zahlung</p>
        {offered ? (
          <Badge tone="warn" dot>Angebot gesendet</Badge>
        ) : (
          <Badge tone="info" dot>Anfrage — Angebot offen</Badge>
        )}
      </div>

      {offered && !editing ? (
        <div className="mt-3 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[var(--color-ink-3)]">Angebotspreis</span>
            <span className="text-xl font-semibold tabular-nums">{euro(quotedPriceCents ?? 0)}</span>
          </div>
          {offerSentAt ? (
            <p className="text-xs text-[var(--color-ink-3)]">
              Gesendet am {new Date(offerSentAt).toLocaleString("de-DE")}
            </p>
          ) : null}
          {paymentUrl ? (
            <div className="flex items-center gap-2">
              <Input readOnly value={paymentUrl} className="h-9 text-xs" onFocus={(e) => e.currentTarget.select()} />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(paymentUrl);
                  toast.success("Zahlungslink kopiert");
                }}
              >
                Kopieren
              </Button>
            </div>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={pending}>
            Neues Angebot / Preis ändern
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-[var(--color-ink-3)]">
            Richtpreis aus dem Katalog: <strong>{euro(estimateCents)}</strong>. Trage nach dem
            Telefonat den finalen Preis ein — der Kunde bekommt Zahlungslink + Angebots-Mail.
          </p>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <div className="grid gap-1.5">
              <Label mono>Endpreis (€, inkl. MwSt.)</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="z. B. 349,00"
              />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Notiz an den Kunden (optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="z. B. Sonderwunsch Innenaufnahmen inklusive."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={pending}>
              {pending ? "Wird gesendet …" : "Angebot senden & Zahlungslink verschicken"}
            </Button>
            {offered ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={pending}>
                Abbrechen
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}
