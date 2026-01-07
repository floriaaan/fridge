import { AiProvider, recipesSchema } from "@/infrastructure/ai";
import { CoreTool } from "ai";
import { createTool } from "ai";

export class OllamaProvider implements AiProvider {
  createRecipeTool(): CoreTool<typeof recipesSchema> {
    return createTool({
      description: "A tool to create a list of recipes.",
      name: "create-recipes",
      parameters: recipesSchema,
      execute: async ({ recipes }) => {
        return {
          recipes: recipes.map((recipe) => ({
            ...recipe,
            instructions: recipe.instructions,
          })),
        };
      },
    });
  }
}
