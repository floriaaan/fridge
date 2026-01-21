import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { authMiddleware } from "@/application/middleware/auth";
import { loggerMiddleware } from "@/application/middleware/logger";
import { productController } from "@/application/controller/product";
import { recipeController } from "@/application/controller/recipe";
import { shoppingItemController } from "@/application/controller/shopping-item";
import { receiptController } from "@/application/controller/receipt";
import { statisticsController } from "@/application/controller/statistics";
import { fridgeScanController } from "@/application/controller/fridge-scan";

const api = new Elysia({ prefix: "/api" })
  .use(productController)
  .use(shoppingItemController)
  .use(recipeController)
  .use(receiptController)
  .use(statisticsController)
  .use(fridgeScanController);

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: true, // Autorise toutes les origines en développement
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    }),
  )
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/",
    }),
  )
  .use(authMiddleware)
  .use(loggerMiddleware)

  .get("/", () => "Hello Elysia")
  .get("/user", ({ user }) => user, { auth: true })
  .use(api)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port} (${process.env.NODE_ENV})`);
  });
