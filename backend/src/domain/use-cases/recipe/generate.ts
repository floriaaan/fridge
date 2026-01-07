import { db } from "@/infrastructure/database";
import {
  recipe,
  product,
  recipeIngredient,
} from "@/infrastructure/database/schema";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { ai } from "@/infrastructure/ai";
import { eq, inArray } from "drizzle-orm";
import { env } from "@/lib/env";

const getLanguageName = (langCode: string) => {
  switch (langCode) {
    case "fr":
      return "french";
    case "en":
    default:
      return "english";
  }
};

export const generateRecipes = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<any>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const userProducts = await db
      .select()
      .from(product)
      .where(eq(product.userId, user.id));

    if (userProducts.length === 0) {
      status(400);
      return {
        error: "No products found",
        message: "You need to have products in your fridge to generate recipes.",
      };
    }

    const productsList = userProducts
      .map((p) => {
        let productInfo = `${p.name} (${p.quantity} ${p.unit})`;
        if (p.expiresAt) {
          const expiresIn = Math.ceil(
            (p.expiresAt.getTime() - new Date().getTime()) / (1000 * 3600 * 24),
          );
          productInfo += ` - expires in ${expiresIn} days`;
        }
        return productInfo;
      })
      .join(", ");

    const language = getLanguageName(env.USER_LANGUAGE);
    const toolResults = await ai.generateRecipesFromProducts(
      productsList,
      language,
    );
    const generatedRecipes = toolResults[0].result.recipes;

    const savedRecipes = await db.transaction(async (tx) => {
      const insertedRecipes = await tx
        .insert(recipe)
        .values(
          generatedRecipes.map((r) => ({
            ownerUserId: user.id,
            title: r.title,
            description: r.description,
            instructions: r.instructions,
            preparationTime: r.preparationTime,
            tags: r.tags,
            source: "ai" as const,
          })),
        )
        .returning();

      for (const r of generatedRecipes) {
        if (r.usedProducts && r.usedProducts.length > 0) {
          const productIds = await tx
            .select({ id: product.id })
            .from(product)
            .where(
              inArray(
                product.name,
                r.usedProducts.map((p) => p),
              ),
            );

          if (productIds.length > 0) {
            await tx.insert(recipeIngredient).values(
              productIds.map((p) => ({
                recipeId: insertedRecipes.find((ir) => ir.title === r.title)!.id,
                productId: p.id,
                label: r.usedProducts.find((up) => up === up)!,
              })),
            );
          }
        }
      }
      return insertedRecipes;
    });

    status(201);
    return {
      success: true,
      data: savedRecipes,
    };
  } catch (error) {
    console.error("Error generating recipes:", error);
    status(500);
    return {
      error: "Failed to generate recipes",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
