import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";

export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_fr?: string;
  categories?: string;
  image_url?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

const API_URL = `${API_BASE_URL}/openfoodfacts`;

export async function searchOpenFoodFacts(
  query: string
): Promise<OpenFoodFactsProduct[]> {
  const cookies = authClient.getCookie();
  const headers = {
    Cookie: cookies,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_URL}/search`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error("Failed to search OpenFoodFacts");
  }

  const result: ApiResponse<{ products: OpenFoodFactsProduct[] }> =
    await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data.products;
}
