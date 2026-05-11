"use client";
import { useEffect, useState, useTransition } from "react";
import { Camera, Check, MessageSquareText, UploadCloud } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { get, set } from "idb-keyval";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { setShotStatus } from "@/app/studio/actions/shots";
import { saveShotAsset } from "@/app/studio/actions/assets";
import { cn } from "@/lib/utils";

type ShotRow = {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  notes: string | null;
  perspective: string | null;
  altitudeMeters: number | null;
  durationSec: number | null;
};

type PendingSync = {
  shotId: string;
  status: string;
  notes: string | null;
  timestamp: number;
};

export function FieldShotList({
  orderId,
  orderCode,
  shots: initialShots,
}: {
  orderId: string;
  orderCode: string;
  shots: ShotRow[];
}) {
  const [shots, setShots] = useState(initialShots);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [online, setOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState<PendingSync[]>([]);
  const storageKey = `immohero.field.${orderCode}`;

  // Hydrate from IndexedDB
  useEffect(() => {
    setOnline(navigator.onLine);
    get<PendingSync[]>(storageKey).then((q) => {
      if (q && q.length > 0) {
        setPendingSync(q);
        flushQueue(q);
      }
    });

    const onOnline = () => {
      setOnline(true);
      get<PendingSync[]>(storageKey).then((q) => {
        if (q && q.length > 0) flushQueue(q);
      });
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const flushQueue = async (queue: PendingSync[]) => {
    for (const item of queue) {
      try {
        await setShotStatus({ shotId: item.shotId, status: item.status, notes: item.notes ?? undefined });
      } catch {
        return; // stop on first failure, retry later
      }
    }
    await set(storageKey, []);
    setPendingSync([]);
    toast.success("Sync abgeschlossen");
  };

  const enqueue = async (item: PendingSync) => {
    const queue = [...pendingSync, item];
    setPendingSync(queue);
    await set(storageKey, queue);
  };

  const updateStatus = async (shot: ShotRow, nextStatus: string) => {
    const optimistic = shots.map((s) => (s.id === shot.id ? { ...s, status: nextStatus } : s));
    setShots(optimistic);

    if (!navigator.onLine) {
      await enqueue({ shotId: shot.id, status: nextStatus, notes: shot.notes, timestamp: Date.now() });
      toast.info("Offline – wird synchronisiert sobald online");
      return;
    }

    startTransition(async () => {
      try {
        await setShotStatus({ shotId: shot.id, status: nextStatus });
      } catch {
        await enqueue({ shotId: shot.id, status: nextStatus, notes: shot.notes, timestamp: Date.now() });
        toast.error("Sync fehlgeschlagen – wird wiederholt");
      }
    });
  };

  const uploadCapture = async (shot: ShotRow, file: File) => {
    if (!navigator.onLine) {
      toast.error("Offline – Upload nicht möglich");
      return;
    }
    try {
      const result = await upload(
        `orders/${orderId}/shots/${shot.id}/raw/${file.name}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          contentType: file.type || undefined,
        },
      );
      await saveShotAsset({
        orderShotId: shot.id,
        kind: "raw",
        blobUrl: result.url,
        blobPathname: result.pathname,
        filename: file.name,
        sizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
        visibleToClient: false,
      });
      toast.success(`${file.name} hochgeladen`);
    } catch (err) {
      toast.error("Upload fehlgeschlagen");
    }
  };

  const doneCount = shots.filter((s) => s.status === "done").length;

  return (
    <>
      {pendingSync.length > 0 && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-warn-soft)] bg-[var(--color-warn-soft)]/40 px-4 py-2 text-xs text-[var(--color-warn)]">
          {pendingSync.length} {pendingSync.length === 1 ? "Änderung" : "Änderungen"} warten auf Sync
        </div>
      )}
      {!online && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)]/40 px-4 py-2 text-xs text-[var(--color-danger)]">
          Offline – Änderungen werden lokal gespeichert
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-ink-3)]">
          {doneCount} / {shots.length} fertig
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              shots
                .filter((s) => s.priority === "must" && s.status !== "done")
                .forEach((s) => updateStatus(s, "done"));
            }}
          >
            Alle Musts → fertig
          </Button>
        </div>
      </div>

      <ul className="space-y-2.5">
        {shots.map((shot) => {
          const isDone = shot.status === "done";
          const isExpanded = expanded === shot.id;
          return (
            <li key={shot.id}>
              <Card className={cn("p-4", isDone && "bg-[var(--color-ok-soft)]/40 border-[var(--color-ok)]/30")}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => updateStatus(shot, isDone ? "planned" : "done")}
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      isDone
                        ? "border-[var(--color-ok)] bg-[var(--color-ok)] text-white"
                        : "border-[var(--color-hair)] bg-[var(--color-bg-elev)] active:bg-[var(--color-bg-sunken)]",
                    )}
                    aria-label={isDone ? "Als offen markieren" : "Als fertig markieren"}
                  >
                    {isDone && <Check className="h-6 w-6" strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("font-semibold leading-tight", isDone && "line-through opacity-60")}>
                        {shot.name}
                      </p>
                      <Badge
                        tone={shot.priority === "must" ? "warn" : "neutral"}
                        className="!py-0 !text-[9px]"
                      >
                        {shot.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-ink-3)] line-clamp-2">{shot.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">
                      {shot.perspective && <span>{shot.perspective}</span>}
                      {shot.altitudeMeters !== null && <span>· {shot.altitudeMeters}m</span>}
                      {shot.durationSec !== null && shot.durationSec > 0 && <span>· {shot.durationSec}s</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setExpanded(isExpanded ? null : shot.id)}
                  >
                    <MessageSquareText className="h-3.5 w-3.5" />
                    {shot.notes ? "Notiz bearbeiten" : "Notiz"}
                  </Button>
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadCapture(shot, f);
                      }}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-1.5 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] px-2.5 py-1 text-[11px] font-medium">
                      <Camera className="h-3.5 w-3.5" />
                      Foto
                    </span>
                  </label>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => updateStatus(shot, "reshoot")}
                  >
                    Reshoot
                  </Button>
                </div>

                {isExpanded && (
                  <Textarea
                    placeholder="Was ist hier wichtig?"
                    autoFocus
                    value={shot.notes ?? ""}
                    onChange={(e) => {
                      setShots((all) => all.map((s) => (s.id === shot.id ? { ...s, notes: e.target.value } : s)));
                    }}
                    onBlur={() => {
                      startTransition(async () => {
                        await setShotStatus({ shotId: shot.id, status: shot.status, notes: shot.notes ?? undefined });
                      });
                    }}
                    className="mt-2"
                  />
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
