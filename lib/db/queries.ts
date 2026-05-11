import { and, eq, gte, inArray, lte, desc, asc } from "drizzle-orm";
import { db } from "./client";
import {
  orders,
  orderItems,
  orderShots,
  orderAssignments,
  users,
  serviceAreas,
  deliveries,
  shotDefinitions,
  teamAvailability,
  type NewOrder,
} from "./schema";

export async function isPlzInServiceArea(plz: string): Promise<boolean> {
  const [row] = await db
    .select({ id: serviceAreas.id })
    .from(serviceAreas)
    .where(and(eq(serviceAreas.plz, plz), eq(serviceAreas.active, true)))
    .limit(1);
  return Boolean(row);
}

export async function findOrCreateCustomer(email: string, name?: string | null, phone?: string | null) {
  const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      name: name ?? null,
      phone: phone ?? null,
      role: "customer",
    })
    .returning();
  return created;
}

export async function createOrderDraft(input: NewOrder) {
  const [row] = await db.insert(orders).values(input).returning();
  return row;
}

export async function getOrderById(id: string) {
  const [row] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return row;
}

export async function getOrderByShortCode(code: string) {
  const [row] = await db.select().from(orders).where(eq(orders.shortCode, code)).limit(1);
  return row;
}

export async function getOrdersForCustomer(customerId: string) {
  return db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));
}

export async function getOrdersForAssignee(userId: string) {
  const rows = await db
    .select({ order: orders, role: orderAssignments.role })
    .from(orderAssignments)
    .innerJoin(orders, eq(orderAssignments.orderId, orders.id))
    .where(eq(orderAssignments.userId, userId))
    .orderBy(asc(orders.scheduledAt));
  return rows;
}

export async function getOrderItems(orderId: string) {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrderShots(orderId: string) {
  return db.select().from(orderShots).where(eq(orderShots.orderId, orderId)).orderBy(asc(orderShots.position));
}

export async function getDeliveryForOrder(orderId: string) {
  const [row] = await db.select().from(deliveries).where(eq(deliveries.orderId, orderId)).limit(1);
  return row;
}

export async function getDeliveryByShareToken(token: string) {
  const [row] = await db.select().from(deliveries).where(eq(deliveries.shareToken, token)).limit(1);
  return row;
}

export async function getServiceArea(plz: string) {
  const [row] = await db.select().from(serviceAreas).where(eq(serviceAreas.plz, plz)).limit(1);
  return row;
}

export async function listShotDefinitions(propertyTemplate: string, stylePackages: string[]) {
  return db
    .select()
    .from(shotDefinitions)
    .where(
      and(
        eq(shotDefinitions.propertyTemplate, propertyTemplate),
        inArray(shotDefinitions.stylePackage, stylePackages),
      ),
    );
}

export async function getBookedSlotsInRange(from: Date, to: Date) {
  return db
    .select({ id: orders.id, scheduledAt: orders.scheduledAt, status: orders.status })
    .from(orders)
    .where(
      and(
        gte(orders.scheduledAt, from),
        lte(orders.scheduledAt, to),
        inArray(orders.status, ["paid", "scheduled", "shooting"]),
      ),
    );
}

export async function getTeamWeekday(weekday: number) {
  return db
    .select()
    .from(teamAvailability)
    .where(and(eq(teamAvailability.weekday, weekday), eq(teamAvailability.active, true)));
}
