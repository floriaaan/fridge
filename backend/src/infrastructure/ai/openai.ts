import { Recipe } from "@/domain/entity/recipe";
import { AiProvider, recipesListSchema, receiptParseSchema, fridgeScanSchema } from "@/infrastructure/ai";
import { buildRecipePrompt, buildReceiptPrompt, buildRecipeImagePrompt, buildFridgeScanPrompt } from "@/infrastructure/ai/prompts";
import { env } from "@/lib/env";
import { createOpenAI } from "@ai-sdk/openai";
import { generateImage, generateText, Output } from "ai";
import { z } from "zod";

export class OpenAiProvider implements AiProvider {
  private openaiInstance: ReturnType<typeof createOpenAI>;

  constructor() {
    this.openaiInstance = createOpenAI({
      apiKey: env.OPENAI_API_KEY!,
    });
  }

  async generateRecipesFromProducts(
    productsList: string,
    language: string,
    params: {
      cuisine?: string;
      difficulty?: "easy" | "medium" | "hard";
      maxTime?: number;
      servings?: number;
    } = {}
  ): Promise<Recipe[]> {
    const { output } = await generateText({
      model: this.openaiInstance(env.OPENAI_MODEL!),
      prompt: buildRecipePrompt(productsList, language, params),
      output: Output.object({
        schema: recipesListSchema,
      }),
    });

    // Transform the returned object to match your Recipe type
    return output.recipes.map((recipe) => ({
      title: recipe.title,
      description: recipe.description || "",
      source: "ai" as const,
      instructions: recipe.instructions,
      preparationTime: recipe.preparationTime || 0,
      tags: recipe.tags,
      ingredients: recipe.ingredients.map((ing) => ({
        label: ing.label,
        quantity: ing.quantity,
        unit: ing.unit,
        productId: ing.productId,
      })),
    })) as Recipe[];
  }

  async parseReceiptImage(imageBase64: string, language: string): Promise<any> {
    try {
      const { output } = await generateText({
        model: this.openaiInstance(env.OPENAI_MODEL!),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildReceiptPrompt(language) },
              { type: "image", image: imageBase64 },
            ],
          },
        ],
        output: Output.object({
          schema: receiptParseSchema,
        }),
      });

      return output;
    } catch (error) {
      console.error("Error parsing receipt with OpenAiProvider:", error);
      throw error;
    }
  }

  async parseFridgeImage(imageBase64: string, language: string): Promise<z.infer<typeof fridgeScanSchema>> {
    try {
      const { output } = await generateText({
        model: this.openaiInstance(env.OPENAI_MODEL!),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildFridgeScanPrompt(language) },
              { type: "image", image: imageBase64 },
            ],
          },
        ],
        output: Output.object({
          schema: fridgeScanSchema,
        }),
      });

      return output;
    } catch (error) {
      console.error("Error parsing fridge image with OpenAiProvider:", error);
      throw error;
    }
  }

  async generateRecipeImage(recipeTitle: string, recipeDescription: string): Promise<Buffer | null> {
    try {
      const { image } = await generateImage({
        model: this.openaiInstance.image("dall-e-3"),
        prompt: buildRecipeImagePrompt(recipeTitle, recipeDescription),
        size: "1024x1024",
      });

      return Buffer.from(image.uint8Array);
    } catch (error) {
      console.error("Error generating recipe image with OpenAiProvider:", error);
      return null;
    }
  }
}
