import { db } from "@/infrastructure/database";
import { shoppingItem } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";

export const getShoppingItems = async (userId: string) => {
  const items = await db.query.shoppingItem.findMany({
    where: eq(shoppingItem.userId, userId),
  });
  return items;
};

export const getShoppingItem = async (userId: string, id: string) => {
  const item = await db.query.shoppingItem.findFirst({
    where: and(eq(shoppingItem.userId, userId), eq(shoppingItem.id, id)),
  });
  return item;
};
