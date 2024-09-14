import { useErrorHandler } from "graphql-yoga";

import { logger as log } from "@/logger.ts";
import type { Context } from "@/modules/common/resolvers.ts";

export const errorHandler = useErrorHandler(({ errors, context, phase }) => {
  if (phase === "context") {
    for (const error of errors) {
      log.error(error);
    }
  }

  if (phase === "execution") {
    const { contextValue } = context as { contextValue: Context };
    const { requestId } = contextValue;

    const childLogger = log.child({ requestId });

    for (const error of errors) {
      childLogger.error(error, "error-info");
    }
  }
});
