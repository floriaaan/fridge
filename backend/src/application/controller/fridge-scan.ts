import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import {
  scanFridge,
  scanFridgeSchema,
  importFridge,
  importFridgeSchema,
} from "@/domain/use-cases/fridge-scan";

export const fridgeScanController = new Elysia({
  prefix: "/fridge-scan",
})
  .use(authMiddleware)
  .post("/scan", scanFridge, { body: scanFridgeSchema, auth: true })
  .post("/import", importFridge, { body: importFridgeSchema, auth: true });
