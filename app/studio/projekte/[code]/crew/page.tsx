import { notFound } from "next/navigation";
import { getProjectFull, getTeamMembers } from "@/lib/db/project-queries";
import { CrewManager } from "@/components/studio/crew-manager";

export default async function CrewTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProjectFull(code);
  if (!data) notFound();

  const team = await getTeamMembers();

  return (
    <CrewManager
      orderId={data.project.id}
      assignments={data.assignments.map((a) => ({
        userId: a.userId,
        role: a.role,
        name: a.name,
        email: a.email,
        image: a.image,
        accentColor: a.accentColor,
      }))}
      team={team.map((m) => ({
        id: m.id,
        name: m.name ?? m.email ?? "?",
        email: m.email,
        image: m.image,
        role: m.role,
      }))}
    />
  );
}
