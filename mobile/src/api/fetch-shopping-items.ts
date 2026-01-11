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

import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/shopping-item`;

export async function fetchShoppingItems(): Promise<ShoppingItem[]> {
  // We'll need to handle authentication later
  // For now, we assume the API is accessible without a token
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch shopping items');
  }

  const result: ApiResponse<ShoppingItem[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || 'API returned an error');
  }

  return result.data;
}
