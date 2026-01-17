import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";
import type { Product } from "@/lib/api/fetch-products";

export interface EnhancedProduct {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  openfoodfactId?: string;
  estimatedExpiryDays?: number;
  imageUrl?: string;
  confidence: "high" | "medium" | "low";
  alternativeMatches?: Array<{
    name: string;
    openfoodfactId: string;
    imageUrl?: string;
  }>;
}

export interface ScanReceiptResponse {
  storeName: string;
  date: string;
  totalAmount: number;
  items: EnhancedProduct[];
}

export interface ImportReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  location: string;
  openfoodfactId?: string;
  estimatedExpiryDays?: number;
}

export interface ImportReceiptInput {
  storeName: string;
  totalAmount: number;
  date: string;
  items: ImportReceiptItem[];
  imageUrl?: string;
  ocrRawData?: any;
}

export interface Receipt {
  id: string;
  userId: string;
  storeName: string;
  scannedAt: string;
  totalAmount: string;
  imageUrl?: string | null;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

const API_URL = `${API_BASE_URL}/receipt`;

export async function scanReceipt(
  imageBase64: string
): Promise<ScanReceiptResponse> {
  const cookies = authClient.getCookie();
  const headers = {
    Cookie: cookies,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_URL}/scan`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    throw new Error("Failed to scan receipt");
  }

  const result: ApiResponse<ScanReceiptResponse> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}

export async function importReceipt(
  input: ImportReceiptInput
): Promise<{ receipt: Receipt; products: Product[] }> {
  const cookies = authClient.getCookie();
  const headers = {
    Cookie: cookies,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_URL}/import`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to import receipt");
  }

  const result: ApiResponse<{ receipt: Receipt; products: Product[] }> =
    await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}

export async function getReceiptHistory(): Promise<Receipt[]> {
  const cookies = authClient.getCookie();
  const headers = { Cookie: cookies };

  const response = await fetch(`${API_URL}/history`, { headers });

  if (!response.ok) {
    throw new Error("Failed to fetch receipt history");
  }

  const result: ApiResponse<Receipt[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}
