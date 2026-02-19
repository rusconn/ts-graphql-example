import { createSchema, createYoga } from "graphql-yoga";

import type { AppContext } from "../../application/context.ts";
import { endpoint } from "../../config/url.ts";
import { renderApolloStudio } from "../../lib/graphql-yoga/render-apollo-studio.ts";
import { resolvers, typeDefs } from "./schema.ts";
import { buildContext, type PluginContext, type ServerContext } from "./yoga/context.ts";
import { armor } from "./yoga/plugins/armor.ts";
import { complexity } from "./yoga/plugins/complexity.ts";
import { cookies } from "./yoga/plugins/cookies.ts";
import { errorHandling } from "./yoga/plugins/error-handling.ts";
import { introspection } from "./yoga/plugins/introspection.ts";
import { logging } from "./yoga/plugins/logging.ts";
import { readinessCheck } from "./yoga/plugins/readiness-check.ts";
import { requestId } from "./yoga/plugins/request-id.ts";
import { startTime } from "./yoga/plugins/start-time.ts";

export const yoga = createYoga<ServerContext & PluginContext, AppContext>({
  renderGraphiQL: () => renderApolloStudio(endpoint),
  schema: createSchema({ typeDefs, resolvers }),
  context: buildContext,
  // 自分でログする
  logging: false,
  plugins: [
    readinessCheck,
    introspection,
    startTime,
    requestId,
    armor,
    complexity,
    logging,
    cookies,
    errorHandling,
  ],
});
