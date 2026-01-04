import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import type { Product } from "@/domain/entity/product";


export const createProductsHandler = async (
  { user, body, set }: { user: any; body: Omit<Product, "id" | "userId" | "createdAt" | "updatedAt">[]; set: any }
): Promise<{ success: true; data: Product[] } | { error: string; message?: string }> => {
  if (!user) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  try {
    const createdProducts = await db
      .insert(product)
      .values(
        body.map((p) => ({
          userId: user.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          location: p.location,
          expiresAt: p.expiresAt ? new Date(p.expiresAt) : null,
          openedAt: p.openedAt ? new Date(p.openedAt) : null,
          category: p.category,
        }))
      )
      .returning();

    set.status = 201;
    return {
      success: true,
      data: createdProducts,
    };
  } catch (error) {
    console.error("Error creating products:", error);
    set.status = 500;
    return {
      error: "Failed to create products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

