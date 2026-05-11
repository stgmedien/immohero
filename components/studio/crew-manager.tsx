"use client";
import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";
import { assignMember, unassignMember } from "@/app/studio/actions/assignments";
import { roleLabel, userInitials } from "@/lib/access";

interface Assignment {
  userId: string;
  role: string;
  name: string | null;
  email: string | null;
  image: string | null;
  accentColor: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  image: string | null;
  role: string;
}

const ASSIGN_ROLES = ["photographer", "drone_pilot", "editor", "admin"];

export function CrewManager({
  orderId,
  assignments,
  team,
}: {
  orderId: string;
  assignments: Assignment[];
  team: TeamMember[];
}) {
  const [pending, startTransition] = useTransition();
  const [userId, setUserId] = useState(team[0]?.id ?? "");
  const [role, setRole] = useState("photographer");

  const handleAssign = () => {
    if (!userId) return;
    startTransition(async () => {
      try {
        await assignMember({ orderId, userId, role });
        toast.success("Zugewiesen");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  const handleUnassign = (a: Assignment) => {
    startTransition(async () => {
      await unassignMember({ orderId, userId: a.userId, role: a.role });
      toast.success("Entfernt");
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-base font-semibold mb-1">Zugewiesene Crew</h2>
        <p className="text-sm text-[var(--color-ink-3)]">
          Wer arbeitet an diesem Projekt? Mitarbeiter erhalten eine Benachrichtigung beim Zuweisen.
        </p>

        {assignments.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Noch niemand zugewiesen"
            description="Wähle unten ein Team-Mitglied und eine Rolle aus."
            className="mt-4"
          />
        ) : (
          <ul className="mt-4 space-y-2">
            {assignments.map((a) => (
              <li
                key={`${a.userId}-${a.role}`}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-sunken)]/40 p-3"
              >
                <Avatar size={32}>
                  {a.image ? <AvatarImage src={a.image} /> : null}
                  <AvatarFallback color={a.accentColor ?? undefined}>
                    {userInitials({ name: a.name, email: a.email })}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.name ?? a.email}</p>
                  <p className="text-xs text-[var(--color-ink-3)]">{a.email}</p>
                </div>
                <Badge tone="brand-soft">{roleLabel(a.role)}</Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleUnassign(a)}
                  disabled={pending}
                  aria-label="Entfernen"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold mb-1">Mitglied hinzufügen</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <div className="grid gap-1.5">
            <Label mono>Team-Mitglied</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {team.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Rolle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSIGN_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAssign} disabled={pending || !userId} className="self-end">
            <Plus className="h-4 w-4" />
            Zuweisen
          </Button>
        </div>
      </Card>
    </div>
  );
}
