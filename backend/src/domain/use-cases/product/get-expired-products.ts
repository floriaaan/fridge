import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { Product } from "@/domain/entity/product";
import { and, eq, lt, gt } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const getExpiredProducts = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<Product[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const now = new Date();
    const expiredProducts = await db
      .select()
      .from(product)
      .where(
        and(
          eq(product.userId, user.id),
          lt(product.expirationDate, now.toISOString()),
          gt(product.quantity, 0)
        )
      );

    return {
      success: true,
      data: expiredProducts,
    };
  } catch (error) {
    status(500);
    return { error: "Failed to fetch expired products", message: (error as Error).message };
  }
};
