import { useLogger } from "graphql-yoga";

import type { Context } from "@/modules/common/resolvers.ts";

export const logging = useLogger({
  logFn: (
    eventName: "execute-start" | "execute-end" | "subscribe-start" | "subscribe-end",
    { args },
  ) => {
    if (eventName === "execute-start" || eventName === "subscribe-start") {
      const { contextValue } = args as { contextValue: Context };
      const { logger, user, params } = contextValue;
      const { query, variables } = params;

      logger.info({ userId: user?.id, query, variables }, "request-info");
    }
  },
  skipIntrospection: true,
});
