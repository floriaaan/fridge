import { db } from "@/infrastructure/database";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { recipe } from "@/infrastructure/database/schema";
import { desc, eq, count } from "drizzle-orm";
import { Recipe } from "@/domain/entity/recipe";

export const listRecipes = async ({
  user,
  query,
  status,
}: Context<{ query: { page?: string; limit?: string } }> & { user: User }): Promise<
  FridgeResponse<Recipe[]>
> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const offset = (page - 1) * limit;

  try {
    const recipes = await db
      .select()
      .from(recipe)
      .where(eq(recipe.ownerUserId, user.id))
      .orderBy(desc(recipe.createdAt))
      .limit(limit)
      .offset(offset);

    const totalRecipesResult = await db
      .select({ count: count() })
      .from(recipe)
      .where(eq(recipe.ownerUserId, user.id));

    const totalRecipes = totalRecipesResult[0].count;

    status(200);
    return {
      success: true,
      data: recipes,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(totalRecipes / limit),
      },
    };
  } catch (error) {
    console.error("Error listing recipes:", error);
    status(500);
    return {
      error: "Failed to list recipes",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
