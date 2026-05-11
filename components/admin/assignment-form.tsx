"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { assignTeamMember, unassignTeamMember } from "@/app/admin/actions";

interface Member {
  id: string;
  name: string;
  role: string;
}

interface Props {
  orderId: string;
  existing: { userId: string; role: string }[];
  team: Member[];
  roles: string[];
}

export function AssignmentForm({ orderId, existing, team, roles }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState(team[0]?.id ?? "");
  const [role, setRole] = useState(roles[0]);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await assignTeamMember({ orderId, userId, role });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <ul className="space-y-2">
        {existing.length === 0 ? (
          <li className="text-sm text-[var(--color-ink-mute)]">Noch niemand zugewiesen.</li>
        ) : (
          existing.map((a) => {
            const member = team.find((t) => t.id === a.userId);
            return (
              <li
                key={`${a.userId}-${a.role}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-alt)]/40 px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium">{member?.name ?? "?"}</span>{" "}
                  <span className="text-[var(--color-ink-soft)]">· {a.role}</span>
                </span>
                <form
                  action={async () => {
                    await unassignTeamMember({ orderId, userId: a.userId, role: a.role });
                  }}
                >
                  <Button type="submit" variant="ghost" size="sm">×</Button>
                </form>
              </li>
            );
          })
        )}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.role})
            </option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        >
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <Button size="sm" onClick={submit} disabled={pending || !userId}>
        Zuweisen
      </Button>
    </div>
  );
}
