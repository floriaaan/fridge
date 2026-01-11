import pino from "pino";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
      messageFormat: "[{time}] | {hostname} | {status} | {method} {path} | {responseTime} | {user}",
      ignore: "pid,time,level,hostname,status,method,path,user,responseTime",
    },
  },
});
