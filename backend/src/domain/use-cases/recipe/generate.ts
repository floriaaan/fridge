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
import { saveRecipeImage } from "@/infrastructure/storage/images";

export interface GenerateRecipesParams {
  cuisine?: string | undefined;
  difficulty?: "easy" | "medium" | "hard" | undefined;
  maxTime?: number | undefined;
  servings?: number | undefined;
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
  params: GenerateRecipesParams = {},
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

    const language = getLanguageName(env.USER_LANGUAGE);

    // @ts-ignore: Unreachable code error
    const generatedRecipes = await ai.generateRecipesFromProducts(productsList, language, params);

    if (!generatedRecipes || generatedRecipes.length === 0) {
      return {
        statusCode: 400,
        data: {
          error: "No recipes generated",
          message: "Failed to generate recipes from your products.",
        },
      };
    }

    console.log("Starting database transaction to save recipes");
    const savedRecipes = await db.transaction(async (tx) => {
      console.log(`Inserting ${generatedRecipes.length} recipes into database`);
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

      console.log(
        `Successfully inserted ${insertedRecipes.length} recipes:`,
        insertedRecipes.map((r) => ({ id: r.id, title: r.title })),
      );

      for (let i = 0; i < generatedRecipes.length; i++) {
        const r = generatedRecipes[i];
        if (!r) {
          logger.warn(`Null or undefined recipe at index ${i}`);
          continue;
        }
        if (!r.ingredients) {
          logger.warn(`No ingredients found for recipe: ${r.title}`);
          continue;
        }
        if (r.ingredients && r.ingredients.length > 0) {
          const insertedRecipe = insertedRecipes[i];
          if (!insertedRecipe) {
            logger.warn(`Could not find inserted recipe for: ${r.title}`);
            continue;
          }

          console.log(`Processing ${r.ingredients.length} ingredients for recipe: ${insertedRecipe.title}`);
          for (const ingredient of r.ingredients) {
            try {
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
                quantity: ingredient.quantity ? Math.round(ingredient.quantity) : null,
                unit: ingredient.unit || null,
              });
            } catch (ingredientError) {
              logger.error(`Error inserting ingredient "${ingredient.label}" for recipe "${insertedRecipe.title}":`, ingredientError);
              throw ingredientError; // Re-throw to rollback transaction
            }
          }
          console.log(`Saved ${r.ingredients.length} ingredients for recipe: ${insertedRecipe.title}`);
        }
      }
      return insertedRecipes;
    });

    console.log(
      `Transaction complete. Saved ${savedRecipes.length} recipes to database:`,
      savedRecipes.map((r) => r.id),
    );

    // Generate images for each recipe in the background
    console.log("Starting image generation for recipes");
    for (const savedRecipe of savedRecipes) {
      try {
        const imageBuffer = await ai.generateRecipeImage(
          savedRecipe.title,
          savedRecipe.description || ""
        );

        if (imageBuffer) {
          const imageUrl = await saveRecipeImage(imageBuffer, savedRecipe.id);
          // Update the recipe with the image URL
          await db
            .update(recipe)
            .set({ imageUrl })
            .where(eq(recipe.id, savedRecipe.id));
          savedRecipe.imageUrl = imageUrl;
          console.log(`Generated and saved image for recipe: ${savedRecipe.title}`);
        } else {
          logger.warn(`Could not generate image for recipe: ${savedRecipe.title}`);
        }
      } catch (error) {
        logger.error(`Error generating image for recipe ${savedRecipe.title}:`, error);
      }
    }

    return {
      statusCode: 201,
      data: {
        success: true,
        data: savedRecipes,
      },
    };
  } catch (error) {
    logger.error("Error in generateRecipes:", error);
    console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
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
