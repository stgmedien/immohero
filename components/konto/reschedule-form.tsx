"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { rescheduleShoot } from "@/app/konto/actions";

export function RescheduleForm({
  orderShortCode,
  currentScheduledAt,
}: {
  orderShortCode: string;
  currentScheduledAt: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [newAt, setNewAt] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const min = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  function submit() {
    if (!newAt) {
      toast.error("Bitte neuen Termin wählen.");
      return;
    }
    startTransition(async () => {
      const res = await rescheduleShoot({
        orderShortCode,
        newScheduledAt: new Date(newAt).toISOString(),
        note: note.trim() || undefined,
      });
      if (res.ok) {
        toast.success("Termin verschoben — wir bestätigen kurz per Mail.");
        setOpen(false);
        setNewAt("");
        setNote("");
      } else {
        toast.error(res.error ?? "Verschieben fehlgeschlagen.");
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <CalendarClock className="h-3.5 w-3.5" />
        Termin verschieben
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-subtle)]/40 p-4">
      <div className="grid gap-1.5">
        <Label mono>Neuer Termin</Label>
        <Input
          type="datetime-local"
          value={newAt}
          min={min}
          onChange={(e) => setNewAt(e.target.value)}
        />
        <p className="text-xs text-[var(--color-ink-mute)]">
          Mindestens 24 Stunden in der Zukunft.
          {currentScheduledAt && (
            <> Aktuell: {new Date(currentScheduledAt).toLocaleString("de-DE")}.</>
          )}
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label mono>Anmerkung (optional)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="z. B. Warum, Zugang anders, …"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={pending}>
          {pending ? "Speichert…" : "Termin verschieben"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}
