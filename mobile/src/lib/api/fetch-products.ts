import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";

export interface Product {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  location: string;
  expiresAt: string | null; // Dates will be strings in JSON
  openedAt: string | null;
  category: string;
  openfoodfactId: string | null;
  categories: string[] | null;
  createdAt: string;
  updatedAt: string;

  openfoodfactData?: {
    _h?: number;
    _i?: number;
    _j?: {
      image_url?: string;
      image_front_url?: string;
      image_front_small_url?: string;
      image_front_thumb_url?: string;
      product_name?: string;
      brands?: string;
      [key: string]: any;
    };
    _k?: any;
    image_url?: string;
    product_name?: string;
    brands?: string;
    [key: string]: any;
  } | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

const API_URL = `${API_BASE_URL}/product`;

export async function fetchProducts(): Promise<Product[]> {
  const cookies = authClient.getCookie();
  const headers = { Cookie: cookies };
  const response = await fetch(API_URL, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result: ApiResponse<Product[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  const products = await Promise.all(result.data.map(async (product) => ({
    ...product,
    ...(product.openfoodfactId ? { openfoodfactData: await fetchOpenFoodFactProduct(product.openfoodfactId) } : {})
  })));
  return products;
}


export const fetchOpenFoodFactProductByBarcode = async (barcode: string) => {

  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch product from OpenFoodFacts");
  }

  const result = await response.json();
  if (result.status !== 1) {
    throw new Error("Product not found in OpenFoodFacts");
  }

  return result.product;
};

const fetchOpenFoodFactProduct = async (openfoodfactId   : string) => {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${openfoodfactId}.json`);
  if (!response.ok) {
    throw new Error("Failed to fetch product from OpenFoodFacts");
  }

  const result = await response.json();
  if (result.status !== 1) {
    throw new Error("Product not found in OpenFoodFacts");
  }

  return result.product;
}
