import { type LoggerOptions, destination, pino, stdTimeFunctions } from "pino";

import { isDev, isProd, isTest } from "./config.ts";

const options: LoggerOptions = {
  enabled: !isTest,
  timestamp: stdTimeFunctions.isoTime,
  formatters: {
    // pid と hostname を省く
    bindings: () => ({}),
  },
  ...(isProd && {
    redact: {
      paths: ["variables.input.email", "variables.input.password"],
      censor: "***",
    },
  }),
  ...(isDev && {
    transport: {
      target: "pino-pretty",
    },
  }),
};

const KiB = 2 ** 10;

const stream = destination({
  sync: false,
  minLength: 8 * KiB,
});

export const logger = pino(options, stream);
