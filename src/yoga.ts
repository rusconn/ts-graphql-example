import { createSchema, createYoga } from "graphql-yoga";

import { endpoint } from "./config.ts";
import type { Context, PluginContext, ServerContext, UserContext } from "./context.ts";
import { TodoAPI } from "./datasources/todo.ts";
import { UserAPI } from "./datasources/user.ts";
import { client } from "./db/client.ts";
import { authenticationErr } from "./graphql/_errors/authenticationError.ts";
import { badUserInputErr } from "./graphql/_errors/badUserInput.ts";
import { tokenExpiredErr } from "./graphql/_errors/tokenExpired.ts";
import { renderApolloStudio } from "./lib/graphql-yoga/renderApolloStudio.ts";
import { logger } from "./logger.ts";
import { armor } from "./plugins/armor.ts";
import { cookies } from "./plugins/cookies.ts";
import { errorHandling } from "./plugins/errorHandling.ts";
import { introspection } from "./plugins/introspection.ts";
import { logging } from "./plugins/logging.ts";
import { readinessCheck } from "./plugins/readinessCheck.ts";
import { requestId } from "./plugins/requestId.ts";
import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./typeDefs.ts";
import { verifyJwt } from "./util/accessToken.ts";

export const yoga = createYoga<ServerContext & PluginContext, UserContext>({
  renderGraphiQL: () => renderApolloStudio(endpoint),
  schema: createSchema({ typeDefs, resolvers }),
  context: async ({ request, requestId }) => {
    const start = Date.now();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    let user: Context["user"] = null;
    if (token != null) {
      const result = await verifyJwt(token);
      switch (result.type) {
        case "Success":
          user = result.payload;
          break;
        case "JWTInvalid":
          throw authenticationErr();
        case "JWTExpired":
          throw tokenExpiredErr();
        case "Unknown":
          throw badUserInputErr("Bad token");
        default:
          throw new Error(result satisfies never);
      }
    }

    return {
      start,
      logger: logger.child({ requestId }),
      user,
      db: client,
      api: {
        todo: new TodoAPI(client),
        user: new UserAPI(client),
      },
    };
  },
  // 自分でログする
  logging: false,
  plugins: [readinessCheck, introspection, requestId, armor, logging, cookies, errorHandling],
});
