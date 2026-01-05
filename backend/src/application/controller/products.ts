import Elysia, { t } from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import { createProductsHandler } from "@/domain/use-cases/products/create";
import { updateProductsHandler, updateProductSchema } from "@/domain/use-cases/products/update";
import { getProductsHandler } from "@/domain/use-cases/products/read";
import { deleteProductsHandler, deleteProductSchema } from "@/domain/use-cases/products/delete";
import { productSchema, type Product } from "@/domain/entity/product";

const errorResponse = t.Object({
  error: t.String(),
  message: t.Optional(t.String()),
});

export const productsController = new Elysia({
  prefix: "/api/products",
})
  .use(authMiddleware)
  .get("/", getProductsHandler, {
    response: {
      200: t.Object({
        success: t.Literal(true),
        data: t.Array(productSchema),
      }),
      401: errorResponse,
      500: errorResponse,
    },
    auth: true,
  })
  .post("/", createProductsHandler, {
    body: t.Array(t.Omit(productSchema, ["id", "userId", "createdAt", "updatedAt"])),
    response: {
      201: t.Object({ success: t.Literal(true), data: t.Array(productSchema) }),
      401: errorResponse,
      500: errorResponse,
    },
    auth: true,
  })
  .put("/", updateProductsHandler, {
    body: t.Array(updateProductSchema),
    response: {
      200: t.Object({ success: t.Literal(true), data: t.Array(productSchema) }),
      401: errorResponse,
      404: errorResponse,
      500: errorResponse,
    },
    auth: true,
  })
  .delete("/", deleteProductsHandler, {
    body: t.Array(deleteProductSchema),
    response: {
      200: t.Object({ success: t.Literal(true), deletedCount: t.Integer() }),
      401: errorResponse,
      500: errorResponse,
    },
    auth: true,
  });
