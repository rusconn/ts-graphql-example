import { useLogger } from "graphql-yoga";

import type { Context } from "@/context.ts";

export const logging = useLogger({
  logFn: (
    eventName: "execute-start" | "execute-end" | "subscribe-start" | "subscribe-end",
    { args },
  ) => {
    const { contextValue } = args as { contextValue: Context };
    const { start, logger, user, params } = contextValue;

    if (eventName === "execute-start" || eventName === "subscribe-start") {
      const { query, variables } = params;
      logger.info({ userId: user?.id, query, variables }, eventName);
    } else {
      logger.info({ duration: `${Date.now() - start}ms` }, eventName);
    }
  },
  skipIntrospection: true,
});
