import { betterAuth } from "better-auth";
import { apiKey, openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/infrastructure/database";
import { schema } from "@/infrastructure/database/schema";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [expo(), openAPI(), apiKey()],
  trustedOrigins: [
        "fridge://",
        
        // Development mode - Expo's exp:// scheme with local IP ranges
        ...(process.env.NODE_ENV === "development" ? [
            "exp://",                      // Trust all Expo URLs (prefix matching)
        ] : [])
    ]
});
