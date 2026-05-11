"use client";
import { useTransition } from "react";
import { updateUserRole } from "@/app/admin/actions";

const ROLES = ["customer", "photographer", "drone_pilot", "editor", "admin"];

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={currentRole}
      disabled={pending}
      onChange={(e) => {
        const role = e.target.value;
        startTransition(async () => {
          await updateUserRole({ userId, role });
        });
      }}
      className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 text-sm"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
