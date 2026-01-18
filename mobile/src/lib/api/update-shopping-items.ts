import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";
import type { ShoppingItem } from "@/lib/api/fetch-shopping-items";

export interface UpdateShoppingItemPayload
  extends Partial<Omit<ShoppingItem, "createdAt" | "updatedAt" | "userId">> {
  id: string;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function updateShoppingItems(
  updates: UpdateShoppingItemPayload[]
): Promise<ShoppingItem[]> {
  const cookies = authClient.getCookie();
  const headers = {
    "Content-Type": "application/json",
    Cookie: cookies,
  };

  const response = await fetch(`${API_BASE_URL}/shopping-item`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update shopping items");
  }

  const result: ApiResponse<ShoppingItem[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}
