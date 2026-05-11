"use client";
import { useState, useTransition } from "react";
import { Archive, ArrowLeft, RefreshCw, Save } from "lucide-react";
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
} from "@/app/studio/actions/projects";
import { StudioStatusBadge } from "@/components/ui/status-badge";

interface ProjectData {
  title: string;
  studioStatus: string;
  scheduledAt: string;
  estimatedDeliveryAt: string;
  propertyNotes: string;
  deliveryNotesInternal: string;
  isArchived: boolean;
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
