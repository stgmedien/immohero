"use client";
import { useState, useTransition } from "react";
import { Archive, ArrowLeft, RefreshCw, Save, Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  setStudioStatus,
  updateProjectMeta,
  archiveOrder,
  unarchiveOrder,
  regenerateShotlist,
  cancelOrder,
} from "@/app/studio/actions/projects";
import { StudioStatusBadge } from "@/components/ui/status-badge";
import { eurosPrecise } from "@/lib/utils";

interface ProjectData {
  title: string;
  studioStatus: string;
  scheduledAt: string;
  estimatedDeliveryAt: string;
  propertyNotes: string;
  deliveryNotesInternal: string;
  isArchived: boolean;
  status: string;
  totalCents: number;
  refundedCents: number;
  hasPayment: boolean;
  cancelledAt: string | null;
  cancelReason: string | null;
}

const STATUSES = [
  { value: "draft", label: "Entwurf" },
  { value: "production", label: "Produktion" },
  { value: "client_approval", label: "Freigabe (Kunde)" },
  { value: "revision", label: "Revision" },
  { value: "approved", label: "Freigegeben" },
  { value: "completed", label: "Geliefert" },
];

export function ProjectSettings({
  orderId,
  shortCode,
  data,
}: {
  orderId: string;
  shortCode: string;
  data: ProjectData;
}) {
  const [form, setForm] = useState(data);
  const [pending, startTransition] = useTransition();

  const [cancelReason, setCancelReason] = useState("");
  const [refundMode, setRefundMode] = useState<"none" | "full" | "partial">(
    data.hasPayment ? "full" : "none",
  );
  const [partialEuro, setPartialEuro] = useState("");
  const [notify, setNotify] = useState(true);
  const isCancelled = form.status === "cancelled" || !!form.cancelledAt;
  const refundable = Math.max(0, form.totalCents - form.refundedCents);

  const doCancel = () => {
    if (cancelReason.trim().length < 3) {
      toast.error("Bitte einen Stornogrund angeben.");
      return;
    }
    const msg =
      refundMode === "none"
        ? "Auftrag stornieren (ohne Erstattung)?"
        : refundMode === "full"
          ? `Auftrag stornieren und ${eurosPrecise(refundable)} erstatten?`
          : `Auftrag stornieren und ${partialEuro || "0"} € erstatten?`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      try {
        const res = await cancelOrder({
          orderId,
          reason: cancelReason,
          refundMode,
          refundCents:
            refundMode === "partial"
              ? Math.round(parseFloat(partialEuro.replace(",", ".")) * 100)
              : undefined,
          notifyCustomer: notify,
        });
        setForm((f) => ({
          ...f,
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          cancelReason,
          refundedCents: f.refundedCents + (res.refundedCents ?? 0),
        }));
        toast.success(
          res.refundedCents
            ? `Storniert · ${eurosPrecise(res.refundedCents)} erstattet`
            : "Auftrag storniert",
        );
      } catch (e) {
        toast.error((e as Error).message || "Stornierung fehlgeschlagen");
      }
    });
  };

  const saveMeta = () => {
    startTransition(async () => {
      await updateProjectMeta({
        orderId,
        title: form.title || undefined,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        estimatedDeliveryAt: form.estimatedDeliveryAt
          ? new Date(form.estimatedDeliveryAt).toISOString()
          : undefined,
        propertyNotes: form.propertyNotes,
        deliveryNotesInternal: form.deliveryNotesInternal,
      });
      toast.success("Gespeichert");
    });
  };

  const changeStatus = (status: string) => {
    setForm((f) => ({ ...f, studioStatus: status }));
    startTransition(async () => {
      await setStudioStatus(orderId, status);
      toast.success(`Status: ${STATUSES.find((s) => s.value === status)?.label ?? status}`);
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Studio-Status</p>
            <h2 className="mt-1 text-xl font-semibold">Workflow-Phase</h2>
          </div>
          <StudioStatusBadge status={form.studioStatus} />
        </div>
        <div className="mt-4">
          <Select value={form.studioStatus} onValueChange={changeStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-2 text-xs text-[var(--color-ink-3)]">
          Bei „Freigabe (Kunde)" wird der Share-Link aktiv; bei „Geliefert" wird die finale Lieferungs-Mail versendet.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Projektdaten</h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-1.5">
            <Label mono>Projekt-Titel</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={`Default: ${shortCode}`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label mono>Termin</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Voraussichtl. Lieferung</Label>
              <Input
                type="date"
                value={form.estimatedDeliveryAt}
                onChange={(e) => setForm({ ...form, estimatedDeliveryAt: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Hinweise des Kunden</Label>
            <Textarea
              value={form.propertyNotes}
              onChange={(e) => setForm({ ...form, propertyNotes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid gap-1.5">
            <Label mono>Interne Lieferungs-Notiz</Label>
            <Textarea
              value={form.deliveryNotesInternal}
              onChange={(e) => setForm({ ...form, deliveryNotesInternal: e.target.value })}
              rows={3}
              placeholder="Was muss das Team bei der Lieferung beachten?"
            />
          </div>
          <Button onClick={saveMeta} disabled={pending} className="self-end">
            <Save className="h-4 w-4" />
            Speichern
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Shotliste regenerieren</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-3)]">
          Setzt die Shotliste komplett zurück auf Basis der gebuchten Services und des Property-Typs.
          <strong className="text-[var(--color-danger)]"> Alle individuellen Anpassungen, Notizen und Status werden gelöscht.</strong>
        </p>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => {
            if (!confirm("Wirklich Shotliste neu generieren? Alle Anpassungen gehen verloren.")) return;
            startTransition(async () => {
              await regenerateShotlist(orderId);
              toast.success("Shotliste neu generiert");
            });
          }}
          disabled={pending}
        >
          <RefreshCw className="h-4 w-4" />
          Neu generieren
        </Button>
      </Card>

      <Card className="p-5 border-[var(--color-danger)]/25">
        <h2 className="text-base font-semibold">Stornierung &amp; Erstattung</h2>
        {isCancelled ? (
          <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] p-3 text-sm">
            <p className="font-medium text-[var(--color-danger)]">
              Storniert{form.cancelledAt ? ` am ${new Date(form.cancelledAt).toLocaleDateString("de-DE")}` : ""}
            </p>
            {form.cancelReason && (
              <p className="mt-1 text-[var(--color-ink-3)]">Grund: {form.cancelReason}</p>
            )}
            {form.refundedCents > 0 && (
              <p className="mt-1 text-[var(--color-ink-3)]">
                Erstattet: {eurosPrecise(form.refundedCents)}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-[var(--color-ink-3)]">
              Auftragssumme {eurosPrecise(form.totalCents)}
              {form.refundedCents > 0
                ? ` · bereits erstattet ${eurosPrecise(form.refundedCents)}`
                : ""}
              {form.hasPayment
                ? ` · erstattbar ${eurosPrecise(refundable)}`
                : " · keine Stripe-Zahlung hinterlegt"}
            </p>
            <div className="grid gap-1.5">
              <Label mono>Stornogrund (geht an den Kunden)</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
                placeholder="z. B. Kunde hat storniert / Termin nicht zustande gekommen"
              />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Erstattung</Label>
              <Select
                value={refundMode}
                onValueChange={(v) => setRefundMode(v as "none" | "full" | "partial")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Erstattung</SelectItem>
                  <SelectItem value="full" disabled={!form.hasPayment || refundable <= 0}>
                    Volle Erstattung ({eurosPrecise(refundable)})
                  </SelectItem>
                  <SelectItem value="partial" disabled={!form.hasPayment || refundable <= 0}>
                    Teilerstattung
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {refundMode === "partial" && (
              <div className="grid gap-1.5">
                <Label mono>Betrag in € (max. {(refundable / 100).toFixed(2)})</Label>
                <Input
                  inputMode="decimal"
                  value={partialEuro}
                  onChange={(e) => setPartialEuro(e.target.value)}
                  placeholder="z. B. 99,50"
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-brand-1)]"
              />
              Kunde per E-Mail benachrichtigen
            </label>
            <Button variant="danger" onClick={doCancel} disabled={pending}>
              <Ban className="h-4 w-4" />
              Auftrag stornieren
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Archiv</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-3)]">
          Archivierte Projekte bleiben erhalten, aber tauchen standardmäßig nicht in der Liste auf.
        </p>
        {form.isArchived ? (
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() =>
              startTransition(async () => {
                await unarchiveOrder(orderId);
                setForm({ ...form, isArchived: false, studioStatus: "production" });
                toast.success("Wiederhergestellt");
              })
            }
            disabled={pending}
          >
            <ArrowLeft className="h-4 w-4" />
            Aus Archiv wiederherstellen
          </Button>
        ) : (
          <Button
            variant="danger"
            className="mt-3"
            onClick={() => {
              if (!confirm("Wirklich archivieren?")) return;
              startTransition(async () => {
                await archiveOrder(orderId);
              });
            }}
            disabled={pending}
          >
            <Archive className="h-4 w-4" />
            Archivieren
          </Button>
        )}
      </Card>
    </div>
  );
}
