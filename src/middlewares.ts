import { GraphQLError } from "graphql";
import { shield } from "graphql-shield";

import * as Prisma from "@/prisma";
import * as Graph from "@/modules/common/schema";
import { ParseError } from "@/modules/common/parsers";
import type { Context } from "@/modules/common/resolvers";
import { permissions } from "./permissions";

const permissionAndErrorMiddleware = shield<unknown, Context>(permissions, {
  // @ts-expect-error Context 型の付け方がわからなかった。動きはするよう。
  fallbackError: (thrown, _parent, _args, { logger }: Context, _info) => {
    if (thrown instanceof ParseError) {
      return new GraphQLError(thrown.message, {
        originalError: thrown,
        extensions: { code: Graph.ErrorCode.BadUserInput },
      });
    }

    if (thrown instanceof Prisma.NotExistsError) {
      return new GraphQLError("Not found", {
        originalError: thrown,
        extensions: { code: Graph.ErrorCode.NotFound },
      });
    }

    if (thrown instanceof GraphQLError) {
      return thrown;
    }

    // 想定外のエラーが投げられた
    if (thrown instanceof Error) {
      return new GraphQLError("Internal server error", {
        originalError: thrown,
        extensions: { code: Graph.ErrorCode.InternalServerError },
      });
    }

    // エラーでは無いものが投げられた
    logger.error(thrown, "error info");
    return new GraphQLError("Internal server error", {
      extensions: { code: Graph.ErrorCode.InternalServerError },
    });
  },
});

export const middlewares = [permissionAndErrorMiddleware];
