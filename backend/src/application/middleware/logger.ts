import { Elysia } from "elysia";
import pino from "pino";
import { AuthMacro } from "./auth";

const logger = pino({
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export const loggerMiddleware = new Elysia({ name: "logger" })
  .onRequest((ctx) => {
    ctx.store = { ...ctx.store, startTime: process.hrtime() };
  })
  .onResponse({ as: "global" }, (ctx) => {
    const { request, set, store } = ctx;
    const { startTime } = store as { startTime: [number, number] };
    const endTime = process.hrtime(startTime);
    const responseTime = (endTime[0] * 1e9 + endTime[1]) / 1e6;

    const user = (ctx as unknown as AuthMacro).user;
    const userName = user?.name || "";

    logger.info(
      {
        status: set.status,
        method: request.method,
        path: new URL(request.url).pathname,
        user: userName,
        responseTime: `${responseTime.toFixed(2)}ms`,
      },
      `| ${set.status} | ${request.method} ${
        new URL(request.url).pathname
      } | ${userName}`
    );
  });
