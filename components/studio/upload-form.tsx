"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { saveShotAsset } from "@/app/studio/actions-upload";

interface Shot {
  id: string;
  name: string;
}

export function UploadForm({ orderId, shots }: { orderId: string; shots: Shot[] }) {
  const [shotId, setShotId] = useState<string>(shots[0]?.id ?? "");
  const [kind, setKind] = useState<"reference" | "raw" | "final">("final");
  const [files, setFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState<{ name: string; status: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!files || files.length === 0 || !shotId) return;
    setBusy(true);
    const list: { name: string; status: string }[] = Array.from(files).map((f) => ({
      name: f.name,
      status: "Warteschlange",
    }));
    setProgress(list);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      list[i].status = "Lädt hoch …";
      setProgress([...list]);
      try {
        const result = await upload(`orders/${orderId}/shots/${shotId}/${kind}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          contentType: file.type || undefined,
        });
        await saveShotAsset({
          orderShotId: shotId,
          kind,
          blobUrl: result.url,
          blobPathname: result.pathname,
          filename: file.name,
          sizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
        });
        list[i].status = "✓ Fertig";
      } catch (err) {
        list[i].status = `✗ ${err instanceof Error ? err.message : "Fehler"}`;
      }
      setProgress([...list]);
    }
    setBusy(false);
  };

  return (
    <Card className="mt-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="shotId">Shot</Label>
          <select
            id="shotId"
            value={shotId}
            onChange={(e) => setShotId(e.target.value)}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          >
            {shots.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="kind">Art</Label>
          <select
            id="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as "reference" | "raw" | "final")}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm"
          >
            <option value="reference">Referenz (intern)</option>
            <option value="raw">Raw / Rohdatei</option>
            <option value="final">Final (Kunde sieht das)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Label htmlFor="files">Dateien</Label>
        <input
          id="files"
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[var(--color-ink)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--color-primary-ink)]"
        />
      </div>

      <Button size="lg" className="mt-6" onClick={handleSubmit} disabled={busy || !files}>
        {busy ? "Lädt hoch…" : "Hochladen"}
      </Button>

      {progress.length > 0 && (
        <ul className="mt-6 space-y-2 text-sm">
          {progress.map((p) => (
            <li key={p.name} className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-alt)]/40 px-3 py-2">
              <span className="truncate">{p.name}</span>
              <span className="text-xs text-[var(--color-ink-soft)]">{p.status}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
