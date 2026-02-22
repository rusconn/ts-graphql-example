import type { Plugin } from "graphql-yoga";
import type { EmptyObject } from "type-fest";

import type { PluginContext, ServerContext } from "../context.ts";

export const startTime: Plugin<EmptyObject, ServerContext & PluginContext> = {
  onRequest({ serverContext }) {
    if (serverContext) {
      serverContext.start = Date.now();
    }
  },
};
