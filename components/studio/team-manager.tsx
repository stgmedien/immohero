"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateUserRole, updateUserStatus } from "@/app/studio/actions/team";
import { roleLabel, userInitials } from "@/lib/access";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string | null;
  initials: string | null;
  accentColor: string | null;
}

const ROLES = ["photographer", "drone_pilot", "editor", "admin", "customer"];
const STATUSES = ["active", "pending", "suspended"];

export function TeamManager({ team }: { team: Member[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="mt-6 p-0 overflow-hidden">
      <div className="p-5 border-b border-[var(--color-hair)]">
        <h2 className="text-base font-semibold">Team-Mitglieder ({team.length})</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--color-bg-sunken)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
          <tr>
            <th className="px-4 py-3">Mitglied</th>
            <th className="px-4 py-3">E-Mail</th>
            <th className="px-4 py-3">Rolle</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {team.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--color-ink-3)]">
                Lass dein Team sich über /login mit ihrer E-Mail anmelden — danach kannst du ihnen hier eine Rolle zuweisen.
              </td>
            </tr>
          ) : (
            team.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-hair)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar size={32}>
                      <AvatarFallback color={u.accentColor ?? undefined}>
                        {userInitials({ name: u.name, email: u.email, initials: u.initials })}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      {u.phone && <p className="text-[10px] text-[var(--color-ink-4)]">{u.phone}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <Select
                    value={u.role}
                    onValueChange={(v) =>
                      startTransition(async () => {
                        await updateUserRole({ userId: u.id, role: v });
                        toast.success(`Rolle: ${roleLabel(v)}`);
                      })
                    }
                  >
                    <SelectTrigger className="!w-44 !h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={u.status}
                    onValueChange={(v) =>
                      startTransition(async () => {
                        await updateUserStatus({ userId: u.id, status: v });
                        toast.success(`Status: ${v}`);
                      })
                    }
                  >
                    <SelectTrigger className="!w-36 !h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
