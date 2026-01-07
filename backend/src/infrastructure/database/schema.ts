import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";

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

export const product = pgTable(
  "product",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").notNull(), // g, ml, piece
    location: text("location").notNull(), // fridge, freezer, pantry
    expiresAt: timestamp("expires_at"),
    openedAt: timestamp("opened_at"),
    category: text("category").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("product_userId_idx").on(table.userId), index("product_expiresAt_idx").on(table.expiresAt)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  apikeys: many(apikey),
  recipes: many(recipe),
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

export const productRelations = relations(product, ({ one, many }) => ({
  user: one(user, {
    fields: [product.userId],
    references: [user.id],
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

export const schema = {
  user,
  session,
  account,
  verification,
  apikey,
  product,
  shoppingItem,
  recipe,
  recipeIngredient,
};
