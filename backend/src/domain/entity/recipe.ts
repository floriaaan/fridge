import { InferSelectModel } from "drizzle-orm";
import { product, recipe, recipeIngredient } from "@/infrastructure/database/schema";

export type Recipe = InferSelectModel<typeof recipe>;
export type RecipeIngredient = InferSelectModel<typeof recipeIngredient>;
export type Product = InferSelectModel<typeof product>;

export type RecipeWithIngredients = Recipe & {
  ingredients: (RecipeIngredient & {
    product: Product | null;
  })[];
};
