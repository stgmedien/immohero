import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum,
  primaryKey,
  uniqueIndex,
  index,
  jsonb,
  bigint,
  serial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* ------------------------------- Enums ------------------------------- */

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "photographer",
  "drone_pilot",
  "editor",
  "admin",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "scheduled",
  "shooting",
  "editing",
  "delivered",
  "cancelled",
]);

export const orderShotStatusEnum = pgEnum("order_shot_status", [
  "planned",
  "done",
  "skipped",
  "reshoot",
]);

export const shotAssetKindEnum = pgEnum("shot_asset_kind", [
  "reference",
  "raw",
  "final",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "draft",
  "ready",
  "sent",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "wohnung",
  "haus",
  "villa",
  "mfh",
  "gewerbe",
  "industrie",
  "grundstueck",
  "bauprojekt",
]);

/* ------------------------------- Users / Auth ------------------------------- */
// Auth.js Drizzle adapter expects these tables (users/accounts/sessions/verificationTokens).

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

/* ------------------------------- Catalog ------------------------------- */

export const services = pgTable("service", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  longDescription: text("long_description").notNull(),
  priceCents: integer("price_cents").notNull(),
  durationMinutes: integer("duration_minutes"),
  durationLabel: text("duration_label").notNull(),
  iconKey: varchar("icon_key", { length: 32 }).notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  stylePackage: varchar("style_package", { length: 32 }).notNull(),
  propertyTypes: text("property_types").array().notNull(),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bundles = pgTable("bundle", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  serviceSlugs: text("service_slugs").array().notNull(),
  discountPercent: integer("discount_percent").notNull(),
  recommended: boolean("recommended").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

export const shotDefinitions = pgTable("shot_definition", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  perspective: text("perspective").notNull(),
  altitudeMeters: integer("altitude_meters").notNull(),
  movement: text("movement").notNull(),
  durationSec: integer("duration_sec").notNull(),
  priority: text("priority").notNull(),
  description: text("description").notNull(),
  propertyTemplate: text("property_template").notNull(),
  stylePackage: text("style_package").notNull(),
});

export const serviceAreas = pgTable(
  "service_area",
  {
    id: serial("id").primaryKey(),
    plz: varchar("plz", { length: 5 }).notNull(),
    city: text("city").notNull(),
    region: text("region").notNull(),
    active: boolean("active").notNull().default(true),
  },
  (table) => ({
    plzIdx: uniqueIndex("service_area_plz_idx").on(table.plz),
  }),
);

/* ------------------------------- Team availability ------------------------------- */

export const teamAvailability = pgTable("team_availability", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(), // 0 = Sunday … 6 = Saturday
  startMinute: integer("start_minute").notNull(), // minutes since 00:00
  endMinute: integer("end_minute").notNull(),
  active: boolean("active").notNull().default(true),
});

export const teamTimeOff = pgTable("team_time_off", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  reason: text("reason"),
});

/* ------------------------------- Orders ------------------------------- */

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    shortCode: varchar("short_code", { length: 10 }).notNull(),
    customerId: text("customer_id").references(() => users.id, { onDelete: "set null" }),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    status: orderStatusEnum("status").notNull().default("pending"),

    bundleSlug: varchar("bundle_slug", { length: 64 }),
    propertyType: propertyTypeEnum("property_type").notNull(),
    propertyAddress: text("property_address").notNull(),
    propertyPlz: varchar("property_plz", { length: 5 }).notNull(),
    propertyCity: text("property_city").notNull(),
    propertySizeQm: integer("property_size_qm"),
    propertyNotes: text("property_notes"),

    scheduledAt: timestamp("scheduled_at"),
    estimatedDeliveryAt: timestamp("estimated_delivery_at"),

    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),

    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCustomerId: text("stripe_customer_id"),
    paidAt: timestamp("paid_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    shortCodeIdx: uniqueIndex("orders_short_code_idx").on(table.shortCode),
    customerIdx: index("orders_customer_idx").on(table.customerId),
    statusIdx: index("orders_status_idx").on(table.status),
  }),
);

export const orderItems = pgTable("order_item", {
  id: serial("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  serviceSlug: varchar("service_slug", { length: 64 }).notNull(),
  serviceName: text("service_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

export const orderAssignments = pgTable(
  "order_assignment",
  {
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orderId, table.userId, table.role] }),
  }),
);

export const orderShots = pgTable(
  "order_shot",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    shotDefinitionId: text("shot_definition_id").references(() => shotDefinitions.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    priority: text("priority").notNull(),
    position: integer("position").notNull(),
    status: orderShotStatusEnum("status").notNull().default("planned"),
    notes: text("notes"),
    completedAt: timestamp("completed_at"),
    completedById: text("completed_by_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => ({
    orderIdx: index("order_shots_order_idx").on(table.orderId),
  }),
);

export const orderShotComments = pgTable("order_shot_comment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderShotId: text("order_shot_id")
    .notNull()
    .references(() => orderShots.id, { onDelete: "cascade" }),
  authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const orderShotAssets = pgTable(
  "order_shot_asset",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderShotId: text("order_shot_id")
      .notNull()
      .references(() => orderShots.id, { onDelete: "cascade" }),
    kind: shotAssetKindEnum("kind").notNull(),
    blobUrl: text("blob_url").notNull(),
    blobPathname: text("blob_pathname").notNull(),
    filename: text("filename").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    mimeType: text("mime_type").notNull(),
    uploadedById: text("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (table) => ({
    shotIdx: index("order_shot_assets_shot_idx").on(table.orderShotId),
  }),
);

/* ------------------------------- Delivery ------------------------------- */

export const deliveries = pgTable("delivery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: deliveryStatusEnum("status").notNull().default("draft"),
  zipBlobUrl: text("zip_blob_url"),
  zipBlobPathname: text("zip_blob_pathname"),
  zipSizeBytes: bigint("zip_size_bytes", { mode: "number" }),
  shareToken: varchar("share_token", { length: 32 }).notNull(),
  expiresAt: timestamp("expires_at"),
  readyAt: timestamp("ready_at"),
  sentAt: timestamp("sent_at"),
  firstViewedAt: timestamp("first_viewed_at"),
  firstDownloadedAt: timestamp("first_downloaded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deliveryFiles = pgTable("delivery_file", {
  id: serial("id").primaryKey(),
  deliveryId: text("delivery_id")
    .notNull()
    .references(() => deliveries.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  blobPathname: text("blob_pathname").notNull(),
  filename: text("filename").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  mimeType: text("mime_type").notNull(),
});

/* ------------------------------- Audit / Logs ------------------------------- */

export const emailLog = pgTable("email_log", {
  id: serial("id").primaryKey(),
  toEmail: text("to_email").notNull(),
  template: varchar("template", { length: 64 }).notNull(),
  subject: text("subject").notNull(),
  resendId: text("resend_id"),
  orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  error: text("error"),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 64 }).notNull(),
  entityType: varchar("entity_type", { length: 32 }).notNull(),
  entityId: text("entity_id"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ------------------------------- Type exports ------------------------------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderShot = typeof orderShots.$inferSelect;
export type NewOrderShot = typeof orderShots.$inferInsert;
export type Service = typeof services.$inferSelect;
export type Bundle = typeof bundles.$inferSelect;
export type Delivery = typeof deliveries.$inferSelect;

export const _sqlHelper = sql; // keep imported helper available
