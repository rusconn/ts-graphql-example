import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import { createSchema, createYoga } from "graphql-yoga";

import type { AppContext } from "../../application/context.ts";
import { isProd } from "../../config/exec-env.ts";
import { maxAliases, maxDepth, maxTokens } from "../../config/graphql-security.ts";
import { endpoint } from "../../config/url.ts";
import { requestId } from "../../lib/graphql-yoga/plugins/request-id.ts";
import { renderApolloStudio } from "../../lib/graphql-yoga/render-apollo-studio.ts";
import { resolvers, typeDefs } from "./schema.ts";
import { buildContext, type PluginContext } from "./yoga/context.ts";
import { complexity } from "./yoga/plugins/complexity.ts";
import { errorHandling } from "./yoga/plugins/error-handling.ts";
import { logging } from "./yoga/plugins/logging.ts";
import { rateLimit } from "./yoga/plugins/rate-limit.ts";
import { readinessCheck } from "./yoga/plugins/readiness-check.ts";

export const yoga = createYoga<PluginContext, AppContext>({
  renderGraphiQL: () => renderApolloStudio(endpoint),
  schema: createSchema({ typeDefs, resolvers }),
  context: buildContext,
  logging: false,
  plugins: [
    readinessCheck,
    useDisableIntrospection({ isDisabled: () => isProd }),
    requestId,
    EnvelopArmorPlugin({
      maxDepth: {
        n: maxDepth,
        flattenFragments: true,
      },
      maxTokens: {
        n: maxTokens,
      },
      maxAliases: {
        n: maxAliases,
      },
      costLimit: {
        enabled: false, // complexity plugin で対応する
      },
    }),
    useCookies(),
    complexity,
    rateLimit,
    logging,
    errorHandling,
  ],
});
