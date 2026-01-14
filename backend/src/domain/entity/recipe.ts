import { InferSelectModel } from "drizzle-orm";
import { product, recipe, recipeIngredient } from "@/infrastructure/database/schema";

// export type Recipe = InferSelectModel<typeof recipe>;
// export type RecipeIngredient = InferSelectModel<typeof recipeIngredient>;
export type Product = InferSelectModel<typeof product>;

export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & {
    product: Product | null;
  })[];
};


export type Recipe = {
  title: string;
  description: string;
  source: "ai" | "user" | "community";
  instructions: string;
  preparationTime?: number;
  tags: string[];
  ingredients: RecipeIngredient[];
};

export type RecipeIngredient = {
  label: string;
  quantity?: number;
  unit?: string;
  productId?: string;
};