interface OpenFoodFactsProduct {
  _id: string;
  categories: string;
}

interface OpenFoodFactsSearchResponse {
  products: OpenFoodFactsProduct[];
}

interface OpenFoodFactsProductResponse {
  product: OpenFoodFactsProduct;
  status: number;
}

export const getOpenFoodFactsData = async (
  productName: string,
  openfoodfactId?: string,
): Promise<{ openfoodfactId: string; categories: string[] } | null> => {
  try {
    let finalOpenFoodFactId = openfoodfactId;

    if (!finalOpenFoodFactId) {
      const searchResponse = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          productName,
        )}&search_simple=1&action=process&json=1`,
      );
      const searchData = (await searchResponse.json()) as OpenFoodFactsSearchResponse;

      if (searchData.products && searchData.products.length > 0) {
        finalOpenFoodFactId = searchData.products[0]._id;
      }
    }

    if (finalOpenFoodFactId) {
      const productResponse = await fetch(
        `https://world.openfoodfacts.net/api/v2/product/${finalOpenFoodFactId}.json?fields=categories`,
      );
      const productData = (await productResponse.json()) as OpenFoodFactsProductResponse;

      if (productData.status === 1 && productData.product && productData.product.categories) {
        return {
          openfoodfactId: finalOpenFoodFactId,
          categories: productData.product.categories.split(",").map(c => c.trim()),
        };
      }
    }
  } catch (error) {
    console.error("Error fetching from Open Food Facts API:", error);
  }

  return null;
};
