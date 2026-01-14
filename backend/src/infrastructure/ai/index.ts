import { z } from "zod";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";
import { OpenAiProvider } from "./openai";
import { env } from "@/lib/env";
import { Recipe } from "@/domain/entity/recipe";

// Define the Zod schema for recipes
const recipeIngredientSchema = z.object({
  label: z.string().describe("Ingredient name"),
  quantity: z.number().optional().describe("Ingredient quantity"),
  unit: z.string().optional().describe("Unit of measurement (g, ml, piece, etc.)"),
  productId: z.string().optional().describe("Product ID if available"),
});

const recipeSchema = z.object({
  title: z.string().describe("Recipe title"),
  description: z.string().optional().describe("Short recipe description"),
  instructions: z.string().describe("Instructions in Markdown"),
  preparationTime: z.number().optional().describe("Preparation time in minutes"),
  tags: z.array(z.string()).describe("Relevant tags for the recipe"),
  ingredients: z.array(recipeIngredientSchema).describe("List of ingredients"),
});

export const recipesListSchema = z.object({
  recipes: z.array(recipeSchema).length(3).describe("List of 3 diverse recipes"),
});

// Define schema for receipt parsing
const receiptItemSchema = z.object({
  name: z.string().describe("Product name as it appears on the receipt"),
  quantity: z.number().describe("Quantity of the product (default to 1 if not specified)"),
  price: z.number().describe("Price of the product in euros"),
  unit: z.string().optional().describe("Unit of measurement (g, kg, ml, L, pièce, portion)"),
});

export const receiptParseSchema = z.object({
  storeName: z.string().describe("Name of the store where the receipt is from"),
  date: z.string().describe("Date of the purchase (ISO format)"),
  items: z.array(receiptItemSchema).describe("List of items extracted from the receipt"),
  totalAmount: z.number().describe("Total amount on the receipt in euros"),
});

// Define a common interface for AI providers
export interface AiProvider {
  generateRecipesFromProducts(productsList: string, language: string): Promise<any>;
  parseReceiptImage(imageBase64: string, language: string): Promise<any>;
}

// Factory to get the AI provider based on the environment variable
const getAiProvider = (): AiProvider => {
  console.log("Selected AI Provider:", env.AI_PROVIDER);
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
