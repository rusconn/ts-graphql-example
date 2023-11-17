import { useErrorHandler } from "@envelop/core";
import { useGraphQlJit } from "@envelop/graphql-jit";
import { EnvelopArmorPlugin as useArmor } from "@escape.tech/graphql-armor";
import { GraphQLError } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { createYoga, useLogger } from "graphql-yoga";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { ulid } from "ulid";
import { App } from "uWebSockets.js";

import type { Context, ServerContext, UserContext } from "@/modules/common/resolvers.ts";
import { ErrorCode } from "@/modules/common/schema.ts";
import { makeLogger } from "./logger.ts";
import { middlewares } from "./middlewares.ts";
import { prisma } from "./prisma/mod.ts";
import { schema } from "./schema.ts";
import { isProd, maxCost, maxDepth } from "./config.ts";

export const yoga = createYoga<ServerContext, UserContext>({
  schema: applyMiddleware(schema, ...middlewares),
  context: async ({ request }) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    let user;

    if (token) {
      const found = await prisma.user.findUnique({
        where: { token },
      });

      if (!found) {
        throw new GraphQLError("Authentication error", {
          extensions: { code: ErrorCode.AuthenticationError },
        });
      }

      user = found;
    } else {
      user = { id: ulid(), role: "GUEST" } as const;
    }

    return { prisma, user, logger: makeLogger() };
  },
  // requestId を使いたいので自分でログする
  logging: false,
  plugins: [
    useGraphQlJit(),
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
