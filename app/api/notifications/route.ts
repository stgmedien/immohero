import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { notifications, orders } from "@/lib/db/schema";
import { and, desc, eq, isNull, count } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const unreadCountOnly = url.searchParams.get("unread_count_only");

  const [{ unreadCount = 0 } = { unreadCount: 0 }] = await db
    .select({ unreadCount: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), isNull(notifications.readAt)));

  if (unreadCountOnly) return NextResponse.json({ unreadCount: Number(unreadCount) });

  const rows = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      orderId: notifications.orderId,
      orderShortCode: orders.shortCode,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .leftJoin(orders, eq(notifications.orderId, orders.id))
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json({
    notifications: rows.map((r) => ({
      ...r,
      readAt: r.readAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    unreadCount: Number(unreadCount),
  });
}
