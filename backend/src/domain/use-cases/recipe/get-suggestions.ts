import { db } from "@/infrastructure/database";
import { product, recipe, recipeIngredient } from "@/infrastructure/database/schema";
import { and, countDistinct, eq, gt, gte, inArray } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { RecipeWithIngredients } from "@/domain/entity/recipe";

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
    const recipesResult = await db
      .select()
      .from(recipe)
      .where(inArray(recipe.id, recipeIds))
      .leftJoin(recipeIngredient, eq(recipe.id, recipeIngredient.recipeId))
      .leftJoin(product, eq(recipeIngredient.productId, product.id));

    const recipes = recipesResult.reduce<Record<string, RecipeWithIngredients[number]>>((acc, row) => {
      const { recipe: r, recipe_ingredient, product: p } = row;
      if (!acc[r.id]) {
        acc[r.id] = { ...r, ingredients: [] };
      }
      if (recipe_ingredient) {
        acc[r.id].ingredients.push({ ...recipe_ingredient, product: p || null });
      }
      return acc;
    }, {});

    return {
      success: true,
      data: Object.values(recipes),
    };
  } catch (error) {
    status(500);
    return { error: "Failed to fetch recipe suggestions", message: (error as Error).message };
  }
};
