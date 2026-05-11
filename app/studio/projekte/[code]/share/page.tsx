import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { count, eq, desc } from "drizzle-orm";
import { shareViews } from "@/lib/db/schema";
import { getProjectFull } from "@/lib/db/project-queries";
import { ShareSettings } from "@/components/studio/share-settings";

export default async function ShareTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProjectFull(code);
  if (!data) notFound();

  const [{ c = 0 } = { c: 0 }] = await db
    .select({ c: count() })
    .from(shareViews)
    .where(eq(shareViews.shareToken, data.project.shareToken));

  return (
    <ShareSettings
      orderId={data.project.id}
      shareToken={data.project.shareToken}
      studioStatus={data.project.studioStatus}
      viewCount={Number(c)}
    />
  );
}
