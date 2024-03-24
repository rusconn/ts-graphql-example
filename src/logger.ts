import { type LoggerOptions, destination, pino, stdTimeFunctions } from "pino";

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

const KiB = 2 ** 10;

const stream = destination({
  sync: false,
  minLength: 8 * KiB,
});

export const logger = pino(options, stream);
