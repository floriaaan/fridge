import { db } from "@/infrastructure/database";
import { and, eq } from "drizzle-orm";
import { shoppingItem } from "@/infrastructure/database/schema";
import { ShoppingItem, shoppingItemSchema } from "@/domain/entity/shopping-item";
import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const updateShoppingItem = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<ShoppingItem[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const updates = body as Partial<ShoppingItem>[];

  try {
    const result = await db.transaction(async (tx) => {
      const promises = updates.map((update) => {
        if (!update.id) {
          throw new Error("Update object must have an id.");
        }
        return tx
          .update(shoppingItem)
          .set(update)
          .where(and(eq(shoppingItem.id, update.id), eq(shoppingItem.userId, user.id)))
          .returning();
      });

      const results = await Promise.all(promises);
      return results.flat().filter((r) => r !== null);
    });

    return { success: true, data: result };
  } catch (error) {
    status(500);
    return { error: "Failed to update shopping items", message: (error as Error).message };
  }
};

export const updateShoppingItemSchema = t.Array(t.Partial(shoppingItemSchema));
