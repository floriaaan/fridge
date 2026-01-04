import { t } from "elysia";
import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { Product } from "@/domain/entity/product";
import { and, eq, inArray, sql } from "drizzle-orm";

export const updateProductQuantitySchema = t.Object({
  id: t.String(),
  quantity: t.Integer(), // Can be positive or negative
});

export const updateProductsHandler = async ({
  user,
  body,
  set,
}: {
  user: any;
  body: Array<{ id: string; quantity: number }>;
  set: any;
}): Promise<
  { success: true; data: Product[] } | { error: string; message?: string }
> => {
  if (!user) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  try {
    const productIds = body.map((p) => p.id);

    // Get current products to verify ownership
    const existingProducts = await db
      .select()
      .from(product)
      .where(and(eq(product.userId, user.id), inArray(product.id, productIds)));

    if (existingProducts.length === 0) {
      set.status = 404;
      return { error: "Products not found" };
    }
    if (existingProducts.length !== productIds.length) {
      set.status = 403;
      return { error: "Some products do not belong to the user" };
    }

    // Create a map of id -> quantity change
    const quantityMap = new Map(body.map((p) => [p.id, p.quantity]));

    // Update all products in a single query using CASE
    const updatedProducts = await db
      .update(product)
      .set({
        quantity: sql`
          CASE 
            ${sql.join(
              productIds.map((id) => {
                const qtyChange = quantityMap.get(id)!;
                return sql`WHEN ${product.id} = ${id} THEN ${product.quantity} + ${qtyChange}`;
              }),
              sql` `
            )}
            ELSE ${product.quantity}
          END
        `,
        updatedAt: new Date(),
      })
      .where(and(eq(product.userId, user.id), inArray(product.id, productIds)))
      .returning();

    return {
      success: true,
      data: updatedProducts,
    };
  } catch (error) {
    console.error("Error updating products:", error);
    set.status = 500;
    return {
      error: "Failed to update products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
