import pino from "pino";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss.l'Z'",
      messageFormat: "{time} | {status} | {method} {path} | {user}",
      ignore: "pid,hostname,status,method,path,user,responseTime",
    },
  },
});
