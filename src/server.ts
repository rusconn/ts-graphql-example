import { useErrorHandler } from "@envelop/core";
import { EnvelopArmorPlugin as useArmor } from "@escape.tech/graphql-armor";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { GraphQLError } from "graphql";
import { createYoga, useLogger } from "graphql-yoga";
import { App } from "uWebSockets.js";
import { ulid } from "ulid";

import type {
  Context,
  ContextUser,
  ServerContext,
  UserContext,
} from "@/modules/common/resolvers.ts";
import { ErrorCode } from "@/modules/common/schema.ts";
import { isProd, maxCost, maxDepth } from "./config.ts";
import { makeLogger } from "./logger.ts";
import { prisma } from "./prisma/mod.ts";
import { resolvers } from "./resolvers.ts";
import { typeDefs } from "./typeDefs.ts";

export const yoga = createYoga<ServerContext, UserContext>({
  schema: makeExecutableSchema({ typeDefs, resolvers }),
  context: async ({ request }) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    let user: ContextUser;

    if (token) {
      const found = await prisma.user.findUnique({
        select: { id: true, role: true },
        where: { token },
      });

      if (!found) {
        throw new GraphQLError("Authentication error", {
          extensions: { code: ErrorCode.AuthenticationError },
        });
      }

      user = found;
    } else {
      user = { id: ulid(), role: "GUEST" };
    }

    return { prisma, user, logger: makeLogger() };
  },
  // requestId を使いたいので自分でログする
  logging: false,
  plugins: [
    useDisableIntrospection({
      isDisabled: () => isProd,
    }),
    useArmor({
      costLimit: { maxCost },
      maxDepth: { n: maxDepth },
    }),
    useLogger({
      logFn: (
        eventName: "execute-start" | "execute-end" | "subscribe-start" | "subscribe-end",
        { args }
      ) => {
        if (eventName === "execute-start" || eventName === "subscribe-start") {
          const { contextValue } = args as { contextValue: Context };
          const { logger, user, params } = contextValue;
          const { query, variables } = params;

          logger.info({ userId: user.id, role: user.role, query, variables }, "request info");
        }
      },
      skipIntrospection: true,
    }),
    useErrorHandler(({ errors, context, phase }) => {
      if (phase === "context") {
        for (const error of errors) {
          console.error(error);
        }
      }

      if (phase === "execution") {
        const { contextValue } = context as { contextValue: Context };
        const { logger } = contextValue;

        for (const error of errors) {
          logger.error(error, "error info");
        }
      }
    }),
  ],
});

export const server = App().any("/*", yoga);
