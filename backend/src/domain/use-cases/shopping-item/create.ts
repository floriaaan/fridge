import { db } from "@/infrastructure/database";
import { CreateShoppingItemInput } from "@/domain/entity/shopping-item";
import { shoppingItem } from "@/infrastructure/database/schema";

export const createShoppingItem = async (
  userId: string,
  input: CreateShoppingItemInput,
) => {
  const [created] = await db
    .insert(shoppingItem)
    .values({
      ...input,
      userId,
      source: input.source ?? "manual",
    })
    .returning();

  return created;
};
