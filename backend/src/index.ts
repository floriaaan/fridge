import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { authMiddleware } from "@/middleware/auth";

const app = new Elysia({ adapter: node() })
  .use(authMiddleware)
  .get("/", () => "Hello Elysia")
  .get("/user", ({ user }) => user, { auth: true })
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port} (${process.env.NODE_ENV})`);
  });
