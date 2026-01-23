import { Context, t } from "elysia";
import { User } from "better-auth/types";
import { FridgeResponse } from "@/application/entities/response";
import { searchOpenFoodFacts } from "@/application/services/openfoodfacts.service";

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_fr?: string;
  categories?: string;
  image_url?: string;
}

export const searchProducts = async ({
  user,
  body,
  status,
}: Context & { user: User }): Promise<FridgeResponse<{ products: OpenFoodFactsProduct[] }>> => {
  if (!user) {
    status(401);
    return { error: "Unauthorized" };
  }

  const { query } = body as { query: string };

  if (!query || query.trim().length === 0) {
    status(400);
    return { error: "Missing search query" };
  }

  try {
    const products = await searchOpenFoodFacts(query);
    
    status(200);
    return {
      success: true,
      data: {
        products,
      },
    };
  } catch (error) {
    console.error("Error searching OpenFoodFacts:", error);
    status(500);
    return {
      error: "Failed to search products",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const searchProductsSchema = t.Object({
  query: t.String(),
});
