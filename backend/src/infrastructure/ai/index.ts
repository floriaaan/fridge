import { z } from "zod";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";
import { OpenAiProvider } from "./openai";
import { env } from "@/lib/env";

// Définir le schéma Zod pour vos recettes
const recipeIngredientSchema = z.object({
  label: z.string().describe("Nom de l'ingrédient"),
  quantity: z.number().optional().describe("Quantité de l'ingrédient"),
  unit: z.string().optional().describe("Unité de mesure (g, ml, pièce, etc.)"),
  productId: z.string().optional().describe("ID du produit si disponible"),
});

const recipeSchema = z.object({
  title: z.string().describe("Titre de la recette"),
  description: z.string().optional().describe("Description courte de la recette"),
  instructions: z.string().describe("Instructions en Markdown"),
  preparationTime: z.number().optional().describe("Temps de préparation en minutes"),
  tags: z.array(z.string()).describe("Tags pertinents pour la recette"),
  ingredients: z.array(recipeIngredientSchema).describe("Liste des ingrédients"),
});

export const recipesListSchema = z.object({
  recipes: z.array(recipeSchema).length(3).describe("Liste de 3 recettes diverses"),
});

// Define schema for receipt parsing
const receiptProductSchema = z.object({
  name: z.string().describe("Product name as it appears on the receipt"),
  quantity: z.number().describe("Quantity of the product"),
  unit: z.string().describe("Unit of measurement (g, kg, ml, L, pièce, portion)"),
  category: z.enum(["meat", "frozen", "vegetables", "dairy", "bread", "fruits", "pantry", "other"]).describe("Product category"),
});

export const receiptParseSchema = z.object({
  products: z.array(receiptProductSchema).describe("List of products extracted from the receipt"),
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
