import pino, { LoggerOptions, stdTimeFunctions } from "pino";
import pretty from "pino-pretty"; // eslint-disable-line import/no-extraneous-dependencies
import { nanoid } from "nanoid";

import type { NodeEnv } from "./env";

export const makeLogger = (nodeEnv: NodeEnv) => {
  if (nodeEnv === "test") {
    return pino({ enabled: false });
  }

  const isDev = nodeEnv === "development";

  // pid と hostname を省き、タイムスタンプを読める形にする
  const options: pretty.PrettyStream | LoggerOptions = isDev
    ? pretty({ ignore: "pid,hostname", translateTime: true })
    : {
        timestamp: stdTimeFunctions.isoTime,
        formatters: {
          bindings: () => ({}),
        },
      };

  const level = isDev ? "debug" : "info";

  return pino(options).child({ requestId: nanoid() }, { level });
};
