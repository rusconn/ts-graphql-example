import { type GraphQLParams, useLogger } from "graphql-yoga";

import { isProd } from "../../../../config/exec-env.ts";
import type { Context } from "../context.ts";

export const logging = useLogger({
  logFn: (
    eventName: "execute-start" | "execute-end" | "subscribe-start" | "subscribe-end",
    { args },
  ) => {
    const { contextValue } = args as { contextValue: Context };
    const { start, logger, user, params } = contextValue;

    if (eventName === "execute-start" || eventName === "subscribe-start") {
      logger.info({ userId: user?.id, ...(isProd ? mask(params) : params) }, eventName);
    } else {
      logger.info({ duration: `${Date.now() - start!}ms` }, eventName);
    }
  },
  skipIntrospection: true,
});

const mask = ({ query, variables }: GraphQLParams<Record<string, unknown>>) => {
  if (query == null) return undefined;

  const sensitiveOperations = [
    "accountUpdate",
    "login",
    "loginPasswordChange",
    "signup",
    "userEmailChange",
  ];

  return sensitiveOperations.some((sop) => query.includes(sop))
    ? { query: "***", variables: "***" }
    : { query, variables };
};
