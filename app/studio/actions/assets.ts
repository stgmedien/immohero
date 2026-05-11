"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessStudio } from "@/lib/access";
import { db } from "@/lib/db/client";
import { orderShotAssets, auditLog } from "@/lib/db/schema";
import { del } from "@vercel/blob";

async function requireStudio() {
  const session = await auth();
  if (!session?.user?.id || !canAccessStudio(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function saveShotAsset(input: {
  orderShotId: string;
  kind: "reference" | "briefing" | "raw" | "final" | "other";
  blobUrl: string;
  blobPathname: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  visibleToClient?: boolean;
}) {
  const session = await requireStudio();
  const [row] = await db
    .insert(orderShotAssets)
    .values({
      orderShotId: input.orderShotId,
      kind: input.kind,
      blobUrl: input.blobUrl,
      blobPathname: input.blobPathname,
      filename: input.filename,
      sizeBytes: input.sizeBytes,
      mimeType: input.mimeType,
      visibleToClient: input.visibleToClient ?? false,
      uploadedById: session.user.id,
    })
    .returning();

  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "upload_asset",
    entityType: "asset",
    entityId: row.id,
    payload: { filename: input.filename, kind: input.kind },
  });

  revalidatePath("/studio/projekte/[code]", "layout");
  return row;
}

export async function deleteShotAsset(input: { assetId: string }) {
  const session = await requireStudio();
  const [asset] = await db.select().from(orderShotAssets).where(eq(orderShotAssets.id, input.assetId)).limit(1);
  if (!asset) return;
  try {
    await del(asset.blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (err) {
    console.warn("[blob/del] could not delete blob:", err);
  }
  await db.delete(orderShotAssets).where(eq(orderShotAssets.id, input.assetId));
  await db.insert(auditLog).values({
    userId: session.user.id,
    userName: session.user.name ?? null,
    action: "delete_asset",
    entityType: "asset",
    entityId: input.assetId,
    payload: { filename: asset.filename },
  });
  revalidatePath("/studio/projekte/[code]", "layout");
}

export async function toggleAssetVisibility(input: { assetId: string; visible: boolean }) {
  await requireStudio();
  await db
    .update(orderShotAssets)
    .set({ visibleToClient: input.visible })
    .where(eq(orderShotAssets.id, input.assetId));
  revalidatePath("/studio/projekte/[code]", "layout");
}
