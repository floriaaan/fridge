import { z } from "zod";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";
import { OpenAiProvider } from "./openai";
import { env } from "@/lib/env";

export const recipeSchema = z.object({
  title: z.string().describe("The title of the recipe."),
  description: z.string().describe("A brief description of the recipe."),
  instructions: z
    .string()
    .describe(
      "The recipe instructions, formatted as a Markdown string. Include headings, lists, and bold text for clarity.",
    ),
  preparationTime: z
    .number()
    .describe("The estimated preparation time in minutes."),
  tags: z
    .array(z.string())
    .describe(
      "A list of tags to categorize the recipe (e.g., 'vegetarian', 'spicy', 'quick-meal').",
    ),
  usedProducts: z
    .array(z.string())
    .describe("A list of product names used in the recipe."),
});

export const recipesSchema = z.object({
  recipes: z
    .array(recipeSchema)
    .describe("An array of three generated recipes."),
});

// Define a common interface for AI providers
export interface AiProvider {
  generateRecipesFromProducts(
    productsList: string,
    language: string,
  ): Promise<any>;
}

// Factory to get the AI provider based on the environment variable
const getAiProvider = (): AiProvider => {
  switch (env.AI_PROVIDER) {
    case "gemini":
      if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
      return new GeminiProvider();
    case "openai":
      if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
      return new OpenAiProvider();
    case "ollama":
      if (!env.OLLAMA_BASE_URL) throw new Error("OLLAMA_BASE_URL is not set");
      if (!env.OLLAMA_MODEL) throw new Error("OLLAMA_MODEL is not set");
      return new OllamaProvider();
    default:
      throw new Error(`Unsupported AI provider: ${env.AI_PROVIDER}`);
  }
};

export const ai = getAiProvider();
