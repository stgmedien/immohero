"use client";
import { useState, useTransition, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Check, Camera, MoreHorizontal, Plus, Trash2,
  ImagePlus, MessageSquare, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShotStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addShot, updateShot, setShotStatus, approveShot, reorderShots, deleteShot } from "@/app/studio/actions/shots";
import { addShotComment, resolveComment } from "@/app/studio/actions/comments";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

type Shot = {
  id: string;
  name: string;
  description: string;
  notes: string | null;
  priority: string;
  position: number;
  status: string;
  category: string | null;
  perspective: string | null;
  altitudeMeters: number | null;
  movement: string | null;
  durationSec: number | null;
  isApproved: boolean;
  referenceAssetUrl: string | null;
};

type Asset = {
  id: string;
  kind: string;
  blobUrl: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  thumbnailUrl: string | null;
  visibleToClient: boolean;
};

type Comment = {
  id: string;
  authorName: string | null;
  body: string;
  source: string;
  createdAt: string;
  resolvedAt: string | null;
};

interface Props {
  orderId: string;
  shortCode: string;
  shots: Shot[];
  assetsByShot: Record<string, Asset[]>;
  commentsByShot: Record<string, Comment[]>;
}

export function ShotlistEditor({ orderId, shortCode, shots: initialShots, assetsByShot, commentsByShot }: Props) {
  const [shots, setShots] = useState(initialShots);
  const [selectedId, setSelectedId] = useState<string | null>(initialShots[0]?.id ?? null);

  useEffect(() => {
    setShots(initialShots);
    if (!selectedId && initialShots[0]) setSelectedId(initialShots[0].id);
  }, [initialShots, selectedId]);

  const selected = shots.find((s) => s.id === selectedId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = shots.findIndex((s) => s.id === active.id);
    const newIdx = shots.findIndex((s) => s.id === over.id);
    const reordered = [...shots];
    const [moved] = reordered.splice(oldIdx, 1);
    reordered.splice(newIdx, 0, moved);
    setShots(reordered);
    try {
      await reorderShots({ orderId, shotIds: reordered.map((s) => s.id) });
      toast.success("Reihenfolge gespeichert");
    } catch {
      toast.error("Speichern fehlgeschlagen");
      setShots(initialShots);
    }
  };

  if (shots.length === 0) {
    return (
      <EmptyState
        icon={Camera}
        title="Noch keine Shots"
        description="Lege Shots manuell an oder generiere die Shotliste neu aus dem Property-Typ + Service."
        action={
          <AddShotButton orderId={orderId} />
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 min-h-[60vh]">
      <ShotListPane
        shots={shots}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        orderId={orderId}
      />
      {selected ? (
        <ShotDetailPane
          shot={selected}
          assets={assetsByShot[selected.id] ?? []}
          comments={commentsByShot[selected.id] ?? []}
          onChange={(patch) => {
            setShots((all) => all.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)));
          }}
        />
      ) : (
        <Card className="p-6 grid place-items-center text-[var(--color-ink-3)]">
          <p>Wähle einen Shot zum Bearbeiten.</p>
        </Card>
      )}
    </div>
  );
}

function ShotListPane({
  shots,
  selectedId,
  onSelect,
  onDragEnd,
  sensors,
  orderId,
}: {
  shots: Shot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDragEnd: (e: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  orderId: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
            Shotliste
          </p>
          <h3 className="text-base font-semibold">{shots.length} Shots</h3>
        </div>
        <AddShotButton orderId={orderId} />
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={shots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {shots.map((shot) => (
              <SortableShotItem
                key={shot.id}
                shot={shot}
                isSelected={shot.id === selectedId}
                onClick={() => onSelect(shot.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableShotItem({
  shot,
  isSelected,
  onClick,
}: {
  shot: Shot;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: shot.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--color-bg-elev)] p-2.5 transition-colors",
          isSelected
            ? "border-[var(--color-brand-1)] ring-2 ring-[var(--color-brand-softer)]"
            : "border-[var(--color-hair)] hover:border-[var(--color-ink-4)]",
        )}
      >
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab text-[var(--color-ink-4)] hover:text-[var(--color-ink-3)] active:cursor-grabbing"
          aria-label="Verschieben"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClick} className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            {shot.status === "done" && <Check className="h-3.5 w-3.5 text-[var(--color-ok)]" />}
            <span className="text-sm font-medium truncate">{shot.name}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">
            <span>{shot.perspective ?? "—"}</span>
            {shot.altitudeMeters !== null && <span>· {shot.altitudeMeters}m</span>}
            {shot.durationSec !== null && shot.durationSec > 0 && <span>· {shot.durationSec}s</span>}
          </div>
        </button>
        <span className={cn(
          "shrink-0 h-1.5 w-1.5 rounded-full",
          shot.priority === "must" && "bg-[var(--color-danger)]",
          shot.priority === "nice" && "bg-[var(--color-ink-4)]",
          shot.priority === "optional" && "bg-[var(--color-ink-5)]",
        )} />
      </div>
    </li>
  );
}

function AddShotButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() =>
        startTransition(async () => {
          await addShot({ orderId, name: "Neuer Shot", priority: "nice" });
          toast.success("Shot hinzugefügt");
        })
      }
      disabled={pending}
    >
      <Plus className="h-3.5 w-3.5" />
      Shot
    </Button>
  );
}

function ShotDetailPane({
  shot,
  assets,
  comments,
  onChange,
}: {
  shot: Shot;
  assets: Asset[];
  comments: Comment[];
  onChange: (patch: Partial<Shot>) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [comment, setComment] = useState("");

  const saveShot = (patch: Partial<Shot>) => {
    onChange(patch);
    startTransition(async () => {
      try {
        await updateShot({
          shotId: shot.id,
          name: patch.name,
          description: patch.description,
          notes: patch.notes ?? undefined,
          category: patch.category ?? undefined,
          perspective: patch.perspective ?? undefined,
          movement: patch.movement ?? undefined,
          altitudeMeters: patch.altitudeMeters ?? undefined,
          durationSec: patch.durationSec ?? undefined,
          priority: (patch.priority as "must" | "nice" | "optional" | undefined) ?? undefined,
          referenceAssetUrl: patch.referenceAssetUrl ?? undefined,
        });
      } catch {
        toast.error("Speichern fehlgeschlagen");
      }
    });
  };

  const toggleDone = () => {
    const next = shot.status === "done" ? "planned" : "done";
    onChange({ status: next });
    startTransition(async () => {
      await setShotStatus({ shotId: shot.id, status: next });
      toast.success(next === "done" ? "Als fertig markiert" : "Zurück auf geplant");
    });
  };

  const toggleApprove = () => {
    onChange({ isApproved: !shot.isApproved });
    startTransition(async () => {
      await approveShot({ shotId: shot.id, approved: !shot.isApproved });
    });
  };

  const submitComment = () => {
    if (!comment.trim()) return;
    startTransition(async () => {
      await addShotComment({ orderShotId: shot.id, body: comment, source: "internal" });
      setComment("");
      toast.success("Kommentar gepostet");
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Input
            value={shot.name}
            onChange={(e) => saveShot({ name: e.target.value })}
            className="text-lg font-semibold !h-auto !py-2 !px-3 !text-lg flex-1"
          />
          <Button
            size="sm"
            variant={shot.status === "done" ? "secondary" : "primary"}
            onClick={toggleDone}
            disabled={pending}
          >
            {shot.status === "done" ? "✓ Fertig" : "Als fertig"}
          </Button>
          <Button
            size="sm"
            variant={shot.isApproved ? "ink" : "outline"}
            onClick={toggleApprove}
            disabled={pending}
          >
            {shot.isApproved ? "Approved" : "Approve"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              if (confirm("Diesen Shot wirklich löschen?")) {
                startTransition(async () => {
                  await deleteShot({ shotId: shot.id });
                  toast.success("Gelöscht");
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
          </Button>
        </div>

        <Textarea
          value={shot.description}
          onChange={(e) => saveShot({ description: e.target.value })}
          placeholder="Beschreibung des Shots…"
          className="mt-3"
        />

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Priorität">
            <Select value={shot.priority} onValueChange={(v) => saveShot({ priority: v as "must" | "nice" | "optional" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="must">● Must</SelectItem>
                <SelectItem value="nice">○ Nice</SelectItem>
                <SelectItem value="optional">· Optional</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={shot.status} onValueChange={(v) => startTransition(async () => {
              onChange({ status: v });
              await setShotStatus({ shotId: shot.id, status: v });
            })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Geplant</SelectItem>
                <SelectItem value="done">Fertig</SelectItem>
                <SelectItem value="skipped">Übersprungen</SelectItem>
                <SelectItem value="reshoot">Reshoot</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Kategorie">
            <Input
              value={shot.category ?? ""}
              onChange={(e) => saveShot({ category: e.target.value })}
              placeholder="z.B. Cinematic"
            />
          </Field>
          <Field label="Perspektive">
            <Input
              value={shot.perspective ?? ""}
              onChange={(e) => saveShot({ perspective: e.target.value })}
              placeholder="z.B. 45° Schräg"
            />
          </Field>
          <Field label="Höhe (m)">
            <Input
              type="number"
              value={shot.altitudeMeters ?? ""}
              onChange={(e) => saveShot({ altitudeMeters: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
          <Field label="Bewegung">
            <Input
              value={shot.movement ?? ""}
              onChange={(e) => saveShot({ movement: e.target.value })}
              placeholder="z.B. Orbit"
            />
          </Field>
          <Field label="Dauer (s)">
            <Input
              type="number"
              value={shot.durationSec ?? ""}
              onChange={(e) => saveShot({ durationSec: e.target.value ? Number(e.target.value) : undefined })}
            />
          </Field>
        </div>

        <Field label="Notizen für Team" className="mt-4">
          <Textarea
            value={shot.notes ?? ""}
            onChange={(e) => saveShot({ notes: e.target.value })}
            placeholder="Hinweise für die Crew…"
          />
        </Field>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Assets</p>
            <h3 className="text-base font-semibold">{assets.length} Dateien</h3>
          </div>
          <Button asChild variant="secondary" size="sm">
            <a href={`#upload-${shot.id}`}>
              <ImagePlus className="h-3.5 w-3.5" />
              Upload
            </a>
          </Button>
        </div>
        {assets.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-ink-3)]">Noch keine Dateien hochgeladen.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {assets.map((a) => (
              <AssetThumb key={a.id} asset={a} />
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Kommentare</p>
            <h3 className="text-base font-semibold">{comments.length} Beiträge</h3>
          </div>
        </div>
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-3)]">Noch keine Kommentare.</p>
          ) : (
            comments.map((c) => (
              <CommentItem key={c.id} comment={c} />
            ))
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Textarea
            placeholder="Neuer Kommentar…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <Button onClick={submitComment} disabled={!comment.trim() || pending} size="sm" className="self-end">
            <MessageSquare className="h-3.5 w-3.5" />
            Posten
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label mono>{label}</Label>
      {children}
    </div>
  );
}

function AssetThumb({ asset }: { asset: Asset }) {
  const isImage = asset.mimeType.startsWith("image/");
  return (
    <a
      href={asset.blobUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-hair)] bg-[var(--color-bg-sunken)] aspect-square relative"
    >
      {isImage ? (
        <img
          src={asset.thumbnailUrl ?? asset.blobUrl}
          alt={asset.filename}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[var(--color-ink-4)]">
          <Camera className="h-8 w-8" />
        </div>
      )}
      <div className="absolute top-1.5 left-1.5">
        <Badge tone={asset.kind === "final" ? "ok" : asset.kind === "reference" ? "brand-soft" : "neutral"} className="!py-0 !text-[9px]">
          {asset.kind}
        </Badge>
      </div>
      <div className="absolute top-1.5 right-1.5">
        {asset.visibleToClient ? (
          <Eye className="h-3.5 w-3.5 text-white drop-shadow" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-white drop-shadow" />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-[10px] text-white truncate">{asset.filename}</p>
      </div>
    </a>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const [pending, startTransition] = useTransition();
  const resolved = !!comment.resolvedAt;
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border p-3",
        resolved ? "border-[var(--color-hair-2)] opacity-60" : "border-[var(--color-hair)]",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.authorName ?? "?"}</span>
          <Badge tone={comment.source === "client" ? "info" : "neutral"} className="!py-0 !text-[9px]">
            {comment.source === "client" ? "Kunde" : "Intern"}
          </Badge>
          <time className="text-[10px] text-[var(--color-ink-4)]">
            {formatDistanceToNow(new Date(comment.createdAt), { locale: de, addSuffix: true })}
          </time>
        </div>
        <Button
          variant="ghost"
          size="xs"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await resolveComment({ commentId: comment.id, isShot: true, resolved: !resolved });
            })
          }
        >
          {resolved ? "Wiedereröffnen" : "Erledigt"}
        </Button>
      </div>
      <p className="mt-2 text-sm whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}
