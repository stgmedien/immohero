"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateDealStage } from "@/app/studio/actions/deals";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "lead", label: "Lead" },
  { id: "qualified", label: "Qualifiziert" },
  { id: "proposal", label: "Angebot" },
  { id: "won", label: "Gewonnen" },
  { id: "lost", label: "Verloren" },
];

export function DealStageActions({ dealId, currentStage }: { dealId: string; currentStage: string }) {
  const [stage, setStage] = useState(currentStage);
  const [pending, startTransition] = useTransition();

  const change = (newStage: string) => {
    setStage(newStage);
    startTransition(async () => {
      await updateDealStage({ dealId, stage: newStage });
      toast.success(`Stage: ${STAGES.find((s) => s.id === newStage)?.label}`);
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold mb-3">Pipeline-Stage</h3>
      <div className="flex items-center gap-1 flex-wrap">
        {STAGES.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => change(s.id)}
              disabled={pending}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                stage === s.id
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                  : "bg-[var(--color-bg-elev)] border border-[var(--color-hair)] hover:border-[var(--color-ink-4)]",
              )}
            >
              {s.label}
            </button>
            {i < STAGES.length - 1 && <ArrowRight className="h-3 w-3 text-[var(--color-ink-4)]" />}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => change("won")} disabled={pending || stage === "won"} variant="primary">
          <CheckCircle2 className="h-4 w-4" />
          Als gewonnen markieren
        </Button>
        <Button onClick={() => change("lost")} disabled={pending || stage === "lost"} variant="outline">
          <XCircle className="h-4 w-4" />
          Verloren
        </Button>
      </div>
    </Card>
  );
}
