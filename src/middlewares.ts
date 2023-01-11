import { GraphQLError } from "graphql";
import { shield } from "graphql-shield";

import * as DataSource from "@/datasources";
import { ErrorCode } from "@/types";
import { permissions } from "@/permissions";
import { ParseError } from "./errors";

const permissionAndErrorMiddleware = shield(permissions, {
  // 各種例外を拾ってハンドリングする
  // ログの為に埋め込んだ内部情報は Apollo Server の設定でレスポンスから除外すること
  fallbackError: (thrown, _parent, _args, _context, _info) => {
    // 想定通りの例外が起きた
    if (thrown instanceof ParseError) {
      throw new GraphQLError(thrown.message, {
        originalError: thrown,
        extensions: { code: ErrorCode.BadUserInput },
      });
    }

    // 想定通りの例外が起きた
    if (thrown instanceof DataSource.NotFoundError) {
      throw new GraphQLError("Not found", {
        originalError: thrown,
        extensions: { code: ErrorCode.NotFound },
      });
    }

    // その他想定通りの例外が起きた
    if (thrown instanceof GraphQLError) {
      return thrown;
    }

    // 想定外の例外が起きた
    if (thrown instanceof Error) {
      return new GraphQLError("Internal server error", {
        originalError: thrown,
        extensions: { code: ErrorCode.InternalServerError },
      });
    }

    // エラーでは無いものが投げられた
    return new GraphQLError("Internal server error", {
      extensions: { code: ErrorCode.InternalServerError, thrown },
    });
  },
});

export const middlewares = [permissionAndErrorMiddleware];
