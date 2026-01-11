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

  return result.data;
}
