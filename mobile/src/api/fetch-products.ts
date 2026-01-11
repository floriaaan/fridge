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

import { API_BASE_URL } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/product`;

export async function fetchProducts(): Promise<Product[]> {
  // We'll need to handle authentication later
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const result: ApiResponse<Product[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || 'API returned an error');
  }

  return result.data;
}
