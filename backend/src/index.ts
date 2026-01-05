import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { authMiddleware } from "@/application/middleware/auth";
import { productsController } from "@/application/controller/products";
import { shoppingItemController } from "@/application/controller/shopping-item";

const app = new Elysia({ adapter: node() })
  .use(authMiddleware)
  .get("/", () => "Hello Elysia")
  .get("/user", ({ user }) => user, { auth: true })
  .use(productsController)
  .use(shoppingItemController)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port} (${process.env.NODE_ENV})`);
  });
