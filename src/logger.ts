import pino, { LoggerOptions, stdTimeFunctions } from "pino";
import { ulid } from "ulid";

import { isDev, isProd, isTest } from "@/config";

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

export const logger = () => pino(options).child({ requestId: ulid() });
