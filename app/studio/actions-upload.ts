"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { orderShotAssets } from "@/lib/db/schema";

const TEAM_ROLES = new Set(["photographer", "drone_pilot", "editor", "admin"]);

export async function saveShotAsset(input: {
  orderShotId: string;
  kind: "reference" | "raw" | "final";
  blobUrl: string;
  blobPathname: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}) {
  const session = await auth();
  if (!session?.user?.role || !TEAM_ROLES.has(session.user.role)) {
    throw new Error("Unauthorized");
  }

  await db.insert(orderShotAssets).values({
    orderShotId: input.orderShotId,
    kind: input.kind,
    blobUrl: input.blobUrl,
    blobPathname: input.blobPathname,
    filename: input.filename,
    sizeBytes: input.sizeBytes,
    mimeType: input.mimeType,
    uploadedById: session.user.id,
  });

  revalidatePath("/studio/projekte/[code]", "page");
}
