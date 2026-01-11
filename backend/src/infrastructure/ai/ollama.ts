import { AiProvider, recipesSchema } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { tool, generateText } from "ai";
import { createOllama } from "ai-sdk-ollama";

export class OllamaProvider implements AiProvider {
  private ollamaInstance: ReturnType<typeof createOllama>;

  constructor() {
    this.ollamaInstance = createOllama({
      baseURL: env.OLLAMA_BASE_URL!,
    });
  }

  async generateRecipesFromProducts(productsList: string, language: string) {
    const recipeTool = tool({
      description: "A tool to create a list of recipes.",
      inputSchema: recipesSchema,
      execute: async (input) => input,
    });

    const { toolResults } = await generateText({
      model: this.ollamaInstance(env.OLLAMA_MODEL!),
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
