import Elysia from "elysia";
import { authMiddleware } from "@/application/middleware/auth";
import {
  scanReceipt,
  scanReceiptSchema,
  importReceipt,
  importReceiptSchema,
  getReceiptHistory,
} from "@/domain/use-cases/receipt";

export const receiptController = new Elysia({
  prefix: "/receipt",
})
  .use(authMiddleware)
  .post("/scan", scanReceipt, { body: scanReceiptSchema, auth: true })
  .post("/import", importReceipt, { body: importReceiptSchema, auth: true })
  .get("/history", getReceiptHistory, { auth: true });
