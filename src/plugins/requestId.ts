import type { Plugin } from "graphql-yoga";
import type { EmptyObject } from "type-fest";

import type { PluginContext, ServerContext } from "@/context.ts";

export const requestId: Plugin<EmptyObject, ServerContext & PluginContext> = {
  onRequest({ request, serverContext }) {
    const reqId = request.headers.get("X-Request-Id");
    const requestId = reqId ?? crypto.randomUUID();
    if (serverContext) {
      serverContext.requestId = requestId;
    }
  },
  onResponse({ response, serverContext }) {
    if (serverContext?.requestId) {
      response.headers.set("X-Request-Id", serverContext.requestId);
    }
  },
};
