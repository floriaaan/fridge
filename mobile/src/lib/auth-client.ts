import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { passkeyClient } from "@better-auth/passkey/client";
import { genericOAuthClient } from "better-auth/client/plugins";


export const authClient = createAuthClient({
    baseURL: process.env.AUTH_BASE_URL || "http://10.200.162.11:3000", // Base URL of your Better Auth backend.
    // baseURL: process.env.AUTH_BASE_URL || "http://192.168.1.136:3000", // Base URL of your Better Auth backend.
    plugins: [
        expoClient({
            scheme: "fridge",
            storagePrefix: "fridge",
            storage: SecureStore,
        }),
        passkeyClient(),
        genericOAuthClient(),
    ]
});