"use client";
import { useState, useTransition } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { addProjectComment, resolveComment } from "@/app/studio/actions/comments";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  authorName: string | null;
  body: string;
  source: string;
  createdAt: string;
  resolvedAt: string | null;
}

export function ProjectComments({ orderId, comments }: { orderId: string; comments: Comment[] }) {
  const [body, setBody] = useState("");
  const [filter, setFilter] = useState<"all" | "internal" | "client" | "open">("all");
  const [pending, startTransition] = useTransition();

  const filtered = comments.filter((c) => {
    if (filter === "all") return true;
    if (filter === "open") return !c.resolvedAt;
    return c.source === filter;
  });

  const submit = () => {
    if (!body.trim()) return;
    startTransition(async () => {
      await addProjectComment({ orderId, body });
      setBody("");
      toast.success("Kommentar gepostet");
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5">
        <h2 className="text-base font-semibold">Neuer Kommentar</h2>
        <p className="text-sm text-[var(--color-ink-3)]">Sichtbar für alle Team-Mitglieder. Kunden sehen interne Kommentare nicht.</p>
        <Textarea
          className="mt-3"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Was soll das Team wissen?"
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={submit} disabled={!body.trim() || pending}>
            <MessageSquare className="h-4 w-4" />
            Posten
          </Button>
        </div>
      </Card>

      <div className="flex items-center gap-1.5">
        {[
          { id: "all", label: `Alle (${comments.length})` },
          { id: "open", label: `Offen (${comments.filter((c) => !c.resolvedAt).length})` },
          { id: "internal", label: "Intern" },
          { id: "client", label: "Kunde" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id as typeof filter)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                : "bg-[var(--color-bg-elev)] border border-[var(--color-hair)] text-[var(--color-ink-2)]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Keine Kommentare"
          description="Sobald jemand kommentiert, erscheinen die Beiträge hier."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  const [pending, startTransition] = useTransition();
  const resolved = !!comment.resolvedAt;
  return (
    <li>
      <Card className={cn("p-4", resolved && "opacity-60")}>
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
                await resolveComment({ commentId: comment.id, isShot: false, resolved: !resolved });
              })
            }
          >
            {resolved ? "Wiedereröffnen" : "Erledigt"}
          </Button>
        </div>
        <p className="mt-2 text-sm whitespace-pre-wrap">{comment.body}</p>
      </Card>
    </li>
  );
}
