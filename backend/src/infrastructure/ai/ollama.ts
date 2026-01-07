import { AiProvider, recipesSchema } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { createTool, render } from "ai";
import { createOllama } from "ai-sdk-ollama";

export class OllamaProvider implements AiProvider {
  private ollamaInstance: ReturnType<typeof createOllama>;

  constructor() {
    this.ollamaInstance = createOllama({
      baseURL: env.OLLAMA_BASE_URL!,
    });
  }

  async generateRecipesFromProducts(productsList: string, language: string) {
    const recipeTool = createTool({
      description: "A tool to create a list of recipes.",
      name: "create-recipes",
      parameters: recipesSchema,
    });

    const { toolResults } = await render({
      model: this.ollamaInstance(env.OLLAMA_MODEL!),
      provider: this.ollamaInstance,
      tools: {
        recipes: recipeTool,
      },
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
