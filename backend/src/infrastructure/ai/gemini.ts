import { AiProvider, recipesSchema } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { tool, generateText } from "ai";

export class GeminiProvider implements AiProvider {
  private googleInstance: ReturnType<typeof createGoogleGenerativeAI>;

  constructor() {
    this.googleInstance = createGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY!,
    });
  }

  async generateRecipesFromProducts(productsList: string, language: string) {
    const recipeTool = tool({
      description: "A tool to create a list of recipes.",
      inputSchema: recipesSchema,
      execute: async (input) => input,
    });

    const { toolResults } = await generateText({
      model: this.googleInstance(env.GEMINI_MODEL!),
      tools: { recipes: recipeTool },
      prompt: `Based on the following products: ${productsList}, generate three diverse recipes in ${language}:
      1. A simple and quick recipe.
      2. A vegetarian recipe.
      3. A more complex and elaborate recipe.

      Prioritize using products that are expiring soon, but feel free to include other common ingredients.
      For each recipe, provide a title, a short description, Markdown instructions, an estimated preparation time, relevant tags, and a list of the products used.
      `,
    });

    return toolResults;
  }
}
