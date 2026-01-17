interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_fr?: string;
  categories?: string;
  image_url?: string;
}

interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsProduct[];
}

export async function searchOpenFoodFacts(
  productName: string
): Promise<OpenFoodFactsProduct[]> {
  try {
    const searchResponse = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        productName
      )}&search_simple=1&action=process&json=1&page_size=5`
    );
    const searchData = (await searchResponse.json()) as OpenFoodFactsSearchResponse;

    if (searchData.products && searchData.products.length > 0) {
      return searchData.products.map((p: any) => ({
        code: p.code || p._id,
        product_name: p.product_name,
        product_name_fr: p.product_name_fr,
        categories: p.categories,
        image_url: p.image_url,
      }));
    }
  } catch (error) {
    console.error("Error searching Open Food Facts:", error);
  }

  return [];
}

export function estimateExpiryDays(category: string): number {
  const expiryMap: Record<string, number> = {
    meat: 3,
    frozen: 90,
    vegetables: 7,
    dairy: 7,
    bread: 5,
    fruits: 7,
    pantry: 180,
    other: 30,
  };

  return expiryMap[category] || 30;
}
