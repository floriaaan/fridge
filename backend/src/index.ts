import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { authMiddleware } from "@/application/middleware/auth";
import { loggerMiddleware } from "@/application/middleware/logger";
import { productController } from "@/application/controller/product";
import { recipeController } from "@/application/controller/recipe";
import { shoppingItemController } from "@/application/controller/shopping-item";

const api = new Elysia({ prefix: "/api" }).use(productController).use(shoppingItemController).use(recipeController);

const app = new Elysia({ adapter: node() })
  .use(authMiddleware)
  .use(loggerMiddleware)

  .get("/", () => "Hello Elysia")
  .get("/user", ({ user }) => user, { auth: true })
  .use(api)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port} (${process.env.NODE_ENV})`);
  });
