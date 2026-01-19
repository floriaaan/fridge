import { Recipe } from "@/domain/entity/recipe";
import { AiProvider, recipesListSchema, receiptParseSchema } from "@/infrastructure/ai";
import { buildRecipePrompt, buildReceiptPrompt } from "@/infrastructure/ai/prompts";
import { env } from "@/lib/env";
import { generateText, Output } from "ai";
import { createOllama } from "ai-sdk-ollama";

export class OllamaProvider implements AiProvider {
  private ollamaInstance: ReturnType<typeof createOllama>;

  constructor() {
    this.ollamaInstance = createOllama({
      baseURL: env.OLLAMA_BASE_URL!,
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
        model: this.ollamaInstance(env.OLLAMA_MODEL!),
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
      console.error("Error generating recipes with OllamaProvider:", error);
      throw error;
    }
  }

  async parseReceiptImage(imageBase64: string, language: string): Promise<any> {
    try {
      const { output } = await generateText({
        model: this.ollamaInstance(env.OLLAMA_MODEL!),
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
      console.error("Error parsing receipt with OllamaProvider:", error);
      throw error;
    }
  }

  async generateRecipeImage(recipeTitle: string, recipeDescription: string): Promise<Buffer | null> {
    // Ollama does not support image generation natively
    // Return null to indicate image generation is not available
    console.warn("OllamaProvider does not support image generation");
    return null;
  }
}
