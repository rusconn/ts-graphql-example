import { createServer } from "node:http";

import { useErrorHandler } from "@envelop/core";
import { EnvelopArmorPlugin as useArmor } from "@escape.tech/graphql-armor";
import { GraphQLError } from "graphql";
import { applyMiddleware } from "graphql-middleware";
import { createYoga, useLogger } from "graphql-yoga";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";

import type { Context, ServerContext, UserContext } from "@/modules/common/resolvers";
import * as Graph from "@/modules/common/schema";
import { makeLogger } from "./logger";
import { middlewares } from "./middlewares";
import { prisma } from "./prisma";
import { schema } from "./schema";
import { isProd, maxCost, maxDepth } from "./config";

export const yoga = createYoga<ServerContext, UserContext>({
  schema: applyMiddleware(schema, ...middlewares),
  context: async ({ request }) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    let user;

    if (token) {
      const maybeUser = await prisma.user.findUnique({
        where: { token },
        select: { id: true, role: true },
      });

      if (!maybeUser) {
        throw new GraphQLError("Authentication error", {
          extensions: { code: Graph.ErrorCode.AuthenticationError },
        });
      }

      user = maybeUser;
    } else {
      user = { id: "GUEST", role: "GUEST" } as const;
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

          logger.info({ userId: user.id, query, variables }, "request info");
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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const server = createServer(yoga);
