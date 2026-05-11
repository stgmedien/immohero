"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn, eurosPrecise } from "@/lib/utils";
import { SERVICES, BUNDLES, PROPERTY_TYPES, bundlePriceCents } from "@/lib/services";
import { createManualProject } from "@/app/studio/actions/wizard";

const STEPS = ["Kunde", "Objekt", "Services", "Termin", "Review"] as const;

interface CustomerOption {
  id: string;
  displayName: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
}

export function NewProjectWizard({ customers }: { customers: CustomerOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    customerId: "",
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    title: "",
    propertyType: "haus",
    propertyAddress: "",
    propertyPlz: "",
    propertyCity: "",
    propertyNotes: "",
    propertySizeQm: "",
    bundleSlug: "",
    serviceSlugs: [] as string[],
    scheduledAt: "",
  });

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const totalCents = form.bundleSlug
    ? bundlePriceCents(BUNDLES.find((b) => b.slug === form.bundleSlug)!)
    : form.serviceSlugs.reduce((sum, slug) => sum + (SERVICES.find((s) => s.slug === slug)?.priceCents ?? 0), 0);

  const submit = () => {
    if (!form.customerEmail || !form.propertyAddress) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }
    if (form.serviceSlugs.length === 0 && !form.bundleSlug) {
      toast.error("Bitte Service oder Bundle wählen");
      return;
    }
    startTransition(async () => {
      try {
        const result = await createManualProject({
          customerId: form.customerId || undefined,
          customerEmail: form.customerEmail,
          customerName: form.customerName,
          customerPhone: form.customerPhone || undefined,
          title: form.title || undefined,
          propertyType: form.propertyType as "wohnung" | "haus" | "villa" | "mfh" | "gewerbe" | "industrie" | "grundstueck" | "bauprojekt",
          propertyAddress: form.propertyAddress,
          propertyPlz: form.propertyPlz,
          propertyCity: form.propertyCity,
          propertyNotes: form.propertyNotes || undefined,
          propertySizeQm: form.propertySizeQm ? Number(form.propertySizeQm) : undefined,
          bundleSlug: form.bundleSlug || undefined,
          serviceSlugs: form.serviceSlugs,
          scheduledAt: form.scheduledAt || undefined,
        });
        toast.success("Projekt angelegt");
        router.push(`/studio/projekte/${result.shortCode}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="mt-8">
      <ol className="flex items-center gap-2 mb-8">
        {STEPS.map((label, idx) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-medium",
                idx < step && "bg-[var(--color-brand-1)] text-white",
                idx === step && "bg-[var(--color-ink)] text-[var(--color-bg)]",
                idx > step && "bg-[var(--color-bg-sunken)] text-[var(--color-ink-3)]",
              )}
            >
              {idx < step ? <Check className="h-3.5 w-3.5" /> : idx + 1}
            </span>
            <span className={cn("text-xs", idx === step ? "font-semibold" : "text-[var(--color-ink-3)]")}>{label}</span>
            {idx < STEPS.length - 1 && <span className="text-[var(--color-ink-4)]">·</span>}
          </li>
        ))}
      </ol>

      <Card className="p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Kunde</h2>
            {customers.length > 0 && (
              <div className="grid gap-1.5">
                <Label mono>Bestehender Kunde (optional)</Label>
                <Select
                  value={form.customerId}
                  onValueChange={(v) => {
                    const c = customers.find((x) => x.id === v);
                    setForm({
                      ...form,
                      customerId: v,
                      customerEmail: c?.primaryEmail ?? form.customerEmail,
                      customerName: c?.displayName ?? form.customerName,
                      customerPhone: c?.primaryPhone ?? form.customerPhone,
                    });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="– Neu –" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-1.5">
              <Label mono>Name *</Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label mono>E-Mail *</Label>
                <Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label mono>Telefon</Label>
                <Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Objekt</h2>
            <div className="grid gap-1.5">
              <Label mono>Projekt-Titel (optional)</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. Villa Seeblick" />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Objekttyp</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setForm({ ...form, propertyType: pt.value })}
                    className={cn(
                      "p-3 rounded-[var(--radius-md)] border text-left transition-colors",
                      form.propertyType === pt.value
                        ? "border-[var(--color-brand-1)] ring-2 ring-[var(--color-brand-softer)]"
                        : "border-[var(--color-hair)] hover:border-[var(--color-ink-4)]",
                    )}
                  >
                    <p className="text-sm font-medium">{pt.label}</p>
                    <p className="text-[10px] text-[var(--color-ink-3)]">{pt.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label mono>Straße + Hausnummer *</Label>
              <Input value={form.propertyAddress} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-[140px_1fr_140px]">
              <div className="grid gap-1.5">
                <Label mono>PLZ *</Label>
                <Input value={form.propertyPlz} onChange={(e) => setForm({ ...form, propertyPlz: e.target.value.replace(/\D/g, "").slice(0, 5) })} />
              </div>
              <div className="grid gap-1.5">
                <Label mono>Stadt *</Label>
                <Input value={form.propertyCity} onChange={(e) => setForm({ ...form, propertyCity: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label mono>m²</Label>
                <Input value={form.propertySizeQm} onChange={(e) => setForm({ ...form, propertySizeQm: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label mono>Hinweise</Label>
              <Textarea value={form.propertyNotes} onChange={(e) => setForm({ ...form, propertyNotes: e.target.value })} rows={2} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Services & Bundles</h2>
            <p className="text-sm text-[var(--color-ink-3)]">Wähle ein Bundle oder einzelne Services.</p>
            <div>
              <h3 className="text-sm font-medium mb-2">Bundles</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {BUNDLES.map((b) => {
                  const selected = form.bundleSlug === b.slug;
                  return (
                    <button
                      key={b.slug}
                      type="button"
                      onClick={() => setForm({ ...form, bundleSlug: selected ? "" : b.slug, serviceSlugs: [] })}
                      className={cn(
                        "p-3 rounded-[var(--radius-md)] border text-left",
                        selected
                          ? "border-[var(--color-brand-1)] ring-2 ring-[var(--color-brand-softer)]"
                          : "border-[var(--color-hair)] hover:border-[var(--color-ink-4)]",
                      )}
                    >
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-[10px] text-[var(--color-ink-3)]">{b.tagline}</p>
                      <p className="mt-1 text-sm font-mono">{eurosPrecise(bundlePriceCents(b))}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Oder Einzelservices</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICES.map((s) => {
                  const checked = form.serviceSlugs.includes(s.slug);
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => {
                        const next = checked
                          ? form.serviceSlugs.filter((x) => x !== s.slug)
                          : [...form.serviceSlugs, s.slug];
                        setForm({ ...form, serviceSlugs: next, bundleSlug: next.length > 0 ? "" : form.bundleSlug });
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[var(--radius-md)] border text-left",
                        checked
                          ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)]"
                          : "border-[var(--color-hair)] hover:border-[var(--color-ink-4)]",
                      )}
                    >
                      <span className={cn(
                        "grid h-5 w-5 place-items-center rounded border",
                        checked ? "bg-[var(--color-brand-1)] border-[var(--color-brand-1)] text-white" : "border-[var(--color-hair)]"
                      )}>
                        {checked && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-[10px] text-[var(--color-ink-3)]">{s.shortDescription}</p>
                      </div>
                      <span className="font-mono text-xs">{eurosPrecise(s.priceCents)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--color-hair)] pt-4">
              <span className="text-sm text-[var(--color-ink-3)]">Gesamtsumme</span>
              <span className="text-xl font-semibold tabular-nums">{eurosPrecise(totalCents)}</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Termin</h2>
            <div className="grid gap-1.5">
              <Label mono>Wann?</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
              <p className="text-xs text-[var(--color-ink-3)]">Du kannst das später jederzeit ändern.</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review</h2>
            <dl className="grid gap-3 text-sm">
              <ReviewRow label="Kunde" value={`${form.customerName} · ${form.customerEmail}`} />
              <ReviewRow label="Adresse" value={`${form.propertyAddress}, ${form.propertyPlz} ${form.propertyCity}`} />
              <ReviewRow label="Objekttyp" value={PROPERTY_TYPES.find((p) => p.value === form.propertyType)?.label ?? form.propertyType} />
              <ReviewRow
                label={form.bundleSlug ? "Bundle" : "Services"}
                value={
                  form.bundleSlug
                    ? BUNDLES.find((b) => b.slug === form.bundleSlug)?.name ?? "?"
                    : form.serviceSlugs.map((s) => SERVICES.find((sv) => sv.slug === s)?.name ?? s).join(", ")
                }
              />
              <ReviewRow label="Gesamt" value={eurosPrecise(totalCents)} />
              {form.scheduledAt && <ReviewRow label="Termin" value={new Date(form.scheduledAt).toLocaleString("de-DE")} />}
            </dl>
            <Badge tone="brand-soft">Beim Anlegen wird automatisch die Shotliste passend zum Objekttyp + Services generiert.</Badge>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[var(--color-hair)] pt-4">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Weiter
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={pending}>
              <Plus className="h-4 w-4" />
              Projekt anlegen
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-hair-2)] pb-2">
      <dt className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">{label}</dt>
      <dd className="text-right text-sm">{value}</dd>
    </div>
  );
}
