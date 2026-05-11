import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageTeam } from "@/lib/access";
import { db } from "@/lib/db/client";
import { asc, desc } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { TeamManager } from "@/components/studio/team-manager";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canManageTeam(session.user.role)) redirect("/studio/dashboard");

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  const team = allUsers.filter((u) => u.role !== "customer");
  const customersList = allUsers.filter((u) => u.role === "customer");

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Team" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Team & Rollen</h1>
        <p className="text-[var(--color-ink-3)]">{team.length} Mitglieder · {customersList.length} Kunden</p>

        <TeamManager team={team.map((u) => ({
          id: u.id,
          name: u.name ?? u.email,
          email: u.email,
          role: u.role,
          status: u.status,
          phone: u.phone,
          initials: u.initials,
          accentColor: u.accentColor,
        }))} />

        <Card className="mt-10 p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--color-hair)]">
            <h2 className="text-base font-semibold">Kundenkonten ({customersList.length})</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-sunken)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">E-Mail</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {customersList.map((u) => (
                <tr key={u.id} className="border-t border-[var(--color-hair)]">
                  <td className="px-4 py-3">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-xs">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </>
  );
}
