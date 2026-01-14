export interface RawReceiptItem {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

export interface ReceiptData {
  storeName: string;
  date: Date;
  items: RawReceiptItem[];
  totalAmount: number;
}

export interface StoreInfo {
  name: string;
  confidence: number;
}

export interface EnhancedProduct {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  openfoodfactId?: string | undefined;
  estimatedExpiryDays?: number | undefined;
  imageUrl?: string | undefined;
  confidence: "high" | "medium" | "low";
  alternativeMatches?: Array<{
    name: string;
    openfoodfactId: string;
    imageUrl?: string | undefined;
  }> | undefined;
}

export class OCRService {
  async extractReceiptData(imageBase64: string): Promise<ReceiptData> {
    const { ai } = await import("@/infrastructure/ai");
    const result = await ai.parseReceiptImage(imageBase64, "fr");
    
    // Convert date string to Date object
    return {
      ...result,
      date: new Date(result.date),
    };
  }

  async enhanceWithOpenFoodFacts(
    items: RawReceiptItem[]
  ): Promise<EnhancedProduct[]> {
    const { searchOpenFoodFacts, estimateExpiryDays } = await import(
      "./openfoodfacts.service"
    );

    const enhancedProducts = await Promise.all(
      items.map(async (item) => {
        try {
          const offResults = await searchOpenFoodFacts(item.name);

          if (offResults.length === 0) {
            return {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit || "pièce",
              price: item.price,
              category: "other",
              confidence: "low" as const,
            };
          }

          const bestMatch = offResults[0]!;
          const category = this.categorizeProduct(bestMatch.categories || "");
          const expiryDays = estimateExpiryDays(category);

          return {
            name: bestMatch.product_name || item.name,
            quantity: item.quantity,
            unit: item.unit || "pièce",
            price: item.price,
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
            price: item.price,
            category: "other",
            confidence: "low" as const,
          };
        }
      })
    );

    return enhancedProducts;
  }

  async detectStore(text: string): Promise<StoreInfo> {
    const storePatterns = [
      { pattern: /carrefour/i, name: "Carrefour" },
      { pattern: /auchan/i, name: "Auchan" },
      { pattern: /leclerc/i, name: "Leclerc" },
      { pattern: /intermarché|intermarche/i, name: "Intermarché" },
      { pattern: /monoprix/i, name: "Monoprix" },
      { pattern: /casino/i, name: "Casino" },
      { pattern: /lidl/i, name: "Lidl" },
      { pattern: /aldi/i, name: "Aldi" },
      { pattern: /franprix/i, name: "Franprix" },
      { pattern: /super\s*u/i, name: "Super U" },
    ];

    for (const { pattern, name } of storePatterns) {
      if (pattern.test(text)) {
        return { name, confidence: 0.9 };
      }
    }

    return { name: "Unknown", confidence: 0 };
  }

  private categorizeProduct(categories: string): string {
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
}

export const ocrService = new OCRService();
