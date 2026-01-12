import { API_BASE_URL } from '@/lib/api-config';
import { authClient } from '@/lib/auth-client';


export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  source: "manual" | "auto_expired" | "recipe";
  createdAt: string; // Dates will be strings in JSON
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}


const API_URL = `${API_BASE_URL}/shopping-item`;

export async function fetchShoppingItems(): Promise<ShoppingItem[]> {
const cookies = authClient.getCookie();
  const headers = { Cookie: cookies };
  const response = await fetch(API_URL, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  if (!response.ok) {
    throw new Error('Failed to fetch shopping items');
  }

  const result: ApiResponse<ShoppingItem[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || 'API returned an error');
  }

  return result.data;
}
