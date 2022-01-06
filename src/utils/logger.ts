import pino, { LoggerOptions, stdTimeFunctions } from "pino";
import pretty from "pino-pretty"; // eslint-disable-line
import cuid from "cuid";

export const makeLogger = (isDev: boolean) => {
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

  return pino(options).child({ requestId: cuid() }, { level });
};
