import { createSchema, createYoga } from "graphql-yoga";

import { endpoint } from "./config/url.ts";
import type { ContextBase, PluginContext, ServerContext, UserContext } from "./context.ts";
import { client } from "./db/client.ts";
import { authenticationErr } from "./graphql/_errors/authenticationError.ts";
import { badUserInputErr } from "./graphql/_errors/badUserInput.ts";
import { tokenExpiredErr } from "./graphql/_errors/tokenExpired.ts";
import { renderApolloStudio } from "./lib/graphql-yoga/renderApolloStudio.ts";
import { logger } from "./logger.ts";
import { armor } from "./plugins/armor.ts";
import { complexity } from "./plugins/complexity.ts";
import { cookies } from "./plugins/cookies.ts";
import { errorHandling } from "./plugins/errorHandling.ts";
import { introspection } from "./plugins/introspection.ts";
import { logging } from "./plugins/logging.ts";
import { readinessCheck } from "./plugins/readinessCheck.ts";
import { requestId } from "./plugins/requestId.ts";
import { TodoQueryForAdmin } from "./query-services/todo/for-admin.ts";
import { TodoQueryForUser } from "./query-services/todo/for-user.ts";
import { UserQueryForAdmin } from "./query-services/user/for-admin.ts";
import { UserQueryForGuest } from "./query-services/user/for-guest.ts";
import { UserQueryForUser } from "./query-services/user/for-user.ts";
import { TodoRepoForAdmin } from "./repositories/todo/for-admin.ts";
import { TodoRepoForUser } from "./repositories/todo/for-user.ts";
import { UserRepoForAdmin } from "./repositories/user/for-admin.ts";
import { UserRepoForGuest } from "./repositories/user/for-guest.ts";
import { UserRepoForUser } from "./repositories/user/for-user.ts";
import { UserCredentialRepoForAdmin } from "./repositories/user-credential/for-admin.ts";
import { UserCredentialRepoForGuest } from "./repositories/user-credential/for-guest.ts";
import { UserCredentialRepoForUser } from "./repositories/user-credential/for-user.ts";
import { UserTokenRepoForAdmin } from "./repositories/user-token/for-admin.ts";
import { UserTokenRepoForGuest } from "./repositories/user-token/for-guest.ts";
import { UserTokenRepoForUser } from "./repositories/user-token/for-user.ts";
import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./typeDefs.ts";
import { type Payload, verifyJwt } from "./util/accessToken.ts";

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
      const found = await UserQueryForGuest.findById(payload.id, client);
      if (found == null) {
        throw authenticationErr();
      }
      user = found;
    }

    const contextBase: ContextBase = {
      start,
      logger: logger.child({ requestId }),
      db: client,
    };

    switch (user?.role) {
      case "admin":
        return {
          ...contextBase,
          role: user.role,
          user,
          queries: {
            todo: new TodoQueryForAdmin(client),
            user: new UserQueryForAdmin(client),
          },
          repos: {
            todo: new TodoRepoForAdmin(client, user.id),
            user: new UserRepoForAdmin(client, user.id),
            userCredential: new UserCredentialRepoForAdmin(client, user.id),
            userToken: new UserTokenRepoForAdmin(client, user.id),
          },
        };
      case "user":
        return {
          ...contextBase,
          role: user.role,
          user,
          queries: {
            todo: new TodoQueryForUser(client, user.id),
            user: new UserQueryForUser(client, user.id),
          },
          repos: {
            todo: new TodoRepoForUser(client, user.id),
            user: new UserRepoForUser(client, user.id),
            userCredential: new UserCredentialRepoForUser(client, user.id),
            userToken: new UserTokenRepoForUser(client, user.id),
          },
        };
      case undefined:
        return {
          ...contextBase,
          role: "guest",
          user,
          queries: {
            user: new UserQueryForGuest(client),
          },
          repos: {
            user: new UserRepoForGuest(client),
            userCredential: new UserCredentialRepoForGuest(client),
            userToken: new UserTokenRepoForGuest(client),
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
