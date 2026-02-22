import { useErrorHandler } from "graphql-yoga";

import { pino } from "../../../../infrastructure/loggers/pino.ts";
import type { Context } from "../context.ts";

export const errorHandling = useErrorHandler(({ errors, context, phase }) => {
  if (phase === "context") {
    for (const error of errors) {
      pino.error(error);
    }
  }

  if (phase === "execution") {
    const { contextValue } = context as { contextValue: Context };
    const { logger } = contextValue;

    for (const error of errors) {
      logger.error(error, "error-info");
    }
  }
});
