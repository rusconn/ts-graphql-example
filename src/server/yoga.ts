import { createSchema, createYoga } from "graphql-yoga";

import { endpoint } from "../config/url.ts";
import type { ContextBase, PluginContext, ServerContext, UserContext } from "./context.ts";
import { kysely } from "../infra/datasources/db/client.ts";
import { authenticationErr } from "../graphql/_errors/authenticationError.ts";
import { badUserInputErr } from "../graphql/_errors/badUserInput.ts";
import { tokenExpiredErr } from "../graphql/_errors/tokenExpired.ts";
import { renderApolloStudio } from "../lib/graphql-yoga/renderApolloStudio.ts";
import { logger } from "./logger.ts";
import { armor } from "./plugins/armor.ts";
import { complexity } from "./plugins/complexity.ts";
import { cookies } from "./plugins/cookies.ts";
import { errorHandling } from "./plugins/errorHandling.ts";
import { introspection } from "./plugins/introspection.ts";
import { logging } from "./plugins/logging.ts";
import { readinessCheck } from "./plugins/readinessCheck.ts";
import { requestId } from "./plugins/requestId.ts";
import { TodoQueryForAdmin } from "../infra/queries/db/todo/for-admin.ts";
import { TodoQueryForUser } from "../infra/queries/db/todo/for-user.ts";
import { UserQueryForAdmin } from "../infra/queries/db/user/for-admin.ts";
import { UserQueryForGuest } from "../infra/queries/db/user/for-guest.ts";
import { UserQueryForUser } from "../infra/queries/db/user/for-user.ts";
import { TodoRepoForAdmin } from "../infra/repos/db/todo/for-admin.ts";
import { TodoRepoForUser } from "../infra/repos/db/todo/for-user.ts";
import { UserRepoForAdmin } from "../infra/repos/db/user/for-admin.ts";
import { UserRepoForGuest } from "../infra/repos/db/user/for-guest.ts";
import { UserRepoForUser } from "../infra/repos/db/user/for-user.ts";
import { RefreshTokenRepoForAdmin } from "../infra/repos/db/refresh-token/for-admin.ts";
import { RefreshTokenRepoForGuest } from "../infra/repos/db/refresh-token/for-guest.ts";
import { RefreshTokenRepoForUser } from "../infra/repos/db/refresh-token/for-user.ts";
import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./typeDefs.ts";
import { type Payload, verifyJwt } from "../util/accessToken.ts";
import { CredentialQueryForAdmin } from "../infra/queries/db/credential/for-admin.ts";
import { CredentialQueryForUser } from "../infra/queries/db/credential/for-user.ts";
import { CredentialQueryForGuest } from "../infra/queries/db/credential/for-guest.ts";

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

    const contextBase: ContextBase = {
      start,
      logger: logger.child({ requestId }),
      kysely,
    };

    switch (user?.role) {
      case "ADMIN":
        return {
          ...contextBase,
          role: user.role,
          user,
          queries: {
            credential: new CredentialQueryForAdmin(kysely, user.id),
            todo: new TodoQueryForAdmin(kysely),
            user: new UserQueryForAdmin(kysely),
          },
          repos: {
            todo: new TodoRepoForAdmin(kysely, user.id),
            user: new UserRepoForAdmin(kysely, user.id),
            refreshToken: new RefreshTokenRepoForAdmin(kysely, user.id),
          },
        };
      case "USER":
        return {
          ...contextBase,
          role: user.role,
          user,
          queries: {
            credential: new CredentialQueryForUser(kysely, user.id),
            todo: new TodoQueryForUser(kysely, user.id),
            user: new UserQueryForUser(kysely, user.id),
          },
          repos: {
            todo: new TodoRepoForUser(kysely, user.id),
            user: new UserRepoForUser(kysely, user.id),
            refreshToken: new RefreshTokenRepoForUser(kysely, user.id),
          },
        };
      case undefined:
        return {
          ...contextBase,
          role: "GUEST",
          user,
          queries: {
            credential: new CredentialQueryForGuest(kysely),
            user: new UserQueryForGuest(kysely),
          },
          repos: {
            user: new UserRepoForGuest(kysely),
            refreshToken: new RefreshTokenRepoForGuest(kysely),
          },
        };
      default:
        throw new Error(user satisfies never);
    }
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
