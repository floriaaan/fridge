import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  productId: string | null;
  label: string;
  quantity: number | null;
  unit: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  } | null;
}

export interface Recipe {
  id: string;
  ownerUserId: string;
  title: string;
  description: string | null;
  source: "ai" | "user" | "community";
  instructions: string;
  preparationTime: number | null;
  tags: string[];
  createdAt: string;
  ingredients?: RecipeIngredient[];
}

export interface RecipeResponse {
  success: boolean;
  data: Recipe[];
  error?: string;
  message?: string;
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/recipe`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }

  try {
    const text = await response.text();
    if (!text) return [];
    const data = JSON.parse(text);
    return (Array.isArray(data) ? data : data.data) || [];
  } catch (e) {
    console.error("Error parsing recipes:", e);
    return [];
  }
}

export async function fetchRecipeSuggestions(): Promise<Recipe[]> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/recipe/suggestions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recipe suggestions");
  }

  try {
    const text = await response.text();
    if (!text) return [];
    const data = JSON.parse(text);
    return (Array.isArray(data) ? data : data.data) || [];
  } catch (e) {
    console.error("Error parsing recipe suggestions:", e);
    return [];
  }
}

export async function generateRecipes(): Promise<Recipe[]> {
  const cookies = authClient.getCookie();
  const response = await fetch(`${API_BASE_URL}/recipe/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
  });



  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate recipes");
  }

  const data = await response.json();
  if (data && data.success) {
    return data.data;
  }

  return [];
}
