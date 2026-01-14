import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";

export interface Passkey {
  id: string;
  name: string;
  credentialID: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only present when created
  createdAt: string;
  expiresAt: string | null;
}


// Passkeys
export async function fetchPasskeys(): Promise<Passkey[]> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/auth/passkey/list`, {
    headers: { Cookie: cookies },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch passkeys");
  }

  const result = await response.json();
  return result || [];
}

export async function createPasskey(name: string): Promise<void> {
  await authClient.passkey.addPasskey({ name });
}

export async function deletePasskey(id: string): Promise<void> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/auth/passkey/${id}`, {
    method: "DELETE",
    headers: { Cookie: cookies },
  });

  if (!response.ok) {
    throw new Error("Failed to delete passkey");
  }
}

// API Keys
export async function fetchApiKeys(): Promise<ApiKey[]> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/auth/api-key/list`, {
    headers: { Cookie: cookies },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }

  const result = await response.json();
  return result || [];
}

export async function createApiKey(name: string): Promise<ApiKey> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/auth/api-key/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create API key");
  }

  const result = await response.json();
  return result;
}

export async function deleteApiKey(id: string): Promise<void> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/auth/api-key/${id}`, {
    method: "DELETE",
    headers: { Cookie: cookies },
  });

  if (!response.ok) {
    throw new Error("Failed to delete API key");
  }
}
