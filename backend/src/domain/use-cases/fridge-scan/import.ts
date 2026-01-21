import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import { Product } from "@/domain/entity/product";

interface ImportFridgeItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  openfoodfactId?: string;
  estimatedExpiryDays?: number;
}

interface ImportFridgeInput {
  items: ImportFridgeItem[];
}

export const importFridge = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<{ products: Product[] }>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const input = body as ImportFridgeInput;

  if (!input.items || input.items.length === 0) {
    status(400);
    return { error: "No items to import" };
  }

  try {
    // Create product records (no receipt associated)
    const productsToInsert = input.items.map((item) => {
      let expiresAt: Date | null = null;
      if (item.estimatedExpiryDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + item.estimatedExpiryDays);
      }

      return {
        userId: user.id,
        receiptId: null, // No receipt for fridge scan
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        location: item.location || "frigo",
        expiresAt,
        openedAt: null,
        category: item.category,
        openfoodfactId: item.openfoodfactId || null,
        categories: null,
        price: null, // No price for fridge scan
      };
    });

    const createdProducts = await db
      .insert(product)
      .values(productsToInsert)
      .returning();

    status(201);
    return {
      success: true,
      data: {
        products: createdProducts,
      },
    };
  } catch (error) {
    console.error("Error importing fridge products:", error);
    status(500);
    return {
      error: "Failed to import fridge products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const importFridgeSchema = t.Object({
  items: t.Array(
    t.Object({
      name: t.String(),
      quantity: t.Number(),
      unit: t.String(),
      category: t.String(),
      location: t.String(),
      openfoodfactId: t.Optional(t.String()),
      estimatedExpiryDays: t.Optional(t.Number()),
    })
  ),
});
