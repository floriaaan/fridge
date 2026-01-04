import { t } from "elysia";
import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import { and, eq, inArray } from "drizzle-orm";

export const deleteProductSchema = t.Object({
  id: t.String(),
});

export const deleteProductsHandler = async ({
  user,
  body,
  set,
}: {
  user: any;
  body: Array<{ id: string }>;
  set: any;
}): Promise<{ success: true; deletedCount: number } | { error: string; message?: string }> => {
  if (!user) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  try {
    const productIds = body.map((p) => p.id);

    // Delete products and verify they belong to the user
    const result = await db
      .delete(product)
      .where(and(eq(product.userId, user.id), inArray(product.id, productIds)))
      .returning();

    return {
      success: true,
      deletedCount: result.length,
    };
  } catch (error) {
    console.error("Error deleting products:", error);
    set.status = 500;
    return {
      error: "Failed to delete products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
