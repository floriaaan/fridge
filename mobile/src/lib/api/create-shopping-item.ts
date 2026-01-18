import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";
import type { ShoppingItem } from "@/lib/api/fetch-shopping-items";

export interface CreateShoppingItemPayload {
  name: string;
  quantity: number;
  unit: string;
  checked?: boolean;
  source?: "manual" | "auto_expired" | "recipe";
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function createShoppingItem(
  input: CreateShoppingItemPayload
): Promise<ShoppingItem> {
  const cookies = authClient.getCookie();
  const headers = {
    "Content-Type": "application/json",
    Cookie: cookies,
  };

  const response = await fetch(`${API_BASE_URL}/shopping-item`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create shopping item");
  }

  const result: ApiResponse<ShoppingItem> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}
