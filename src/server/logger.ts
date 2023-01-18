import pino, { LoggerOptions, stdTimeFunctions } from "pino";
import pretty from "pino-pretty"; // eslint-disable-line import/no-extraneous-dependencies
import { nanoid } from "nanoid";

import { isDev, isTest } from "@/config";

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

export const logger = isTest
  ? pino({ enabled: false })
  : pino(options).child({ requestId: nanoid() }, { level });
