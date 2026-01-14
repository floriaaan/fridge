import { betterAuth } from "better-auth";
import { apiKey, genericOAuth, openAPI } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/infrastructure/database";
import { schema } from "@/infrastructure/database/schema";
import { expo } from "@better-auth/expo";
import { env } from "./env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    expo(),
    openAPI(),
    apiKey({
      enableSessionForAPIKeys: true,
    }),
    passkey(),
    genericOAuth({
      config: [
        {
          providerId: "pocketid",
          clientId: env.POCKETID_CLIENT_ID,
          clientSecret: env.POCKETID_CLIENT_SECRET,
          discoveryUrl: env.POCKETID_ISSUER,
        },
      ],
    }),
  ],
  trustedOrigins: [
    "fridge://",

    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://", // Trust all Expo URLs (prefix matching)
        ]
      : []),
  ],
});
