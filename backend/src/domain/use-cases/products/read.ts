import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { Product } from "@/domain/entity/product";
import { eq } from "drizzle-orm";

export const getProductsHandler = async ({
  user,
  set,
}: {
  user: any;
  set: any;
}): Promise<{ success: true; data: Product[] } | { error: string }> => {
  if (!user) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  try {
    const products = await db.select().from(product).where(eq(product.userId, user.id));

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    set.status = 500;
    return { error: "Failed to fetch products" };
  }
};
