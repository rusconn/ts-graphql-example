import { type LoggerOptions, destination, pino, stdTimeFunctions } from "pino";

import { isDev, isProd, isTest } from "./config.ts";
import { Ki } from "./lib/number/prefix.ts";

const options: LoggerOptions = {
  enabled: !isTest,
  timestamp: stdTimeFunctions.isoTime,
  formatters: {
    // pid と hostname を省く
    bindings: () => ({}),
  },
  ...(isProd && {
    redact: {
      paths: ["variables.email", "variables.password"],
      censor: "***",
    },
  }),
  ...(isDev && {
    transport: {
      target: "pino-pretty",
    },
  }),
};

const stream = destination({
  sync: false,
  minLength: 8 * Ki,
});

export const logger = pino(options, stream);
