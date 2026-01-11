import { auth } from "@/lib/auth";
import { Elysia } from "elysia";

// user middleware (compute user and session and pass to routes)
export const authMiddleware = new Elysia({ name: "better-auth" })
  .use(
    auth.handler.derive(({ session, user }) => {
      return {
        user,
        session,
      };
    })
  )
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        try {
          const session = await auth.api.getSession({
            headers,
          });

          if (!session) return status(401);

          return {
            user: session.user,
            session: session.session,
          } as AuthMacro;
        } catch (error) {
          console.error("Auth middleware error:", error);
          return status(401);
        }
      },
    },
  });

export type AuthMacro = {
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"];
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["session"];
};
