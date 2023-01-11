import { ApolloServer } from "@apollo/server";
import omit from "lodash/omit";
import depthLimit from "graphql-depth-limit";
import { applyMiddleware } from "graphql-middleware";
import { createComplexityLimitRule } from "graphql-validation-complexity";

import { middlewares, schema } from "@/graphql";
import type { Context } from "@/server/types";
import { isIntrospectionQuery } from "./graphql";

type MakeServerParams = {
  maxDepth: number;
  maxCost: number;
  alertCost: number;
};

export const makeServer = ({ maxDepth, maxCost, alertCost }: MakeServerParams) =>
  new ApolloServer<Context>({
    schema: applyMiddleware(schema, ...middlewares),
    validationRules: [
      depthLimit(maxDepth),
      createComplexityLimitRule(maxCost, {
        onCost: cost => {
          const logger = cost < alertCost ? console.log : console.warn;
          logger({ cost });
        },
      }),
    ],
    formatError: error => {
      // message で内部実装がバレ得るのでマスクする
      if (error.message.startsWith("Context creation failed: ")) {
        return { ...error, message: "Some errors occurred" };
      }

      // 内部の例外情報はクライアントに渡さない
      return omit(error, "extensions.thrown");
    },
    // デフォルトでは in-memory なので、スケールアウトする場合は外部のキャッシュを指定する
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
              const headersForSecurity = new Map<string, string>()
                .set("X-Content-Type-Options", "nosniff") // XSS
                .set("X-Frame-Options", "DENY") // クリックジャッキング
                .set("Strict-Transport-Security", "max-age=31536000; includeSubdomains"); // https

              for (const [key, value] of headersForSecurity) {
                response.http.headers.set(key, value);
              }
            },
          };
        },
      },
    ],
  });
