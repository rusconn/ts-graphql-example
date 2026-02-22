import { pino as createPino, destination, type LoggerOptions, stdTimeFunctions } from "pino";

import { isDev, isTest } from "../../config/exec-env.ts";
import { Ki } from "../../lib/number/prefix.ts";

const options: LoggerOptions = {
  enabled: !isTest,
  timestamp: stdTimeFunctions.isoTime,
  formatters: {
    // pid と hostname を省く
    bindings: () => ({}),
  },
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

export const pino = createPino(options, stream);
