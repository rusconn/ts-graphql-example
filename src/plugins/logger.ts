import { useLogger } from "graphql-yoga";

import { logger as log } from "@/logger.ts";
import type { Context } from "@/modules/common/resolvers.ts";

export const logger = useLogger({
  logFn: (
    eventName: "execute-start" | "execute-end" | "subscribe-start" | "subscribe-end",
    { args },
  ) => {
    if (eventName === "execute-start" || eventName === "subscribe-start") {
      const { contextValue } = args as { contextValue: Context };
      const { requestId, user, params } = contextValue;
      const { query, variables } = params;

      log.info({ requestId, userId: user?.id, query, variables }, "request-info");
    }
  },
  skipIntrospection: true,
});
