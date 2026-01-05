import { db } from "@/infrastructure/database";
import { CreateShoppingItemInput, ShoppingItem } from "@/domain/entity/shopping-item";
import { shoppingItem } from "@/infrastructure/database/schema";
import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const createShoppingItem = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<ShoppingItem>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const input = body as CreateShoppingItemInput;
  try {
    const [created] = await db
      .insert(shoppingItem)
      .values({
        ...input,
        userId: user.id,
        source: input.source ?? "manual",
      })
      .returning();

    status(201);
    return { success: true, data: created! };
  } catch (error) {
    status(500);
    return { error: "Failed to create shopping item", message: (error as Error).message };
  }
};

export const createShoppingItemSchema = t.Object({
  name: t.String(),
  quantity: t.Number(),
  unit: t.String(),
  checked: t.Optional(t.Boolean()),
  source: t.Optional(t.Union([t.Literal("manual"), t.Literal("auto_expired"), t.Literal("recipe")])),
});
