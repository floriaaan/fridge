import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { Product } from "@/domain/entity/product";
import { eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const getProducts = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<Product[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const products = await db.select().from(product).where(eq(product.userId, user.id));

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    status(500);
    return { error: "Failed to fetch products", message: (error as Error).message };
  }
};
