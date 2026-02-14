import { createSchema, createYoga } from "graphql-yoga";

import { endpoint } from "../config/url.ts";
import { authenticationErr } from "../graphql/_errors/global/authentication-error.ts";
import { badUserInputErr } from "../graphql/_errors/global/bad-user-input.ts";
import { tokenExpiredErr } from "../graphql/_errors/global/token-expired.ts";
import { kysely } from "../infra/datasources/db/client.ts";
import { CredentialQueryForAdmin } from "../infra/queries/db/credential/for-admin.ts";
import { CredentialQueryForGuest } from "../infra/queries/db/credential/for-guest.ts";
import { CredentialQueryForUser } from "../infra/queries/db/credential/for-user.ts";
import { TodoQueryForAdmin } from "../infra/queries/db/todo/for-admin.ts";
import { TodoQueryForUser } from "../infra/queries/db/todo/for-user.ts";
import { UserQueryForAdmin } from "../infra/queries/db/user/for-admin.ts";
import { UserQueryForGuest } from "../infra/queries/db/user/for-guest.ts";
import { UserQueryForUser } from "../infra/queries/db/user/for-user.ts";
import { TodoReaderRepoForAdmin } from "../infra/repos-for-read/db/for-admin/todo.ts";
import { UserReaderRepoForAdmin } from "../infra/repos-for-read/db/for-admin/user.ts";
import { TodoReaderRepoForUser } from "../infra/repos-for-read/db/for-user/todo.ts";
import { UserReaderRepoForUser } from "../infra/repos-for-read/db/for-user/user.ts";
import { UnitOfWorkForAdmin } from "../infra/unit-of-works/db/for-admin.ts";
import { UnitOfWorkForGuest } from "../infra/unit-of-works/db/for-guest.ts";
import { UnitOfWorkForUser } from "../infra/unit-of-works/db/for-user.ts";
import { renderApolloStudio } from "../lib/graphql-yoga/render-apollo-studio.ts";
import { type Payload, verifyJwt } from "../util/access-token.ts";
import type { ContextBase, PluginContext, ServerContext, UserContext } from "./context.ts";
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

    const contextBase: ContextBase = {
      start,
      logger: logger.child({ requestId }),
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
            todo: new TodoReaderRepoForAdmin(kysely, user.id),
            user: new UserReaderRepoForAdmin(kysely, user.id),
          },
          unitOfWork: new UnitOfWorkForAdmin(kysely, user.id),
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
            todo: new TodoReaderRepoForUser(kysely, user.id),
            user: new UserReaderRepoForUser(kysely, user.id),
          },
          unitOfWork: new UnitOfWorkForUser(kysely, user.id),
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
          unitOfWork: new UnitOfWorkForGuest(kysely),
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
