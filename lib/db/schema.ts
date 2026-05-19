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

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "pending",
  "suspended",
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

export const studioStatusEnum = pgEnum("studio_status", [
  "draft",
  "production",
  "client_approval",
  "revision",
  "approved",
  "completed",
  "archived",
]);

export const orderShotStatusEnum = pgEnum("order_shot_status", [
  "planned",
  "done",
  "skipped",
  "reshoot",
]);

export const shotAssetKindEnum = pgEnum("shot_asset_kind", [
  "reference",
  "briefing",
  "raw",
  "final",
  "other",
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

export const customerKindEnum = pgEnum("customer_kind", ["person", "company"]);

export const dealStageEnum = pgEnum("deal_stage", [
  "lead",
  "qualified",
  "proposal",
  "won",
  "lost",
]);

export const dealNoteKindEnum = pgEnum("deal_note_kind", [
  "note",
  "call",
  "meeting",
  "email",
  "task",
]);

export const commentSourceEnum = pgEnum("comment_source", ["internal", "client"]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "project_assignment",
  "client_comment",
  "share_approval",
  "weather_warning",
  "delivery_ready",
  "status_change",
  "asset_uploaded",
  "consultation_requested",
]);

export const consultationStatusEnum = pgEnum("consultation_status", [
  "requested",
  "confirmed",
  "declined",
  "cancelled",
  "completed",
]);

export const meetingProviderEnum = pgEnum("meeting_provider", [
  "google_meet",
  "teams",
  "zoom",
  "custom",
]);

/* ------------------------------- Users / Auth ------------------------------- */

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("customer"),
  status: userStatusEnum("status").notNull().default("active"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  initials: varchar("initials", { length: 4 }),
  accentColor: varchar("accent_color", { length: 16 }).default("#3F5A3A"),
  language: varchar("language", { length: 8 }).notNull().default("de"),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Europe/Berlin"),
  notificationPrefs: jsonb("notification_prefs").$type<{
    projectAssignment: boolean;
    clientComment: boolean;
    shareApproval: boolean;
    weatherWarning: boolean;
    statusChange: boolean;
    assetUploaded: boolean;
    dashboardStartFilter: string;
  }>().default({
    projectAssignment: true,
    clientComment: true,
    shareApproval: true,
    weatherWarning: true,
    statusChange: true,
    assetUploaded: false,
    dashboardStartFilter: "all",
  }),
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

/* ------------------------------- CRM ------------------------------- */

export const companies = pgTable(
  "company",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    displayName: text("display_name").notNull(),
    legalName: text("legal_name"),
    website: text("website"),
    primaryEmail: text("primary_email"),
    primaryPhone: text("primary_phone"),
    billingAddress: text("billing_address"),
    notes: text("notes"),
    archivedAt: timestamp("archived_at"),
    createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    displayNameIdx: index("company_display_name_idx").on(table.displayName),
  }),
);

export const customers = pgTable(
  "customer",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    companyId: text("company_id").references(() => companies.id, { onDelete: "set null" }),
    kind: customerKindEnum("kind").notNull().default("person"),
    displayName: text("display_name").notNull(),
    companyName: text("company_name"),
    primaryEmail: text("primary_email"),
    primaryPhone: text("primary_phone"),
    address: text("address"),
    notes: text("notes"),
    source: text("source"),
    isAbo: boolean("is_abo").notNull().default(false),
    aboServiceSlugs: text("abo_service_slugs").array(),
    aboBundleSlug: varchar("abo_bundle_slug", { length: 64 }),
    aboNotes: text("abo_notes"),
    aboActivatedAt: timestamp("abo_activated_at"),
    archivedAt: timestamp("archived_at"),
    createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: index("customer_email_idx").on(table.primaryEmail),
    displayNameIdx: index("customer_display_name_idx").on(table.displayName),
    companyIdx: index("customer_company_idx").on(table.companyId),
  }),
);

export const propertySubmissionStatusEnum = pgEnum("property_submission_status", [
  "pending",
  "approved",
  "rejected",
  "converted",
]);

export const propertySubmissions = pgTable(
  "property_submission",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    customerRecordId: text("customer_record_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    submittedByUserId: text("submitted_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    submittedByEmail: text("submitted_by_email").notNull(),
    propertyType: propertyTypeEnum("property_type").notNull(),
    propertyAddress: text("property_address").notNull(),
    propertyPlz: varchar("property_plz", { length: 5 }).notNull(),
    propertyCity: text("property_city").notNull(),
    propertySizeQm: integer("property_size_qm"),
    propertyNotes: text("property_notes"),
    desiredTimeframe: text("desired_timeframe"),
    uploads: jsonb("uploads").$type<
      { url: string; pathname: string; filename: string; sizeBytes: number; mimeType: string }[]
    >(),
    status: propertySubmissionStatusEnum("status").notNull().default("pending"),
    convertedOrderId: text("converted_order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    reviewNotes: text("review_notes"),
    reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    customerIdx: index("property_submission_customer_idx").on(table.customerRecordId),
    statusIdx: index("property_submission_status_idx").on(table.status),
  }),
);

export const customerContacts = pgTable(
  "customer_contact",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    roleAtCustomer: text("role_at_customer"),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    customerIdx: index("customer_contact_customer_idx").on(table.customerId),
  }),
);

export const deals = pgTable(
  "deal",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
    primaryContactId: text("primary_contact_id").references(() => customerContacts.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    valueCents: integer("value_cents").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
    probability: integer("probability").notNull().default(20),
    stage: dealStageEnum("stage").notNull().default("lead"),
    source: text("source"),
    expectedCloseDate: timestamp("expected_close_date"),
    actualCloseDate: timestamp("actual_close_date"),
    wonOrderId: text("won_order_id"),
    lostReason: text("lost_reason"),
    ownerUserId: text("owner_user_id").references(() => users.id, { onDelete: "set null" }),
    archivedAt: timestamp("archived_at"),
    createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    stageIdx: index("deal_stage_idx").on(table.stage),
    customerIdx: index("deal_customer_idx").on(table.customerId),
  }),
);

export const dealNotes = pgTable(
  "deal_note",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    dealId: text("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    kind: dealNoteKindEnum("kind").notNull().default("note"),
    body: text("body").notNull(),
    happenedAt: timestamp("happened_at").notNull().defaultNow(),
    authorUserId: text("author_user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    dealIdx: index("deal_note_deal_idx").on(table.dealId),
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
  weekday: integer("weekday").notNull(),
  startMinute: integer("start_minute").notNull(),
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
    customerRecordId: text("customer_record_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    status: orderStatusEnum("status").notNull().default("pending"),
    studioStatus: studioStatusEnum("studio_status").notNull().default("draft"),
    origin: varchar("origin", { length: 16 }).notNull().default("booking"),

    bundleSlug: varchar("bundle_slug", { length: 64 }),
    propertyType: propertyTypeEnum("property_type").notNull(),
    propertyAddress: text("property_address").notNull(),
    propertyPlz: varchar("property_plz", { length: 5 }).notNull(),
    propertyCity: text("property_city").notNull(),
    propertySizeQm: integer("property_size_qm"),
    propertyNotes: text("property_notes"),
    propertyLat: text("property_lat"),
    propertyLng: text("property_lng"),

    scheduledAt: timestamp("scheduled_at"),
    estimatedDeliveryAt: timestamp("estimated_delivery_at"),

    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),

    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCustomerId: text("stripe_customer_id"),
    paidAt: timestamp("paid_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancelReason: text("cancel_reason"),
    refundedCents: integer("refunded_cents").notNull().default(0),
    refundedAt: timestamp("refunded_at"),

    shareToken: varchar("share_token", { length: 32 })
      .notNull()
      .$defaultFn(() => crypto.randomUUID().replace(/-/g, ""))
      .default(sql`replace(gen_random_uuid()::text, '-', '')`),
    clientApproval: varchar("client_approval", { length: 16 }),
    archivedAt: timestamp("archived_at"),
    weatherSnapshot: jsonb("weather_snapshot").$type<{
      condition: string;
      temp: number;
      wind: number;
      gust?: number;
      precipitationProbability?: number;
      flyable: boolean;
      forecastDate?: string;
      locationName?: string;
      updatedAt: string;
    } | null>(),
    weatherRefreshedAt: timestamp("weather_refreshed_at"),
    deliveryNotesInternal: text("delivery_notes_internal"),
    coverImageUrl: text("cover_image_url"),
    title: text("title"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    shortCodeIdx: uniqueIndex("orders_short_code_idx").on(table.shortCode),
    shareTokenIdx: uniqueIndex("orders_share_token_idx").on(table.shareToken),
    customerIdx: index("orders_customer_idx").on(table.customerId),
    customerRecordIdx: index("orders_customer_record_idx").on(table.customerRecordId),
    statusIdx: index("orders_status_idx").on(table.status),
    studioStatusIdx: index("orders_studio_status_idx").on(table.studioStatus),
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
    category: text("category"),
    perspective: text("perspective"),
    altitudeMeters: integer("altitude_meters"),
    movement: text("movement"),
    durationSec: integer("duration_sec"),
    priority: text("priority").notNull(),
    position: integer("position").notNull(),
    status: orderShotStatusEnum("status").notNull().default("planned"),
    notes: text("notes"),
    referenceAssetUrl: text("reference_asset_url"),
    isApproved: boolean("is_approved").notNull().default(false),
    approvedAt: timestamp("approved_at"),
    approvedByClient: boolean("approved_by_client").notNull().default(false),
    completedAt: timestamp("completed_at"),
    completedById: text("completed_by_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => ({
    orderIdx: index("order_shots_order_idx").on(table.orderId),
  }),
);

export const orderShotComments = pgTable(
  "order_shot_comment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderShotId: text("order_shot_id")
      .notNull()
      .references(() => orderShots.id, { onDelete: "cascade" }),
    source: commentSourceEnum("source").notNull().default("internal"),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
    resolvedById: text("resolved_by_id").references(() => users.id, { onDelete: "set null" }),
    readByUserIds: text("read_by_user_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  },
  (table) => ({
    shotIdx: index("order_shot_comment_shot_idx").on(table.orderShotId),
  }),
);

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
    thumbnailUrl: text("thumbnail_url"),
    visibleToClient: boolean("visible_to_client").notNull().default(false),
    uploadedById: text("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (table) => ({
    shotIdx: index("order_shot_assets_shot_idx").on(table.orderShotId),
  }),
);

export const orderComments = pgTable(
  "order_comment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    source: commentSourceEnum("source").notNull().default("internal"),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
    resolvedById: text("resolved_by_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => ({
    orderIdx: index("order_comment_order_idx").on(table.orderId),
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
  shareToken: varchar("share_token", { length: 32 })
    .notNull()
    .default(sql`replace(gen_random_uuid()::text, '-', '')`),
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

/* ------------------------------- Notifications ------------------------------- */

export const notifications = pgTable(
  "notification",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
    metadata: jsonb("metadata"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("notification_user_idx").on(table.userId),
    createdIdx: index("notification_created_idx").on(table.createdAt),
  }),
);

/* ------------------------------- Share Views (analytics) ------------------------------- */

export const shareViews = pgTable(
  "share_view",
  {
    id: serial("id").primaryKey(),
    shareToken: varchar("share_token", { length: 32 }).notNull(),
    ip: varchar("ip", { length: 45 }),
    userAgent: text("user_agent"),
    viewedAt: timestamp("viewed_at").notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: index("share_view_token_idx").on(table.shareToken),
  }),
);

/* ------------------------------- Consultations (Beratungstermine) ------------------------------- */

export const consultations = pgTable(
  "consultation",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    requestedStart: timestamp("requested_start").notNull(),
    requestedEnd: timestamp("requested_end").notNull(),
    status: consultationStatusEnum("status").notNull().default("requested"),
    assignedUserId: text("assigned_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    googleEventId: text("google_event_id"),
    googleCalendarId: text("google_calendar_id"),
    googleHtmlLink: text("google_html_link"),
    meetingProvider: meetingProviderEnum("meeting_provider"),
    meetingUrl: text("meeting_url"),
    customerNote: text("customer_note"),
    internalNotes: text("internal_notes"),
    declineReason: text("decline_reason"),
    confirmedAt: timestamp("confirmed_at"),
    declinedAt: timestamp("declined_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderIdx: index("consultation_order_idx").on(table.orderId),
    statusIdx: index("consultation_status_idx").on(table.status),
    startIdx: index("consultation_start_idx").on(table.requestedStart),
  }),
);

/* ------------------------------- Leads (Messe) ------------------------------- */

export const leads = pgTable(
  "lead",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    voucherCode: varchar("voucher_code", { length: 16 }).notNull(),
    voucherAmountCents: integer("voucher_amount_cents").notNull().default(1500),
    minOrderCents: integer("min_order_cents").notNull().default(19900),
    stripeCouponId: text("stripe_coupon_id"),
    stripePromotionCodeId: text("stripe_promotion_code_id"),
    consentMarketing: boolean("consent_marketing").notNull().default(true),
    consentAt: timestamp("consent_at").notNull().defaultNow(),
    source: varchar("source", { length: 32 }).notNull().default("messe-2026"),
    expiresAt: timestamp("expires_at").notNull(),
    redeemedAt: timestamp("redeemed_at"),
    redeemedOrderId: text("redeemed_order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("lead_email_idx").on(table.email),
    voucherCodeIdx: uniqueIndex("lead_voucher_code_idx").on(table.voucherCode),
    promoCodeIdx: index("lead_promo_code_idx").on(table.stripePromotionCodeId),
  }),
);

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
  userName: text("user_name"),
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
export type OrderShotAsset = typeof orderShotAssets.$inferSelect;
export type OrderShotComment = typeof orderShotComments.$inferSelect;
export type OrderComment = typeof orderComments.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type PropertySubmission = typeof propertySubmissions.$inferSelect;
export type NewPropertySubmission = typeof propertySubmissions.$inferInsert;
export type NewCustomer = typeof customers.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type CustomerContact = typeof customerContacts.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type DealNote = typeof dealNotes.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Bundle = typeof bundles.$inferSelect;
export type Delivery = typeof deliveries.$inferSelect;
export type AuditLogRow = typeof auditLog.$inferSelect;
export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export const _sqlHelper = sql;
