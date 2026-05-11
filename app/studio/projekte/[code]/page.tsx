import { notFound } from "next/navigation";
import { getProjectFull } from "@/lib/db/project-queries";
import { ShotlistEditor } from "@/components/studio/shotlist-editor";

export default async function ShotlistTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProjectFull(code);
  if (!data) notFound();

  return (
    <ShotlistEditor
      orderId={data.project.id}
      shortCode={code}
      shots={data.shots.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        notes: s.notes,
        priority: s.priority,
        position: s.position,
        status: s.status,
        category: s.category,
        perspective: s.perspective,
        altitudeMeters: s.altitudeMeters,
        movement: s.movement,
        durationSec: s.durationSec,
        isApproved: s.isApproved,
        referenceAssetUrl: s.referenceAssetUrl,
      }))}
      assetsByShot={Object.fromEntries(
        Array.from(data.assetsByShot.entries()).map(([k, v]) => [
          k,
          v.map((a) => ({
            id: a.id,
            kind: a.kind,
            blobUrl: a.blobUrl,
            filename: a.filename,
            sizeBytes: a.sizeBytes,
            mimeType: a.mimeType,
            thumbnailUrl: a.thumbnailUrl,
            visibleToClient: a.visibleToClient,
          })),
        ]),
      )}
      commentsByShot={Object.fromEntries(
        Array.from(data.commentsByShot.entries()).map(([k, v]) => [
          k,
          v.map((c) => ({
            id: c.id,
            authorName: c.authorName,
            body: c.body,
            source: c.source,
            createdAt: c.createdAt.toISOString(),
            resolvedAt: c.resolvedAt?.toISOString() ?? null,
          })),
        ]),
      )}
    />
  );
}
