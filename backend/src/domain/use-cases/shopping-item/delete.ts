import { db } from "@/infrastructure/database";
import { and, eq } from "drizzle-orm";
import { shoppingItem } from "@/infrastructure/database/schema";

export const deleteShoppingItem = async (userId: string, id: string) => {
  await db
    .delete(shoppingItem)
    .where(and(eq(shoppingItem.id, id), eq(shoppingItem.userId, userId)));
};
