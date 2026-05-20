"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { germanDateTime } from "@/lib/utils";
import { postClientComment } from "@/app/konto/auftraege/[code]/comment-actions";

interface Comment {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
  isClient: boolean;
}

export function OrderComments({
  orderShortCode,
  comments,
  customerName,
}: {
  orderShortCode: string;
  comments: Comment[];
  customerName: string;
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!body.trim()) return;
    const text = body;
    startTransition(async () => {
      const res = await postClientComment({ orderShortCode, body: text });
      if (res.ok) {
        setBody("");
        toast.success("Nachricht gesendet.");
      } else {
        toast.error(res.error ?? "Fehler beim Senden.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-[var(--color-ink-mute)]">
            Noch keine Nachrichten. Schreib uns, was du brauchst — wir antworten meist
            innerhalb eines Werktags.
          </p>
        )}
        {comments.map((c) => (
          <li
            key={c.id}
            className={
              c.isClient
                ? "ml-auto max-w-[85%] rounded-[var(--radius-md)] bg-[var(--color-brand-soft)] p-3"
                : "max-w-[85%] rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] p-3"
            }
          >
            <p className="whitespace-pre-wrap text-sm">{c.body}</p>
            <p className="mt-1 text-[11px] text-[var(--color-ink-mute)]">
              {c.isClient ? customerName : c.authorName ?? "ImmoHero Team"} ·{" "}
              {germanDateTime(c.createdAt)}
            </p>
          </li>
        ))}
      </ol>
      <div className="grid gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Schreib eine Nachricht ans Team …"
          rows={3}
        />
        <Button onClick={submit} disabled={pending || !body.trim()} className="justify-self-start">
          {pending ? "Sende…" : "Nachricht senden"}
        </Button>
      </div>
    </div>
  );
}
