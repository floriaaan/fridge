import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { getBaseUrl } from "./api-config";
// import { passkeyClient } from "@better-auth/passkey/client";
// import { genericOAuthClient } from "better-auth/client/plugins";

// Create auth client with current base URL
function createClient() {
  return createAuthClient({
    baseURL: getBaseUrl(),
    plugins: [
      expoClient({
        scheme: "fridge",
        storagePrefix: "fridge",
        storage: SecureStore,
        cookiePrefix: "better-auth", // Correspond au préfixe par défaut du serveur
      }),
    ],
  });
}

// Singleton instance - will be recreated when server config changes
let _authClient = createClient();

export const authClient = _authClient;

// Function to recreate auth client with new base URL (after server config change)
export function reinitializeAuthClient(): void {
  _authClient = createClient();
  // Update the exported reference
  Object.assign(authClient, _authClient);
}
