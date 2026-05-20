"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitFeedback } from "@/app/feedback/[token]/actions";

export function FeedbackForm({ token }: { token: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="rounded-[var(--radius-md)] bg-[var(--color-ok-soft)] p-4 text-sm">
        Vielen Dank! Wir freuen uns über jede Rückmeldung.
      </p>
    );
  }

  function submit() {
    if (score === null) {
      toast.error("Bitte einen Wert auswählen.");
      return;
    }
    startTransition(async () => {
      const res = await submitFeedback({ token, score, comment });
      if (res.ok) {
        setDone(true);
      } else {
        toast.error(res.error ?? "Fehler beim Speichern.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 11 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setScore(i)}
              className={cn(
                "h-10 w-10 rounded-[var(--radius-md)] border text-sm font-medium transition-colors",
                score === i
                  ? "border-[var(--color-brand-1)] bg-[var(--color-brand-1)] text-white"
                  : "border-[var(--color-hair)] hover:bg-[var(--color-bg-subtle)]",
              )}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-[var(--color-ink-mute)]">
          <span>Sehr unwahrscheinlich</span>
          <span>Sehr wahrscheinlich</span>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="fb-comment">Was war gut, was können wir besser machen? (optional)</Label>
        <Textarea
          id="fb-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
        />
      </div>
      <Button onClick={submit} disabled={pending || score === null} size="lg">
        {pending ? "Sende…" : "Feedback abgeben"}
      </Button>
    </div>
  );
}
