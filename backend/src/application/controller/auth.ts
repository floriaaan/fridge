import { auth } from "@/lib/auth";
import { Elysia } from "elysia";

// Handler for all better-auth routes
const authHandler = async (ctx: any) => {
  return auth.handler(ctx.request);
};

export const authController = new Elysia({ prefix: "/api/auth" })
  // GET routes
  .get("/get-session", authHandler)
  
  // POST routes  
  .post("/sign-in/email", authHandler)
  .post("/sign-up/email", authHandler)
  .post("/sign-out", authHandler)
  .post("/reset-password", authHandler)
  .post("/forgot-password", authHandler)
  .post("/verify-email", authHandler)
  .post("/change-password", authHandler)
  
  // Fallback for other auth routes (OPTIONS, etc)
  .all("/*", authHandler);