import type { Plugin } from "graphql-yoga";

export const requestId: Plugin<{}, { requestId?: string }> = {
  onRequest({ request, serverContext }) {
    const requestId = request.headers.get("X-Request-Id") ?? crypto.randomUUID();
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
