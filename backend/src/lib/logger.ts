import pino from "pino";
import type { Logger, Bindings, LoggerOptions, TransportSingleOptions } from "pino";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

const baseConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  base: {
    pid: process.pid,
    hostname: undefined, // Will be set dynamically
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
    bindings: (bindings: Bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
    }),
  },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "secret"],
    censor: "[REDACTED]",
  },
};

const devTransport: TransportSingleOptions = {
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l",
    ignore: "pid,hostname",
    singleLine: false,
  },
};

const prodTransport: TransportSingleOptions = {
  target: "pino/file",
  options: { destination: 1 }, // stdout
};

export const logger: Logger = pino({
  ...baseConfig,
  transport: isProduction ? prodTransport : devTransport,
});

/**
 * Creates a child logger with the caller's file path context
 * @param filePath - Use `import.meta.url` or `__filename`
 * @returns Child logger with file context
 */
export function createLogger(filePath: string): Logger {
  const fullPath = filePath.startsWith("file://") ? new URL(filePath).pathname : filePath;
  const relativePath = path.relative(process.cwd(), fullPath);

  return logger.child({
    file: fullPath,
    module: relativePath,
  });
}

/**
 * HTTP request logger middleware helper
 */
export function logRequest(req: { method: string; url: string; path?: string }, res: { statusCode: number }, responseTime: number, user?: string) {
  const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

  logger[level]({
    method: req.method,
    path: req.path || req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    user: user || "anonymous",
  }, `${req.method} ${req.path || req.url} ${res.statusCode}`);
}
