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
import { logger } from "@/lib/logger";

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
  userId: string
): Promise<{ data: any; statusCode: number; error?: string }> => {
  logger.info("🚀 Starting recipe generation for user: %s", userId);

  try {
    logger.debug("📦 Fetching user products...");
    const userProducts = await db
      .select()
      .from(product)
      .where(eq(product.userId, userId));

    logger.info("✅ Found %d products", userProducts.length);

    if (userProducts.length === 0) {
      logger.warn("⚠️ No products found for user");
      return {
        statusCode: 400,
        data: {
          error: "No products found",
          message: "You need to have products in your fridge to generate recipes.",
        },
      };
    }

    logger.debug("📝 Formatting products list...");
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

    logger.debug("📋 Products list: %s", productsList);

    const language = getLanguageName(env.USER_LANGUAGE);
    logger.info("🌍 Language setting: %s", language);
    
    logger.info("🤖 Calling AI to generate recipes...");
    const toolResults = await ai.generateRecipesFromProducts(
      productsList,
      language,
    );
    
    logger.info("✅ AI response received");
    logger.debug("📊 Tool results: %O", toolResults);
    
    const generatedRecipes = toolResults[0]?.result?.recipes;
    logger.info("🎯 Generated %d recipes", generatedRecipes?.length || 0);

    if (!generatedRecipes || generatedRecipes.length === 0) {
      logger.warn("⚠️ No recipes generated from AI response");
      return {
        statusCode: 400,
        data: {
          error: "No recipes generated",
          message: "Failed to generate recipes from your products.",
        },
      };
    }

    logger.info("💾 Saving recipes to database...");
    const savedRecipes = await db.transaction(async (tx) => {
      logger.debug("📌 Inserting recipe records...");
      const insertedRecipes = await tx
        .insert(recipe)
        .values(
          generatedRecipes.map((r) => ({
            ownerUserId: userId,
            title: r.title,
            description: r.description,
            instructions: r.instructions,
            preparationTime: r.preparationTime,
            tags: r.tags,
            source: "ai" as const,
          })),
        )
        .returning();

      logger.info("✅ Inserted %d recipe records", insertedRecipes.length);

      for (const r of generatedRecipes) {
        if (r.usedProducts && r.usedProducts.length > 0) {
          logger.debug("🔗 Linking ingredients for recipe: %s", r.title);
          const productIds = await tx
            .select({ id: product.id })
            .from(product)
            .where(
              inArray(
                product.name,
                r.usedProducts.map((p) => p),
              ),
            );

          logger.info("✅ Found %d matching products", productIds.length);

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

    logger.info("✅ Recipe generation completed successfully");
    logger.info("📤 Returning saved recipes count: %d", savedRecipes.length);

    return {
      statusCode: 201,
      data: {
        success: true,
        data: savedRecipes,
      },
    };
  } catch (error) {
    logger.error({ error }, "❌ Error generating recipes");
    logger.error("📋 Error details: %O", error instanceof Error ? error.message : error);
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
  status,
}: Context & { user: User }): Promise<FridgeResponse<any>> => {
  console.log("📨 Generate recipes handler called for user:", user?.id);
  
  if (!user) {
    logger.warn("❌ User not authenticated");
    status(401);
    return { error: "Unauthorized" };
  }

  const result = await performGenerateRecipes(user.id);
  status(result.statusCode);
  return result.data;
};
