import { API_BASE_URL } from "@/lib/api-config";
import { authClient } from "@/lib/auth-client";

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface OverallStats {
  totalProducts: number;
  consumedProducts: number;
  discardedProducts: number;
  activeProducts: number;
  wasteRate: number;
  moneySaved: number;
  moneyWasted: number;
  co2Avoided: number;
  topCategories: CategoryStat[];
  motivationMessage: string;
}

export interface PeriodStats extends OverallStats {
  period: "daily" | "weekly" | "monthly" | "yearly";
  periodStart: string;
  periodEnd: string;
}

export interface WasteEvolutionPoint {
  date: string;
  wasteRate: number;
  consumedProducts: number;
  discardedProducts: number;
  totalProducts: number;
}

export interface WasteEvolution {
  points: WasteEvolutionPoint[];
  trend: "up" | "down" | "stable";
  averageWasteRate: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

const STATISTICS_URL = `${API_BASE_URL}/statistics`;

export async function fetchOverallStats(): Promise<OverallStats> {
  const cookies = authClient.getCookie();
  const headers = { Cookie: cookies };
  const response = await fetch(`${STATISTICS_URL}/overview`, { headers });
  
  if (!response.ok) {
    throw new Error("Failed to fetch statistics");
  }

  const result: ApiResponse<OverallStats> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}

export async function fetchStatsByPeriod(
  period: "daily" | "weekly" | "monthly" | "yearly",
  date?: string
): Promise<PeriodStats> {
  const cookies = authClient.getCookie();
  const headers = { Cookie: cookies };
  const url = date 
    ? `${STATISTICS_URL}/period/${period}?date=${date}`
    : `${STATISTICS_URL}/period/${period}`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error("Failed to fetch period statistics");
  }

  const result: ApiResponse<PeriodStats> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}

export async function fetchWasteEvolution(months: number = 6): Promise<WasteEvolution> {
  const cookies = authClient.getCookie();
  const headers = { Cookie: cookies };
  const response = await fetch(`${STATISTICS_URL}/evolution?months=${months}`, { headers });
  
  if (!response.ok) {
    throw new Error("Failed to fetch waste evolution");
  }

  const result: ApiResponse<WasteEvolution> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}

export async function fetchTopCategories(limit: number = 10): Promise<CategoryStat[]> {
  const cookies = authClient.getCookie();
  const headers = { Cookie: cookies };
  const response = await fetch(`${STATISTICS_URL}/categories?limit=${limit}`, { headers });
  
  if (!response.ok) {
    throw new Error("Failed to fetch top categories");
  }

  const result: ApiResponse<CategoryStat[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "API returned an error");
  }

  return result.data;
}
