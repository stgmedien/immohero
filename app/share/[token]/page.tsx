import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { eq, asc, and, inArray } from "drizzle-orm";
import { orders, orderShots, orderShotAssets, orderShotComments, shareViews, assetReactions } from "@/lib/db/schema";
import { SharePortal } from "@/components/share/share-portal";
import { AssetReactionsPanel } from "@/components/share/asset-reactions-panel";

export const dynamic = "force-dynamic";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.shareToken, token)).limit(1);
  if (!order) notFound();
  if (order.studioStatus === "draft" || order.studioStatus === "archived") notFound();

  const shots = await db
    .select()
    .from(orderShots)
    .where(eq(orderShots.orderId, order.id))
    .orderBy(asc(orderShots.position));

  const shotIds = shots.map((s) => s.id);
  const [assets, comments] = shotIds.length === 0
    ? [[], []]
    : await Promise.all([
        db
          .select()
          .from(orderShotAssets)
          .where(and(inArray(orderShotAssets.orderShotId, shotIds), eq(orderShotAssets.visibleToClient, true))),
        db
          .select()
          .from(orderShotComments)
          .where(inArray(orderShotComments.orderShotId, shotIds)),
      ]);
  const assetIds = assets.map((a) => a.id);
  const reactions = assetIds.length === 0
    ? []
    : await db
        .select()
        .from(assetReactions)
        .where(inArray(assetReactions.orderShotAssetId, assetIds));

  // Log view
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = headersList.get("user-agent") ?? null;
    await db.insert(shareViews).values({ shareToken: token, ip, userAgent });
  } catch {}

  const assetsByShot = new Map<string, typeof assets>();
  for (const a of assets) {
    const arr = assetsByShot.get(a.orderShotId) ?? [];
    arr.push(a);
    assetsByShot.set(a.orderShotId, arr);
  }
  const commentsByShot = new Map<string, typeof comments>();
  for (const c of comments) {
    const arr = commentsByShot.get(c.orderShotId) ?? [];
    arr.push(c);
    commentsByShot.set(c.orderShotId, arr);
  }

  const reactionsByAsset: Record<string, { id: string; kind: "favorite" | "comment"; body: string | null; createdAt: string }[]> = {};
  for (const r of reactions) {
    const arr = reactionsByAsset[r.orderShotAssetId] ?? [];
    arr.push({
      id: r.id,
      kind: r.kind,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
    });
    reactionsByAsset[r.orderShotAssetId] = arr;
  }

  const reactionAssets = assets.map((a) => ({
    id: a.id,
    blobUrl: a.blobUrl,
    thumbnailUrl: a.thumbnailUrl,
    filename: a.filename,
    mimeType: a.mimeType,
  }));

  return (
    <>
    <SharePortal
      shareToken={token}
      project={{
        id: order.id,
        shortCode: order.shortCode,
        title: order.title ?? order.propertyAddress,
        address: `${order.propertyAddress}, ${order.propertyPlz} ${order.propertyCity}`,
        studioStatus: order.studioStatus,
        scheduledAt: order.scheduledAt?.toISOString() ?? null,
        estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
      }}
      shots={shots.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        priority: s.priority,
        status: s.status,
        category: s.category,
        perspective: s.perspective,
        altitudeMeters: s.altitudeMeters,
        durationSec: s.durationSec,
        isApproved: s.isApproved,
        approvedByClient: s.approvedByClient,
        referenceAssetUrl: s.referenceAssetUrl,
        assets: (assetsByShot.get(s.id) ?? []).map((a) => ({
          id: a.id,
          kind: a.kind,
          blobUrl: a.blobUrl,
          filename: a.filename,
          sizeBytes: Number(a.sizeBytes),
          mimeType: a.mimeType,
          thumbnailUrl: a.thumbnailUrl,
        })),
        comments: (commentsByShot.get(s.id) ?? [])
          .filter((c) => c.source === "client")
          .map((c) => ({
            id: c.id,
            authorName: c.authorName,
            body: c.body,
            createdAt: c.createdAt.toISOString(),
          })),
      }))}
    />
    {reactionAssets.length > 0 && (
      <div className="container-page mt-8 pb-12">
        <AssetReactionsPanel
          shareToken={token}
          assets={reactionAssets}
          reactionsByAsset={reactionsByAsset}
        />
      </div>
    )}
    </>
  );
}
