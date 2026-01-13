import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import { generateRecipes, getRecipeSuggestions, listRecipes } from "@/domain/use-cases/recipe";

export const recipeController = new Elysia({
  prefix: "/recipe",
})
  .use(authMiddleware)
  .get("/suggestions", getRecipeSuggestions, { auth: true })
  .post("/generate", generateRecipes, { auth: true })
  .get("/", listRecipes, { auth: true });
