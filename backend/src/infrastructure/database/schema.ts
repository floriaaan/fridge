import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, index, numeric, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const apikey = pgTable(
  "apikey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    start: text("start"),
    prefix: text("prefix"),
    key: text("key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamp("last_refill_at"),
    enabled: boolean("enabled").default(true),
    rateLimitEnabled: boolean("rate_limit_enabled").default(true),
    rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
    rateLimitMax: integer("rate_limit_max").default(10),
    requestCount: integer("request_count").default(0),
    remaining: integer("remaining"),
    lastRequest: timestamp("last_request"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    permissions: text("permissions"),
    metadata: text("metadata"),
  },
  (table) => [index("apikey_key_idx").on(table.key), index("apikey_userId_idx").on(table.userId)],
);

export const receipt = pgTable(
  "receipt",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storeName: text("store_name").notNull(),
    scannedAt: timestamp("scanned_at").defaultNow().notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
    ocrRawData: jsonb("ocr_raw_data"),
    itemsCount: integer("items_count").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("receipt_userId_idx").on(table.userId)],
);

export const discardReasonEnum = ["expired", "spoiled", "other"] as const;
export type DiscardReason = typeof discardReasonEnum[number];

export const product = pgTable(
  "product",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiptId: text("receipt_id").references(() => receipt.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").notNull(), // g, ml, piece
    location: text("location").notNull(), // fridge, freezer, pantry
    expiresAt: timestamp("expires_at"),
    openedAt: timestamp("opened_at"),
    consumedAt: timestamp("consumed_at"), // When the product was consumed
    discardedAt: timestamp("discarded_at"), // When the product was discarded
    discardReason: text("discard_reason", { enum: discardReasonEnum }), // Reason for discarding
    category: text("category").notNull(),
    openfoodfactId: text("openfoodfact_id"),
    categories: text("categories").array(),
    price: numeric("price", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("product_userId_idx").on(table.userId),
    index("product_expiresAt_idx").on(table.expiresAt),
    index("product_receiptId_idx").on(table.receiptId),
  ],
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  apikeys: many(apikey),
  recipes: many(recipe),
  receipts: many(receipt),
  userBadges: many(userBadge),
  userChallenges: many(userChallenge),
  gamificationProfile: one(userGamificationProfile, {
    fields: [user.id],
    references: [userGamificationProfile.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const apikeyRelations = relations(apikey, ({ one }) => ({
  user: one(user, {
    fields: [apikey.userId],
    references: [user.id],
  }),
}));

export const receiptRelations = relations(receipt, ({ one, many }) => ({
  user: one(user, {
    fields: [receipt.userId],
    references: [user.id],
  }),
  products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  user: one(user, {
    fields: [product.userId],
    references: [user.id],
  }),
  receipt: one(receipt, {
    fields: [product.receiptId],
    references: [receipt.id],
  }),
  recipeIngredients: many(recipeIngredient),
}));

export const shoppingItem = pgTable(
  "shopping_item",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").notNull(),
    checked: boolean("checked").default(false).notNull(),
    source: text("source", {
      enum: ["manual", "auto_expired", "recipe"],
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("shopping_item_userId_idx").on(table.userId)],
);

export const shoppingItemRelations = relations(shoppingItem, ({ one }) => ({
  user: one(user, {
    fields: [shoppingItem.userId],
    references: [user.id],
  }),
}));

export const recipe = pgTable(
  "recipe",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    source: text("source", { enum: ["ai", "user", "community"] }).notNull(),
    instructions: text("instructions").notNull(),
    preparationTime: integer("preparation_time"),
    tags: text("tags").array().default(sql`'{}'::text[]`).notNull(),
    generationParams: jsonb("generation_params"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("recipe_ownerUserId_idx").on(table.ownerUserId)],
);

export const recipeIngredient = pgTable(
  "recipe_ingredient",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => product.id, { onDelete: "set null" }),
    label: text("label").notNull(),
    quantity: integer("quantity"),
    unit: text("unit"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("recipe_ingredient_recipeId_idx").on(table.recipeId),
    index("recipe_ingredient_productId_idx").on(table.productId),
  ],
);

export const recipeRelations = relations(recipe, ({ one, many }) => ({
  owner: one(user, {
    fields: [recipe.ownerUserId],
    references: [user.id],
  }),
  ingredients: many(recipeIngredient),
}));

export const recipeIngredientRelations = relations(recipeIngredient, ({ one }) => ({
  recipe: one(recipe, {
    fields: [recipeIngredient.recipeId],
    references: [recipe.id],
  }),
  product: one(product, {
    fields: [recipeIngredient.productId],
    references: [product.id],
  }),
}));

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ],
);



export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const periodEnum = ["daily", "weekly", "monthly", "yearly"] as const;
export type Period = typeof periodEnum[number];

export const statisticsSnapshot = pgTable(
  "statistics_snapshot",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    period: text("period", { enum: periodEnum }).notNull(),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    totalProducts: integer("total_products").notNull(),
    consumedProducts: integer("consumed_products").notNull(),
    discardedProducts: integer("discarded_products").notNull(),
    moneyWasted: numeric("money_wasted", { precision: 10, scale: 2 }).notNull(),
    moneySaved: numeric("money_saved", { precision: 10, scale: 2 }).notNull(),
    co2Avoided: numeric("co2_avoided", { precision: 10, scale: 2 }).notNull(),
    topCategories: jsonb("top_categories"),
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  },
  (table) => [
    index("statistics_snapshot_userId_idx").on(table.userId),
    index("statistics_snapshot_period_idx").on(table.period),
    index("statistics_snapshot_periodStart_idx").on(table.periodStart),
  ],
);

export const statisticsSnapshotRelations = relations(statisticsSnapshot, ({ one }) => ({
  user: one(user, {
    fields: [statisticsSnapshot.userId],
    references: [user.id],
  }),
}));

// Gamification Tables

export const badgeTypeEnum = [
  "first_product",
  "first_week",
  "zero_waste_week",
  "eco_warrior",
  "recipe_master",
  "scanner_pro",
  "money_saver",
  "consistent_user",
] as const;
export type BadgeType = typeof badgeTypeEnum[number];

export const badge = pgTable("badge", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type", { enum: badgeTypeEnum }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteria: jsonb("criteria").notNull(), // JSON with criteria like { minProducts: 10 }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadge = pgTable(
  "user_badge",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badge.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_badge_userId_idx").on(table.userId),
    index("user_badge_badgeId_idx").on(table.badgeId),
  ],
);

export const challengeTypeEnum = ["monthly", "weekly"] as const;
export type ChallengeType = typeof challengeTypeEnum[number];

export const challengeStatusEnum = ["active", "completed", "expired"] as const;
export type ChallengeStatus = typeof challengeStatusEnum[number];

export const challenge = pgTable(
  "challenge",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: text("type", { enum: challengeTypeEnum }).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    goal: jsonb("goal").notNull(), // JSON with goal like { type: "zero_waste_days", target: 7 }
    reward: jsonb("reward").notNull(), // JSON with reward like { points: 100, badge: "eco_warrior" }
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("challenge_type_idx").on(table.type),
    index("challenge_startDate_idx").on(table.startDate),
  ],
);

export const userChallenge = pgTable(
  "user_challenge",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    challengeId: text("challenge_id")
      .notNull()
      .references(() => challenge.id, { onDelete: "cascade" }),
    progress: jsonb("progress").notNull(), // JSON tracking progress like { daysCompleted: 3 }
    status: text("status", { enum: challengeStatusEnum }).default("active").notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_challenge_userId_idx").on(table.userId),
    index("user_challenge_challengeId_idx").on(table.challengeId),
  ],
);

export const userGamificationProfile = pgTable(
  "user_gamification_profile",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    level: integer("level").default(1).notNull(),
    points: integer("points").default(0).notNull(),
    streak: integer("streak").default(0).notNull(), // consecutive days of activity
    lastActivityDate: timestamp("last_activity_date"),
    totalBadges: integer("total_badges").default(0).notNull(),
    totalChallengesCompleted: integer("total_challenges_completed").default(0).notNull(),
    ecoScore: numeric("eco_score", { precision: 10, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_gamification_profile_userId_idx").on(table.userId),
    index("user_gamification_profile_points_idx").on(table.points),
  ],
);

export const badgeRelations = relations(badge, ({ many }) => ({
  userBadges: many(userBadge),
}));

export const userBadgeRelations = relations(userBadge, ({ one }) => ({
  user: one(user, {
    fields: [userBadge.userId],
    references: [user.id],
  }),
  badge: one(badge, {
    fields: [userBadge.badgeId],
    references: [badge.id],
  }),
}));

export const challengeRelations = relations(challenge, ({ many }) => ({
  userChallenges: many(userChallenge),
}));

export const userChallengeRelations = relations(userChallenge, ({ one }) => ({
  user: one(user, {
    fields: [userChallenge.userId],
    references: [user.id],
  }),
  challenge: one(challenge, {
    fields: [userChallenge.challengeId],
    references: [challenge.id],
  }),
}));

export const userGamificationProfileRelations = relations(userGamificationProfile, ({ one }) => ({
  user: one(user, {
    fields: [userGamificationProfile.userId],
    references: [user.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  apikey,
  receipt,
  product,
  shoppingItem,
  recipe,
  recipeIngredient,
  passkey,
  statisticsSnapshot,
  badge,
  userBadge,
  challenge,
  userChallenge,
  userGamificationProfile,
};