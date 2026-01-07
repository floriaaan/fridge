import { db } from "@/infrastructure/database";
import { recipe } from "@/infrastructure/database/schema";
import { Context } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { product } from "@/infrastructure/database/schema";
import { ai } from "@/infrastructure/ai";
import { z } from "zod";
import { createTool, render } from "ai";

const recipeSchema = z.object({
  title: z.string().describe("The title of the recipe."),
  description: z.string().describe("A brief description of the recipe."),
  instructions: z
    .string()
    .describe(
      "The recipe instructions, formatted as a Markdown string. Include headings, lists, and bold text for clarity.",
    ),
  preparationTime: z
    .number()
    .describe("The estimated preparation time in minutes."),
  tags: z
    .array(z.string())
    .describe(
      "A list of tags to categorize the recipe (e.g., 'vegetarian', 'spicy', 'quick-meal').",
    ),
});

const recipesSchema = z.object({
  recipes: z
    .array(recipeSchema)
    .describe("An array of three generated recipes."),
});

export const generateRecipes = async ({
  user,
  status,
}: Context & { user: User }): Promise<FridgeResponse<any>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  try {
    const userProducts = await db.query.product.findMany({
      where: (product, { eq }) => eq(product.userId, user.id),
    });

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

    const tool = createTool({
      description: "A tool to create a list of recipes.",
      name: "create-recipes",
      parameters: recipesSchema,
    });

    const { toolResults } = await render({
      model: "openai/gpt-4o-mini",
      provider: ai,
      tools: {
        recipes: tool,
      },
      prompt: `Based on the following products: ${productsList}, generate three diverse recipes:
      1. A simple and quick recipe.
      2. A vegetarian recipe.
      3. A more complex and elaborate recipe.

      Prioritize using products that are expiring soon, but feel free to include other common ingredients.
      For each recipe, provide a title, a short description, Markdown instructions, an estimated preparation time, and relevant tags.
      `,
    });

    const generatedRecipes = toolResults[0].result.recipes;

    const savedRecipes = await db
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
