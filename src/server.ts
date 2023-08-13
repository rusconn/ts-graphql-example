import { ApolloServer } from "@apollo/server";
import depthLimit from "graphql-depth-limit";
import { applyMiddleware } from "graphql-middleware";
import { createComplexityLimitRule } from "graphql-validation-complexity";

import { maxDepth, maxCost, alertCost } from "@/config";
import type { Context } from "@/modules/common/resolvers";
import { middlewares } from "./middlewares";
import { schema } from "./schema";
import { isIntrospectionQuery } from "./generic/graphql";

export const server = new ApolloServer<Context>({
  schema: applyMiddleware(schema, ...middlewares),
  validationRules: [
    depthLimit(maxDepth),
    createComplexityLimitRule(maxCost, {
      onCost: cost => {
        (cost < alertCost ? console.log : console.warn)({ cost });
      },
    }),
  ],
  formatError: error => {
    // message で内部実装がバレ得るのでマスクする
    if (error.message.startsWith("Context creation failed: ")) {
      return { ...error, message: "Some errors occurred" };
    }

    return error;
  },
  cache: undefined,
  // requestId を埋め込みたいのでコンテキストにセットしている
  logger: undefined,
  plugins: [
    {
      async requestDidStart({ contextValue, request }) {
        const { logger, user } = contextValue;
        const { query, variables } = request;

        if (query && !isIntrospectionQuery(query)) {
          logger.info({ userId: user.id, query, variables }, "request info");
        }

        return {
          didEncounterErrors: async ({ contextValue: context, errors }) => {
            for (const error of errors) {
              context.logger.error(error, "error info");
            }
          },
          async willSendResponse({ response }) {
            // 脆弱性対策: https://qiita.com/tnishi97/items/9fb9b2e69689fbfb52e3
            response.http.headers
              .set("X-Content-Type-Options", "nosniff") // XSS
              .set("X-Frame-Options", "DENY") // クリックジャッキング
              .set("Strict-Transport-Security", "max-age=31536000; includeSubdomains"); // https
          },
        };
      },
    },
  ],
});
