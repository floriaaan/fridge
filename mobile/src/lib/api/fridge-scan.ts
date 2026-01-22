import { getApiBaseUrl } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";
import type { EnhancedProduct } from "@/lib/api/receipt";

export interface ScanFridgeResponse {
  items: EnhancedProduct[];
}

export interface ImportFridgeItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location: string;
  openfoodfactId?: string;
  estimatedExpiryDays?: number;
}

export interface ImportFridgeInput {
  items: ImportFridgeItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export async function scanFridgeContents(
  imageBase64: string
): Promise<ScanFridgeResponse> {
  const cookies = authClient.getCookie();
  const headers = {
    Cookie: cookies,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${getApiBaseUrl()}/fridge-scan/scan`, {
    method: "POST",
    headers,
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    throw new Error("Failed to scan fridge contents");
  }

  const result: ApiResponse<ScanFridgeResponse> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}

export async function importFridgeProducts(
  input: ImportFridgeInput
): Promise<{ products: any[] }> {
  const cookies = authClient.getCookie();
  const headers = {
    Cookie: cookies,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${getApiBaseUrl()}/fridge-scan/import`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to import fridge products");
  }

  const result: ApiResponse<{ products: any[] }> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}
