"use client";

/**
 * Quiz einer Lektion (Single-Choice). Bewertung passiert serverseitig —
 * dieses Bauteil kennt die richtigen Antworten NICHT, bis der Server
 * das Ergebnis (inkl. Erklärungen) zurückgibt.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitQuizAction } from "@/app/(marketing)/academy/actions";

export interface QuizClientQuestion {
  question: string;
  options: string[];
}

interface Result {
  score: number;
  passed: boolean;
  results: { correctIndex: number; correct: boolean; explanation?: string }[];
  courseCompleted?: boolean;
  certificateSerial?: string | null;
}

export function LessonQuiz({
  lessonId,
  questions,
  alreadyPassed,
}: {
  lessonId: string;
  questions: QuizClientQuestion[];
  alreadyPassed: boolean;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (alreadyPassed && !result) {
    return (
      <Card className="mt-8 border-[var(--color-brand-1)]/40 bg-[var(--color-brand-softer)] p-5">
        <p className="font-medium text-[var(--color-brand-ink)]">✓ Quiz bestanden — Lektion abgeschlossen.</p>
      </Card>
    );
  }

  const allAnswered = answers.every((a) => a !== null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitQuizAction(lessonId, answers.map((a) => a ?? -1));
      if (!res.ok || res.score == null) {
        setError("Das hat nicht geklappt — bitte nochmal versuchen.");
        return;
      }
      setResult({
        score: res.score,
        passed: Boolean(res.passed),
        results: res.results ?? [],
        courseCompleted: res.courseCompleted,
        certificateSerial: res.certificateSerial,
      });
      if (res.passed) router.refresh();
    });
  }

  function reset() {
    setAnswers(questions.map(() => null));
    setResult(null);
  }

  return (
    <section className="mt-10 border-t border-[var(--color-line)] pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Wissens-Check</h2>
        <Badge tone="neutral">{questions.length} Fragen · ab 70 % bestanden</Badge>
      </div>

      <div className="mt-5 space-y-5">
        {questions.map((q, qi) => {
          const r = result?.results[qi];
          return (
            <Card key={qi} className="p-5">
              <p className="font-medium">
                {qi + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const showCorrect = r && r.correctIndex === oi;
                  const showWrong = r && selected && !r.correct;
                  return (
                    <label
                      key={oi}
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-2.5 text-sm transition-colors",
                        showCorrect
                          ? "border-[var(--color-ok)] bg-[var(--color-brand-softer)]"
                          : showWrong
                            ? "border-[var(--color-danger)] bg-red-50"
                            : selected
                              ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)]"
                              : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={selected}
                        disabled={Boolean(result) || pending}
                        onChange={() =>
                          setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                        }
                        className="accent-[var(--color-brand-1)]"
                      />
                      <span>{opt}</span>
                      {showCorrect ? <span className="ml-auto text-[var(--color-ok)]">✓</span> : null}
                      {showWrong ? <span className="ml-auto text-[var(--color-danger)]">✗</span> : null}
                    </label>
                  );
                })}
              </div>
              {r && !r.correct && r.explanation ? (
                <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] px-4 py-2.5 text-sm text-[var(--color-ink-3)]">
                  💡 {r.explanation}
                </p>
              ) : null}
            </Card>
          );
        })}
      </div>

      {error ? <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p> : null}

      {!result ? (
        <Button className="mt-6" onClick={submit} disabled={!allAnswered || pending}>
          {pending ? "Wird ausgewertet …" : "Antworten prüfen"}
        </Button>
      ) : result.passed ? (
        <Card className="mt-6 border-[var(--color-brand-1)]/40 bg-[var(--color-brand-softer)] p-5">
          <p className="font-serif text-xl text-[var(--color-brand-ink)]">
            🎉 Bestanden — {result.score} %! Lektion abgeschlossen.
          </p>
          {result.courseCompleted ? (
            <p className="mt-1 text-sm text-[var(--color-ink-3)]">
              Und damit ist der ganze Kurs geschafft — dein Zertifikat
              {result.certificateSerial ? ` (${result.certificateSerial})` : ""} ist per E-Mail unterwegs.
            </p>
          ) : null}
        </Card>
      ) : (
        <div className="mt-6 flex items-center gap-4">
          <p className="text-sm text-[var(--color-ink-3)]">
            {result.score} % — noch nicht ganz. Schau dir die Erklärungen an und versuch es nochmal.
          </p>
          <Button variant="outline" onClick={reset}>
            Nochmal versuchen
          </Button>
        </div>
      )}
    </section>
  );
}
