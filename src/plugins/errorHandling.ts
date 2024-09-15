import { useErrorHandler } from "graphql-yoga";

import { logger } from "@/logger.ts";
import type { Context } from "@/modules/common/resolvers.ts";

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
