import { notFound } from "next/navigation";
import { getProjectFull } from "@/lib/db/project-queries";
import { AssetManager } from "@/components/studio/asset-manager";

export default async function AssetsTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProjectFull(code);
  if (!data) notFound();

  const allAssets = Array.from(data.assetsByShot.entries()).flatMap(([shotId, assets]) =>
    assets.map((a) => ({
      ...a,
      sizeBytes: Number(a.sizeBytes),
      shotId,
      shotName: data.shots.find((s) => s.id === shotId)?.name ?? "?",
    })),
  );

  return (
    <AssetManager
      orderId={data.project.id}
      shots={data.shots.map((s) => ({ id: s.id, name: s.name }))}
      assets={allAssets.map((a) => ({
        id: a.id,
        kind: a.kind,
        blobUrl: a.blobUrl,
        filename: a.filename,
        sizeBytes: a.sizeBytes,
        mimeType: a.mimeType,
        thumbnailUrl: a.thumbnailUrl,
        visibleToClient: a.visibleToClient,
        shotId: a.shotId,
        shotName: a.shotName,
      }))}
    />
  );
}
