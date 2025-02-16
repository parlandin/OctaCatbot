import { Logger } from "@whiskeysockets/baileys/node_modules/pino/pino";
import pino from "pino";
import { isDev } from "./isDev";

export const pinoLogger = pino({
  level: isDev ? "debug" : "error",
  timestamp: false,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
}) as unknown as Logger;

export type BaileysLogger = Logger;
