import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";

interface UpdateProductPayload {
  id: string;
  name?: string;
  quantity?: number;
}

export async function updateProduct(payload: UpdateProductPayload) {
  const { id, ...data } = payload;
  const cookies = authClient.getCookie();
  const headers = {
    "Content-Type": "application/json",
    Cookie: cookies,
  };
  const response = await fetch(`${API_BASE_URL}/product/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update product");
  }

  return response.json();
}
