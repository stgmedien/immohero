import { notFound } from "next/navigation";
import { getProjectFull } from "@/lib/db/project-queries";
import { ProjectSettings } from "@/components/studio/project-settings";

export default async function EinstellungenTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProjectFull(code);
  if (!data) notFound();

  const { project } = data;

  return (
    <ProjectSettings
      orderId={project.id}
      shortCode={project.shortCode}
      data={{
        title: project.title ?? "",
        studioStatus: project.studioStatus,
        scheduledAt: project.scheduledAt?.toISOString().slice(0, 16) ?? "",
        estimatedDeliveryAt: project.estimatedDeliveryAt?.toISOString().slice(0, 10) ?? "",
        propertyNotes: project.propertyNotes ?? "",
        deliveryNotesInternal: project.deliveryNotesInternal ?? "",
        isArchived: !!project.archivedAt,
      }}
    />
  );
}
