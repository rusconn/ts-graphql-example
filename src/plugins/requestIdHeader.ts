import type { Plugin } from "graphql-yoga";

import type { Context } from "@/modules/common/resolvers.ts";

export const requestIdHeader: Plugin = {
  onResponse({ response, serverContext }) {
    const context = serverContext as Context | undefined;
    if (context?.requestId) {
      response.headers.set("X-Request-Id", context.requestId);
    }
  },
};
