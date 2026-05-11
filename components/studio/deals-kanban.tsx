"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, eurosPrecise, germanDate } from "@/lib/utils";
import { createDeal, updateDealStage } from "@/app/studio/actions/deals";

interface DealRow {
  id: string;
  title: string;
  stage: string;
  valueCents: number;
  probability: number;
  expectedCloseDate: string | null;
  customerId: string | null;
}

const STAGES = [
  { id: "lead", label: "Lead", color: "var(--color-info)" },
  { id: "qualified", label: "Qualifiziert", color: "var(--color-brand-1)" },
  { id: "proposal", label: "Angebot", color: "var(--color-warn)" },
  { id: "won", label: "Gewonnen", color: "var(--color-ok)" },
  { id: "lost", label: "Verloren", color: "var(--color-danger)" },
];

export function DealsKanban({ deals: initial }: { deals: DealRow[] }) {
  const [deals, setDeals] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;
    const newStage = over.id as string;
    const deal = deals.find((d) => d.id === active.id);
    if (!deal || deal.stage === newStage) return;
    setDeals((all) => all.map((d) => (d.id === active.id ? { ...d, stage: newStage } : d)));
    startTransition(async () => {
      try {
        await updateDealStage({ dealId: active.id as string, stage: newStage });
        toast.success("Stage aktualisiert");
      } catch {
        toast.error("Fehler");
        setDeals(initial);
      }
    });
  };

  const activeDeal = deals.find((d) => d.id === activeId);

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <NewDealDialog />
      </div>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 min-h-[60vh]">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((d) => d.stage === stage.id)}
            />
          ))}
        </div>
        <DragOverlay>{activeDeal && <DealCard deal={activeDeal} dragging />}</DragOverlay>
      </DndContext>
    </>
  );
}

function KanbanColumn({
  stage,
  deals,
}: {
  stage: { id: string; label: string; color: string };
  deals: DealRow[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((sum, d) => sum + d.valueCents, 0);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)]/40 border border-[var(--color-hair)] p-3 transition-colors",
        isOver && "bg-[var(--color-brand-softer)] border-[var(--color-brand-1)]",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
          {stage.label}
        </h3>
        <span className="text-[10px] font-mono text-[var(--color-ink-4)]">
          {deals.length} · {eurosPrecise(total)}
        </span>
      </div>
      <div className="space-y-2 flex-1">
        {deals.map((d) => (
          <DraggableDeal key={d.id} deal={d} />
        ))}
        {deals.length === 0 && (
          <p className="text-center text-xs text-[var(--color-ink-4)] py-6">—</p>
        )}
      </div>
    </div>
  );
}

function DraggableDeal({ deal }: { deal: DealRow }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.3 : 1 }}>
      <DealCard deal={deal} />
    </div>
  );
}

function DealCard({ deal, dragging }: { deal: DealRow; dragging?: boolean }) {
  return (
    <Link
      href={`/studio/deals/${deal.id}`}
      className={cn(
        "block rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-elev)] p-3 transition-shadow hover:shadow-sm",
        dragging && "shadow-[var(--shadow-elev)] rotate-2",
      )}
    >
      <p className="text-sm font-medium leading-tight">{deal.title}</p>
      <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--color-ink-3)]">
        <span className="font-mono">{eurosPrecise(deal.valueCents)}</span>
        <span>{deal.probability}%</span>
      </div>
      {deal.expectedCloseDate && (
        <p className="mt-1 text-[10px] text-[var(--color-ink-4)]">
          → {germanDate(deal.expectedCloseDate)}
        </p>
      )}
    </Link>
  );
}

function NewDealDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: "",
    valueCents: "",
    stage: "lead" as "lead" | "qualified" | "proposal" | "won" | "lost",
    expectedCloseDate: "",
    description: "",
  });

  const submit = () => {
    startTransition(async () => {
      try {
        await createDeal({
          title: form.title,
          stage: form.stage,
          valueCents: Math.round(Number(form.valueCents.replace(/[^0-9.]/g, "")) * 100) || 0,
          expectedCloseDate: form.expectedCloseDate || undefined,
          description: form.description || undefined,
        });
        toast.success("Deal angelegt");
        setOpen(false);
        setForm({ title: "", valueCents: "", stage: "lead", expectedCloseDate: "", description: "" });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Neuer Deal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Deal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label mono>Titel *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label mono>Wert (€)</Label>
              <Input
                value={form.valueCents}
                onChange={(e) => setForm({ ...form, valueCents: e.target.value })}
                placeholder="1500"
              />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as typeof form.stage })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Erwarteter Abschluss</Label>
            <Input
              type="date"
              value={form.expectedCloseDate}
              onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label mono>Beschreibung</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={submit} disabled={pending || !form.title}>Anlegen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
