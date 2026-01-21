import { getServerConfig, type ServerConfig } from "./server-config";

// Default BASE_URL from environment for fallback
const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Cache for server config to avoid async calls on every API request
let cachedConfig: ServerConfig | null = null;
let isInitialized = false;

export async function initializeApiConfig(): Promise<void> {
  cachedConfig = await getServerConfig();
  isInitialized = true;
}

export function updateCachedConfig(config: ServerConfig): void {
  cachedConfig = config;
  isInitialized = true;
}

export function getBaseUrl(): string {
  if (cachedConfig?.baseUrl) {
    return cachedConfig.baseUrl;
  }
  return DEFAULT_BASE_URL;
}

export function getApiBaseUrl(): string {
  return `${getBaseUrl()}/api`;
}

export function isConfigured(): boolean {
  return isInitialized && cachedConfig !== null;
}

// Legacy exports for compatibility
const BASE_URL = DEFAULT_BASE_URL;
const API_BASE_URL = `${DEFAULT_BASE_URL}/api`;

export { BASE_URL, API_BASE_URL };
