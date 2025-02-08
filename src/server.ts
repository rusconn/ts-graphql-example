import { GraphQLError } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { App } from "uWebSockets.js";

import { endpoint } from "./config.ts";
import type { Context, PluginContext, ServerContext, UserContext } from "./context.ts";
import { TodoAPI } from "./datasources/todo.ts";
import { UserAPI } from "./datasources/user.ts";
import { client } from "./db/client.ts";
import { renderApolloStudio } from "./lib/graphql-yoga/renderApolloStudio.ts";
import { logger } from "./logger.ts";
import * as UserToken from "./models/user/token.ts";
import { armor } from "./plugins/armor.ts";
import { errorHandling } from "./plugins/errorHandling.ts";
import { introspection } from "./plugins/introspection.ts";
import { logging } from "./plugins/logging.ts";
import { readinessCheck } from "./plugins/readinessCheck.ts";
import { requestId } from "./plugins/requestId.ts";
import { resolvers } from "./resolvers.ts";
import { ErrorCode } from "./schema.ts";
import { typeDefs } from "./typeDefs.ts";

const authenErr = () =>
  new GraphQLError("Authentication error", {
    extensions: { code: ErrorCode.AuthenticationError },
  });

export const yoga = createYoga<ServerContext & PluginContext, UserContext>({
  renderGraphiQL: () => renderApolloStudio(endpoint),
  schema: createSchema({ typeDefs, resolvers }),
  context: async ({ request, requestId }) => {
    const start = Date.now();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    const api = {
      todo: new TodoAPI(client),
      user: new UserAPI(client),
    };

    let user: Context["user"] | undefined = null;
    if (token != null) {
      if (!UserToken.is(token)) {
        throw authenErr();
      }

      user = await api.user.getByToken(token);

      if (user === undefined) {
        throw authenErr();
      }
    }

    return {
      start,
      logger: logger.child({ requestId }),
      user,
      db: client,
      api,
    };
  },
  // 自分でログする
  logging: false,
  plugins: [readinessCheck, introspection, requestId, armor, logging, errorHandling],
});

export const server = App().any("/*", yoga);
