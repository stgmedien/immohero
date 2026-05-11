"use client";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateShotStatus } from "@/app/studio/actions";
import { cn } from "@/lib/utils";

type ShotRow = {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  notes: string | null;
};

const STORAGE_KEY_PREFIX = "immohero.field.";

export function FieldShotList({ orderCode, shots: initialShots }: { orderCode: string; shots: ShotRow[] }) {
  const [shots, setShots] = useState(initialShots);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const storageKey = `${STORAGE_KEY_PREFIX}${orderCode}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const pending = JSON.parse(raw) as Record<string, { status: string; notes: string | null }>;
        setShots((prev) =>
          prev.map((s) => (pending[s.id] ? { ...s, status: pending[s.id].status, notes: pending[s.id].notes } : s)),
        );
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const persistPending = (updated: ShotRow[]) => {
    try {
      const payload: Record<string, { status: string; notes: string | null }> = {};
      for (const shot of updated) {
        payload[shot.id] = { status: shot.status, notes: shot.notes };
      }
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  };

  const toggle = (shot: ShotRow) => {
    const nextStatus = shot.status === "done" ? "planned" : "done";
    const next = shots.map((s) => (s.id === shot.id ? { ...s, status: nextStatus } : s));
    setShots(next);
    persistPending(next);
    startTransition(async () => {
      try {
        await updateShotStatus({ shotId: shot.id, status: nextStatus });
      } catch (err) {
        console.error("[field-mode] sync failed", err);
      }
    });
  };

  const setNotes = (id: string, notes: string) => {
    const next = shots.map((s) => (s.id === id ? { ...s, notes } : s));
    setShots(next);
    persistPending(next);
  };

  const flushNotes = (shot: ShotRow) => {
    startTransition(async () => {
      try {
        await updateShotStatus({ shotId: shot.id, status: shot.status, notes: shot.notes ?? null });
      } catch (err) {
        console.error("[field-mode] notes sync failed", err);
      }
    });
  };

  const doneCount = shots.filter((s) => s.status === "done").length;
  const pct = shots.length === 0 ? 0 : Math.round((doneCount / shots.length) * 100);

  return (
    <div className="mt-6">
      <div className="sticky top-2 z-10 mb-4 flex items-center gap-3 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm text-[var(--color-primary-ink)] shadow-md">
        <div className="flex-1">
          <p className="font-medium">{doneCount} von {shots.length} fertig · {pct}%</p>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full bg-[var(--color-primary)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {pending && <span className="text-xs text-[var(--color-primary)]">↻ Sync…</span>}
      </div>

      <ul className="space-y-3">
        {shots.map((shot) => {
          const isDone = shot.status === "done";
          const isActive = activeId === shot.id;
          return (
            <li key={shot.id}>
              <Card
                className={cn(
                  "p-4 transition-colors",
                  isDone && "bg-[var(--color-primary-soft)]/30 border-[var(--color-primary)]",
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(shot)}
                    aria-label={isDone ? "Als offen markieren" : "Als fertig markieren"}
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-lg transition-colors",
                      isDone
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-ink)]"
                        : "border-[var(--color-line)] bg-[var(--color-surface)]",
                    )}
                  >
                    {isDone ? "✓" : ""}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("font-medium", isDone && "line-through opacity-60")}>{shot.name}</p>
                      <Badge tone={shot.priority === "must" ? "warn" : "neutral"}>{shot.priority}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{shot.description}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 px-0 text-[var(--color-ink-soft)]"
                      onClick={() => setActiveId(isActive ? null : shot.id)}
                    >
                      {isActive ? "Notizen schließen" : shot.notes ? "Notiz bearbeiten" : "Notiz hinzufügen"}
                    </Button>
                    {isActive && (
                      <Textarea
                        autoFocus
                        value={shot.notes ?? ""}
                        onChange={(e) => setNotes(shot.id, e.target.value)}
                        onBlur={() => flushNotes(shot)}
                        placeholder="Was ist anders, was sollte der Editor wissen?"
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
