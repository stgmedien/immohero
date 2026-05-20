"use client";

import { useState, useTransition } from "react";
import { Heart, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  toggleAssetFavorite,
  addAssetComment,
} from "@/app/share/actions";

interface Asset {
  id: string;
  blobUrl: string;
  thumbnailUrl: string | null;
  filename: string;
  mimeType: string;
}

interface Reaction {
  id: string;
  kind: "favorite" | "comment";
  body: string | null;
  createdAt: string;
}

export function AssetReactionsPanel({
  shareToken,
  assets,
  reactionsByAsset,
}: {
  shareToken: string;
  assets: Asset[];
  reactionsByAsset: Record<string, Reaction[]>;
}) {
  const [pendingAsset, setPendingAsset] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState<Record<string, string>>({});
  const [optimisticFav, setOptimisticFav] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();

  if (assets.length === 0) return null;

  const isFav = (a: Asset) => {
    if (a.id in optimisticFav) return optimisticFav[a.id];
    return (reactionsByAsset[a.id] ?? []).some((r) => r.kind === "favorite");
  };

  function toggle(a: Asset) {
    setOptimisticFav((m) => ({ ...m, [a.id]: !isFav(a) }));
    setPendingAsset(a.id);
    startTransition(async () => {
      try {
        await toggleAssetFavorite({ token: shareToken, assetId: a.id });
      } catch {
        toast.error("Konnte nicht gespeichert werden.");
      } finally {
        setPendingAsset(null);
      }
    });
  }

  function comment(a: Asset) {
    const body = (commentBody[a.id] ?? "").trim();
    if (!body) return;
    setPendingAsset(a.id);
    startTransition(async () => {
      try {
        await addAssetComment({ token: shareToken, assetId: a.id, body });
        setCommentBody((m) => ({ ...m, [a.id]: "" }));
        toast.success("Kommentar gespeichert.");
      } catch {
        toast.error("Kommentar fehlgeschlagen.");
      } finally {
        setPendingAsset(null);
      }
    });
  }

  const favoriteCount = assets.filter(isFav).length;

  return (
    <Card className="p-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl">Deine Lieblings-Shots & Anmerkungen</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Markiere deine Favoriten mit dem Herz und lass Anmerkungen pro Bild da —
            das hilft uns bei der Auswahl und Nachbearbeitung.
          </p>
        </div>
        {favoriteCount > 0 && (
          <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-mono text-[var(--color-brand-ink)]">
            {favoriteCount} Favorit{favoriteCount === 1 ? "" : "en"}
          </span>
        )}
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((a) => {
          const fav = isFav(a);
          const comments = (reactionsByAsset[a.id] ?? []).filter((r) => r.kind === "comment");
          const isImg = a.mimeType.startsWith("image/");
          return (
            <li key={a.id} className="rounded-[var(--radius-md)] border border-[var(--color-hair)] overflow-hidden">
              <div className="relative aspect-[4/3] bg-[var(--color-bg-subtle)]">
                {isImg ? (
                  <Image
                    src={a.thumbnailUrl ?? a.blobUrl}
                    alt={a.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-[var(--color-ink-mute)]">
                    {a.mimeType}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggle(a)}
                  disabled={pending && pendingAsset === a.id}
                  className={cn(
                    "absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full shadow-sm transition-colors",
                    fav
                      ? "bg-[var(--color-brand-1)] text-white"
                      : "bg-white/90 text-[var(--color-ink)] hover:bg-white",
                  )}
                  aria-label={fav ? "Favorit entfernen" : "Als Favorit markieren"}
                >
                  <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-[var(--color-ink-mute)]">{a.filename}</p>
                {comments.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {comments.map((c) => (
                      <li
                        key={c.id}
                        className="rounded bg-[var(--color-bg-subtle)] p-2 text-xs"
                      >
                        {c.body}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 flex gap-1">
                  <Input
                    value={commentBody[a.id] ?? ""}
                    onChange={(e) =>
                      setCommentBody((m) => ({ ...m, [a.id]: e.target.value }))
                    }
                    placeholder="Anmerkung … (z. B. heller)"
                    className="h-8 text-xs"
                  />
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    onClick={() => comment(a)}
                    disabled={pending && pendingAsset === a.id}
                    title="Kommentar speichern"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
