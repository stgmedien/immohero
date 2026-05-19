"use client";

import { useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitProperty } from "@/app/abo/actions";

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: "wohnung", label: "Wohnung" },
  { value: "haus", label: "Haus" },
  { value: "villa", label: "Villa" },
  { value: "mfh", label: "Mehrfamilienhaus" },
  { value: "gewerbe", label: "Gewerbe" },
  { value: "industrie", label: "Industrie" },
  { value: "grundstueck", label: "Grundstück" },
  { value: "bauprojekt", label: "Bauprojekt" },
];

type UploadMeta = {
  url: string;
  pathname: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
};

export function AboSubmissionForm() {
  const [propertyType, setPropertyType] = useState("haus");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-ok)]/30 bg-[var(--color-ok-soft)] p-6 text-center">
        <p className="font-serif text-2xl text-[var(--color-ink)]">
          Objekt eingereicht — danke!
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Wir prüfen die Einreichung und melden uns. Du bekommst gleich eine
          Bestätigung per E-Mail.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => {
            setDone(false);
            setFiles([]);
            setPropertyType("haus");
          }}
        >
          Weiteres Objekt einreichen
        </Button>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    const address = String(formData.get("propertyAddress") ?? "").trim();
    const plz = String(formData.get("propertyPlz") ?? "").trim();
    const city = String(formData.get("propertyCity") ?? "").trim();
    const sizeRaw = String(formData.get("propertySizeQm") ?? "").trim();
    const notes = String(formData.get("propertyNotes") ?? "").trim();
    const timeframe = String(formData.get("desiredTimeframe") ?? "").trim();

    if (address.length < 3) {
      toast.error("Bitte eine gültige Adresse angeben.");
      return;
    }
    if (!/^\d{5}$/.test(plz)) {
      toast.error("PLZ muss 5 Ziffern haben.");
      return;
    }
    if (city.length < 2) {
      toast.error("Bitte eine Stadt angeben.");
      return;
    }

    let uploads: UploadMeta[] = [];
    if (files.length > 0) {
      setUploading(true);
      try {
        uploads = await Promise.all(
          files.map(async (file) => {
            const result = await upload(
              `abo-submissions/${Date.now()}-${file.name}`,
              file,
              {
                access: "public",
                handleUploadUrl: "/api/abo/upload",
                contentType: file.type || undefined,
              },
            );
            return {
              url: result.url,
              pathname: result.pathname,
              filename: file.name,
              sizeBytes: file.size,
              mimeType: file.type || "application/octet-stream",
            };
          }),
        );
      } catch {
        setUploading(false);
        toast.error("Datei-Upload fehlgeschlagen. Bitte erneut versuchen.");
        return;
      }
      setUploading(false);
    }

    startTransition(async () => {
      const res = await submitProperty({
        propertyType,
        propertyAddress: address,
        propertyPlz: plz,
        propertyCity: city,
        propertySizeQm: sizeRaw ? Number(sizeRaw) : undefined,
        propertyNotes: notes || undefined,
        desiredTimeframe: timeframe || undefined,
        uploads: uploads.length > 0 ? uploads : undefined,
      });
      if (res.ok) {
        setDone(true);
        toast.success("Objekt eingereicht.");
      } else {
        toast.error(res.error ?? "Einreichung fehlgeschlagen.");
      }
    });
  }

  const busy = uploading || pending;

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="propertyType">Objektart</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger id="propertyType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="propertySizeQm">Größe (m², optional)</Label>
          <Input
            id="propertySizeQm"
            name="propertySizeQm"
            type="number"
            min={1}
            placeholder="z. B. 140"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="propertyAddress">Adresse</Label>
        <Input
          id="propertyAddress"
          name="propertyAddress"
          required
          placeholder="Straße und Hausnummer"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="propertyPlz">PLZ</Label>
          <Input
            id="propertyPlz"
            name="propertyPlz"
            required
            inputMode="numeric"
            pattern="\d{5}"
            placeholder="33332"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="propertyCity">Stadt</Label>
          <Input id="propertyCity" name="propertyCity" required placeholder="Gütersloh" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desiredTimeframe">Wunsch-Zeitraum (optional)</Label>
        <Input
          id="desiredTimeframe"
          name="desiredTimeframe"
          placeholder="z. B. nächste 2 Wochen"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="propertyNotes">Anmerkungen (optional)</Label>
        <Textarea
          id="propertyNotes"
          name="propertyNotes"
          placeholder="Besonderheiten, Zugang, Ansprechpartner vor Ort …"
          maxLength={2000}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="aboFiles">Fotos / Unterlagen (optional)</Label>
        <input
          id="aboFiles"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-[var(--color-ink-soft)] file:mr-3 file:rounded-[var(--radius-md)] file:border file:border-[var(--color-hair)] file:bg-[var(--color-bg-subtle)] file:px-3 file:py-2 file:text-sm"
        />
        {files.length > 0 && (
          <p className="text-xs text-[var(--color-ink-mute)]">
            {files.length} Datei{files.length === 1 ? "" : "en"} ausgewählt
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {uploading
          ? "Dateien werden hochgeladen…"
          : pending
            ? "Wird eingereicht…"
            : "Objekt einreichen"}
      </Button>
    </form>
  );
}
