import { db } from "@/infrastructure/database";
import { product, recipe, recipeIngredient } from "@/infrastructure/database/schema";
import { and, countDistinct, eq, gt, gte, inArray } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";

type RecipeWithIngredients = Awaited<ReturnType<typeof getRecipeSuggestions>>["data"];

export const getRecipeSuggestions = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<RecipeWithIngredients>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    // 1. Get user's available products
    const userProducts = await db
      .select({ id: product.id })
      .from(product)
      .where(and(eq(product.userId, user.id), gt(product.quantity, 0)));

    if (userProducts.length === 0) {
      return {
        success: true,
        data: [],
      };
    }
    const userProductIds = userProducts.map((p) => p.id);

    // 2. Find recipes with at least 2 matching products
    const sq = db
      .select({
        recipeId: recipeIngredient.recipeId,
        matchCount: countDistinct(recipeIngredient.productId).as("match_count"),
      })
      .from(recipeIngredient)
      .where(inArray(recipeIngredient.productId, userProductIds))
      .groupBy(recipeIngredient.recipeId)
      .as("sq");

    const matchingRecipes = await db.select({ recipeId: sq.recipeId }).from(sq).where(gte(sq.matchCount, 2));

    if (matchingRecipes.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const recipeIds = matchingRecipes.map((r) => r.recipeId as string).filter(Boolean);

    // 3. Fetch full recipe details for the matching recipes
    const recipes = await db.query.recipe.findMany({
      where: inArray(recipe.id, recipeIds),
      with: {
        ingredients: {
          with: {
            product: true,
          },
        },
      },
    });

    return {
      success: true,
      data: recipes,
    };
  } catch (error) {
    status(500);
    return { error: "Failed to fetch recipe suggestions", message: (error as Error).message };
  }
};
