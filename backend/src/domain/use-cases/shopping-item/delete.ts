import { db } from "@/infrastructure/database";
import { and, eq, inArray } from "drizzle-orm";
import { shoppingItem } from "@/infrastructure/database/schema";
import { User } from "better-auth/types";
import { Context, t } from "elysia";
import { FridgeResponse } from "@/application/entities/response";

export const deleteShoppingItem = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<{ count: number }>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const ids = (body as { id: string }[]).map((item) => item.id);
    const result = await db
      .delete(shoppingItem)
      .where(and(eq(shoppingItem.userId, user.id), inArray(shoppingItem.id, ids)))
      .returning();

    return { success: true, data: { count: result.length } };
  } catch (error) {
    status(500);
    return { error: "Failed to delete shopping items", message: (error as Error).message };
  }
};

export const deleteShoppingItemSchema = t.Array(t.Object({ id: t.String() }));
