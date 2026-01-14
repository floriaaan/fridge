import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { ocrService, EnhancedProduct } from "@/application/services/ocr.service";

export interface ScanReceiptResponse {
  storeName: string;
  date: string;
  totalAmount: number;
  items: EnhancedProduct[];
}

export const scanReceipt = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<ScanReceiptResponse>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const { imageBase64 } = body as { imageBase64: string };

  if (!imageBase64) {
    status(400);
    return { error: "Missing image data" };
  }

  try {
    // Extract receipt data using OCR/AI
    const receiptData = await ocrService.extractReceiptData(imageBase64);

    // Enhance products with Open Food Facts
    const enhancedProducts = await ocrService.enhanceWithOpenFoodFacts(receiptData.items);

    status(200);
    return {
      success: true,
      data: {
        storeName: receiptData.storeName,
        date: receiptData.date.toISOString(),
        totalAmount: receiptData.totalAmount,
        items: enhancedProducts,
      },
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    status(500);
    return {
      error: "Failed to scan receipt",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const scanReceiptSchema = t.Object({
  imageBase64: t.String(),
});
