import { notFound } from "next/navigation";
import { getProjectFull } from "@/lib/db/project-queries";
import { ProjectComments } from "@/components/studio/project-comments";

export default async function KommentareTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProjectFull(code);
  if (!data) notFound();

  return (
    <ProjectComments
      orderId={data.project.id}
      comments={data.comments.map((c) => ({
        id: c.id,
        authorName: c.authorName,
        body: c.body,
        source: c.source,
        createdAt: c.createdAt.toISOString(),
        resolvedAt: c.resolvedAt?.toISOString() ?? null,
      }))}
    />
  );
}
