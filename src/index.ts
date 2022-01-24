import omit from "lodash/omit";
import depthLimit from "graphql-depth-limit";
import { applyMiddleware } from "graphql-middleware";
import { createComplexityLimitRule } from "graphql-validation-complexity";
import { ApolloError, ApolloServer } from "apollo-server";

import { Context, ErrorCode } from "@/types";
import { TodoAPI, UserAPI } from "@/datasources";
import { middlewares } from "@/middlewares";
import { plugins } from "@/plugins";
import { schema } from "@/schema";
import { getEnvsWithValidation, isIntrospectionQuery, makeLogger, makePrismaClient } from "@/utils";

const { maxDepth, maxCost, alertCost, nodeEnv } = getEnvsWithValidation();
const isDev = nodeEnv === "development";
const prisma = makePrismaClient(isDev);

const server = new ApolloServer({
  // 型パラメータを指定しないと型エラーになる。解決方法が不明。
  schema: applyMiddleware<unknown>(schema, ...middlewares),
  context: async ({ req }) => {
    const { query } = req.body as { query: string | undefined };

    if (query && isIntrospectionQuery(query)) {
      return {};
    }

    const logger = makeLogger(isDev);
    const token = req.headers.authorization?.replace("Bearer ", "");

    let user;

    if (token) {
      const maybeUser = await prisma.user.findUnique({ where: { token } });

      if (!maybeUser) {
        // AuthenticationError を使わないのは code をカスタムする為
        // AuthenticationError だと code が UNAUTHENTICATED になる
        // この API は認証なしでもゲストとして使えるので、UNAUTHENTICATED だと意味がおかしい
        throw new ApolloError("Authentication error", ErrorCode.AuthenticationError);
      }

      user = maybeUser;
    } else {
      user = { id: 0, role: "GUEST" };
    }

    return { logger, user } as Omit<Context, "dataSources">;
  },
  dataSources: () => ({
    todoAPI: new TodoAPI(prisma),
    userAPI: new UserAPI(prisma),
  }),
  validationRules: [
    depthLimit(maxDepth),
    createComplexityLimitRule(maxCost, {
      onCost: cost => {
        const logger = cost < alertCost ? console.log : console.warn;
        logger({ cost });
      },
    }),
  ],
  // 脆弱性対策: https://qiita.com/tnishi97/items/9fb9b2e69689fbfb52e3
  formatResponse: (response, requestContext) => {
    if (requestContext.response?.http) {
      const headersForSecurity = {
        "Cache-Control": "no-store", // キャッシュ漏洩
        "X-Content-Type-Options": "nosniff", // XSS
        "X-Frame-Options": "DENY", // クリックジャッキング
        "Strict-Transport-Security": "max-age=31536000; includeSubdomains", // https
      };

      for (const [key, value] of Object.entries(headersForSecurity)) {
        requestContext.response.http.headers.set(key, value);
      }
    }

    return response;
  },
  // 例外情報はクライアントに渡さない
  formatError: error => omit(error, "extensions.thrown"),
  // デフォルトでは in-memory なので、スケールアウトする場合は外部のキャッシュを指定する
  cache: undefined,
  // requestId を埋め込みたいのでコンテキストにセットしている
  logger: undefined,
  plugins,
});

server
  .listen()
  .then(({ url }) => console.log(`🚀  Server ready at ${url}`))
  .catch(console.error);
