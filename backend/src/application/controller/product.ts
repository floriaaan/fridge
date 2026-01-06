import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";

import {
  createProducts,
  createProductSchema,
  deleteProducts,
  deleteProductSchema,
  getProducts,
  updateProducts,
  updateProductSchema,
  getExpiredProducts,
  getExpiresSoonProducts,
} from "@/domain/use-cases/product";

export const productController = new Elysia({
  prefix: "/product",
})
  .use(authMiddleware)
  .get("/", getProducts, { auth: true })
  .get("/expired", getExpiredProducts, { auth: true })
  .get("/expires-soon", getExpiresSoonProducts, { auth: true })
  .post("/", createProducts, { body: createProductSchema, auth: true })
  .put("/", updateProducts, { body: updateProductSchema, auth: true })
  .delete("/", deleteProducts, { body: deleteProductSchema, auth: true });
