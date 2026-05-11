"use client";
import { useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, UploadCloud, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { saveShotAsset, deleteShotAsset, toggleAssetVisibility } from "@/app/studio/actions/assets";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  kind: string;
  blobUrl: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  thumbnailUrl: string | null;
  visibleToClient: boolean;
  shotId: string;
  shotName: string;
}

const KINDS = ["reference", "briefing", "raw", "final", "other"] as const;
type Kind = (typeof KINDS)[number];

export function AssetManager({
  orderId,
  shots,
  assets: initial,
}: {
  orderId: string;
  shots: { id: string; name: string }[];
  assets: Asset[];
}) {
  const [assets, setAssets] = useState(initial);
  const [filterKind, setFilterKind] = useState<string>("all");
  const [filterShot, setFilterShot] = useState<string>("all");
  const [uploadShot, setUploadShot] = useState<string>(shots[0]?.id ?? "");
  const [uploadKind, setUploadKind] = useState<Kind>("final");
  const [visibleToClient, setVisibleToClient] = useState(true);
  const [uploading, setUploading] = useState<{ name: string; status: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = assets.filter((a) => {
    if (filterKind !== "all" && a.kind !== filterKind) return false;
    if (filterShot !== "all" && a.shotId !== filterShot) return false;
    return true;
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || !uploadShot) return;
    setBusy(true);
    const progress = Array.from(files).map((f) => ({ name: f.name, status: "Wartet…" }));
    setUploading(progress);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      progress[i].status = "Lädt hoch…";
      setUploading([...progress]);
      try {
        const result = await upload(
          `orders/${orderId}/shots/${uploadShot}/${uploadKind}/${file.name}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            contentType: file.type || undefined,
          },
        );
        const newAsset = await saveShotAsset({
          orderShotId: uploadShot,
          kind: uploadKind,
          blobUrl: result.url,
          blobPathname: result.pathname,
          filename: file.name,
          sizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
          visibleToClient,
        });
        if (newAsset) {
          setAssets((prev) => [
            {
              ...newAsset,
              sizeBytes: Number(newAsset.sizeBytes),
              shotId: uploadShot,
              shotName: shots.find((s) => s.id === uploadShot)?.name ?? "?",
            },
            ...prev,
          ]);
        }
        progress[i].status = "✓ Fertig";
      } catch (err) {
        progress[i].status = `✗ ${err instanceof Error ? err.message : "Fehler"}`;
      }
      setUploading([...progress]);
    }
    setBusy(false);
    setTimeout(() => setUploading([]), 5000);
    toast.success(`${files.length} Datei${files.length === 1 ? "" : "en"} hochgeladen`);
  };

  return (
    <div className="space-y-6">
      <Card id="upload" className="p-5">
        <h2 className="text-base font-semibold">Upload</h2>
        <p className="text-sm text-[var(--color-ink-3)]">
          Direkt-Upload zu Vercel Blob. Bis 2 GB pro Datei. Sichtbarkeit kann später pro Datei umgeschaltet werden.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label mono>Shot</Label>
            <Select value={uploadShot} onValueChange={setUploadShot}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {shots.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Typ</Label>
            <Select value={uploadKind} onValueChange={(v) => setUploadKind(v as Kind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reference">Referenz</SelectItem>
                <SelectItem value="briefing">Briefing</SelectItem>
                <SelectItem value="raw">Raw</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="other">Sonstige</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Kunde sieht</Label>
            <Select value={visibleToClient ? "yes" : "no"} onValueChange={(v) => setVisibleToClient(v === "yes")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Ja</SelectItem>
                <SelectItem value="no">Nein (intern)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <label
          className={cn(
            "mt-4 block rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-hair)] bg-[var(--color-bg-sunken)]/40 p-8 text-center cursor-pointer transition-colors hover:border-[var(--color-brand-1)] hover:bg-[var(--color-brand-softer)]",
            busy && "opacity-70",
          )}
        >
          <input
            type="file"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            disabled={busy}
            className="hidden"
          />
          <UploadCloud className="mx-auto h-8 w-8 text-[var(--color-ink-3)]" />
          <p className="mt-2 text-sm font-medium">Dateien auswählen oder hier ablegen</p>
          <p className="text-xs text-[var(--color-ink-3)]">Bilder, Videos, PDFs · bis 2 GB</p>
        </label>

        {uploading.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm">
            {uploading.map((u, i) => (
              <li key={i} className="flex items-center justify-between rounded border border-[var(--color-hair)] bg-[var(--color-bg-sunken)]/30 px-3 py-1.5">
                <span className="truncate">{u.name}</span>
                <span className="text-xs text-[var(--color-ink-3)]">{u.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold">Alle Assets ({filtered.length})</h2>
          <p className="text-sm text-[var(--color-ink-3)]">{assets.length} Dateien insgesamt</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterKind} onValueChange={setFilterKind}>
            <SelectTrigger className="!w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="reference">Referenz</SelectItem>
              <SelectItem value="briefing">Briefing</SelectItem>
              <SelectItem value="raw">Raw</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="other">Sonstige</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterShot} onValueChange={setFilterShot}>
            <SelectTrigger className="!w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Shots</SelectItem>
              {shots.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ImagePlus}
          title="Keine Dateien"
          description="Lade die ersten Dateien oben hoch."
        />
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => (
            <AssetTile
              key={a.id}
              asset={a}
              onDelete={() =>
                startTransition(async () => {
                  if (!confirm(`Datei "${a.filename}" wirklich löschen?`)) return;
                  await deleteShotAsset({ assetId: a.id });
                  setAssets((prev) => prev.filter((x) => x.id !== a.id));
                  toast.success("Gelöscht");
                })
              }
              onToggleVisibility={() =>
                startTransition(async () => {
                  await toggleAssetVisibility({ assetId: a.id, visible: !a.visibleToClient });
                  setAssets((prev) => prev.map((x) => (x.id === a.id ? { ...x, visibleToClient: !a.visibleToClient } : x)));
                })
              }
              pending={pending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetTile({
  asset,
  onDelete,
  onToggleVisibility,
  pending,
}: {
  asset: Asset;
  onDelete: () => void;
  onToggleVisibility: () => void;
  pending: boolean;
}) {
  const isImage = asset.mimeType.startsWith("image/");
  return (
    <Card className="overflow-hidden p-0">
      <a
        href={asset.blobUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-[4/3] bg-[var(--color-bg-sunken)] relative"
      >
        {isImage ? (
          <img src={asset.thumbnailUrl ?? asset.blobUrl} alt={asset.filename} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[var(--color-ink-4)]">
            <ImagePlus className="h-12 w-12" />
          </div>
        )}
        <Badge tone={asset.kind === "final" ? "ok" : asset.kind === "reference" ? "brand-soft" : "neutral"} className="absolute top-2 left-2 !text-[9px]">
          {asset.kind}
        </Badge>
      </a>
      <div className="p-3">
        <p className="text-xs font-medium truncate" title={asset.filename}>{asset.filename}</p>
        <p className="text-[10px] text-[var(--color-ink-4)] truncate">{asset.shotName}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-ink-3)]">{(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleVisibility}
              disabled={pending}
              title={asset.visibleToClient ? "Sichtbar für Kunde" : "Nur intern"}
            >
              {asset.visibleToClient ? <Eye className="h-3.5 w-3.5 text-[var(--color-ok)]" /> : <EyeOff className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onDelete} disabled={pending} title="Löschen">
              <Trash2 className="h-3.5 w-3.5 text-[var(--color-danger)]" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
