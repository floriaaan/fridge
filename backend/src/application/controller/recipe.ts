import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import {
  generateRecipes,
  getRecipeSuggestions,
  listRecipes,
} from "@/domain/use-cases/recipe";
import { rateLimit } from "elysia-rate-limit";

export const recipeController = new Elysia({
  prefix: "/recipe",
})
  .use(authMiddleware)
  .get("/suggestions", getRecipeSuggestions, { auth: true })
  .post("/generate", generateRecipes, {
    auth: true,
    beforeHandle: [
      rateLimit({
        scoping: "user",
        duration: 3600000, // 1 hour
        max: 1,
        generator: (req, server) => {
          return req.headers.get("authorization") ?? req.ip;
        },
      }),
    ],
  })
  .get("/", listRecipes, { auth: true });
