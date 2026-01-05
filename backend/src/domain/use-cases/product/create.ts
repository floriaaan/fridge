import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import { productSchema, type Product } from "@/domain/entity/product";
import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

export const createProducts = async ({
  user,
  body,
  status,
}: Context & { user: User}
): Promise<FridgeResponse<Product[]>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const products = body as Omit<Product, "id" | "userId" | "createdAt" | "updatedAt">[]; 

  try {
    const createdProducts = await db
      .insert(product)
      .values(
        products.map((p) => ({
          userId: user.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          location: p.location,
          expiresAt: p.expiresAt ? new Date(p.expiresAt) : null,
          openedAt: p.openedAt ? new Date(p.openedAt) : null,
          category: p.category,
        })),
      )
      .returning();

    status(201);
    return {
      success: true,
      data: createdProducts,
    };
  } catch (error) {
    console.error("Error creating products:", error);
    status(500);
    return {
      error: "Failed to create products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const createProductSchema = t.Array(t.Omit(productSchema, ["id", "userId", "createdAt", "updatedAt"]))