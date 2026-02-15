import { createSchema, createYoga } from "graphql-yoga";

import { endpoint } from "../config/url.ts";
import { authenticationErr } from "../graphql/_errors/global/authentication-error.ts";
import { badUserInputErr } from "../graphql/_errors/global/bad-user-input.ts";
import { tokenExpiredErr } from "../graphql/_errors/global/token-expired.ts";
import { kysely } from "../infra/datasources/db/client.ts";
import { UserQueryForGuest } from "../infra/queries/db/user/for-guest.ts";
import { renderApolloStudio } from "../lib/graphql-yoga/render-apollo-studio.ts";
import { type Payload, verifyJwt } from "../util/access-token.ts";
import {
  createUserContextCore,
  type PluginContext,
  type ServerContext,
  type UserContext,
} from "./context.ts";
import { logger } from "./logger.ts";
import { armor } from "./plugins/armor.ts";
import { complexity } from "./plugins/complexity.ts";
import { cookies } from "./plugins/cookies.ts";
import { errorHandling } from "./plugins/error-handling.ts";
import { introspection } from "./plugins/introspection.ts";
import { logging } from "./plugins/logging.ts";
import { readinessCheck } from "./plugins/readiness-check.ts";
import { requestId } from "./plugins/request-id.ts";
import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./type-defs.ts";

export const yoga = createYoga<ServerContext & PluginContext, UserContext>({
  renderGraphiQL: () => renderApolloStudio(endpoint),
  schema: createSchema({ typeDefs, resolvers }),
  context: async ({ request, requestId }) => {
    const start = Date.now();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    let payload: Payload | null = null;
    if (token != null) {
      const result = await verifyJwt(token);
      switch (result.type) {
        case "Success":
          payload = result.payload;
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

    let user: UserContext["user"] = null;
    if (payload) {
      const found = await UserQueryForGuest.find(payload.id, kysely);
      if (found == null) {
        throw authenticationErr();
      }
      user = found;
    }

    const userContextCore = createUserContextCore(user, kysely);

    return {
      start,
      logger: logger.child({ requestId }),
      ...userContextCore,
    };
  },
  // 自分でログする
  logging: false,
  plugins: [
    readinessCheck,
    introspection,
    requestId,
    armor,
    complexity,
    logging,
    cookies,
    errorHandling,
  ],
});
