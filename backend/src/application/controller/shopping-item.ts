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
    const items = await getShoppingItems(user!.id);
    return { success: true, data: items };
  })
  .get(
    "/:id",
    async ({ user, params }) => {
      return await getShoppingItem(user!.id, params.id);
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
      return await createShoppingItem(user!.id, body);
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
    "/",
    async ({ user, body }) => {
      return await updateShoppingItem(user!.id, body);
    },
    {
      body: t.Array(t.Partial(shoppingItemSchema)),
    },
  )
  .delete(
    "/",
    async ({ user, body }) => {
      const ids = body.map((item: { id: string }) => item.id);
      await deleteShoppingItem(user!.id, ids);
      return {
        status: "ok",
      };
    },
    {
      body: t.Array(t.Object({ id: t.String() })),
    },
  );
