import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { EnhancedProduct } from "@/application/services/ocr.service";

export interface ConfirmProductsResponse {
  items: EnhancedProduct[];
  metadata?: Record<string, any>;
}

/**
 * Shared service for confirming scanned products
 * Used by both receipt and fridge-scan flows
 */
export async function confirmProducts(
  imageBase64: string,
  enhanceFunc: (items: any[]) => Promise<EnhancedProduct[]>,
  parseFunc: (imageBase64: string, locale: string) => Promise<any>
): Promise<EnhancedProduct[]> {
  // Parse image using provided function
  const parsedData = await parseFunc(imageBase64, "fr");
  
  // Enhance products with Open Food Facts
  const enhancedProducts = await enhanceFunc(parsedData.items);
  
  return enhancedProducts;
}
