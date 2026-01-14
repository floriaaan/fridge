import { Recipe } from "@/domain/entity/recipe";
import { AiProvider, recipesListSchema, receiptParseSchema } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { createOpenAI } from "@ai-sdk/openai";
import { tool, generateText, Output } from "ai";

export class OpenAiProvider implements AiProvider {
  private openaiInstance: ReturnType<typeof createOpenAI>;

  constructor() {
    this.openaiInstance = createOpenAI({
      apiKey: env.OPENAI_API_KEY!,
    });
  }

  async generateRecipesFromProducts(productsList: string, language: string): Promise<Recipe[]> {
    const { output } = await generateText({
      model: this.openaiInstance(env.OPENAI_MODEL!),

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
  }

  async parseReceiptImage(imageBase64: string, language: string): Promise<any> {
    try {
      const { output } = await generateText({
        model: this.openaiInstance(env.OPENAI_MODEL!),
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

Be as accurate as possible. If you can't find specific information, make reasonable estimates. Return the data in French (${language}).`,
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
      console.error("Error parsing receipt with OpenAiProvider:", error);
      throw error;
    }
  }
}
