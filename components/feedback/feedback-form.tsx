"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitFeedback } from "@/app/feedback/[token]/actions";
import { useLocale } from "@/components/site/locale-provider";
import { t } from "@/lib/i18n";

export function FeedbackForm({ token }: { token: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const locale = useLocale();

  if (done) {
    return (
      <p className="rounded-[var(--radius-md)] bg-[var(--color-ok-soft)] p-4 text-sm">
        {t(locale, "fb_thanks")}
      </p>
    );
  }

  function submit() {
    if (score === null) {
      toast.error(locale === "en" ? "Please select a score." : "Bitte einen Wert auswählen.");
      return;
    }
    startTransition(async () => {
      const res = await submitFeedback({ token, score, comment });
      if (res.ok) {
        setDone(true);
      } else {
        toast.error(res.error ?? (locale === "en" ? "Save failed." : "Fehler beim Speichern."));
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
          <span>{t(locale, "fb_low")}</span>
          <span>{t(locale, "fb_high")}</span>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="fb-comment">{t(locale, "fb_comment_label")}</Label>
        <Textarea
          id="fb-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
        />
      </div>
      <Button onClick={submit} disabled={pending || score === null} size="lg">
        {pending ? t(locale, "fb_submitting") : t(locale, "fb_submit")}
      </Button>
    </div>
  );
}
