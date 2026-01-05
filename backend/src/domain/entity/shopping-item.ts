import { t } from "elysia";

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  source: "manual" | "auto_expired" | "recipe";
  createdAt: Date;
  updatedAt: Date;
}

export const shoppingItemSchema = t.Object({
  id: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  name: t.String(),
  quantity: t.Integer(),
  unit: t.String(),
  checked: t.Boolean(),
  source: t.Union([t.Literal("manual"), t.Literal("auto_expired"), t.Literal("recipe")]),
  createdAt: t.Optional(t.Date()),
  updatedAt: t.Optional(t.Date()),
});

export interface CreateShoppingItemInput {
  name: string;
  quantity: number;
  unit: string;
  checked?: boolean;
  source?: "manual" | "auto_expired" | "recipe";
}
