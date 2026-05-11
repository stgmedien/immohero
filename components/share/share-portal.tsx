"use client";
import { useState, useTransition } from "react";
import { Check, MessageSquare, Camera, Calendar, MapPin, Cloud, Download } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudioStatusBadge } from "@/components/ui/status-badge";
import { germanDate, cn } from "@/lib/utils";
import { submitShotApproval, submitShotComment, submitAllApproval } from "@/app/share/actions";

interface ShareProject {
  id: string;
  shortCode: string;
  title: string;
  address: string;
  studioStatus: string;
  scheduledAt: string | null;
  estimatedDeliveryAt: string | null;
}

interface ShareAsset {
  id: string;
  kind: string;
  blobUrl: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  thumbnailUrl: string | null;
}

interface ShareShot {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  category: string | null;
  perspective: string | null;
  altitudeMeters: number | null;
  durationSec: number | null;
  isApproved: boolean;
  approvedByClient: boolean;
  referenceAssetUrl: string | null;
  assets: ShareAsset[];
  comments: { id: string; authorName: string | null; body: string; createdAt: string }[];
}

export function SharePortal({
  shareToken,
  project,
  shots: initialShots,
}: {
  shareToken: string;
  project: ShareProject;
  shots: ShareShot[];
}) {
  const [shots, setShots] = useState(initialShots);
  const [openShotId, setOpenShotId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const approveAll = () => {
    if (!confirm("Wirklich alle Shots freigeben?")) return;
    startTransition(async () => {
      await submitAllApproval(shareToken);
      setShots((all) => all.map((s) => ({ ...s, isApproved: true, approvedByClient: true })));
      toast.success("Alle Shots freigegeben");
    });
  };

  const openShot = shots.find((s) => s.id === openShotId);
  const finalAssets = shots.flatMap((s) => s.assets.filter((a) => a.kind === "final"));
  const approvedCount = shots.filter((s) => s.isApproved).length;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <section className="text-center mb-12">
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--color-ink-4)]">
          Auftrag {project.shortCode}
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl leading-tight">{project.title}</h1>
        <p className="mt-2 text-[var(--color-ink-3)] inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {project.address}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <StudioStatusBadge status={project.studioStatus} />
          {project.scheduledAt && (
            <Badge tone="outline">
              <Calendar className="h-3 w-3" />
              {germanDate(project.scheduledAt)}
            </Badge>
          )}
        </div>
      </section>

      <Card className="p-5 mb-6 bg-[var(--color-brand-softer)] border-[var(--color-brand-1)]/20">
        <p className="text-sm">
          Du kannst hier:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--color-ink-2)]">
          <li>✓ Alle geplanten Aufnahmen sehen</li>
          <li>✓ Einzelne Shots freigeben oder kommentieren</li>
          <li>✓ Finale Bilder herunterladen (sobald verfügbar)</li>
        </ul>
        {project.studioStatus === "client_approval" && approvedCount < shots.length && (
          <Button onClick={approveAll} disabled={pending} className="mt-4">
            <Check className="h-4 w-4" />
            Alle freigeben ({approvedCount}/{shots.length})
          </Button>
        )}
      </Card>

      <section>
        <h2 className="text-base font-semibold mb-3">Shotliste</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {shots.map((shot) => (
            <button
              key={shot.id}
              type="button"
              onClick={() => setOpenShotId(shot.id)}
              className={cn(
                "group block aspect-[4/3] rounded-[var(--radius-lg)] border bg-[var(--color-bg-sunken)] overflow-hidden text-left relative transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elev)]",
                shot.isApproved
                  ? "border-[var(--color-ok)] ring-2 ring-[var(--color-ok)]/30"
                  : "border-[var(--color-hair)]",
              )}
            >
              {shot.assets[0]?.thumbnailUrl || shot.assets[0]?.blobUrl ? (
                <img
                  src={shot.assets[0].thumbnailUrl ?? shot.assets[0].blobUrl}
                  alt={shot.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-[var(--color-ink-4)]">
                  <Camera className="h-8 w-8" />
                </div>
              )}
              <div className="absolute inset-x-0 top-0 p-2 flex items-start justify-between">
                <Badge tone={shot.priority === "must" ? "warn" : "neutral"} className="!text-[9px]">
                  {shot.priority}
                </Badge>
                {shot.isApproved && (
                  <Badge tone="ok" className="!text-[9px]">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs text-white font-medium line-clamp-1">{shot.name}</p>
                <p className="text-[10px] text-white/70">{shot.perspective ?? "—"}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {finalAssets.length > 0 && (
        <section className="mt-12">
          <h2 className="text-base font-semibold mb-3">Finale Lieferung ({finalAssets.length})</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {finalAssets.map((asset) => (
              <DownloadCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}

      {openShot && (
        <ShotDetailDialog
          shareToken={shareToken}
          shot={openShot}
          onClose={() => setOpenShotId(null)}
          onUpdate={(patch) => {
            setShots((all) => all.map((s) => (s.id === openShot.id ? { ...s, ...patch } : s)));
          }}
        />
      )}
    </div>
  );
}

function DownloadCard({ asset }: { asset: ShareAsset }) {
  const isImage = asset.mimeType.startsWith("image/");
  return (
    <a
      href={asset.blobUrl}
      download={asset.filename}
      className="block aspect-[4/3] rounded-[var(--radius-lg)] border border-[var(--color-hair)] bg-[var(--color-bg-sunken)] overflow-hidden relative group"
    >
      {isImage ? (
        <img
          src={asset.thumbnailUrl ?? asset.blobUrl}
          alt={asset.filename}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Download className="h-8 w-8 text-[var(--color-ink-4)]" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors grid place-items-center">
        <Badge tone="ink" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Download className="h-3 w-3" />
          Download
        </Badge>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-[10px] text-white truncate">{asset.filename}</p>
      </div>
    </a>
  );
}

function ShotDetailDialog({
  shareToken,
  shot,
  onClose,
  onUpdate,
}: {
  shareToken: string;
  shot: ShareShot;
  onClose: () => void;
  onUpdate: (patch: Partial<ShareShot>) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");

  const handleApprove = (approved: boolean) => {
    startTransition(async () => {
      await submitShotApproval({ token: shareToken, shotId: shot.id, approved });
      onUpdate({ isApproved: approved, approvedByClient: approved });
      toast.success(approved ? "Freigegeben" : "Freigabe zurückgezogen");
    });
  };

  const handleComment = () => {
    if (!commentBody.trim() || !authorName.trim()) return;
    startTransition(async () => {
      await submitShotComment({
        token: shareToken,
        shotId: shot.id,
        body: commentBody,
        authorName,
      });
      onUpdate({
        comments: [
          ...shot.comments,
          { id: `temp-${Date.now()}`, authorName, body: commentBody, createdAt: new Date().toISOString() },
        ],
      });
      setCommentBody("");
      toast.success("Kommentar gesendet");
    });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{shot.name}</DialogTitle>
        </DialogHeader>
        {shot.assets[0] && (
          <div className="aspect-video rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-bg-sunken)]">
            <img
              src={shot.assets[0].thumbnailUrl ?? shot.assets[0].blobUrl}
              alt={shot.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <p className="text-sm text-[var(--color-ink-2)]">{shot.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">
          {shot.perspective && <div><p className="text-[var(--color-ink-3)]">Perspektive</p><p className="mt-0.5 text-[var(--color-ink-2)] normal-case">{shot.perspective}</p></div>}
          {shot.altitudeMeters !== null && <div><p>Höhe</p><p className="mt-0.5 text-[var(--color-ink-2)] normal-case">{shot.altitudeMeters}m</p></div>}
          {shot.durationSec !== null && shot.durationSec > 0 && <div><p>Dauer</p><p className="mt-0.5 text-[var(--color-ink-2)] normal-case">{shot.durationSec}s</p></div>}
          <div><p>Priorität</p><p className="mt-0.5 text-[var(--color-ink-2)] normal-case">{shot.priority}</p></div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-hair)] pt-4">
          <p className="text-sm font-medium">Freigabe</p>
          {shot.isApproved ? (
            <Button variant="outline" size="sm" onClick={() => handleApprove(false)} disabled={pending}>
              Zurückziehen
            </Button>
          ) : (
            <Button onClick={() => handleApprove(true)} disabled={pending}>
              <Check className="h-4 w-4" />
              Freigeben
            </Button>
          )}
        </div>

        <div className="border-t border-[var(--color-hair)] pt-4">
          <p className="text-sm font-medium mb-2">Kommentare ({shot.comments.length})</p>
          <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {shot.comments.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-3)]">Noch keine Kommentare.</p>
            ) : (
              shot.comments.map((c) => (
                <li key={c.id} className="rounded-[var(--radius-sm)] border border-[var(--color-hair)] p-2 text-xs">
                  <p className="font-medium">{c.authorName ?? "Anonym"}</p>
                  <p className="mt-0.5 text-[var(--color-ink-2)]">{c.body}</p>
                  <time className="text-[10px] text-[var(--color-ink-4)]">
                    {formatDistanceToNow(new Date(c.createdAt), { locale: de, addSuffix: true })}
                  </time>
                </li>
              ))
            )}
          </ul>
          <div className="grid gap-2">
            <Input
              placeholder="Dein Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <Textarea
              placeholder="Kommentar…"
              rows={2}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <Button
              onClick={handleComment}
              disabled={!commentBody.trim() || !authorName.trim() || pending}
              size="sm"
              className="self-end"
            >
              <MessageSquare className="h-4 w-4" />
              Senden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
