import * as SecureStore from "expo-secure-store";

const SERVER_CONFIG_KEY = "fridge_server_config";
const ONBOARDING_COMPLETED_KEY = "fridge_onboarding_completed";

export interface ServerConfig {
  baseUrl: string;
  isOfficialInstance: boolean;
}

// Default official instance URL - configured via environment variable
// In production, this should be set to the actual hosted server URL
const OFFICIAL_INSTANCE_URL = process.env.EXPO_PUBLIC_API_URL || "https://fridge-api.example.com";

export async function getServerConfig(): Promise<ServerConfig | null> {
  try {
    const config = await SecureStore.getItemAsync(SERVER_CONFIG_KEY);
    if (config) {
      return JSON.parse(config) as ServerConfig;
    }
    return null;
  } catch (error) {
    console.error("Error reading server config:", error);
    return null;
  }
}

export async function setServerConfig(config: ServerConfig): Promise<void> {
  try {
    await SecureStore.setItemAsync(SERVER_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving server config:", error);
    throw error;
  }
}

export async function clearServerConfig(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SERVER_CONFIG_KEY);
  } catch (error) {
    console.error("Error clearing server config:", error);
  }
}

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const completed = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
    return completed === "true";
  } catch (error) {
    console.error("Error reading onboarding status:", error);
    return false;
  }
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, completed ? "true" : "false");
  } catch (error) {
    console.error("Error saving onboarding status:", error);
    throw error;
  }
}

export function getOfficialInstanceUrl(): string {
  return OFFICIAL_INSTANCE_URL;
}
