import { db } from "@/infrastructure/database";
import { recipe, product, recipeIngredient } from "@/infrastructure/database/schema";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { ai } from "@/infrastructure/ai";
import { Recipe } from "@/domain/entity/recipe";
import { eq, inArray } from "drizzle-orm";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface GenerateRecipesParams {
  cuisine?: string;
  difficulty?: "easy" | "medium" | "hard";
  maxTime?: number;
  servings?: number;
}

const getLanguageName = (langCode: string) => {
  switch (langCode) {
    case "fr":
      return "french";
    case "en":
    default:
      return "english";
  }
};

const performGenerateRecipes = async (
  userId: string,
  params: GenerateRecipesParams = {}
): Promise<{ data: any; statusCode: number; error?: string }> => {
  try {
    const userProducts = await db.select().from(product).where(eq(product.userId, userId));

    if (userProducts.length === 0) {
      return {
        statusCode: 400,
        data: {
          error: "No products found",
          message: "You need to have products in your fridge to generate recipes.",
        },
      };
    }

    const productsList = userProducts
      .map((p) => {
        let productInfo = `${p.name} (${p.quantity} ${p.unit})`;
        if (p.expiresAt) {
          const expiresIn = Math.ceil((p.expiresAt.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          productInfo += ` - expires in ${expiresIn} days`;
        }
        return productInfo;
      })
      .join(", ");

    console.log("User products for recipe generation:", productsList);
    console.log("Generation params:", params);

    const language = getLanguageName(env.USER_LANGUAGE);

    const generatedRecipes = await ai.generateRecipesFromProducts(productsList, language, params);
    console.log("Generated recipes:", generatedRecipes);

    if (!generatedRecipes || generatedRecipes.length === 0) {
      return {
        statusCode: 400,
        data: {
          error: "No recipes generated",
          message: "Failed to generate recipes from your products.",
        },
      };
    }

    const savedRecipes = await db.transaction(async (tx) => {
      const insertedRecipes = await tx
        .insert(recipe)
        .values(
          generatedRecipes.map((r: Recipe) => ({
            ownerUserId: userId,
            title: r.title,
            description: r.description,
            instructions: r.instructions,
            preparationTime: r.preparationTime,
            tags: r.tags,
            source: "ai" as const,
            generationParams: params,
          })),
        )
        .returning();

      for (const r of generatedRecipes) {
        if (r.ingredients && r.ingredients.length > 0) {
          const insertedRecipe = insertedRecipes.find((ir) => ir.title === r.title);
          if (!insertedRecipe) continue;

          for (const ingredient of r.ingredients) {
            // Try to find a matching product by name
            const matchingProducts = await tx
              .select({ id: product.id })
              .from(product)
              .where(eq(product.name, ingredient.label));

            const productId = matchingProducts[0]?.id ?? null;

            // Insert the ingredient with or without a productId
            await tx.insert(recipeIngredient).values({
              recipeId: insertedRecipe.id,
              productId: productId,
              label: ingredient.label,
              quantity: ingredient.quantity || null,
              unit: ingredient.unit || null,
            });
          }
        }
      }
      return insertedRecipes;
    });

    console.log("Saved recipes to database:", savedRecipes);

    return {
      statusCode: 201,
      data: {
        success: true,
        data: savedRecipes,
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      data: {
        error: "Failed to generate recipes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

export const generateRecipes = async ({
  user,
  query,
  status,
}: Context<{ query: { cuisine?: string; difficulty?: string; maxTime?: string; servings?: string } }> & {
  user: User;
}): Promise<FridgeResponse<any>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const params: GenerateRecipesParams = {
    cuisine: query.cuisine,
    difficulty: query.difficulty as "easy" | "medium" | "hard" | undefined,
    maxTime: query.maxTime ? parseInt(query.maxTime, 10) : undefined,
    servings: query.servings ? parseInt(query.servings, 10) : undefined,
  };

  const result = await performGenerateRecipes(user.id, params);
  status(result.statusCode);
  return result.data;
};
