import { getApiBaseUrl } from "../api-config";
import { authClient } from "../auth-client";

export async function deleteShoppingItems(ids: string[]): Promise<{ count: number }> {
  const session = await authClient.getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${getApiBaseUrl()}/shopping-item`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.data?.session.token}`,
    },
    body: JSON.stringify(ids.map(id => ({ id }))),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete shopping items");
  }

  const result = await response.json();
  return result.data;
}
