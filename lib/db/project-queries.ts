import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "./client";
import {
  orders,
  orderShots,
  orderShotAssets,
  orderShotComments,
  orderComments,
  orderItems,
  orderAssignments,
  users,
  customers,
} from "./schema";

export async function getProjectByShortCode(shortCode: string) {
  const [row] = await db.select().from(orders).where(eq(orders.shortCode, shortCode)).limit(1);
  return row ?? null;
}

export async function getProjectFull(shortCode: string) {
  const project = await getProjectByShortCode(shortCode);
  if (!project) return null;

  const [items, shots, comments, assignments, customer] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, project.id)),
    db
      .select()
      .from(orderShots)
      .where(eq(orderShots.orderId, project.id))
      .orderBy(asc(orderShots.position)),
    db
      .select()
      .from(orderComments)
      .where(eq(orderComments.orderId, project.id))
      .orderBy(desc(orderComments.createdAt)),
    db
      .select({
        userId: orderAssignments.userId,
        role: orderAssignments.role,
        assignedAt: orderAssignments.assignedAt,
        name: users.name,
        email: users.email,
        image: users.image,
        accentColor: users.accentColor,
        initials: users.initials,
      })
      .from(orderAssignments)
      .innerJoin(users, eq(orderAssignments.userId, users.id))
      .where(eq(orderAssignments.orderId, project.id)),
    project.customerRecordId
      ? db.select().from(customers).where(eq(customers.id, project.customerRecordId)).limit(1).then((r) => r[0] ?? null)
      : Promise.resolve(null),
  ]);

  // Shot assets + comments grouped by shotId
  const shotIds = shots.map((s) => s.id);
  const [assets, shotComments] = shotIds.length === 0
    ? [[], []]
    : await Promise.all([
        db.select().from(orderShotAssets).where(inArray(orderShotAssets.orderShotId, shotIds)),
        db
          .select()
          .from(orderShotComments)
          .where(inArray(orderShotComments.orderShotId, shotIds))
          .orderBy(desc(orderShotComments.createdAt)),
      ]);

  const assetsByShot = new Map<string, typeof assets>();
  for (const a of assets) {
    const arr = assetsByShot.get(a.orderShotId) ?? [];
    arr.push(a);
    assetsByShot.set(a.orderShotId, arr);
  }

  const commentsByShot = new Map<string, typeof shotComments>();
  for (const c of shotComments) {
    const arr = commentsByShot.get(c.orderShotId) ?? [];
    arr.push(c);
    commentsByShot.set(c.orderShotId, arr);
  }

  return {
    project,
    items,
    shots,
    comments,
    assignments,
    customer,
    assetsByShot,
    commentsByShot,
    totals: {
      shots: shots.length,
      shotsDone: shots.filter((s) => s.status === "done").length,
      shotsApproved: shots.filter((s) => s.isApproved).length,
      assets: assets.length,
    },
  };
}

export type ProjectFull = NonNullable<Awaited<ReturnType<typeof getProjectFull>>>;

export async function getTeamMembers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      accentColor: users.accentColor,
      initials: users.initials,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(inArray(users.role, ["admin", "editor", "photographer", "drone_pilot"]))
    .orderBy(asc(users.name));
}
