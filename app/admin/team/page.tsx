import { db } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleSelect } from "@/components/admin/role-select";

export default async function AdminTeamPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  const customers = allUsers.filter((u) => u.role === "customer");
  const team = allUsers.filter((u) => u.role !== "customer");

  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Team & Nutzer</h1>

      <h2 className="mt-8 font-serif text-2xl">Team</h2>
      <Card className="mt-4 overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Rolle</th>
            </tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-line)]">
                <td className="px-4 py-3">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <RoleSelect userId={u.id} currentRole={u.role} />
                </td>
              </tr>
            ))}
            {team.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-[var(--color-ink-mute)]">
                  Noch keine Team-Mitglieder. Fordere neue Mitglieder über das Login auf und weise ihnen hier eine Rolle zu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <h2 className="mt-12 font-serif text-2xl">Kunden ({customers.length})</h2>
      <Card className="mt-4 overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">E-Mail</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-line)]">
                <td className="px-4 py-3">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-xs">{u.phone ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
