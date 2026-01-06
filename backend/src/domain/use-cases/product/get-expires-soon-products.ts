import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { Product } from "@/domain/entity/product";
import { and, eq, lte, gt } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const getExpiresSoonProducts = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<Product[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const now = new Date();
    const inOneWeek = new Date();
    inOneWeek.setDate(now.getDate() + 7);

    const expiresSoonProducts = await db
      .select()
      .from(product)
      .where(
        and(
          eq(product.userId, user.id),
          gt(product.expirationDate, now.toISOString()),
          lte(product.expirationDate, inOneWeek.toISOString()),
          gt(product.quantity, 0)
        )
      );

    return {
      success: true,
      data: expiresSoonProducts,
    };
  } catch (error) {
    status(500);
    return { error: "Failed to fetch products expiring soon", message: (error as Error).message };
  }
};
