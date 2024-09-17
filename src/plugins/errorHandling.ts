import { useErrorHandler } from "graphql-yoga";

import type { Context } from "@/context.ts";
import { logger } from "@/logger.ts";

export const errorHandling = useErrorHandler(({ errors, context, phase }) => {
  if (phase === "context") {
    for (const error of errors) {
      logger.error(error);
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
