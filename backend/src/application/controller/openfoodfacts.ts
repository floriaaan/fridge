import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import { searchProducts, searchProductsSchema } from "@/domain/use-cases/openfoodfacts/search";

export const openfoodfactsController = new Elysia({
  prefix: "/openfoodfacts",
})
  .use(authMiddleware)
  .post("/search", searchProducts, { body: searchProductsSchema, auth: true });
