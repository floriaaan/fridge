import { FridgeResponse } from "@/application/entities/response";
import { ShoppingItem } from "@/domain/entity/shopping-item";
import { db } from "@/infrastructure/database";
import { shoppingItem } from "@/infrastructure/database/schema";
import { User } from "better-auth/types";
import { eq } from "drizzle-orm";
import { Context } from "elysia";

export const getShoppingItems = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<ShoppingItem[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const items = await db.select().from(shoppingItem).where(eq(shoppingItem.userId, user.id));
    return { success: true, data: items };
  } catch (error) {
    status(500);
    return { error: "Failed to fetch shopping items", message: (error as Error).message };
  }
};
