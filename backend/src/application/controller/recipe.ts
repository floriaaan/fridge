import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import { getRecipeSuggestions } from "@/domain/use-cases/recipe";

export const recipeController = new Elysia({
  prefix: "/recipe",
})
  .use(authMiddleware)
  .get("/suggestions", getRecipeSuggestions, { auth: true });
