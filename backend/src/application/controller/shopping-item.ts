import Elysia from "elysia";
import {
  createShoppingItem,
  createShoppingItemSchema,
  deleteShoppingItem,
  deleteShoppingItemSchema,
  getShoppingItems,
  updateShoppingItem,
  updateShoppingItemSchema,
} from "@/domain/use-cases/shopping-item";
import { authMiddleware } from "@/application/middleware/auth";

export const shoppingItemController = new Elysia({
  prefix: "/shopping-item",
  name: "shopping-item",
})
  .use(authMiddleware)
  .get("/", getShoppingItems, { auth: true })
  .post("/", createShoppingItem, { body: createShoppingItemSchema, auth: true })
  .put("/", updateShoppingItem, { body: updateShoppingItemSchema, auth: true })
  .delete("/", deleteShoppingItem, { body: deleteShoppingItemSchema, auth: true });
