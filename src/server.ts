import { GraphQLError } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { App } from "uWebSockets.js";

import type { Context, PluginContext, ServerContext, UserContext } from "./context.ts";
import { db } from "./db/client.ts";
import { createLoaders } from "./db/loaders/mod.ts";
import { logger } from "./logger.ts";
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
  schema: createSchema({ typeDefs, resolvers }),
  context: async ({ request, requestId }) => {
    const start = Date.now();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    const user: Context["user"] = token
      ? await db
          .selectFrom("User")
          .where("token", "=", token)
          .select(["id", "role"])
          .executeTakeFirstOrThrow(authenErr)
      : null;

    return {
      start,
      logger: logger.child({ requestId }),
      db,
      loaders: createLoaders(db),
      user,
    };
  },
  // 自分でログする
  logging: false,
  plugins: [readinessCheck, introspection, requestId, armor, logging, errorHandling],
});

export const server = App().any("/*", yoga);
