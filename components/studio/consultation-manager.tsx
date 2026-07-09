"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Calendar, Check, X, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { germanDateTime } from "@/lib/utils";
import {
  acceptConsultation,
  declineConsultation,
  completeConsultation,
} from "@/app/studio/actions/consultations";

interface Row {
  id: string;
  orderId: string | null;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  requestedStart: string;
  requestedEnd: string;
  status: string;
  meetingProvider: string | null;
  meetingUrl: string | null;
  customerNote: string | null;
  internalNotes: string | null;
  googleHtmlLink: string | null;
  shortCode: string | null;
  orderStatus: string | null;
  propertyCity: string | null;
  propertyAddress: string | null;
}

export function ConsultationManager({
  title,
  rows,
  repName,
  confirmedView,
  readOnly,
}: {
  title: string;
  rows: Row[];
  repName: string;
  confirmedView?: boolean;
  readOnly?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
        {title}
      </h2>
      <div className="mt-3 space-y-3">
        {rows.map((r) => (
          <ConsultationCard
            key={r.id}
            row={r}
            repName={repName}
            confirmedView={confirmedView}
            readOnly={readOnly}
          />
        ))}
      </div>
    </section>
  );
}

function ConsultationCard({
  row,
  repName,
  confirmedView,
  readOnly,
}: {
  row: Row;
  repName: string;
  confirmedView?: boolean;
  readOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const statusTone =
    row.status === "confirmed"
      ? "ok"
      : row.status === "requested"
        ? "warn"
        : row.status === "declined"
          ? "danger"
          : "neutral";

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg">{germanDateTime(row.requestedStart)} Uhr</span>
            <Badge tone={statusTone as "ok" | "warn" | "danger" | "neutral"}>{row.status}</Badge>
          </div>
          <p className="mt-1 text-sm">
            <strong>{row.customerName ?? row.customerEmail}</strong>
            {row.customerPhone ? ` · ${row.customerPhone}` : ""}
          </p>
          <p className="text-xs text-[var(--color-ink-3)]">{row.customerEmail}</p>
          {row.shortCode && (
            <p className="mt-1 text-xs text-[var(--color-ink-3)]">
              Auftrag{" "}
              <Link href={`/studio/projekte/${row.shortCode}`} className="underline">
                {row.shortCode}
              </Link>
              {row.propertyCity ? ` · ${row.propertyAddress}, ${row.propertyCity}` : ""}
              {row.orderStatus === "inquiry" || row.orderStatus === "offer_sent" ? (
                <>
                  {" · "}
                  <Link
                    href={`/studio/projekte/${row.shortCode}/kunde`}
                    className="font-medium text-[var(--color-brand-1)] underline"
                  >
                    {row.orderStatus === "offer_sent" ? "Angebot ansehen →" : "Angebot senden →"}
                  </Link>
                </>
              ) : null}
            </p>
          )}
          {row.customerNote && (
            <p className="mt-2 rounded-md bg-[var(--color-bg-sunken)]/50 px-3 py-2 text-xs text-[var(--color-ink-2)]">
              Kundennotiz: {row.customerNote}
            </p>
          )}
          {row.meetingUrl && (
            <a
              href={row.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--color-brand-1)] underline"
            >
              <Video className="h-3.5 w-3.5" />
              {row.meetingProvider ?? "Meeting"} öffnen
            </a>
          )}
          {row.googleHtmlLink && (
            <a
              href={row.googleHtmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 ml-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-3)] underline"
            >
              <ExternalLink className="h-3 w-3" />
              im Kalender
            </a>
          )}
        </div>

        {!readOnly && (
          <div className="flex shrink-0 gap-2">
            {row.status === "requested" && (
              <>
                <AcceptDialog row={row} repName={repName} />
                <DeclineDialog row={row} />
              </>
            )}
            {confirmedView && row.status === "confirmed" && (
              <Button
                variant="secondary"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await completeConsultation(row.id);
                    toast.success("Als erledigt markiert");
                  })
                }
              >
                <Check className="h-4 w-4" />
                Erledigt
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function AcceptDialog({ row, repName }: { row: Row; repName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [provider, setProvider] = useState<"google_meet" | "teams" | "zoom" | "custom">(
    "google_meet",
  );
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (provider !== "google_meet" && !meetingUrl.trim()) {
      toast.error("Bitte den Meeting-Link einfügen.");
      return;
    }
    startTransition(async () => {
      try {
        await acceptConsultation({
          consultationId: row.id,
          meetingProvider: provider,
          meetingUrl: meetingUrl.trim() || undefined,
          internalNotes: notes.trim() || undefined,
        });
        toast.success("Termin bestätigt & Kunde benachrichtigt");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Check className="h-4 w-4" />
          Annehmen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beratungstermin bestätigen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-[var(--color-bg-sunken)]/50 p-3 text-sm">
            <p className="font-medium">{germanDateTime(row.requestedStart)} Uhr</p>
            <p className="text-xs text-[var(--color-ink-3)]">
              {row.customerName ?? row.customerEmail} · wird {repName} zugewiesen
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Meeting-Tool</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as typeof provider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_meet">Google Meet (automatisch)</SelectItem>
                <SelectItem value="teams">Microsoft Teams (Link einfügen)</SelectItem>
                <SelectItem value="zoom">Zoom (Link einfügen)</SelectItem>
                <SelectItem value="custom">Anderer Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {provider !== "google_meet" && (
            <div className="grid gap-1.5">
              <Label mono>Meeting-Link</Label>
              <Input
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://teams.microsoft.com/l/meetup-join/…"
                autoFocus
              />
            </div>
          )}
          {provider === "google_meet" && (
            <p className="text-xs text-[var(--color-ink-3)]">
              Google Meet erzeugt automatisch einen Link in der Kalender-Einladung (sofern
              Google verbunden ist). Du kannst optional trotzdem einen eigenen Link eintragen.
            </p>
          )}
          <div className="grid gap-1.5">
            <Label mono>Interne Notiz (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Worauf im Gespräch achten?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={submit} disabled={pending}>
            <Calendar className="h-4 w-4" />
            Bestätigen & einladen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeclineDialog({ row }: { row: Row }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("Der gewünschte Termin ist leider schon vergeben.");

  const submit = () => {
    startTransition(async () => {
      try {
        await declineConsultation({ consultationId: row.id, reason: reason.trim() });
        toast.success("Abgelehnt & Kunde benachrichtigt");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <X className="h-4 w-4" />
          Ablehnen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Termin ablehnen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label mono>Grund / Nachricht an den Kunden</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          <p className="text-xs text-[var(--color-ink-3)]">
            Der Kunde bekommt eine freundliche E-Mail mit der Bitte, neue Zeiten vorzuschlagen.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button variant="danger" onClick={submit} disabled={pending || !reason.trim()}>
            Ablehnen & benachrichtigen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
