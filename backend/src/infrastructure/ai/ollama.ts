import { Recipe } from "@/domain/entity/recipe";
import { AiProvider, recipesListSchema, receiptParseSchema } from "@/infrastructure/ai";
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
      let prompt = `Based on the following products: ${productsList}, generate three diverse recipes in ${language}:
            
      1. A simple and quick recipe (less than 30 minutes).
      2. A vegetarian recipe.
      3. A more complex and elaborate recipe.
      
      Prioritize using products that are expiring soon, but feel free to include other common ingredients.`;

      if (params.cuisine) {
        prompt += `\n\nCuisine type: ${params.cuisine}`;
      }
      if (params.difficulty) {
        prompt += `\n\nDifficulty level: ${params.difficulty}`;
      }
      if (params.maxTime) {
        prompt += `\n\nMaximum preparation time: ${params.maxTime} minutes`;
      }
      if (params.servings) {
        prompt += `\n\nNumber of servings: ${params.servings}`;
      }

      prompt += `
      
      For each recipe, provide:
      - A clear and appealing title
      - A short description (1-2 sentences)
      - Detailed instructions in Markdown format with numbered steps
      - An estimated preparation time in minutes
      - Relevant tags (e.g., "quick", "vegetarian", "healthy", cuisine type)
      - A complete list of ingredients with quantities and units when possible
      
      Ensure the recipes are practical and well-balanced.`;

      const { output } = await generateText({
        model: this.ollamaInstance(env.OLLAMA_MODEL!),
        prompt,
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
              {
                type: "text",
                text: `Analyze this receipt image and extract the following information:
1. Store name (the merchant/store name at the top)
2. Purchase date (in ISO format YYYY-MM-DD)
3. All items/products with their:
   - Product name
   - Quantity (if visible, otherwise default to 1)
   - Price (in euros)
   - Unit if applicable (g, kg, ml, L, pièce, portion)
4. Total amount (the final total at the bottom)

Be as accurate as possible. If you can't find specific information, make reasonable estimates. Return the data in ${language}.`,
              },
              {
                type: "image",
                image: imageBase64,
              },
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
}
