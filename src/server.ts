import { useErrorHandler } from "@envelop/core";
import { EnvelopArmorPlugin as useArmor } from "@escape.tech/graphql-armor";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";
import { GraphQLError } from "graphql";
import { createSchema, createYoga, useLogger } from "graphql-yoga";
import { App } from "uWebSockets.js";

import type { Context, ServerContext, UserContext } from "@/modules/common/resolvers.ts";
import { ErrorCode } from "@/modules/common/schema.ts";
import { isProd, maxCost, maxDepth } from "./config.ts";
import { createLogger } from "./logger.ts";
import { prisma } from "./prisma/mod.ts";
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

    let user: Context["user"];

    if (token) {
      const found = await prisma.user.findUnique({
        where: { token },
      });

      if (!found) {
        throw authenErr();
      }

      user = found;
    } else {
      user = { id: undefined, role: "GUEST" };
    }

    return { prisma, user, logger: createLogger() };
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
        { args },
      ) => {
        if (eventName === "execute-start" || eventName === "subscribe-start") {
          const { contextValue } = args as { contextValue: Context };
          const { logger, user, params } = contextValue;
          const { query, variables } = params;

          logger.info({ userId: user.id, query, variables }, "request-info");
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
          logger.error(error, "error-info");
        }
      }
    }),
  ],
});

export const server = App().any("/*", yoga);
