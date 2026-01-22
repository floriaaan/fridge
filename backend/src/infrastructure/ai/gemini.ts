import { Recipe } from "@/domain/entity/recipe";
import { AiProvider, recipesListSchema, receiptParseSchema, fridgeScanSchema } from "@/infrastructure/ai";
import { buildRecipePrompt, buildReceiptPrompt, buildRecipeImagePrompt, buildFridgeScanPrompt } from "@/infrastructure/ai/prompts";
import { env } from "@/lib/env";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateImage, generateText, Output } from "ai";
import { z } from "zod";

export class GeminiProvider implements AiProvider {
  private googleInstance: ReturnType<typeof createGoogleGenerativeAI>;

  constructor() {
    this.googleInstance = createGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY!,
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
    try {
      const { output } = await generateText({
        model: this.googleInstance(env.GEMINI_MODEL!),
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
    } catch (error) {
      console.error("Error generating recipes with GeminiProvider:", error);
      throw error;
    }
  }

  async parseReceiptImage(imageBase64: string, language: string): Promise<any> {
    try {
      const { output } = await generateText({
        model: this.googleInstance(env.GEMINI_MODEL!),
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
      console.error("Error parsing receipt with GeminiProvider:", error);
      throw error;
    }
  }

  async parseFridgeImage(imageBase64: string, language: string): Promise<z.infer<typeof fridgeScanSchema>> {
    try {
      const { output } = await generateText({
        model: this.googleInstance(env.GEMINI_MODEL!),
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
      console.error("Error parsing fridge image with GeminiProvider:", error);
      throw error;
    }
  }

  async generateRecipeImage(recipeTitle: string, recipeDescription: string): Promise<Buffer | null> {
    try {
      const { image } = await generateImage({
        model: this.googleInstance.image("imagen-4.0-fast-generate-001"),
        prompt: buildRecipeImagePrompt(recipeTitle, recipeDescription),
        aspectRatio: "1:1",
      });

      return Buffer.from(image.uint8Array);
    } catch (error) {
      console.error("Error generating recipe image with GeminiProvider:", error);
      return null;
    }
  }
}
