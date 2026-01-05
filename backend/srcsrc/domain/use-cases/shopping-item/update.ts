import { db } from "@/infrastructure/database";
import { and, eq } from "drizzle-orm";
import { shoppingItem } from "@/infrastructure/database/schema";
import { ShoppingItem } from "@/domain/entity/shopping-item";

export const updateShoppingItem = async (
  userId: string,
  updates: Partial<ShoppingItem>[],
) => {
  return await db.transaction(async (tx) => {
    const promises = updates.map((update) => {
      if (!update.id) {
        throw new Error("Update object must have an id.");
      }
      return tx
        .update(shoppingItem)
        .set(update)
        .where(and(eq(shoppingItem.id, update.id), eq(shoppingItem.userId, userId)))
        .returning();
    });

    const results = await Promise.all(promises);
    return results.flat().filter((r) => r !== null);
  });
};
