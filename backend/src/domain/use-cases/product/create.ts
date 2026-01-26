import { db } from "@/infrastructure/database";
import { product } from "@/infrastructure/database/schema";
import { CreateProductInput, type Product } from "@/domain/entity/product";
import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { getOpenFoodFactsData } from "@/infrastructure/openfoodfacts/connector";
import {
  updateUserActivity,
  awardPoints,
  checkAndAwardBadges,
  updateChallengeProgress,
} from "@/domain/use-cases/gamification";

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

  const products = body as CreateProductInput[];

  try {
    const productsToInsert = await Promise.all(
      products.map(async (p) => {
        const offData = await getOpenFoodFactsData(p.name, p.openfoodfactId);
        return {
          userId: user.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          location: p.location,
          expiresAt: p.expiresAt ? new Date(p.expiresAt) : null,
          openedAt: p.openedAt ? new Date(p.openedAt) : null,
          category: p.category,
          openfoodfactId: offData?.openfoodfactId ?? null,
          categories: offData?.categories ?? null,
        };
      })
    );

    const createdProducts = await db
      .insert(product)
      .values(productsToInsert)
      .returning();

    // Gamification triggers
    await updateUserActivity(user.id);
    await awardPoints(user.id, 5 * products.length); // 5 points per product
    await checkAndAwardBadges(user.id);

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

export const createProductSchema = t.Array(
  t.Object({
    name: t.String(),
    quantity: t.Integer(),
    unit: t.String(),
    location: t.String(),
    expiresAt: t.Optional(t.String()),
    openedAt: t.Optional(t.String()),
    category: t.String(),
    openfoodfactId: t.Optional(t.String()),
  }),
);
