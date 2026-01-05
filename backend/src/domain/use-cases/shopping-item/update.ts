import { db } from "@/infrastructure/database";
import { and, eq } from "drizzle-orm";
import { shoppingItem } from "@/infrastructure/database/schema";
import { ShoppingItem } from "@/domain/entity/shopping-item";

export const updateShoppingItem = async (
  userId: string,
  id: string,
  updates: Partial<ShoppingItem>,
) => {
  const [updated] = await db
    .update(shoppingItem)
    .set(updates)
    .where(and(eq(shoppingItem.id, id), eq(shoppingItem.userId, userId)))
    .returning();

  return updated;
};
