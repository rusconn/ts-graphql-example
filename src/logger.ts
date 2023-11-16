import { randomUUID } from "node:crypto";

import { type LoggerOptions, pino, stdTimeFunctions } from "pino";

import { isDev, isProd, isTest } from "@/config.ts";

const options: LoggerOptions = {
  enabled: !isTest,
  timestamp: stdTimeFunctions.isoTime,
  formatters: {
    // pid と hostname を省く
    bindings: () => ({}),
  },
  redact: isProd
    ? {
        paths: ["variables.input.email", "variables.input.password"],
        censor: "***",
      }
    : undefined,
  transport: isDev
    ? {
        target: "pino-pretty",
      }
    : undefined,
};

export const makeLogger = () => pino(options).child({ requestId: randomUUID() });
