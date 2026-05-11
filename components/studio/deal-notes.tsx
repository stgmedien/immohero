"use client";
import { useState, useTransition } from "react";
import { Plus, Phone, Mail, Users, Calendar, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { addDealNote } from "@/app/studio/actions/deals";

const KINDS = [
  { id: "note", label: "Notiz", icon: Pencil },
  { id: "call", label: "Anruf", icon: Phone },
  { id: "email", label: "E-Mail", icon: Mail },
  { id: "meeting", label: "Meeting", icon: Users },
  { id: "task", label: "Aufgabe", icon: Calendar },
];

interface Note {
  id: string;
  kind: string;
  body: string;
  happenedAt: string;
  authorName: string;
}

export function DealNotes({ dealId, notes }: { dealId: string; notes: Note[] }) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<string>("note");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!body.trim()) return;
    startTransition(async () => {
      await addDealNote({ dealId, body, kind: kind as "note" | "call" | "meeting" | "email" | "task" });
      setBody("");
      toast.success("Aktivität gespeichert");
    });
  };

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold">Aktivitäten ({notes.length})</h3>
      <div className="mt-4 grid gap-2">
        <div className="flex gap-2">
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="!w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KINDS.map((k) => <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={submit} disabled={!body.trim() || pending} size="md">
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>
        </div>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Was ist passiert?"
          rows={2}
        />
      </div>
      <div className="mt-6">
        {notes.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-3)]">Noch keine Aktivitäten.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => {
              const kindConfig = KINDS.find((k) => k.id === n.kind);
              const Icon = kindConfig?.icon ?? Pencil;
              return (
                <li key={n.id} className="border-l-2 border-[var(--color-brand-1)] pl-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">
                    <Icon className="h-3 w-3" />
                    {kindConfig?.label ?? n.kind}
                    <span className="text-[var(--color-ink-4)]">·</span>
                    <span>{n.authorName}</span>
                    <span>·</span>
                    <time>{formatDistanceToNow(new Date(n.happenedAt), { locale: de, addSuffix: true })}</time>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{n.body}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
