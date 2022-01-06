import type { ApolloServerPlugin } from "apollo-server-plugin-base";

import type { Context } from "@/types";
import { isIntrospectionQuery } from "@/utils";

// Apollo が提供する logger は requestId が無いので使わない
const loggerPlugin: ApolloServerPlugin<Context> = {
  requestDidStart: async ({ context, request }) => {
    const { logger, user } = context;
    const { query, variables } = request;

    if (query && !isIntrospectionQuery(query)) {
      logger.info({ userId: user.id, query, variables }, "request info");
    }

    return {
      didEncounterErrors: async ({ context: { logger: logger2 }, errors }) => {
        for (const error of errors) {
          logger2.error(error, "error info");
        }
      },
    };
  },
};

export const plugins = [loggerPlugin];
