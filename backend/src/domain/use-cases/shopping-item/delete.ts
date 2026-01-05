import { db } from "@/infrastructure/database";
import { and, eq, inArray } from "drizzle-orm";
import { shoppingItem } from "@/infrastructure/database/schema";

export const deleteShoppingItem = async (userId: string, ids: string[]) => {
  await db
    .delete(shoppingItem)
    .where(and(eq(shoppingItem.userId, userId), inArray(shoppingItem.id, ids)));
};
