import { Recipe } from "@/domain/entity/recipe";
import { AiProvider, recipesListSchema } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, jsonSchema, Output } from "ai";

export class GeminiProvider implements AiProvider {
  private googleInstance: ReturnType<typeof createGoogleGenerativeAI>;

  constructor() {
    this.googleInstance = createGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY!,
    });
  }

  async generateRecipesFromProducts(productsList: string, language: string): Promise<Recipe[]> {
    try {
      const { output } = await generateText({
        model: this.googleInstance(env.GEMINI_MODEL!),
        prompt: `Based on the following products: ${productsList}, generate three diverse recipes in ${language}:
      
1. A simple and quick recipe (less than 30 minutes).
2. A vegetarian recipe.
3. A more complex and elaborate recipe.

Prioritize using products that are expiring soon, but feel free to include other common ingredients.

For each recipe, provide:
- A clear and appealing title
- A short description (1-2 sentences)
- Detailed instructions in Markdown format with numbered steps
- An estimated preparation time in minutes
- Relevant tags (e.g., "quick", "vegetarian", "healthy", cuisine type)
- A complete list of ingredients with quantities and units when possible

Ensure the recipes are practical and well-balanced.`,
        output: Output.object({
          schema: recipesListSchema,
        }),
      });

      // Transformer l'objet retourné pour correspondre à votre type Recipe
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
}
