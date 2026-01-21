import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { EnhancedProduct } from "@/application/services/ocr.service";

export interface ScanFridgeResponse {
  items: EnhancedProduct[];
}

export const scanFridge = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<ScanFridgeResponse>> => {
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
    const { ai } = await import("@/infrastructure/ai");
    const { searchOpenFoodFacts, estimateExpiryDays } = await import(
      "@/application/services/openfoodfacts.service"
    );

    // Parse fridge image using AI
    const fridgeData = await ai.parseFridgeImage(imageBase64, "fr");

    // Enhance products with Open Food Facts
    const enhancedProducts: EnhancedProduct[] = await Promise.all(
      fridgeData.items.map(async (item) => {
        try {
          const offResults = await searchOpenFoodFacts(item.name);

          if (offResults.length === 0) {
            return {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit || "pièce",
              price: 0, // No price for fridge scan
              category: "other",
              confidence: "low" as const,
            };
          }

          const bestMatch = offResults[0]!;
          const category = categorizeProduct(bestMatch.categories || "");
          const expiryDays = estimateExpiryDays(category);

          return {
            name: bestMatch.product_name || item.name,
            quantity: item.quantity,
            unit: item.unit || "pièce",
            price: 0,
            category,
            openfoodfactId: bestMatch.code || undefined,
            estimatedExpiryDays: expiryDays || undefined,
            imageUrl: bestMatch.image_url || undefined,
            confidence: offResults.length === 1 ? ("high" as const) : ("medium" as const),
            alternativeMatches:
              offResults.length > 1
                ? offResults.slice(1, 4).map((alt) => ({
                    name: alt.product_name || alt.code,
                    openfoodfactId: alt.code,
                    imageUrl: alt.image_url || undefined,
                  }))
                : undefined,
          };
        } catch (error) {
          console.error(`Failed to enhance product ${item.name}:`, error);
          return {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || "pièce",
            price: 0,
            category: "other",
            confidence: "low" as const,
          };
        }
      })
    );

    status(200);
    return {
      success: true,
      data: {
        items: enhancedProducts,
      },
    };
  } catch (error) {
    console.error("Error scanning fridge:", error);
    status(500);
    return {
      error: "Failed to scan fridge contents",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

function categorizeProduct(categories: string): string {
  const categoryStr = categories.toLowerCase();

  if (categoryStr.includes("meat") || categoryStr.includes("viande") || categoryStr.includes("poisson"))
    return "meat";
  if (categoryStr.includes("frozen") || categoryStr.includes("surgélé") || categoryStr.includes("surgelé"))
    return "frozen";
  if (
    categoryStr.includes("vegetable") ||
    categoryStr.includes("légume") ||
    categoryStr.includes("legume")
  )
    return "vegetables";
  if (
    categoryStr.includes("dairy") ||
    categoryStr.includes("lait") ||
    categoryStr.includes("fromage") ||
    categoryStr.includes("yaourt") ||
    categoryStr.includes("yogurt")
  )
    return "dairy";
  if (categoryStr.includes("bread") || categoryStr.includes("pain") || categoryStr.includes("boulangerie"))
    return "bread";
  if (categoryStr.includes("fruit"))
    return "fruits";
  if (
    categoryStr.includes("pantry") ||
    categoryStr.includes("épicerie") ||
    categoryStr.includes("epicerie") ||
    categoryStr.includes("conserve")
  )
    return "pantry";

  return "other";
}

export const scanFridgeSchema = t.Object({
  imageBase64: t.String(),
});
