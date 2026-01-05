import Elysia, { t } from "elysia";
import {
  createShoppingItem,
  deleteShoppingItem,
  getShoppingItem,
  getShoppingItems,
  updateShoppingItem,
} from "@/domain/use-cases/shopping-item";
import { auth } from "@/application/middleware/auth";
import { shoppingItemSchema } from "@/domain/entity/shopping-item";

export const shoppingItemController = new Elysia({
  prefix: "/shopping-item",
  name: "shopping-item",
})
  .use(auth)
  .get("/", async ({ user }) => {
    if (!user) {
      throw new Error("User not found");
    }
    return await getShoppingItems(user.id);
  })
  .get(
    "/:id",
    async ({ user, params }) => {
      if (!user) {
        throw new Error("User not found");
      }
      return await getShoppingItem(user.id, params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    "/",
    async ({ user, body }) => {
      if (!user) {
        throw new Error("User not found");
      }
      return await createShoppingItem(user.id, body);
    },
    {
      body: t.Object({
        name: t.String(),
        quantity: t.Number(),
        unit: t.String(),
        checked: t.Optional(t.Boolean()),
        source: t.Optional(
          t.Union([
            t.Literal("manual"),
            t.Literal("auto_expired"),
            t.Literal("recipe"),
          ]),
        ),
      }),
    },
  )
  .put(
    "/:id",
    async ({ user, params, body }) => {
      if (!user) {
        throw new Error("User not found");
      }
      return await updateShoppingItem(user.id, params.id, body);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Partial(shoppingItemSchema),
    },
  )
  .delete(
    "/:id",
    async ({ user, params }) => {
      if (!user) {
        throw new Error("User not found");
      }
      await deleteShoppingItem(user.id, params.id);
      return {
        status: "ok",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
