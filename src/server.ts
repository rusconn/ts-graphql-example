import { GraphQLError } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { App } from "uWebSockets.js";

import type { Context, ServerContext, UserContext } from "@/modules/common/resolvers.ts";
import { ErrorCode } from "@/modules/common/schema.ts";
import { db } from "./db/client.ts";
import { createLoaders } from "./db/loaders/mod.ts";
import { logger as appLogger } from "./logger.ts";
import { armor } from "./plugins/armor.ts";
import { errorHandler } from "./plugins/errorHandler.ts";
import { introspection } from "./plugins/introspection.ts";
import { logger } from "./plugins/logger.ts";
import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./typeDefs.ts";

const authenErr = () =>
  new GraphQLError("Authentication error", {
    extensions: { code: ErrorCode.AuthenticationError },
  });

export const yoga = createYoga<ServerContext, UserContext>({
  schema: createSchema({ typeDefs, resolvers }),
  context: async ({ request }) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    const user: Context["user"] = token
      ? await db
          .selectFrom("User")
          .where("token", "=", token)
          .selectAll()
          .executeTakeFirstOrThrow(authenErr)
      : null;

    const requestId = crypto.randomUUID();

    return {
      logger: appLogger.child({ requestId }),
      db,
      loaders: createLoaders(db),
      user,
    };
  },
  // 自分でログする
  logging: false,
  plugins: [introspection, armor, logger, errorHandler],
});

export const server = App().any("/*", yoga);
