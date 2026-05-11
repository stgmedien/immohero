import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canAccessStudio } from "@/lib/access";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { fetchWeatherForOrder } from "@/lib/weather";

export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !canAccessStudio(session.user.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { code } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.shortCode, code)).limit(1);
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });

  const snapshot = await fetchWeatherForOrder({
    plz: order.propertyPlz,
    city: order.propertyCity,
    scheduledAt: order.scheduledAt,
  });
  if (snapshot) {
    await db
      .update(orders)
      .set({ weatherSnapshot: snapshot, weatherRefreshedAt: new Date() })
      .where(eq(orders.id, order.id));
  }
  return NextResponse.json({ snapshot });
}
