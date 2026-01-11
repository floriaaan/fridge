import { Context, Elysia } from "elysia";
import { logger } from "@/lib/logger";
import { User } from "better-auth/types";

export const loggerMiddleware = new Elysia({ name: "logger" })
  .onRequest((ctx) => {
    ctx.store = { ...ctx.store, startTime: process.hrtime() };
  })
  .onAfterResponse({ as: "global" }, (context) => {
    const { request, set, store } = context;
    const { startTime } = store as { startTime: [number, number] };
    const endTime = process.hrtime(startTime);
    const responseTime = (endTime[0] * 1e9 + endTime[1]) / 1e6;

    const userName = (context as any).user?.name || "";

    logger.info({
      status: set.status,
      method: request.method,
      path: new URL(request.url).pathname,
      user: userName,
      responseTime: `${responseTime.toFixed(2)}ms`,
    });
  });
