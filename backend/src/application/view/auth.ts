import { Context } from "elysia";
import { auth } from "@/lib/auth";

export const betterAuthHandler = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    context.status(405);
    return { error: "Method Not Allowed" };
  }
};
