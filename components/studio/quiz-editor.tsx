"use client";

/**
 * Strukturierter Quiz-Editor für Academy-Lektionen:
 * Fragen + Optionen + Korrekt-Markierung + optionale Erklärung —
 * bewusst KEIN JSON-Textfeld.
 */
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface QuizQuestionDraft {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export function QuizEditor({
  value,
  onChange,
}: {
  value: QuizQuestionDraft[];
  onChange: (quiz: QuizQuestionDraft[]) => void;
}) {
  const patchQuestion = (qi: number, patch: Partial<QuizQuestionDraft>) =>
    onChange(value.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label mono>Quiz (optional — Bestehen ab 70 % schließt die Lektion ab)</Label>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={() =>
            onChange([...value, { question: "", options: ["", ""], correctIndex: 0 }])
          }
        >
          <Plus className="h-3.5 w-3.5" /> Frage
        </Button>
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-[var(--color-ink-3)]">
          Kein Quiz — die Lektion wird über den „Lektion abschließen"-Button beendet.
        </p>
      ) : null}

      {value.map((q, qi) => (
        <div key={qi} className="rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-subtle)]/60 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-ink-3)]">Frage {qi + 1}</span>
            <div className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Frage löschen"
              onClick={() => onChange(value.filter((_, i) => i !== qi))}
            >
              <Trash2 className="h-3.5 w-3.5 text-[var(--color-danger)]" />
            </Button>
          </div>
          <Input
            value={q.question}
            onChange={(e) => patchQuestion(qi, { question: e.target.value })}
            placeholder="Frage, z. B. Wie hoch darfst du in der offenen Kategorie maximal fliegen?"
            className="mt-2"
          />

          <div className="mt-2 space-y-1.5">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`quiz-correct-${qi}`}
                  checked={q.correctIndex === oi}
                  onChange={() => patchQuestion(qi, { correctIndex: oi })}
                  title="Als richtige Antwort markieren"
                  className="h-4 w-4 shrink-0 accent-[var(--color-brand-1)]"
                />
                <Input
                  value={opt}
                  onChange={(e) =>
                    patchQuestion(qi, { options: q.options.map((o, i) => (i === oi ? e.target.value : o)) })
                  }
                  placeholder={`Antwort ${oi + 1}${q.correctIndex === oi ? " (richtig)" : ""}`}
                  className="h-8 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Antwort löschen"
                  disabled={q.options.length <= 2}
                  onClick={() =>
                    patchQuestion(qi, {
                      options: q.options.filter((_, i) => i !== oi),
                      correctIndex:
                        q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex,
                    })
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={q.options.length >= 6}
              onClick={() => patchQuestion(qi, { options: [...q.options, ""] })}
            >
              <Plus className="h-3 w-3" /> Antwort
            </Button>
          </div>

          <Input
            value={q.explanation ?? ""}
            onChange={(e) => patchQuestion(qi, { explanation: e.target.value || undefined })}
            placeholder="Erklärung bei falscher Antwort (optional)"
            className="mt-2 h-8 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
