"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { completeLessonAction } from "@/app/(marketing)/academy/actions";

export function LessonCompleteButton({
  lessonId,
  completed,
}: {
  lessonId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  if (completed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-softer)] px-4 py-2 text-sm font-medium text-[var(--color-brand-ink)]">
        ✓ Abgeschlossen
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={() =>
          startTransition(async () => {
            const res = await completeLessonAction(lessonId);
            if (res.ok) {
              if (res.courseCompleted) {
                setNote(
                  `🎉 Kurs komplett! Dein Zertifikat${res.certificateSerial ? ` (${res.certificateSerial})` : ""} ist per E-Mail unterwegs.`,
                );
              }
              router.refresh();
            }
          })
        }
        disabled={pending}
      >
        {pending ? "Wird gespeichert …" : "Lektion abschließen ✓"}
      </Button>
      {note ? <p className="text-sm text-[var(--color-ink-3)]">{note}</p> : null}
    </div>
  );
}
