import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { staticPlugin } from "@elysiajs/static";
import { authMiddleware } from "@/application/middleware/auth";
import { loggerMiddleware } from "@/application/middleware/logger";
import { productController } from "@/application/controller/product";
import { recipeController } from "@/application/controller/recipe";
import { shoppingItemController } from "@/application/controller/shopping-item";
import { receiptController } from "@/application/controller/receipt";
import { statisticsController } from "@/application/controller/statistics";

const api = new Elysia({ prefix: "/api" }).use(productController).use(shoppingItemController).use(recipeController).use(receiptController).use(statisticsController);

const app = new Elysia({ adapter: node() })
  .use(staticPlugin({
    assets: "public",
    prefix: "/",
  }))
  .use(authMiddleware)
  .use(loggerMiddleware)

  .get("/", () => "Hello Elysia")
  .get("/user", ({ user }) => user, { auth: true })
  .use(api)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port} (${process.env.NODE_ENV})`);
  });
